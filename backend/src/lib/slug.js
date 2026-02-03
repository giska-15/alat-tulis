function slugify(input) {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function productImageUrl(productId, categoryId) {
  const q = categoryId === "AT" ? "stationery" : "product";
  return `https://source.unsplash.com/featured/600x450?${encodeURIComponent(q)}&sig=${encodeURIComponent(
    String(productId ?? "0")
  )}`;
}

module.exports = { slugify, productImageUrl };
