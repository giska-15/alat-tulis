function defaultApiBase() {
	// Use same-origin by default. In dev, Astro proxies /api -> http://localhost:4000.
	// This is crucial for VS Code devtunnels: the public tunnel host cannot reach :4000 directly.
	return "";
}

const API_BASE = () => (window.__API_BASE ?? defaultApiBase()).replace(/\/$/, "");

async function apiFetch(path, init) {
	const res = await fetch(`${API_BASE()}${path}`, {
		...init,
		headers: {
			Accept: "application/json",
			...(init?.headers || {}),
		},
	});

	if (res.status === 204) return undefined;

	const json = await res.json().catch(() => null);
	if (!res.ok) {
		const message = json?.error?.message || `Request failed: ${res.status}`;
		throw new Error(message);
	}
	if (!json || json.data === undefined) throw new Error("Invalid API response");
	return json.data;
}

export function formatRupiah(value) {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	})
		.format(Number(value || 0))
		.replace(/\u00A0/g, " ");
}

export async function fetchCategoriesSearch(params) {
	const sp = new URLSearchParams();
	if (params?.q) sp.set("q", params.q);
	const qs = sp.toString();
	return apiFetch(`/api/categories${qs ? `?${qs}` : ""}`);
}

export async function createCategory(input) {
	return apiFetch(`/api/categories`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
}

export async function deleteCategory(id) {
	return apiFetch(`/api/categories/${id}`, { method: "DELETE" });
}

export async function fetchProducts(params) {
	const sp = new URLSearchParams();
	if (params?.q) sp.set("q", params.q);
	if (params?.categoryId) sp.set("categoryId", params.categoryId);
	if (params?.limit != null) sp.set("limit", String(params.limit));
	if (params?.bestSelling) sp.set("bestSelling", "1");
	const qs = sp.toString();
	return apiFetch(`/api/products${qs ? `?${qs}` : ""}`);
}

export async function createProduct(input) {
	return apiFetch(`/api/products`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
}

export async function deleteProduct(id) {
	return apiFetch(`/api/products/${id}`, { method: "DELETE" });
}

export async function fetchCustomersSearch(params) {
	const sp = new URLSearchParams();
	if (params?.q) sp.set("q", params.q);
	const qs = sp.toString();
	return apiFetch(`/api/customers${qs ? `?${qs}` : ""}`);
}

export async function fetchCustomers() {
	return apiFetch(`/api/customers`);
}

export async function createCustomer(input) {
	return apiFetch(`/api/customers`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
}

export async function deleteCustomer(id) {
	return apiFetch(`/api/customers/${id}`, { method: "DELETE" });
}

export async function fetchSales() {
	return apiFetch(`/api/sales`);
}

export async function createSale(input) {
	return apiFetch(`/api/sales`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
}

export async function deleteSale(id) {
	return apiFetch(`/api/sales/${id}`, { method: "DELETE" });
}

export async function fetchCashier(id) {
	return apiFetch(`/api/cashiers/${id}`);
}

export async function fetchCashiers(params) {
	const sp = new URLSearchParams();
	if (params?.q) sp.set("q", params.q);
	const qs = sp.toString();
	return apiFetch(`/api/cashiers${qs ? `?${qs}` : ""}`);
}
