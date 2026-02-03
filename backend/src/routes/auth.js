const express = require("express");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");

const router = express.Router();

const GoogleAuthSchema = z.object({
  credential: z.string().min(10),
});

const PasswordLoginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

const RegisterSchema = z.object({
  name: z.string().min(1),
  identifier: z.string().min(1),
  password: z.string().min(1),
});

// In-memory auth store for dev (works even if DB isn't available).
// Keyed by identifier (email/phone). Not persisted across restarts.
const memUsers = new Map();

function getGoogleClientId() {
  return String(process.env.GOOGLE_CLIENT_ID ?? "").trim();
}

function getJwtSecret() {
  return String(process.env.JWT_SECRET ?? "").trim();
}

function getCookieName() {
  return String(process.env.AUTH_COOKIE_NAME ?? "uas_web_session").trim() || "uas_web_session";
}

function getCookieOptions() {
  const isProd = String(process.env.NODE_ENV ?? "").toLowerCase() === "production";
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function signSession(user) {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) return null;
  return jwt.sign(
    {
      sub: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: "7d",
      issuer: "uas-web-backend",
      audience: "uas-web-frontend",
    }
  );
}

router.post("/register", async (req, res, next) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: { message: "Validation error", details: parsed.error.flatten() } });
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(400).json({ error: { message: "Auth belum dikonfigurasi (JWT_SECRET kosong)" } });
    }

    const name = String(parsed.data.name).trim();
    const identifier = String(parsed.data.identifier).trim();
    const password = String(parsed.data.password);
    if (!name || !identifier || !password) {
      return res.status(400).json({ error: { message: "Name, identifier, dan password wajib" } });
    }

    // 1) Try DB-backed registration (Cashier) if possible.
    try {
      const { prisma } = require("../prisma");
      const existing = await prisma.cashier.findFirst({
        where: {
          OR: [{ username: identifier }, { email: identifier }],
        },
      });

      if (existing) {
        return res.status(409).json({ error: { message: "Akun sudah ada. Silakan login." } });
      }

      // Ensure gender row exists (seed normally creates it).
      const genderId = "L";
      const now = new Date();
      const cashier = await prisma.cashier.create({
        data: {
          id: String(randomUUID().replace(/-/g, "").slice(0, 8)),
          username: name.slice(0, 45),
          email: identifier.includes("@") ? identifier : `${identifier}@example.com`,
          contactNumber: identifier.replace(/\s+/g, "").slice(0, 14) || "080000000000",
          address: "-",
          placeOfBirth: "-",
          dateOfBirth: new Date("2000-01-01"),
          genderId,
          createdAt: now,
          updatedAt: now,
          password,
        },
      });

      const user = { sub: cashier.id, email: cashier.email, name: cashier.username, role: "cashier" };
      const token = signSession(user);
      res.cookie(getCookieName(), token, getCookieOptions());
      return res.json({ data: { user } });
    } catch {
      // Ignore and fall back to in-memory.
    }

    // 2) In-memory registration fallback.
    if (memUsers.has(identifier)) {
      return res.status(409).json({ error: { message: "Akun sudah ada. Silakan login." } });
    }
    const user = {
      sub: String(randomUUID()),
      email: identifier.includes("@") ? identifier : undefined,
      name,
      role: "customer",
    };
    memUsers.set(identifier, { user, password });
    const token = signSession(user);
    res.cookie(getCookieName(), token, getCookieOptions());
    return res.json({ data: { user } });
  } catch (e) {
    return next(e);
  }
});

