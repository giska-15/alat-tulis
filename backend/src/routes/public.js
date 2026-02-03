const express = require("express");
const { prisma } = require("../prisma");
const { slugify, productImageUrl } = require("../lib/slug");
const { toInt } = require("../lib/http");

const router = express.Router();

router.get("/config", (req, res) => {
  res.json({
    data: {
      googleClientId: String(process.env.GOOGLE_CLIENT_ID ?? "").trim() || null,
    },
  });
});

// Homepage payload for the Astro frontend
router.get("/home", async (req, res) => {
  const bestLimit = toInt(req.query.bestLimit, 4) ?? 4;
  const exploreLimit = toInt(req.query.exploreLimit, 8) ?? 8;
  const newLimit = toInt(req.query.newLimit, 4) ?? 4;

  try {
    const categories = await prisma.productCategory.findMany({ orderBy: { name: "asc" } });

    const requestedThemeId = req.query.themeCategoryId != null ? String(req.query.themeCategoryId) : undefined;
    const hasAT = categories.some((c) => c.id === "AT");
    const themeCategoryId =
      (requestedThemeId && categories.some((c) => c.id === requestedThemeId) ? requestedThemeId : undefined) ??
      (hasAT ? "AT" : categories[0]?.id ?? "AT");

    const bestGrouped = await prisma.detailPenjualan.groupBy({
      by: ["productId"],
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: bestLimit,
    });

    let bestSelling = [];
    if (bestGrouped.length) {
      const bestIds = bestGrouped.map((g) => g.productId);
      const bestRows = await prisma.product.findMany({
        where: { id: { in: bestIds } },
        include: { category: true },
      });
      const bestById = new Map(bestRows.map((p) => [p.id, p]));
      bestSelling = bestGrouped
        .map((g) => {
          const p = bestById.get(g.productId);
          if (!p) return null;
          return {
            id: p.id,
            name: p.name,
            slug: slugify(p.name),
            price: p.price,
            stock: p.stock,
            imageUrl: productImageUrl(p.id, p.categoryId),
            soldQty: g._sum.qty ?? 0,
            category: { id: p.category.id, name: p.category.name, slug: slugify(p.category.name) },
          };
        })
        .filter(Boolean);
    } else {
      const fallbackRows = await prisma.product.findMany({
        include: { category: true },
        orderBy: { id: "desc" },
        take: bestLimit,
      });
      bestSelling = fallbackRows.map((p) => ({
        id: p.id,
        name: p.name,
        slug: slugify(p.name),
        price: p.price,
        stock: p.stock,
        imageUrl: productImageUrl(p.id, p.categoryId),
        soldQty: 0,
        category: { id: p.category.id, name: p.category.name, slug: slugify(p.category.name) },
      }));
    }

    const exploreRows = await prisma.product.findMany({
      where: themeCategoryId ? { categoryId: themeCategoryId } : undefined,
      include: { category: true },
      orderBy: { id: "desc" },
      take: exploreLimit,
    });

    const explore = exploreRows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: slugify(p.name),
      price: p.price,
      stock: p.stock,
      imageUrl: productImageUrl(p.id, p.categoryId),
      category: { id: p.category.id, name: p.category.name, slug: slugify(p.category.name) },
    }));

    const newRows = await prisma.product.findMany({
      include: { category: true },
      orderBy: { id: "desc" },
      take: newLimit,
    });

    const newArrival = newRows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: slugify(p.name),
      price: p.price,
      stock: p.stock,
      imageUrl: productImageUrl(p.id, p.categoryId),
      category: { id: p.category.id, name: p.category.name, slug: slugify(p.category.name) },
    }));

    return res.json({
      data: {
        categories: categories.map((c) => ({ id: c.id, name: c.name, slug: slugify(c.name) })),
        bestSelling,
        explore,
        newArrival,
        themeCategoryId,
      },
    });
  } catch (err) {
    console.warn("/api/public/home: falling back to demo payload (db not available)");
    console.warn(err);

    const demoCategories = [
      { id: "AT", name: "Alat Tulis" },
      { id: "BK", name: "Buku" },
      { id: "PG", name: "Penggaris" },
      { id: "PF", name: "Map" },
    ];

    const demoProducts = [
      { id: 1, name: "Pensil 2B AT 1", price: 2500, stock: 120, categoryId: "AT" },
      { id: 2, name: "Pulpen Gel AT 2", price: 6000, stock: 75, categoryId: "AT" },
      { id: 3, name: "Penghapus AT 3", price: 3000, stock: 200, categoryId: "AT" },
      { id: 4, name: "Rautan AT 4", price: 4500, stock: 90, categoryId: "AT" },
      { id: 5, name: "Spidol AT 5", price: 9000, stock: 60, categoryId: "AT" },
      { id: 6, name: "Buku Tulis 40 Lembar", price: 7500, stock: 40, categoryId: "BK" },
      { id: 7, name: "Penggaris 30cm", price: 5000, stock: 30, categoryId: "PG" },
      { id: 8, name: "Map Plastik", price: 4000, stock: 150, categoryId: "PF" },
    ];

    const toProduct = (p) => {
      const cat = demoCategories.find((c) => c.id === p.categoryId) ?? demoCategories[0];
      return {
        id: p.id,
        name: p.name,
        slug: slugify(p.name),
        price: p.price,
        stock: p.stock,
        imageUrl: productImageUrl(p.id, p.categoryId),
        category: { id: cat.id, name: cat.name, slug: slugify(cat.name) },
      };
    };

    const data = {
      categories: demoCategories.map((c) => ({ id: c.id, name: c.name, slug: slugify(c.name) })),
      bestSelling: demoProducts.slice(0, bestLimit).map((p, i) => ({ ...toProduct(p), soldQty: 10 - i })),
      explore: demoProducts.slice(0, exploreLimit).map(toProduct),
      newArrival: demoProducts.slice(0, newLimit).map(toProduct),
      themeCategoryId: "AT",
    };

    return res.json({ data });
  }
});

module.exports = router;
