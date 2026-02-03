# UAS Web Backend (Node.js + Prisma)

Backend REST API untuk project E-Commerce alat tulis, **menggunakan database dari** `prisma/genexmart.sql` (MariaDB/MySQL).

## Prasyarat

- Node.js LTS
- MariaDB/MySQL (contoh: XAMPP)

## Setup Database (Wajib)

1. Buat database bernama `genexmart` di MariaDB/MySQL.
2. Import file SQL:
   - Buka phpMyAdmin → Import → pilih `prisma/genexmart.sql` → Go.
3. Atur koneksi database di `.env`:

`DATABASE_URL="mysql://root:@localhost:3306/genexmart"`

> Jika user/password/port berbeda, sesuaikan.

## Menjalankan API

- Install:
  - `npm install`
- Generate Prisma client:
  - `npx prisma generate`
- Jalankan dev server:
  - `npm run dev`

API default: `http://localhost:4000`

## Endpoint utama

- Public homepage payload: `GET /api/public/home`
- Admin CRUD:
  - Categories: `/api/categories`
  - Products: `/api/products`
  - Customers: `/api/customers`
  - Sales (orders): `/api/sales`

Catatan: Karena tabel SQL tidak punya kolom `slug`/`imageUrl`, API mengirim versi **computed** untuk kebutuhan frontend.
