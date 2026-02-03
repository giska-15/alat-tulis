const express = require("express");
const { z } = require("zod");
const { prisma } = require("../prisma");
const { toInt, sendError } = require("../lib/http");
const { slugify, productImageUrl } = require("../lib/slug");

const router = express.Router();

const ProductCreateSchema = z.object({
  name: z.string().min(2).max(40),
  price: z.number().int().nonnegative(),
  categoryId: z.string().length(2),
  stock: z.number().int().nonnegative().optional().nullable(),
  createdBy: z.string().min(2).max(40).optional(),
  updatedBy: z.string().min(2).max(40).optional(),
});

const ProductUpdateSchema = ProductCreateSchema.partial();

router.get("/", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const categoryId = req.query.categoryId != null ? String(req.query.categoryId) : undefined;
  const bestSelling = req.query.bestSelling === "1" || req.query.bestSelling === "true";
  const limit = toInt(req.query.limit, undefined);

  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(q
      ? {
          name: { contains: q },
        }
      : {}),
  };

  if (bestSelling) {
    const grouped = await prisma.detailPenjualan.groupBy({
      by: ["productId"],
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      ...(limit ? { take: limit } : {}),
    });

    const ids = grouped.map((g) => g.productId);
    const rows = await prisma.product.findMany({
      where: { id: { in: ids }, ...(categoryId ? { categoryId } : {}), ...(q ? { name: { contains: q } } : {}) },
      include: { category: true },
    });

    const byId = new Map(rows.map((p) => [p.id, p]));
    const data = grouped
      .map((g) => {
        const p = byId.get(g.productId);
        if (!p) return null;
        return {
          id: p.id,
          name: p.name,
          slug: slugify(p.name),
          price: p.price,
          stock: p.stock,
          category: { id: p.category.id, name: p.category.name, slug: slugify(p.category.name) },
          imageUrl: productImageUrl(p.id, p.categoryId),
          soldQty: g._sum.qty ?? 0,
        };
      })
      .filter(Boolean);

    return res.json({ data });
  }

  const rows = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { id: "desc" },
    ...(limit ? { take: limit } : {}),
  });

  const data = rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: slugify(p.name),
    price: p.price,
    stock: p.stock,
    category: { id: p.category.id, name: p.category.name, slug: slugify(p.category.name) },
    imageUrl: productImageUrl(p.id, p.categoryId),
  }));

  res.json({ data });
});

router.get("/slug/:slug", async (req, res) => {
  const slug = String(req.params.slug);
  // Slug isn't stored in DB; we derive it from PRODUCT_NAME.
  const rows = await prisma.product.findMany({
    include: { category: true },
    orderBy: { id: "desc" },
    take: 500,
  });
  const found = rows.find((p) => slugify(p.name) === slug);
  if (!found) return sendError(res, 404, "Product not found");

  res.json({
    data: {
      id: found.id,
      name: found.name,
      slug: slugify(found.name),
      price: found.price,
      stock: found.stock,
      category: { id: found.category.id, name: found.category.name, slug: slugify(found.category.name) },
      imageUrl: productImageUrl(found.id, found.categoryId),
    },
  });
});

router.get("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return sendError(res, 400, "Invalid id");

  const p = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!p) return sendError(res, 404, "Product not found");

  res.json({
    data: {
      id: p.id,
      name: p.name,
      slug: slugify(p.name),
      price: p.price,
      stock: p.stock,
      category: { id: p.category.id, name: p.category.name, slug: slugify(p.category.name) },
      imageUrl: productImageUrl(p.id, p.categoryId),
    },
  });
});

router.post("/", async (req, res) => {
  const body = {
    ...req.body,
    price: toInt(req.body?.price, undefined),
    stock: req.body?.stock != null ? toInt(req.body.stock, undefined) : null,
    categoryId: req.body?.categoryId != null ? String(req.body.categoryId) : undefined,
  };

  const parsed = ProductCreateSchema.safeParse(body);
  if (!parsed.success) return sendError(res, 400, "Validation error", parsed.error.flatten());

  try {
    const now = new Date();
    const created = await prisma.product.create({
      data: {
        name: parsed.data.name,
        price: parsed.data.price,
        categoryId: parsed.data.categoryId,
        stock: parsed.data.stock ?? null,
        createdAt: now,
        updatedAt: now,
        createdBy: parsed.data.createdBy ?? "admin",
        updatedBy: parsed.data.updatedBy ?? parsed.data.createdBy ?? "admin",
      },
      include: { category: true },
    });
    res.status(201).json({
      data: {
        id: created.id,
        name: created.name,
        slug: slugify(created.name),
        price: created.price,
        stock: created.stock,
        category: { id: created.category.id, name: created.category.name, slug: slugify(created.category.name) },
        imageUrl: productImageUrl(created.id, created.categoryId),
      },
    });
  } catch (e) {
    return sendError(res, 400, "Failed to create product", String(e.message ?? e));
  }
});

router.put("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return sendError(res, 400, "Invalid id");

  const body = {
    ...req.body,
    price: req.body?.price != null ? toInt(req.body.price, undefined) : undefined,
    stock: req.body?.stock != null ? toInt(req.body.stock, undefined) : undefined,
    categoryId: req.body?.categoryId != null ? String(req.body.categoryId) : undefined,
  };

  const parsed = ProductUpdateSchema.safeParse(body);
  if (!parsed.success) return sendError(res, 400, "Validation error", parsed.error.flatten());

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(parsed.data.name != null ? { name: parsed.data.name } : {}),
        ...(parsed.data.price != null ? { price: parsed.data.price } : {}),
        ...(parsed.data.stock !== undefined ? { stock: parsed.data.stock } : {}),
        ...(parsed.data.categoryId != null ? { categoryId: parsed.data.categoryId } : {}),
        updatedAt: new Date(),
        updatedBy: parsed.data.updatedBy ?? "admin",
      },
      include: { category: true },
    });
    res.json({
      data: {
        id: updated.id,
        name: updated.name,
        slug: slugify(updated.name),
        price: updated.price,
        stock: updated.stock,
        category: { id: updated.category.id, name: updated.category.name, slug: slugify(updated.category.name) },
        imageUrl: productImageUrl(updated.id, updated.categoryId),
      },
    });
  } catch (e) {
    return sendError(res, 400, "Failed to update product", String(e.message ?? e));
  }
});

router.delete("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return sendError(res, 400, "Invalid id");

  try {
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    return sendError(res, 400, "Failed to delete product", String(e.message ?? e));
  }
});

module.exports = router;
