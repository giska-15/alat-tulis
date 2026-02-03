const express = require("express");
const { z } = require("zod");
const { prisma } = require("../prisma");
const { sendError } = require("../lib/http");

const router = express.Router();

const CustomerCreateSchema = z.object({
  id: z.string().length(8),
  name: z.string().min(2).max(45),
  address: z.string().min(3).max(100),
  placeOfBirth: z.string().min(2).max(25),
  dateOfBirth: z.string(),
  contactNumber: z.string().min(6).max(14),
  email: z.string().email().max(40),
  genderId: z.enum(["L", "P"]),
  createdBy: z.string().max(35).optional().nullable(),
  updatedBy: z.string().max(35).optional().nullable(),
});

const CustomerUpdateSchema = CustomerCreateSchema.partial();

router.get("/", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { contactNumber: { contains: q } },
          { id: { contains: q } },
        ],
      }
    : undefined;

  const rows = await prisma.customer.findMany({
    where,
    orderBy: { id: "desc" },
  });

  const data = rows.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    contactNumber: c.contactNumber,
    address: c.address,
    placeOfBirth: c.placeOfBirth,
    dateOfBirth: c.dateOfBirth,
    genderId: c.genderId,
    createdAt: c.createdAt,
    createdBy: c.createdBy,
    updatedAt: c.updatedAt,
    updatedBy: c.updatedBy,
  }));

  res.json({ data });
});

router.get("/:id", async (req, res) => {
  const id = String(req.params.id ?? "").trim();
  if (!id) return sendError(res, 400, "Invalid id");

  const data = await prisma.customer.findUnique({ where: { id } });
  if (!data) return sendError(res, 404, "Customer not found");

  res.json({ data });
});

router.post("/", async (req, res) => {
  const parsed = CustomerCreateSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Validation error", parsed.error.flatten());

  try {
    const now = new Date();
    const created = await prisma.customer.create({
      data: {
        id: parsed.data.id,
        name: parsed.data.name,
        address: parsed.data.address,
        placeOfBirth: parsed.data.placeOfBirth,
        dateOfBirth: new Date(parsed.data.dateOfBirth),
        contactNumber: parsed.data.contactNumber,
        email: parsed.data.email,
        genderId: parsed.data.genderId,
        createdAt: now,
        createdBy: parsed.data.createdBy ?? null,
        updatedAt: now,
        updatedBy: parsed.data.updatedBy ?? null,
      },
    });
    res.status(201).json({ data: created });
  } catch (e) {
    return sendError(res, 400, "Failed to create customer", String(e.message ?? e));
  }
});

router.put("/:id", async (req, res) => {
  const id = String(req.params.id ?? "").trim();
  if (!id) return sendError(res, 400, "Invalid id");

  const parsed = CustomerUpdateSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Validation error", parsed.error.flatten());

  try {
    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(parsed.data.id ? { id: parsed.data.id } : {}),
        ...(parsed.data.name ? { name: parsed.data.name } : {}),
        ...(parsed.data.address ? { address: parsed.data.address } : {}),
        ...(parsed.data.placeOfBirth ? { placeOfBirth: parsed.data.placeOfBirth } : {}),
        ...(parsed.data.dateOfBirth ? { dateOfBirth: new Date(parsed.data.dateOfBirth) } : {}),
        ...(parsed.data.contactNumber ? { contactNumber: parsed.data.contactNumber } : {}),
        ...(parsed.data.email ? { email: parsed.data.email } : {}),
        ...(parsed.data.genderId ? { genderId: parsed.data.genderId } : {}),
        updatedAt: new Date(),
        ...(parsed.data.updatedBy !== undefined ? { updatedBy: parsed.data.updatedBy } : {}),
      },
    });
    res.json({ data: updated });
  } catch (e) {
    return sendError(res, 400, "Failed to update customer", String(e.message ?? e));
  }
});

router.delete("/:id", async (req, res) => {
  const id = String(req.params.id ?? "").trim();
  if (!id) return sendError(res, 400, "Invalid id");

  try {
    await prisma.customer.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    return sendError(res, 400, "Failed to delete customer", String(e.message ?? e));
  }
});

module.exports = router;
