# Alat Tulis — UAS Web (Fullstack)

Aplikasi e-commerce **alat tulis** (UAS Web) dengan:

- **Frontend**: Astro + TypeScript
- **Backend**: Node.js (Express) + Prisma
- **Database**: MariaDB/MySQL (opsional via Docker Compose)

> Mode demo tersedia: kalau database belum jalan, aplikasi tetap bisa menampilkan produk (fallback payload) agar UI tetap bisa dites.

---

## Fitur

- Katalog produk, kategori, best selling, dan explore
- Detail produk (dynamic route)
- Keranjang, wishlist, checkout (client-side store)
- Auth: register/login + session cookie (`/api/auth/*`)
- Admin pages (UI) untuk kategori, produk, customer, transaksi

---

## Struktur Folder

```text
.
├─ backend/            # Express + Prisma API
├─ frontend/           # Astro app
└─ docker-compose.yml  # MariaDB (opsional)
```

---

## Menjalankan (Quickstart)

### 1) Database (opsional, disarankan)

Repo ini menyediakan `docker-compose.yml` untuk MariaDB.

```bash
docker compose up -d
```

Database akan expose ke host port **3307** (container 3306) dan otomatis import `backend/prisma/genexmart.sql` saat volume masih kosong.

### 2) Backend

Masuk ke folder backend:

```bash
cd backend
npm install
```

Buat file `.env` dari contoh:

```bash
copy .env.example .env
```

Minimal set:

- `DATABASE_URL` (contoh Docker: `mysql://root:root@localhost:3307/genexmart`)
- `JWT_SECRET` (wajib untuk login/register)
- `PORT` (default `4000`)

Jalankan:

```bash
npm run dev
```

Backend berjalan di: `http://localhost:4000`

### 3) Frontend

Di terminal baru:

```bash
cd frontend
npm install
npm run dev
```

Frontend biasanya berjalan di: `http://localhost:4321` (kalau port bentrok, Astro akan naikkan port otomatis).

> Opsional: jika backend tidak di `http://localhost:4000`, buat `frontend/.env`:
>
> ```env
> PUBLIC_API_BASE=http://localhost:4000
> ```

---

## Mode Demo (tanpa DB)

Kalau database belum siap/jalan, backend tetap bisa:

- `GET /api/public/home` mengembalikan **fallback demo payload** agar produk tetap muncul.
- Auth tetap bisa dipakai selama `JWT_SECRET` diisi.

Login cepat untuk demo:

- Identifier: `admin`
- Password: `admin`

---

## Endpoint Penting

- Health check: `GET /health`
- Home payload: `GET /api/public/home`
- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- CRUD:
  - Categories: `/api/categories`
  - Products: `/api/products`
  - Customers: `/api/customers`
  - Sales: `/api/sales`
  - Cashiers: `/api/cashiers`

---

## Catatan

- File `.env`, `node_modules`, database lokal (`*.db`) dan `cookiejar*.txt` sudah di-ignore dari Git.
- Frontend menggunakan gambar katalog lokal di `frontend/public/images/catalog` untuk menjaga konsistensi thumbnail di card/cart/checkout.

---

## Lisensi

Project tugas/UAS. Silakan sesuaikan kebutuhan kampus.
