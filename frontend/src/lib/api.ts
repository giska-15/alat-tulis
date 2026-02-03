export type Category = {
	id: string;
	name: string;
	slug: string;
};

export type Product = {
	id: number;
	name: string;
	slug: string;
	price: number;
	stock: number | null;
	imageUrl: string;
	category: Category;
	soldQty?: number;
};

export type HomePayload = {
	categories: Category[];
	bestSelling: Product[];
	explore: Product[];
	newArrival: Product[];
	themeCategoryId: string;
};

const PUBLIC_API_BASE = import.meta.env.PUBLIC_API_BASE;

// If a real backend isn't configured, use demo data for production deployments
// (GitHub Pages, Vercel, etc). Keep local dev using the backend + Vite proxy.
const USE_DEMO_DATA = !import.meta.env.DEV && !PUBLIC_API_BASE;

const DEMO_CATEGORIES: Category[] = [
	{ id: "AT", name: "Alat Tulis", slug: "alat-tulis" },
	{ id: "PL", name: "Pulpen", slug: "pulpen" },
	{ id: "PN", name: "Pensil", slug: "pensil" },
	{ id: "BK", name: "Buku", slug: "buku" },
	{ id: "PG", name: "Penggaris", slug: "penggaris" },
	{ id: "SP", name: "Spidol", slug: "spidol" },
	{ id: "HB", name: "Highlighter", slug: "highlighter" },
	{ id: "PF", name: "Map & File", slug: "map-dan-file" },
];

const DEMO_CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(DEMO_CATEGORIES.map((c) => [String(c.id), c]));

const DEMO_PRODUCTS: Product[] = [
	{ id: 1, name: "AT 1 Pensil 2B", slug: "at-1-pensil-2b", price: 2000, stock: 120, imageUrl: "", category: DEMO_CATEGORY_BY_ID.PN, soldQty: 98 },
	{ id: 2, name: "AT 2 Pensil HB", slug: "at-2-pensil-hb", price: 2500, stock: 90, imageUrl: "", category: DEMO_CATEGORY_BY_ID.PN, soldQty: 76 },
	{ id: 3, name: "AT 3 Buku Tulis A5", slug: "at-3-buku-tulis-a5", price: 6500, stock: 60, imageUrl: "", category: DEMO_CATEGORY_BY_ID.BK, soldQty: 54 },
	{ id: 4, name: "AT 4 Penggaris 30cm", slug: "at-4-penggaris-30cm", price: 5000, stock: 70, imageUrl: "", category: DEMO_CATEGORY_BY_ID.PG, soldQty: 41 },
	{ id: 5, name: "AT 5 Pulpen Gel 0.5", slug: "at-5-pulpen-gel-05", price: 4500, stock: 80, imageUrl: "", category: DEMO_CATEGORY_BY_ID.PL, soldQty: 88 },
	{ id: 6, name: "AT 6 Spidol Permanent", slug: "at-6-spidol-permanent", price: 9000, stock: 40, imageUrl: "", category: DEMO_CATEGORY_BY_ID.SP, soldQty: 35 },
	{ id: 7, name: "AT 7 Highlighter Neon", slug: "at-7-highlighter-neon", price: 7000, stock: 55, imageUrl: "", category: DEMO_CATEGORY_BY_ID.HB, soldQty: 29 },
	{ id: 8, name: "AT 8 Map Plastik", slug: "at-8-map-plastik", price: 3500, stock: 110, imageUrl: "", category: DEMO_CATEGORY_BY_ID.PF, soldQty: 63 },
];

function demoFetchCategories(): Category[] {
	return DEMO_CATEGORIES;
}

function demoFetchCategory(id: string): Category {
	const c = DEMO_CATEGORY_BY_ID[String(id)];
	if (!c) throw new Error("Kategori tidak ditemukan");
	return c;
}

function demoFetchProducts(params?: { q?: string; categoryId?: string; limit?: number; bestSelling?: boolean }): Product[] {
	let rows = DEMO_PRODUCTS.slice();

	if (params?.categoryId) rows = rows.filter((p) => String(p.category?.id) === String(params.categoryId));
	if (params?.q) {
		const q = String(params.q).trim().toLowerCase();
		if (q) rows = rows.filter((p) => String(p.name).toLowerCase().includes(q));
	}
	if (params?.bestSelling) rows = rows.slice().sort((a, b) => Number(b.soldQty ?? 0) - Number(a.soldQty ?? 0));
	if (params?.limit != null) rows = rows.slice(0, Math.max(0, Number(params.limit) || 0));
	return rows;
}

function demoFetchProduct(id: number): Product {
	const p = DEMO_PRODUCTS.find((x) => x.id === Number(id));
	if (!p) throw new Error("Produk tidak ditemukan");
	return p;
}

function demoFetchHome(): HomePayload {
	const explore = DEMO_PRODUCTS.slice(0, 8);
	const bestSelling = DEMO_PRODUCTS.slice().sort((a, b) => Number(b.soldQty ?? 0) - Number(a.soldQty ?? 0)).slice(0, 4);
	const newArrival = DEMO_PRODUCTS.slice(0, 4);
	return {
		categories: DEMO_CATEGORIES,
		bestSelling,
		explore,
		newArrival,
		themeCategoryId: "AT",
	};
}

const API_BASE = PUBLIC_API_BASE ?? "http://localhost:4000";

