const express = require("express");
const { z } = require("zod");
const { prisma } = require("../prisma");
const { toInt, sendError } = require("../lib/http");

const router = express.Router();

const SaleCreateSchema = z.object({
  customerId: z.string().length(8).optional().nullable(),
  cashierId: z.string().length(8).optional(),
  methodId: z.string().length(1).optional().nullable(),
  orderDate: z.string().optional(),
  bankTrans: z.string().max(25).optional().nullable(),
  receiptNumber: z.string().max(20).optional().nullable(),
  trackingNumber: z.string().max(25).optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        qty: z.number().int().positive(),
        price: z.number().int().nonnegative(),
      })
    )
    .min(1),
});

router.get("/", async (req, res) => {
  const customerId = String(req.query.customerId ?? "").trim();
  const q = String(req.query.q ?? "").trim();

  const whereParts = [];
  if (customerId) whereParts.push({ customerId });
  if (q) {
    whereParts.push({
      OR: [
        { receiptNumber: { contains: q } },
        { trackingNumber: { contains: q } },
        // allow quick search by numeric order id
        ...(Number.isFinite(Number(q)) ? [{ id: Number(q) }] : []),
      ],
    });
  }
  const where = whereParts.length ? { AND: whereParts } : undefined;

  const data = await prisma.penjualan.findMany({
    where,
    include: {
      customer: true,
      items: {
        include: { product: true },
      },
      cashier: true,
      method: true,
    },
    orderBy: { id: "desc" },
  });

  res.json({ data });
});

router.get("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return sendError(res, 400, "Invalid id");

  const data = await prisma.penjualan.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } },
      cashier: true,
      method: true,
    },
  });
  if (!data) return sendError(res, 404, "Sale not found");

  res.json({ data });
});

router.post("/", async (req, res) => {
  const body = {
    ...req.body,
    customerId: req.body?.customerId != null ? String(req.body.customerId) : null,
    cashierId: req.body?.cashierId != null ? String(req.body.cashierId) : undefined,
    methodId: req.body?.methodId != null ? String(req.body.methodId) : null,
    orderDate: req.body?.orderDate != null ? String(req.body.orderDate) : undefined,
    bankTrans: req.body?.bankTrans != null ? String(req.body.bankTrans) : null,
    receiptNumber: req.body?.receiptNumber != null ? String(req.body.receiptNumber) : null,
    trackingNumber: req.body?.trackingNumber != null ? String(req.body.trackingNumber) : null,
    items: Array.isArray(req.body?.items)
      ? req.body.items.map((it) => ({
          ...it,
          productId: toInt(it.productId, undefined),
          qty: toInt(it.qty, undefined),
          price: toInt(it.price, undefined),
        }))
      : req.body?.items,
  };

  const parsed = SaleCreateSchema.safeParse(body);
  if (!parsed.success) return sendError(res, 400, "Validation error", parsed.error.flatten());

  const { items, ...saleInput } = parsed.data;
  const computedTotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);

  try {
    const cashierId = saleInput.cashierId ?? "12345678";
    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.penjualan.create({
        data: {
          customerId: saleInput.customerId ?? null,
          cashierId,
          methodId: saleInput.methodId ?? "1",
          bankTrans: saleInput.bankTrans ?? null,
          receiptNumber: saleInput.receiptNumber ?? null,
          trackingNumber: saleInput.trackingNumber ?? null,
          orderDate: saleInput.orderDate ? new Date(saleInput.orderDate) : new Date(),
          total: computedTotal,
        },
      });

      await tx.detailPenjualan.createMany({
        data: items.map((it) => ({
          orderId: order.id,
          productId: it.productId,
          qty: it.qty,
          price: it.price,
        })),
      });

      return tx.penjualan.findUnique({
        where: { id: order.id },
        include: {
          customer: true,
          cashier: true,
          method: true,
          items: { include: { product: true } },
        },
      });
    });

    res.status(201).json({ data: created });
  } catch (e) {
    return sendError(res, 400, "Failed to create sale", String(e.message ?? e));
  }
});

router.delete("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return sendError(res, 400, "Invalid id");

  try {
    await prisma.penjualan.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    return sendError(res, 400, "Failed to delete sale", String(e.message ?? e));
  }
});

module.exports = router;