// Simple username/email + password login (uses Cashier table).
// Dev fallback: if DB isn't available, allows admin/admin.
router.post("/login", async (req, res, next) => {
  try {
    const parsed = PasswordLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: { message: "Validation error", details: parsed.error.flatten() } });
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(400).json({ error: { message: "Auth belum dikonfigurasi (JWT_SECRET kosong)" } });
    }

    const identifier = String(parsed.data.identifier).trim();
    const password = String(parsed.data.password);
    if (!identifier || !password) return res.status(400).json({ error: { message: "Identifier dan password wajib" } });

    // 1) Check in-memory users first.
    const mem = memUsers.get(identifier);
    if (mem && String(mem.password) === password) {
      const token = signSession(mem.user);
      res.cookie(getCookieName(), token, getCookieOptions());
      return res.json({ data: { user: mem.user } });
    }

    let cashier = null;
    try {
      const { prisma } = require("../prisma");
      cashier = await prisma.cashier.findFirst({
        where: {
          OR: [{ username: identifier }, { email: identifier }],
        },
      });
    } catch {
      cashier = null;
    }

    // If DB lookup failed / cashier not found, allow a safe dev fallback.
    if (!cashier) {
      if (identifier === "admin" && password === "admin") {
        const user = {
          sub: "12345678",
          email: "admin@example.com",
          name: "admin",
          role: "cashier",
        };
        const token = signSession(user);
        res.cookie(getCookieName(), token, getCookieOptions());
        return res.json({ data: { user } });
      }
      return res.status(401).json({ error: { message: "Username/email atau password salah" } });
    }

    const ok = String(cashier.password ?? "") === password;
    if (!ok) return res.status(401).json({ error: { message: "Username/email atau password salah" } });

    const user = {
      sub: cashier.id,
      email: cashier.email,
      name: cashier.username,
      role: "cashier",
    };

    const sessionToken = signSession(user);
    res.cookie(getCookieName(), sessionToken, getCookieOptions());
    return res.json({ data: { user } });
  } catch (e) {
    return next(e);
  }
});

// Verify Google ID token via Google's tokeninfo endpoint.
// This avoids needing a client secret, but still requires GOOGLE_CLIENT_ID to check audience.
router.post("/google", async (req, res, next) => {
  try {
    const parsed = GoogleAuthSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: { message: "Validation error", details: parsed.error.flatten() } });
    }

    const clientId = getGoogleClientId();
    if (!clientId) {
      return res.status(400).json({ error: { message: "Google login belum dikonfigurasi (GOOGLE_CLIENT_ID kosong)" } });
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(400).json({ error: { message: "Auth belum dikonfigurasi (JWT_SECRET kosong)" } });
    }

    const idToken = parsed.data.credential;
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const r = await fetch(url);
    const json = await r.json().catch(() => null);
    if (!r.ok || !json) {
      return res.status(401).json({ error: { message: "Token Google tidak valid" } });
    }

    // tokeninfo returns: aud, sub, email, email_verified, name, picture, given_name, family_name, exp, etc.
    if (json.aud !== clientId) {
      return res.status(401).json({ error: { message: "Audience token tidak cocok" } });
    }

    const user = {
      sub: String(json.sub ?? ""),
      email: json.email ? String(json.email) : undefined,
      email_verified: json.email_verified === "true" || json.email_verified === true,
      name: json.name ? String(json.name) : undefined,
      picture: json.picture ? String(json.picture) : undefined,
      given_name: json.given_name ? String(json.given_name) : undefined,
      family_name: json.family_name ? String(json.family_name) : undefined,
    };

    if (!user.sub) return res.status(401).json({ error: { message: "Token Google tidak valid" } });

    const sessionToken = jwt.sign(
      {
        sub: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      jwtSecret,
      {
        expiresIn: "7d",
        issuer: "uas-web-backend",
        audience: "uas-web-frontend",
      }
    );

    res.cookie(getCookieName(), sessionToken, getCookieOptions());
    return res.json({ data: { user } });
  } catch (e) {
    return next(e);
  }
});

router.get("/me", (req, res) => {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    return res.status(400).json({ error: { message: "Auth belum dikonfigurasi (JWT_SECRET kosong)" } });
  }

  const token = req.cookies?.[getCookieName()];
  if (!token) return res.status(401).json({ error: { message: "Belum login" } });

  try {
    const payload = jwt.verify(token, jwtSecret, {
      issuer: "uas-web-backend",
      audience: "uas-web-frontend",
    });
    const user = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      role: payload.role,
    };
    return res.json({ data: { user } });
  } catch {
    return res.status(401).json({ error: { message: "Sesi tidak valid" } });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie(getCookieName(), { ...getCookieOptions(), maxAge: 0 });
  res.json({ ok: true });
});

module.exports = router;