type ApiEnvelope<T> = {
	data: T;
	error?: { message?: string };
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		...init,
		headers: {
			Accept: "application/json",
			...(init?.headers ?? {}),
		},
	});

	if (res.status === 204) return undefined as T;

	const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
	if (!res.ok) {
		const message = json?.error?.message ?? `Request failed: ${res.status}`;
		throw new Error(message);
	}
	if (!json || (json as any).data === undefined) throw new Error("Invalid API response");
	return json.data;
}

export async function fetchCategories(): Promise<Category[]> {
	if (USE_DEMO_DATA) return demoFetchCategories();
	return apiFetch<Category[]>("/api/categories");
}

export async function fetchCategoriesSearch(params?: { q?: string }): Promise<Category[]> {
	if (USE_DEMO_DATA) return demoFetchCategories();
	const sp = new URLSearchParams();
	if (params?.q) sp.set("q", params.q);
	const qs = sp.toString();
	return apiFetch<Category[]>(`/api/categories${qs ? `?${qs}` : ""}`);
}

export async function fetchProducts(params?: {
	q?: string;
	categoryId?: string;
	limit?: number;
	bestSelling?: boolean;
}): Promise<Product[]> {
	if (USE_DEMO_DATA) return demoFetchProducts(params);
	const sp = new URLSearchParams();
	if (params?.q) sp.set("q", params.q);
	if (params?.categoryId) sp.set("categoryId", params.categoryId);
	if (params?.limit != null) sp.set("limit", String(params.limit));
	if (params?.bestSelling) sp.set("bestSelling", "1");
	const qs = sp.toString();
	return apiFetch<Product[]>(`/api/products${qs ? `?${qs}` : ""}`);
}

export async function fetchProduct(id: number): Promise<Product> {
	if (USE_DEMO_DATA) return demoFetchProduct(id);
	return apiFetch<Product>(`/api/products/${id}`);
}

export async function fetchCategory(id: string): Promise<Category> {
	if (USE_DEMO_DATA) return demoFetchCategory(id);
	return apiFetch<Category>(`/api/categories/${id}`);
}

export async function createCategory(input: { id: string; name: string }): Promise<Category> {
	return apiFetch<Category>("/api/categories", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
}

export async function deleteCategory(id: string): Promise<void> {
	await apiFetch<void>(`/api/categories/${id}`, { method: "DELETE" });
}

export async function createProduct(input: {
	name: string;
	price: number;
	categoryId: string;
	stock?: number | null;
}): Promise<Product> {
	return apiFetch<Product>("/api/products", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
}

export async function deleteProduct(id: number): Promise<void> {
	await apiFetch<void>(`/api/products/${id}`, { method: "DELETE" });
}

export type Customer = {
	id: string;
	name: string;
	email: string;
	contactNumber: string;
	address: string;
	placeOfBirth: string;
	dateOfBirth: string | Date;
	genderId: "L" | "P";
};

export async function fetchCustomers(): Promise<Customer[]> {
	return apiFetch<Customer[]>("/api/customers");
}

export async function fetchCustomersSearch(params?: { q?: string }): Promise<Customer[]> {
	const sp = new URLSearchParams();
	if (params?.q) sp.set("q", params.q);
	const qs = sp.toString();
	return apiFetch<Customer[]>(`/api/customers${qs ? `?${qs}` : ""}`);
}

export async function createCustomer(input: {
	id: string;
	name: string;
	address: string;
	placeOfBirth: string;
	dateOfBirth: string;
	contactNumber: string;
	email: string;
	genderId: "L" | "P";
}): Promise<Customer> {
	return apiFetch<Customer>("/api/customers", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
}

export async function deleteCustomer(id: string): Promise<void> {
	await apiFetch<void>(`/api/customers/${id}`, { method: "DELETE" });
}

export type SaleItemInput = { productId: number; qty: number; price: number };
export type Sale = {
	id: number;
	orderDate: string | Date;
	total: number;
	customerId?: string | null;
	cashierId?: string;
	methodId?: string | null;
};

export type Cashier = {
	id: string;
	username: string;
	email: string;
	contactNumber: string;
	address: string;
	placeOfBirth: string;
	dateOfBirth: string | Date;
	genderId: string;
};

export async function fetchCashier(id: string): Promise<Cashier> {
	return apiFetch<Cashier>(`/api/cashiers/${id}`);
}

export async function fetchCashiers(params?: { q?: string }): Promise<Cashier[]> {
	const sp = new URLSearchParams();
	if (params?.q) sp.set("q", params.q);
	const qs = sp.toString();
	return apiFetch<Cashier[]>(`/api/cashiers${qs ? `?${qs}` : ""}`);
}

export async function fetchSales(): Promise<any[]> {
	return apiFetch<any[]>("/api/sales");
}

export async function createSale(input: {
	customerId?: string | null;
	cashierId?: string;
	methodId?: string | null;
	orderDate?: string;
	bankTrans?: string | null;
	receiptNumber?: string | null;
	items: SaleItemInput[];
}): Promise<any> {
	return apiFetch<any>("/api/sales", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
}

export async function deleteSale(id: number): Promise<void> {
	await apiFetch<void>(`/api/sales/${id}`, { method: "DELETE" });
}

export async function fetchHome(): Promise<HomePayload> {
	if (USE_DEMO_DATA) return demoFetchHome();
	return apiFetch<HomePayload>("/api/public/home");
}

export function formatRupiah(value: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	})
		.format(value)
		.replace(/\u00A0/g, " ");
}
