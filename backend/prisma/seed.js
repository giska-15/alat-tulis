const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function randomIdDigits(len) {
  let out = "";
  for (let i = 0; i < len; i++) out += String(randInt(0, 9));
  return out;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  // Base reference data (safe to re-run)
  await prisma.gender.createMany({
    data: [
      { id: "L", gender: "Laki-laki" },
      { id: "P", gender: "Perempuan" },
    ],
    skipDuplicates: true,
  });

  await prisma.paymentMethod.createMany({
    data: [
      { id: "1", method: "Cash" },
      { id: "2", method: "Transfer" },
      { id: "3", method: "QRIS" },
    ],
    skipDuplicates: true,
  });

  // Ensure at least one cashier exists for transactions/admin sidebar
  const hasCashier = await prisma.cashier.findFirst();
  if (!hasCashier) {
    const now = new Date();
    await prisma.cashier.create({
      data: {
        id: "12345678",
        username: "admin",
        email: "admin@example.com",
        contactNumber: "080000000000",
        address: "Alamat Toko",
        placeOfBirth: "Tegal",
        dateOfBirth: new Date("2000-01-01"),
        genderId: "L",
        createdAt: now,
        updatedAt: now,
        password: "admin",
      },
    });
  }

  await prisma.productCategory.createMany({
    data: [
      { id: "AT", name: "Alat Tulis" },
      { id: "PL", name: "Pulpen" },
      { id: "PN", name: "Pensil" },
      { id: "BK", name: "Buku" },
      { id: "SP", name: "Spidol" },
      { id: "PH", name: "Penghapus" },
      { id: "PG", name: "Penggaris" },
      { id: "TX", name: "Tip-Ex" },
      { id: "ST", name: "Stapler" },
      { id: "CT", name: "Cutter" },
      { id: "GN", name: "Gunting" },

      // Extra ATK categories (lebih banyak biar halaman kategori rame)
      { id: "LM", name: "Lem" },
      { id: "PF", name: "Map & File" },
      { id: "EN", name: "Amplop" },
      { id: "KP", name: "Kertas" },
      { id: "MR", name: "Marker" },
      { id: "HB", name: "Highlighter" },
      { id: "TR", name: "Tinta & Refill" },
      { id: "LB", name: "Label" },
      { id: "LK", name: "Lakban" },
      { id: "CL", name: "Clip" },
      { id: "BD", name: "Binder" },
      { id: "NT", name: "Notebook" },
      { id: "FB", name: "Folder" },
      { id: "KR", name: "Kalkulator" },
      { id: "GL", name: "Glue Stick" },
      { id: "PT", name: "Peralatan Tulis" },
      { id: "AR", name: "Alat Gambar" },
      { id: "WB", name: "Whiteboard" },
      { id: "TP", name: "Tempat Pensil" },
    ],
    skipDuplicates: true,
  });

  // Seed products (idempotent): always try to insert missing items.
  const now = new Date();
  const createdBy = "seed";

  await prisma.product.createMany({
    data: [
      // Pulpen
      { name: "Kenko Pulpen Gel 2 Pcs", price: 10000, categoryId: "PL", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 100 },
      { name: "Joyko Ball Pen 1 Pack", price: 20300, categoryId: "PL", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 80 },
      { name: "Snowman Drawing Pen 0.1", price: 15000, categoryId: "PL", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 90 },
      { name: "Pulpen Pilot G2 0.7", price: 25000, categoryId: "PL", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 55 },
      { name: "Pulpen Standard AE7", price: 6000, categoryId: "PL", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 180 },
      { name: "Refill Tinta Pulpen (Hitam)", price: 7000, categoryId: "TR", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 120 },

      // Pensil
      { name: "Pensil 2B Faber-Castell 12pcs", price: 50000, categoryId: "PN", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 60 },
      { name: "Pensil 2B (Satuan)", price: 5000, categoryId: "PN", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 200 },
      { name: "Pensil Mekanik 0.5", price: 18000, categoryId: "PN", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 90 },
      { name: "Isi Pensil 0.5 2B", price: 8000, categoryId: "TR", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 150 },
      { name: "Rautan Pensil Putar", price: 20000, categoryId: "PN", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 40 },

      // Buku & Kertas
      { name: "Buku Tulis Sinar Dunia 58 Lembar", price: 6000, categoryId: "BK", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 150 },
      { name: "Buku Tulis Sidu 38 Lembar", price: 4000, categoryId: "BK", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 140 },
      { name: "Buku Gambar A4", price: 5000, categoryId: "BK", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 120 },
      { name: "Kertas HVS A4 70gsm (1 Rim)", price: 52000, categoryId: "KP", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 35 },
      { name: "Kertas HVS F4 70gsm (1 Rim)", price: 56000, categoryId: "KP", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 30 },
      { name: "Kertas Kado Polos", price: 7000, categoryId: "KP", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 80 },
      { name: "Amplop Putih A4", price: 12000, categoryId: "EN", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 60 },
      { name: "Amplop Coklat F4", price: 15000, categoryId: "EN", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 55 },
      { name: "Sticky Notes 3x3", price: 9000, categoryId: "LB", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 110 },
      { name: "Buku Nota Kecil", price: 8000, categoryId: "NT", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 90 },

      // Spidol/Marker/Highlighter
      { name: "Spidol Whiteboard Snowman", price: 17000, categoryId: "WB", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 100 },
      { name: "Spidol Snowman Hitam", price: 8000, categoryId: "SP", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 100 },
      { name: "Highlighter Marker Set 6 Warna", price: 18000, categoryId: "HB", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 70 },
      { name: "Marker Permanen Hitam", price: 10000, categoryId: "MR", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 85 },
      { name: "Marker Permanen Biru", price: 10000, categoryId: "MR", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 85 },

      // Penghapus / Tip-Ex
      { name: "Penghapus Joyko", price: 3000, categoryId: "PH", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 180 },
      { name: "Tip Ex Correction Pen", price: 9000, categoryId: "TX", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 60 },
      { name: "Tip Ex Tape Roller", price: 17000, categoryId: "TX", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 45 },

      // Penggaris / Alat gambar
      { name: "Penggaris Besi 30 Cm", price: 15000, categoryId: "PG", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 80 },
      { name: "Penggaris Plastik 30 Cm", price: 5000, categoryId: "PG", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 100 },
      { name: "Jangka (Compass)", price: 22000, categoryId: "AR", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 35 },
      { name: "Set Penggaris Geometri", price: 14000, categoryId: "AR", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 50 },

      // Stapler / Clip / File
      { name: "Stapler Joyko HD-10", price: 35000, categoryId: "ST", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 30 },
      { name: "Isi Staples No.10", price: 7000, categoryId: "ST", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 120 },
      { name: "Paper Clip No. 1 (100 pcs)", price: 9000, categoryId: "CL", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 75 },
      { name: "Binder Clip 25mm (12 pcs)", price: 12000, categoryId: "CL", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 60 },
      { name: "Map Plastik L (A4)", price: 5000, categoryId: "PF", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 140 },
      { name: "Map Folder Kancing", price: 9000, categoryId: "FB", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 80 },

      // Cutter / Gunting / Lem / Lakban
      { name: "Cutter Joyko L-500", price: 6000, categoryId: "CT", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 90 },
      { name: "Isi Cutter 18mm", price: 8000, categoryId: "CT", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 120 },
      { name: "Gunting Kenko", price: 9000, categoryId: "GN", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 70 },
      { name: "Lem UHU 35ml", price: 18000, categoryId: "LM", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 40 },
      { name: "Glue Stick 21g", price: 12000, categoryId: "GL", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 55 },
      { name: "Lakban Bening 48mm", price: 14000, categoryId: "LK", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 65 },
      { name: "Lakban Kertas (Masking Tape)", price: 16000, categoryId: "LK", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 50 },

      // Misc
      { name: "Kalkulator Citizen 12 Digit", price: 85000, categoryId: "KR", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 20 },
      { name: "Whiteboard Mini + Marker", price: 45000, categoryId: "WB", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 25 },
      { name: "Tempat Pensil Meja", price: 25000, categoryId: "TP", createdAt: now, createdBy, updatedAt: now, updatedBy: createdBy, stock: 45 },
    ],
    skipDuplicates: true,
  });

  // Ensure every category has at least a couple of products so category pages aren't empty.
  const categories = await prisma.productCategory.findMany({ select: { id: true, name: true } });
  const grouped = await prisma.product.groupBy({ by: ["categoryId"], _count: { _all: true } });
  const hasProducts = new Set(grouped.map((g) => g.categoryId));

  const fillers = [];
  for (const c of categories) {
    if (hasProducts.has(c.id)) continue;
    for (let i = 1; i <= 2; i++) {
      const base = `Produk ${c.name}`.slice(0, 28);
      const name = `${base} ${c.id}${i}`.slice(0, 40);
      fillers.push({
        name,
        price: 5000 + i * 2500,
        categoryId: c.id,
        createdAt: now,
        createdBy,
        updatedAt: now,
        updatedBy: createdBy,
        stock: 50 + i * 10,
      });
    }
  }
  if (fillers.length) {
    await prisma.product.createMany({ data: fillers, skipDuplicates: true });
  }

  // Distribute older seeded products into ATK sub-categories (safe to re-run)
  await prisma.product.updateMany({
    where: { name: { in: ["Kenko Pulpen Gel 2 Pcs", "Joyko Ball Pen 1 Pack", "Snowman Drawing Pen 0.1"] } },
    data: { categoryId: "PL" },
  });

  await prisma.product.updateMany({
    where: { name: { in: ["Highlighter Marker Set 6 Warna", "Spidol Whiteboard Snowman", "Spidol Snowman Hitam"] } },
    data: { categoryId: "SP" },
  });

  await prisma.product.updateMany({
    where: { name: { in: ["Pensil 2B Faber-Castell 12pcs", "Pensil 2B (Satuan)", "Rautan Pensil Putar"] } },
    data: { categoryId: "PN" },
  });

  await prisma.product.updateMany({
    where: { name: { in: ["Buku Tulis Sinar Dunia 58 Lembar", "Buku Tulis Sidu 38 Lembar", "Buku Gambar A4"] } },
    data: { categoryId: "BK" },
  });

  await prisma.product.updateMany({
    where: { name: { in: ["Penghapus Joyko"] } },
    data: { categoryId: "PH" },
  });

  await prisma.product.updateMany({
    where: { name: { in: ["Penggaris Besi 30 Cm", "Penggaris Plastik 30 Cm"] } },
    data: { categoryId: "PG" },
  });

  await prisma.product.updateMany({
    where: { name: { in: ["Tip Ex Correction Pen"] } },
    data: { categoryId: "TX" },
  });

  await prisma.product.updateMany({
    where: { name: { in: ["Stapler Joyko HD-10", "Isi Staples No.10"] } },
    data: { categoryId: "ST" },
  });

  await prisma.product.updateMany({
    where: { name: { in: ["Cutter Joyko L-500"] } },
    data: { categoryId: "CT" },
  });

  await prisma.product.updateMany({
    where: { name: { in: ["Gunting Kenko"] } },
    data: { categoryId: "GN" },
  });

  // Ensure a few customers exist (for bot transactions)
  // Realistic-but-fictional Indonesian customer data (no real personal data)
  const firstNames = [
    "Ahmad",
    "Rizky",
    "Dimas",
    "Fajar",
    "Bagas",
    "Andi",
    "Putra",
    "Bima",
    "Reza",
    "Ilham",
    "Siti",
    "Alya",
    "Nadia",
    "Dewi",
    "Intan",
    "Rani",
    "Salsa",
    "Nurul",
    "Wulan",
    "Rahma",
  ];
  const lastNames = [
    "Pratama",
    "Saputra",
    "Hidayat",
    "Ramadhan",
    "Wijaya",
    "Maulana",
    "Kurniawan",
    "Permata",
    "Santoso",
    "Lestari",
    "Ananda",
    "Putri",
    "Utami",
    "Fauzan",
    "Syahputra",
  ];
  const cities = [
    "Jakarta",
    "Bandung",
    "Semarang",
    "Surabaya",
    "Yogyakarta",
    "Malang",
    "Tegal",
    "Cirebon",
    "Bekasi",
    "Depok",
    "Bogor",
    "Solo",
  ];
  const streets = [
    "Jl. Sudirman",
    "Jl. Gatot Subroto",
    "Jl. Diponegoro",
    "Jl. Ahmad Yani",
    "Jl. Pemuda",
    "Jl. Merdeka",
    "Jl. Imam Bonjol",
    "Jl. Raya Kaligawe",
    "Jl. Siliwangi",
    "Jl. Pahlawan",
  ];

  const makeEmail = (name, id) => {
    // email column is VARCHAR(40) => keep local part <= 28 (since "@example.com" is 12)
    const suffix = `.${String(id).slice(-3)}`;
    let base = String(name)
      .toLowerCase()
      .replace(/[^a-z]+/g, ".")
      .replace(/\.+/g, ".")
      .replace(/^\.|\.$/g, "");

    if (base.length > 24) base = base.slice(0, 24).replace(/\.$/, "");
    const local = `${base}${suffix}`.replace(/\.+/g, ".").replace(/^\.|\.$/g, "");
    return `${local}@example.com`;
  };

  // Ensure only these two customers are present for demo transactions
  // (IDs must be length 8 because CUST_ID is CHAR(8))
  const fixedCustomers = [
    {
      id: "24090060",
      name: "Akbar Rizqi Ainul Yaqin",
      email: "akbar.rizki@gmail.com",
      contactNumber: "082313054691",
      genderId: "L",
    },
    {
      id: "24090055",
      name: "Giska Aura Muhamad Prasetyo",
      email: "ktlbpkkaupch@gmail.com",
      contactNumber: "0895323030369",
      genderId: "P",
    },
  ];

  const nowCustomer = new Date();
  for (const c of fixedCustomers) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        email: c.email,
        contactNumber: c.contactNumber,
        updatedAt: nowCustomer,
        updatedBy: "seed",
      },
      create: {
        id: c.id,
        name: c.name,
        address: "Jl. Sudirman No. 1, Jakarta",
        placeOfBirth: "Jakarta",
        dateOfBirth: new Date("2000-01-01"),
        contactNumber: c.contactNumber,
        email: c.email,
        genderId: c.genderId,
        createdAt: nowCustomer,
        createdBy: "seed",
        updatedAt: nowCustomer,
        updatedBy: "seed",
      },
    });
  }

  // Keep dataset focused: remove any other customers and orders.
  const fixedIds = fixedCustomers.map((c) => c.id);
  const staleOrders = await prisma.penjualan.findMany({
    where: {
      OR: [{ customerId: null }, { customerId: { notIn: fixedIds } }],
    },
    select: { id: true },
  });
  if (staleOrders.length) {
    const staleOrderIds = staleOrders.map((o) => o.id);
    await prisma.detailPenjualan.deleteMany({ where: { orderId: { in: staleOrderIds } } });
    await prisma.penjualan.deleteMany({ where: { id: { in: staleOrderIds } } });
  }
  await prisma.customer.deleteMany({ where: { id: { notIn: fixedIds } } });

  // Normalize older "generic" customers from previous seed versions so the UI looks realistic.
  // Keep IDs intact so existing bot orders remain linked.
  const genericCustomers = await prisma.customer.findMany({
    where: {
      createdBy: "seed",
      OR: [
        { address: "Indonesia" },
        { email: { startsWith: "user" } },
        { dateOfBirth: new Date("2003-01-01") },
      ],
    },
    take: 50,
  });

  if (genericCustomers.length) {
    const allEmails = await prisma.customer.findMany({ select: { email: true } });
    const usedEmails = new Set(allEmails.map((r) => r.email));
    const now = new Date();

    for (let idx = 0; idx < genericCustomers.length; idx++) {
      const c = genericCustomers[idx];

      const city = pick(cities);
      const address = `${pick(streets)} No. ${randInt(1, 199)}, ${city}`;

      const year = randInt(1990, 2006);
      const month = randInt(1, 12);
      const day = randInt(1, 28);
      const dateOfBirth = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);

      // If name is too generic/short, regenerate a nicer one.
      const nextName = c.name && c.name.trim().length >= 6 ? c.name : `${pick(firstNames)} ${pick(lastNames)}`;

      // Ensure unique email when updating.
      usedEmails.delete(c.email);
      let nextEmail = makeEmail(nextName, c.id);
      while (usedEmails.has(nextEmail)) {
        nextEmail = makeEmail(`${pick(firstNames)} ${pick(lastNames)}`, c.id);
      }
      usedEmails.add(nextEmail);

      await prisma.customer.update({
        where: { id: c.id },
        data: {
          name: nextName,
          address,
          placeOfBirth: pick(cities),
          dateOfBirth,
          email: nextEmail,
          updatedAt: now,
          updatedBy: "seed",
        },
      });
    }
  }

  // Seed bot transactions (orders + order_details)
  const saleCount = await prisma.penjualan.count();
  if (saleCount < 12) {
    const products = await prisma.product.findMany({ orderBy: { id: "asc" }, take: 50 });
    const customers = await prisma.customer.findMany({ where: { id: { in: fixedCustomers.map((c) => c.id) } } });
    const cashiers = await prisma.cashier.findMany({ take: 10 });
    const methods = await prisma.paymentMethod.findMany({ take: 10 });

    if (products.length && cashiers.length) {
      const targetAdds = 12 - saleCount;
      for (let i = 0; i < targetAdds; i++) {
        const customer = customers.length ? pick(customers) : null;
        const cashier = pick(cashiers);
        const method = methods.length ? pick(methods) : null;

        const itemCount = randInt(1, Math.min(4, products.length));
        const chosen = new Map();
        while (chosen.size < itemCount) {
          const p = pick(products);
          chosen.set(p.id, p);
        }

        const items = Array.from(chosen.values()).map((p) => {
          const qty = randInt(1, 4);
          return { productId: p.id, qty, price: p.price };
        });

        const total = items.reduce((sum, it) => sum + it.qty * it.price, 0);
        const orderDate = daysAgo(randInt(0, 25));

        const invoiceNumber = `INV${String(Date.now()).slice(-10)}${randInt(100, 999)}`.slice(0, 20);
        const trackingNumber = `RESI${String(Date.now()).slice(-8)}${randInt(1000, 9999)}`.slice(0, 25);

        await prisma.$transaction(async (tx) => {
          const order = await tx.penjualan.create({
            data: {
              orderDate,
              customerId: customer?.id ?? null,
              cashierId: cashier.id,
              total,
              methodId: method?.id ?? "1",
              bankTrans: method?.id === "2" ? `BCA-${randomIdDigits(10)}` : null,
              // RECEIPT_NUMBER is Char(20)
              receiptNumber: invoiceNumber,
              trackingNumber,
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
        });
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
