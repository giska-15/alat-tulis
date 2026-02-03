import { fallbackProductImage } from "./image";

export type StoredProduct = {
	id: number;
	name: string;
	slug: string;
	price: number;
	stock: number | null;
	imageUrl: string;
	category?: { id: string; name: string; slug: string };
};

export type CartLine = { product: StoredProduct; qty: number };

const CART_KEY = "exclusive_cart_v1";
const WISHLIST_KEY = "exclusive_wishlist_v1";

function safeParse<T>(raw: string | null, fallback: T): T {
	if (!raw) return fallback;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

export function loadCart(): CartLine[] {
	if (typeof window === "undefined") return [];
	return safeParse<CartLine[]>(window.localStorage.getItem(CART_KEY), []);
}

export function saveCart(lines: CartLine[]): void {
	window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
	window.dispatchEvent(new CustomEvent("store:cart"));
}

export function loadWishlist(): StoredProduct[] {
	if (typeof window === "undefined") return [];
	return safeParse<StoredProduct[]>(window.localStorage.getItem(WISHLIST_KEY), []);
}

export function saveWishlist(items: StoredProduct[]): void {
	window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
	window.dispatchEvent(new CustomEvent("store:wishlist"));
}

export function addToCart(product: StoredProduct, qty = 1): void {
	const lines = loadCart();
	const idx = lines.findIndex((l) => l.product.id === product.id);
	if (idx >= 0) {
		lines[idx] = { product: lines[idx].product, qty: Math.max(1, lines[idx].qty + qty) };
	} else {
		lines.push({ product, qty: Math.max(1, qty) });
	}
	saveCart(lines);
}

export function removeFromCart(productId: number): void {
	saveCart(loadCart().filter((l) => l.product.id !== productId));
}

export function setCartQty(productId: number, qty: number): void {
	const nextQty = Math.max(1, Math.floor(qty || 1));
	const lines = loadCart().map((l) => (l.product.id === productId ? { ...l, qty: nextQty } : l));
	saveCart(lines);
}

export function clearCart(): void {
	saveCart([]);
}

export function isInWishlist(productId: number): boolean {
	return loadWishlist().some((p) => p.id === productId);
}

export function toggleWishlist(product: StoredProduct): boolean {
	const items = loadWishlist();
	const exists = items.some((p) => p.id === product.id);
	const next = exists ? items.filter((p) => p.id !== product.id) : [product, ...items];
	saveWishlist(next);
	return !exists;
}

export function moveWishlistToCart(): void {
	const items = loadWishlist();
	for (const p of items) addToCart(p, 1);
	saveWishlist([]);
}

function formatRupiah(amount: number): string {
	try {
		return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
	} catch {
		return `Rp ${amount.toLocaleString("id-ID")}`;
	}
}

function updateHeaderBadges(): void {
	const cartCount = loadCart().reduce((s, l) => s + l.qty, 0);
	const wishlistCount = loadWishlist().length;
	for (const el of document.querySelectorAll<HTMLElement>("[data-store-count]")) {
		const key = el.dataset.storeCount;
		const value = key === "cart" ? cartCount : key === "wishlist" ? wishlistCount : 0;
		el.textContent = String(value);
		el.style.display = value > 0 ? "grid" : "none";
	}

	for (const el of document.querySelectorAll<HTMLElement>("[data-wishlist-state]")) {
		const id = Number(el.dataset.wishlistState);
		if (!Number.isFinite(id)) continue;
		el.dataset.active = isInWishlist(id) ? "1" : "0";
	}
}

function getProductFromElement(el: Element): StoredProduct | null {
	const raw = (el as HTMLElement).dataset.product;
	if (!raw) return null;
	try {
		return JSON.parse(raw) as StoredProduct;
	} catch {
		return null;
	}
}

export function initStoreUi(): void {
	if (typeof window === "undefined") return;
	updateHeaderBadges();

	window.addEventListener("store:cart", updateHeaderBadges);
	window.addEventListener("store:wishlist", updateHeaderBadges);
	window.addEventListener("storage", (e) => {
		if (e.key === CART_KEY || e.key === WISHLIST_KEY) updateHeaderBadges();
	});

	document.addEventListener("click", (e) => {
		const target = e.target as Element | null;
		if (!target) return;
		const actionEl = target.closest<HTMLElement>("[data-action]");
		if (!actionEl) return;
		const action = actionEl.dataset.action;
		if (!action) return;

		if (action === "add-to-cart") {
			e.preventDefault();
			const host = actionEl.closest<HTMLElement>("[data-product]");
			const product = (host && getProductFromElement(host)) || getProductFromElement(actionEl);
			if (!product) return;
			const qty = Number(actionEl.dataset.qty ?? "1");
			addToCart(product, Number.isFinite(qty) ? qty : 1);
			return;
		}

		if (action === "toggle-wishlist") {
			e.preventDefault();
			const host = actionEl.closest<HTMLElement>("[data-product]");
			const product = (host && getProductFromElement(host)) || getProductFromElement(actionEl);
			if (!product) return;
			toggleWishlist(product);
			return;
		}
	});
}

export function renderWishlistGrid(opts: {
	grid: HTMLElement;
	empty: HTMLElement;
	onCount?: (count: number) => void;
}): void {
	const items = loadWishlist();
	opts.onCount?.(items.length);
	opts.grid.innerHTML = "";
	opts.empty.style.display = items.length ? "none" : "block";

	for (const p of items) {
		const fallbackImg = fallbackProductImage(p.id, p.name, p.category?.id);
		const imageSrc = p.imageUrl || fallbackImg;
		const card = document.createElement("article");
		card.className = "group";
		card.dataset.product = JSON.stringify(p);

		card.innerHTML = `
			<div class="relative overflow-hidden rounded bg-zinc-50 ring-1 ring-zinc-100">
				<button class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded bg-white/90 text-zinc-700 shadow ring-1 ring-zinc-200 hover:text-zinc-900" type="button" data-action="remove-wishlist" aria-label="Remove">
					<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
				</button>
				<a class="block aspect-[4/3] bg-white" href="/products/${p.id}" aria-label="Lihat ${p.name}">
					<img src="${imageSrc}" alt="${p.name}" class="h-full w-full object-cover" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${fallbackImg}';" />
				</a>
				<button class="absolute inset-x-0 bottom-0 translate-y-full bg-black py-2 text-center text-sm font-medium text-white transition group-hover:translate-y-0" type="button" data-action="add-to-cart">Add To Cart</button>
			</div>
			<div class="mt-3 space-y-1">
				<p class="line-clamp-2 text-sm font-medium">${p.name}</p>
				<p class="text-sm text-red-500">${formatRupiah(p.price)}</p>
			</div>
		`;

		card.querySelector("[data-action='remove-wishlist']")?.addEventListener("click", () => {
			saveWishlist(loadWishlist().filter((x) => x.id !== p.id));
			renderWishlistGrid(opts);
		});

		opts.grid.appendChild(card);
	}
}

export function renderCartTable(opts: {
	tbody: HTMLElement;
	empty: HTMLElement;
	subtotalEl: HTMLElement;
	shippingEl: HTMLElement;
	totalEl: HTMLElement;
}): void {
	const lines = loadCart();
	opts.tbody.innerHTML = "";
	opts.empty.style.display = lines.length ? "none" : "table-row";

	const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
	const shipping = 0;
	const total = subtotal + shipping;
	opts.subtotalEl.textContent = formatRupiah(subtotal);
	opts.shippingEl.textContent = shipping === 0 ? "Free" : formatRupiah(shipping);
	opts.totalEl.textContent = formatRupiah(total);

	for (const l of lines) {
		const fallbackImg = fallbackProductImage(l.product.id, l.product.name, l.product.category?.id);
		const imageSrc = l.product.imageUrl || fallbackImg;
		const tr = document.createElement("tr");
		tr.className = "border-b border-zinc-100 last:border-0";
		tr.dataset.product = JSON.stringify(l.product);
		tr.innerHTML = `
			<td class="px-6 py-5">
				<div class="flex items-center gap-4">
					<img src="${imageSrc}" alt="${l.product.name}" class="h-14 w-14 rounded bg-white object-cover ring-1 ring-zinc-100" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${fallbackImg}';" />
					<div>
						<p class="line-clamp-2 max-w-[18rem] font-medium">${l.product.name}</p>
						<button type="button" class="mt-1 text-xs text-red-500 hover:underline" data-action="remove">Remove</button>
					</div>
				</div>
			</td>
			<td class="px-6 py-5" data-cell="price">${formatRupiah(l.product.price)}</td>
			<td class="px-6 py-5">
				<div class="inline-flex h-10 items-center rounded border border-zinc-200 px-2">
					<button type="button" class="h-8 w-8 text-zinc-500 hover:text-zinc-900" data-action="dec">-</button>
					<span class="w-10 text-center text-sm font-semibold" data-cell="qty">${String(l.qty).padStart(2, "0")}</span>
					<button type="button" class="h-8 w-8 text-zinc-500 hover:text-zinc-900" data-action="inc">+</button>
				</div>
			</td>
			<td class="px-6 py-5" data-cell="lineTotal">${formatRupiah(l.product.price * l.qty)}</td>
		`;

		const updateRow = () => {
			const fresh = loadCart().find((x) => x.product.id === l.product.id);
			if (!fresh) return;
			(tr.querySelector("[data-cell='qty']") as HTMLElement).textContent = String(fresh.qty).padStart(2, "0");
			(tr.querySelector("[data-cell='lineTotal']") as HTMLElement).textContent = formatRupiah(fresh.product.price * fresh.qty);
		};

		tr.querySelector("[data-action='remove']")?.addEventListener("click", () => {
			removeFromCart(l.product.id);
			renderCartTable(opts);
		});
		tr.querySelector("[data-action='dec']")?.addEventListener("click", () => {
			setCartQty(l.product.id, (loadCart().find((x) => x.product.id === l.product.id)?.qty ?? 1) - 1);
			updateRow();
			renderCartTable(opts);
		});
		tr.querySelector("[data-action='inc']")?.addEventListener("click", () => {
			setCartQty(l.product.id, (loadCart().find((x) => x.product.id === l.product.id)?.qty ?? 1) + 1);
			updateRow();
			renderCartTable(opts);
		});

		opts.tbody.appendChild(tr);
	}
}

export function renderCheckoutSummary(opts: {
	itemsRoot: HTMLElement;
	emptyEl: HTMLElement;
	subtotalEl: HTMLElement;
	shippingEl: HTMLElement;
	totalEl: HTMLElement;
}): void {
	const lines = loadCart();
	opts.itemsRoot.innerHTML = "";
	opts.emptyEl.style.display = lines.length ? "none" : "block";

	for (const l of lines) {
		const fallbackImg = fallbackProductImage(l.product.id, l.product.name, l.product.category?.id);
		const imageSrc = l.product.imageUrl || fallbackImg;
		const row = document.createElement("div");
		row.className = "flex items-center justify-between gap-4";
		row.innerHTML = `
			<div class="flex items-center gap-3">
				<img src="${imageSrc}" alt="${l.product.name}" class="h-12 w-12 rounded bg-white object-cover ring-1 ring-zinc-100" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${fallbackImg}';" />
				<div>
					<p class="line-clamp-1 text-sm font-medium">${l.product.name}</p>
					<p class="text-xs text-zinc-500">Qty: ${l.qty}</p>
				</div>
			</div>
			<p class="text-sm font-semibold">${formatRupiah(l.product.price * l.qty)}</p>
		`;
		opts.itemsRoot.appendChild(row);
	}

	const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
	const shipping = 0;
	const total = subtotal + shipping;
	opts.subtotalEl.textContent = formatRupiah(subtotal);
	opts.shippingEl.textContent = shipping === 0 ? "Free" : formatRupiah(shipping);
	opts.totalEl.textContent = formatRupiah(total);
}

async function apiFetchJson(path: string, init?: RequestInit): Promise<any> {
	const res = await fetch(path, {
		...init,
		headers: {
			Accept: "application/json",
			...(init?.headers ?? {}),
		},
	});
	if (res.status === 204) return undefined;
	const json = await res.json().catch(() => null);
	if (!res.ok) {
		const message = json?.error?.message ?? `Request failed: ${res.status}`;
		throw new Error(message);
	}
	return json?.data ?? json;
}

export async function placeOrder(input?: {
	customerId?: string | null;
	cashierId?: string;
	methodId?: string | null;
	bankTrans?: string | null;
	receiptNumber?: string | null;
	trackingNumber?: string | null;
}): Promise<any> {
	if (typeof window === "undefined") throw new Error("Checkout only available in browser");
	const lines = loadCart();
	if (!lines.length) throw new Error("Cart kamu kosong");

	const payload = {
		customerId: input?.customerId ?? null,
		cashierId: input?.cashierId,
		methodId: input?.methodId ?? null,
		bankTrans: input?.bankTrans ?? null,
		receiptNumber: input?.receiptNumber ?? null,
		trackingNumber: input?.trackingNumber ?? null,
		items: lines.map((l) => ({
			productId: l.product.id,
			qty: l.qty,
			price: l.product.price,
		})),
	};

	const data = await apiFetchJson("/api/sales", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	clearCart();
	return data;
}
