const express = require("express");
const { prisma } = require("../prisma");
const { sendError } = require("../lib/http");

const router = express.Router();

function toPublicCashier(c) {
  return {
    id: c.id,
    username: c.username,
    email: c.email,
    contactNumber: c.contactNumber,
    address: c.address,
    placeOfBirth: c.placeOfBirth,
    dateOfBirth: c.dateOfBirth,
    genderId: c.genderId,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

router.get("/", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const where = q
    ? {
        OR: [
          { id: { contains: q } },
          { username: { contains: q } },
          { email: { contains: q } },
          { contactNumber: { contains: q } },
        ],
      }
    : undefined;

  const rows = await prisma.cashier.findMany({
    where,
    orderBy: { id: "desc" },
  });

  res.json({ data: rows.map(toPublicCashier) });
});

router.get("/:id", async (req, res) => {
  const id = String(req.params.id ?? "").trim();
  if (!id) return sendError(res, 400, "Invalid id");

  const row = await prisma.cashier.findUnique({ where: { id } });
  if (!row) return sendError(res, 404, "Cashier not found");

  res.json({ data: toPublicCashier(row) });
});

module.exports = router;
