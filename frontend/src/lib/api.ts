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

const API_BASE = import.meta.env.PUBLIC_API_BASE ?? "http://localhost:4000";

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
	return apiFetch<Category[]>("/api/categories");
}

export async function fetchCategoriesSearch(params?: { q?: string }): Promise<Category[]> {
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
	const sp = new URLSearchParams();
	if (params?.q) sp.set("q", params.q);
	if (params?.categoryId) sp.set("categoryId", params.categoryId);
	if (params?.limit != null) sp.set("limit", String(params.limit));
	if (params?.bestSelling) sp.set("bestSelling", "1");
	const qs = sp.toString();
	return apiFetch<Product[]>(`/api/products${qs ? `?${qs}` : ""}`);
}

export async function fetchProduct(id: number): Promise<Product> {
	return apiFetch<Product>(`/api/products/${id}`);
}

export async function fetchCategory(id: string): Promise<Category> {
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
