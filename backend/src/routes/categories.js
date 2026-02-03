const express = require("express");
const { z } = require("zod");
const { prisma } = require("../prisma");
const { sendError } = require("../lib/http");
const { slugify } = require("../lib/slug");

const router = express.Router();

const CategoryCreateSchema = z.object({
  id: z.string().length(2),
  name: z.string().min(2).max(20),
});

const CategoryUpdateSchema = CategoryCreateSchema.partial();

router.get("/", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { id: { contains: q } },
        ],
      }
    : undefined;

  const rows = await prisma.productCategory.findMany({
    where,
    orderBy: { name: "asc" },
  });

  const data = rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: slugify(c.name),
  }));

  res.json({ data });
});

router.get("/:id", async (req, res) => {
  const id = String(req.params.id ?? "").trim();
  if (!id) return sendError(res, 400, "Invalid id");

  const c = await prisma.productCategory.findUnique({ where: { id } });
  if (!c) return sendError(res, 404, "Category not found");

  res.json({
    data: {
      id: c.id,
      name: c.name,
      slug: slugify(c.name),
    },
  });
});

router.post("/", async (req, res) => {
  const parsed = CategoryCreateSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Validation error", parsed.error.flatten());

  try {
    const created = await prisma.productCategory.create({
      data: {
        id: parsed.data.id,
        name: parsed.data.name,
      },
    });
    res.status(201).json({
      data: {
        id: created.id,
        name: created.name,
        slug: slugify(created.name),
      },
    });
  } catch (e) {
    return sendError(res, 400, "Failed to create category", String(e.message ?? e));
  }
});

router.put("/:id", async (req, res) => {
  const id = String(req.params.id ?? "").trim();
  if (!id) return sendError(res, 400, "Invalid id");

  const parsed = CategoryUpdateSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Validation error", parsed.error.flatten());

  try {
    const updated = await prisma.productCategory.update({
      where: { id },
      data: {
        ...(parsed.data.id ? { id: parsed.data.id } : {}),
        ...(parsed.data.name ? { name: parsed.data.name } : {}),
      },
    });
    res.json({
      data: {
        id: updated.id,
        name: updated.name,
        slug: slugify(updated.name),
      },
    });
  } catch (e) {
    return sendError(res, 400, "Failed to update category", String(e.message ?? e));
  }
});

router.delete("/:id", async (req, res) => {
  const id = String(req.params.id ?? "").trim();
  if (!id) return sendError(res, 400, "Invalid id");

  try {
    await prisma.productCategory.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    return sendError(res, 400, "Failed to delete category", String(e.message ?? e));
  }
});

module.exports = router;
