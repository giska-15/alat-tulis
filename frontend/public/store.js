(function () {
	'use strict';

	var CART_KEY = 'exclusive_cart_v1';
	var WISHLIST_KEY = 'exclusive_wishlist_v1';

	function safeParse(raw, fallback) {
		if (!raw) return fallback;
		try {
			return JSON.parse(raw);
		} catch (_e) {
			return fallback;
		}
	}

	function loadCart() {
		return safeParse(window.localStorage.getItem(CART_KEY), []);
	}

	function saveCart(lines) {
		window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
		window.dispatchEvent(new CustomEvent('store:cart'));
	}

	function loadWishlist() {
		return safeParse(window.localStorage.getItem(WISHLIST_KEY), []);
	}

	function saveWishlist(items) {
		window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
		window.dispatchEvent(new CustomEvent('store:wishlist'));
	}

	function addToCart(product, qty) {
		var q = Math.max(1, Math.floor(Number(qty || 1)));
		var lines = loadCart();
		var idx = lines.findIndex(function (l) {
			return l && l.product && l.product.id === product.id;
		});
		if (idx >= 0) {
			lines[idx] = { product: lines[idx].product, qty: Math.max(1, lines[idx].qty + q) };
		} else {
			lines.push({ product: product, qty: q });
		}
		saveCart(lines);
	}

	function removeFromCart(productId) {
		saveCart(
			loadCart().filter(function (l) {
				return l && l.product && l.product.id !== productId;
			})
		);
	}

	function setCartQty(productId, qty) {
		var nextQty = Math.max(1, Math.floor(Number(qty || 1)));
		var lines = loadCart().map(function (l) {
			return l.product.id === productId ? { product: l.product, qty: nextQty } : l;
		});
		saveCart(lines);
	}

	function clearCart() {
		saveCart([]);
	}

	function isInWishlist(productId) {
		return loadWishlist().some(function (p) {
			return p && p.id === productId;
		});
	}

	function toggleWishlist(product) {
		var items = loadWishlist();
		var exists = items.some(function (p) {
			return p && p.id === product.id;
		});
		var next = exists
			? items.filter(function (p) {
					return p && p.id !== product.id;
				})
			: [product].concat(items);
		saveWishlist(next);
		return !exists;
	}

	function moveWishlistToCart() {
		var items = loadWishlist();
		items.forEach(function (p) {
			addToCart(p, 1);
		});
		saveWishlist([]);
	}

	function formatRupiah(amount) {
		try {
			return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
		} catch (_e) {
			return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
		}
	}

	var PLACEHOLDER_IMG = '/images/product-placeholder.svg';

	function parseAtIndex(name) {
		if (!name) return null;
		var m = String(name).match(/\bAT\s*(\d{1,2})\b/i);
		if (!m) return null;
		var n = Number(m[1]);
		if (!Number.isFinite(n) || n < 1 || n > 12) return null;
		return n;
	}

	function fallbackImageUrl(product) {
		var categoryId = product && product.category && product.category.id ? String(product.category.id) : '';
		// category-level overrides (match src/lib/image.ts intent)
		if (categoryId === 'PF' || categoryId === 'FB' || categoryId === 'BD') return '/images/catalog/at12.png';
		if (categoryId === 'PG' || categoryId === 'AR') return '/images/catalog/at4.png';
		if (categoryId === 'BK' || categoryId === 'KP' || categoryId === 'NT' || categoryId === 'EN') return '/images/catalog/at3.png';

		var atIndex = parseAtIndex(product && product.name);
		if (atIndex) return '/images/catalog/at' + String(atIndex) + '.png';

		var id = product && product.id != null ? Number(product.id) : 0;
		var safe = Number.isFinite(id) ? Math.abs(id) : 0;
		var idx = (safe % 6) + 1;
		return '/images/catalog/fallback' + String(idx) + '.webp';
	}

	function expectedCatalogImage(product) {
		if (!product) return '';
		var categoryId = product && product.category && product.category.id ? String(product.category.id) : '';
		if (categoryId === 'PF' || categoryId === 'FB' || categoryId === 'BD') return '/images/catalog/at12.png';
		if (categoryId === 'PG' || categoryId === 'AR') return '/images/catalog/at4.png';
		if (categoryId === 'BK' || categoryId === 'KP' || categoryId === 'NT' || categoryId === 'EN') return '/images/catalog/at3.png';
		var atIndex = parseAtIndex(product && product.name);
		if (atIndex) return '/images/catalog/at' + String(atIndex) + '.png';
		return '';
	}

	function resolveImageUrl(product) {
		var url = product && product.imageUrl != null ? String(product.imageUrl).trim() : '';
		if (url && url !== 'undefined' && url !== 'null') return url;
		return fallbackImageUrl(product) || PLACEHOLDER_IMG;
	}

	function isMissingImageUrl(product) {
		var url = product && product.imageUrl != null ? String(product.imageUrl).trim() : '';
		return !url || url === 'undefined' || url === 'null';
	}

	function normalizeStoredImages() {
		var changed = false;
		var cart = loadCart();
		var nextCart = cart.map(function (l) {
			if (!l || !l.product) return l;
			var expected = expectedCatalogImage(l.product);
			var url = l.product.imageUrl != null ? String(l.product.imageUrl).trim() : '';
			if (expected) {
				var shouldFix =
					!url ||
					url === 'undefined' ||
					url === 'null' ||
					url.indexOf('product-placeholder.svg') >= 0 ||
					url.indexOf('/images/catalog/fallback') === 0 ||
					url.indexOf('unsplash.com') >= 0 ||
					url !== expected;
				if (shouldFix) {
					l.product.imageUrl = expected;
					changed = true;
					return l;
				}
			}

			if (isMissingImageUrl(l.product)) {
				l.product.imageUrl = fallbackImageUrl(l.product) || PLACEHOLDER_IMG;
				changed = true;
			}
			return l;
		});
		if (changed) saveCart(nextCart);

		var wChanged = false;
		var wish = loadWishlist();
		var nextWish = wish.map(function (p) {
			if (!p) return p;
			var expected = expectedCatalogImage(p);
			var url = p.imageUrl != null ? String(p.imageUrl).trim() : '';
			if (expected) {
				var shouldFix =
					!url ||
					url === 'undefined' ||
					url === 'null' ||
					url.indexOf('product-placeholder.svg') >= 0 ||
					url.indexOf('/images/catalog/fallback') === 0 ||
					url.indexOf('unsplash.com') >= 0 ||
					url !== expected;
				if (shouldFix) {
					p.imageUrl = expected;
					wChanged = true;
					return p;
				}
			}

			if (isMissingImageUrl(p)) {
				p.imageUrl = fallbackImageUrl(p) || PLACEHOLDER_IMG;
				wChanged = true;
			}
			return p;
		});
		if (wChanged) saveWishlist(nextWish);
	}

	function updateHeaderBadges() {
		var cartCount = loadCart().reduce(function (s, l) {
			return s + (l.qty || 0);
		}, 0);
		var wishlistCount = loadWishlist().length;

		document.querySelectorAll('[data-store-count]').forEach(function (el) {
			var key = el.getAttribute('data-store-count');
			var value = key === 'cart' ? cartCount : key === 'wishlist' ? wishlistCount : 0;
			el.textContent = String(value);
			el.style.display = value > 0 ? 'grid' : 'none';
		});

		document.querySelectorAll('[data-wishlist-state]').forEach(function (el) {
			var id = Number(el.getAttribute('data-wishlist-state') || '0');
			if (!Number.isFinite(id) || id <= 0) return;
			el.setAttribute('data-active', isInWishlist(id) ? '1' : '0');
		});
	}

	function getProductFromElement(el) {
		if (!el) return null;
		var raw = el.getAttribute('data-product');
		if (!raw) return null;
		try {
			return JSON.parse(raw);
		} catch (_e) {
			return null;
		}
	}

	function tryHydrateImageUrlFromDom(product, scopeEl) {
		if (!product) return;
		try {
			var img = null;

			if (scopeEl && scopeEl instanceof Element) {
				img = scopeEl.querySelector('img[data-product-image]') || scopeEl.querySelector('img');
			}

			if ((!img || !(img instanceof HTMLImageElement)) && product.id != null) {
				img = document.querySelector('img[data-product-image-id="' + String(product.id) + '"]');
			}

			if (!(img instanceof HTMLImageElement)) return;
			var src = (img.currentSrc || img.src || '').trim();
			if (!src) return;
			if (src.indexOf('product-placeholder.svg') >= 0) return;
			product.imageUrl = src;
		} catch (_e) {
			// ignore
		}
	}

	function initStoreUi() {
		normalizeStoredImages();
		updateHeaderBadges();

		window.addEventListener('store:cart', updateHeaderBadges);
		window.addEventListener('store:wishlist', updateHeaderBadges);
		window.addEventListener('storage', function (e) {
			if (e.key === CART_KEY || e.key === WISHLIST_KEY) updateHeaderBadges();
		});

		document.addEventListener('click', function (e) {
			var target = e.target;
			if (!(target instanceof Element)) return;
			var actionEl = target.closest('[data-action]');
			if (!actionEl) return;
			var action = actionEl.getAttribute('data-action');
			if (!action) return;

			if (action === 'add-to-cart') {
				e.preventDefault();
				var host = actionEl.closest('[data-product]');
				var product = getProductFromElement(host) || getProductFromElement(actionEl);
				if (!product) return;
				tryHydrateImageUrlFromDom(product, host || actionEl);
				var qty = Number(actionEl.getAttribute('data-qty') || '1');
				addToCart(product, Number.isFinite(qty) ? qty : 1);
				return;
			}

			if (action === 'buy-now') {
				e.preventDefault();
				var hostBuy = actionEl.closest('[data-product]');
				var productBuy = getProductFromElement(hostBuy) || getProductFromElement(actionEl);
				if (!productBuy) return;
				tryHydrateImageUrlFromDom(productBuy, hostBuy || actionEl);
				var qtyBuy = Number(actionEl.getAttribute('data-qty') || '1');
				var nextQty = Number.isFinite(qtyBuy) ? Math.max(1, Math.floor(qtyBuy)) : 1;
				saveCart([{ product: productBuy, qty: nextQty }]);
				window.location.href = '/checkout';
				return;
			}

			if (action === 'toggle-wishlist') {
				e.preventDefault();
				var host2 = actionEl.closest('[data-product]');
				var product2 = getProductFromElement(host2) || getProductFromElement(actionEl);
				if (!product2) return;
				tryHydrateImageUrlFromDom(product2, host2 || actionEl);
				toggleWishlist(product2);
				return;
			}
		});
	}

	function renderWishlistGrid(opts) {
		var grid = opts.grid;
		var empty = opts.empty;
		var onCount = opts.onCount;

		var items = loadWishlist();
		if (typeof onCount === 'function') onCount(items.length);
		grid.innerHTML = '';
		empty.style.display = items.length ? 'none' : 'block';

		items.forEach(function (p) {
			var card = document.createElement('article');
			card.className = 'group';
			card.setAttribute('data-product', JSON.stringify(p));
			card.innerHTML =
				'<div class="relative overflow-hidden rounded bg-zinc-50 ring-1 ring-zinc-100">' +
				'<button class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded bg-white/90 text-zinc-700 shadow ring-1 ring-zinc-200 hover:text-zinc-900" type="button" aria-label="Remove">' +
				'<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 14h8l1-14"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>' +
				'</button>' +
				'<a class="block aspect-[4/3] bg-white" href="/products/' +
				p.id +
				'" aria-label="Lihat ' +
				(p.name || 'Product') +
				'">' +
				'<img src="' +
				resolveImageUrl(p) +
				'" alt="' +
				(p.name || 'Product') +
				'" class="h-full w-full object-cover" loading="lazy" onerror="this.onerror=null; this.src=\'/images/product-placeholder.svg\';" />' +
				'</a>' +
				'<button class="absolute inset-x-0 bottom-0 translate-y-full bg-black py-2 text-center text-sm font-medium text-white transition group-hover:translate-y-0" type="button" data-action="add-to-cart">Add To Cart</button>' +
				'</div>' +
				'<div class="mt-3 space-y-1">' +
				'<p class="line-clamp-2 text-sm font-medium">' +
				(p.name || 'Product') +
				'</p>' +
				'<p class="text-sm text-red-500">' +
				formatRupiah(Number(p.price || 0)) +
				'</p>' +
				'</div>';

			card.querySelector('button[aria-label="Remove"]').addEventListener('click', function () {
				saveWishlist(
					loadWishlist().filter(function (x) {
						return x && x.id !== p.id;
					})
				);
				renderWishlistGrid(opts);
			});

			grid.appendChild(card);
		});
	}

	function renderCartTable(opts) {
		var tbody = opts.tbody;
		var empty = opts.empty;
		var subtotalEl = opts.subtotalEl;
		var shippingEl = opts.shippingEl;
		var totalEl = opts.totalEl;

		var lines = loadCart();
		tbody.innerHTML = '';
		empty.style.display = lines.length ? 'none' : 'table-row';

		var subtotal = lines.reduce(function (s, l) {
			return s + Number(l.product.price || 0) * Number(l.qty || 1);
		}, 0);
		var shipping = 0;
		var total = subtotal + shipping;
		subtotalEl.textContent = formatRupiah(subtotal);
		shippingEl.textContent = shipping === 0 ? 'Free' : formatRupiah(shipping);
		totalEl.textContent = formatRupiah(total);

		lines.forEach(function (l) {
			var tr = document.createElement('tr');
			tr.className = 'border-b border-zinc-100 last:border-0';
			tr.innerHTML =
				'<td class="px-6 py-5">' +
				'<div class="flex items-center gap-4">' +
				'<img src="' +
				resolveImageUrl(l.product) +
				'" alt="' +
				(l.product.name || 'Product') +
				'" class="h-14 w-14 rounded bg-white object-cover ring-1 ring-zinc-100" loading="lazy" onerror="this.onerror=null; this.src=\'/images/product-placeholder.svg\';" />' +
				'<div>' +
				'<p class="line-clamp-2 max-w-[18rem] font-medium">' +
				(l.product.name || 'Product') +
				'</p>' +
				'<button type="button" class="mt-1 text-xs text-red-500 hover:underline">Remove</button>' +
				'</div>' +
				'</div>' +
				'</td>' +
				'<td class="px-6 py-5">' +
				formatRupiah(Number(l.product.price || 0)) +
				'</td>' +
				'<td class="px-6 py-5">' +
				'<div class="inline-flex h-10 items-center rounded border border-zinc-200 px-2">' +
				'<button type="button" class="h-8 w-8 text-zinc-500 hover:text-zinc-900" data-dec>-</button>' +
				'<span class="w-10 text-center text-sm font-semibold" data-qty>' +
				String(l.qty || 1).padStart(2, '0') +
				'</span>' +
				'<button type="button" class="h-8 w-8 text-zinc-500 hover:text-zinc-900" data-inc>+</button>' +
				'</div>' +
				'</td>' +
				'<td class="px-6 py-5" data-line-total>' +
				formatRupiah(Number(l.product.price || 0) * Number(l.qty || 1)) +
				'</td>';

			tr.querySelector('button:not([data-dec]):not([data-inc])').addEventListener('click', function () {
				removeFromCart(l.product.id);
				renderCartTable(opts);
			});

			tr.querySelector('[data-dec]').addEventListener('click', function () {
				setCartQty(l.product.id, (l.qty || 1) - 1);
				renderCartTable(opts);
			});
			tr.querySelector('[data-inc]').addEventListener('click', function () {
				setCartQty(l.product.id, (l.qty || 1) + 1);
				renderCartTable(opts);
			});

			tbody.appendChild(tr);
		});
	}

	function renderCheckoutSummary(opts) {
		var itemsRoot = opts.itemsRoot;
		var emptyEl = opts.emptyEl;
		var subtotalEl = opts.subtotalEl;
		var shippingEl = opts.shippingEl;
		var totalEl = opts.totalEl;

		var lines = loadCart();
		itemsRoot.innerHTML = '';
		emptyEl.style.display = lines.length ? 'none' : 'block';

		lines.forEach(function (l) {
			var row = document.createElement('div');
			row.className = 'flex items-center justify-between gap-4';
			row.innerHTML =
				'<div class="flex items-center gap-3">' +
				'<img src="' +
				resolveImageUrl(l.product) +
				'" alt="' +
				(l.product.name || 'Product') +
				'" class="h-12 w-12 rounded bg-white object-cover ring-1 ring-zinc-100" loading="lazy" onerror="this.onerror=null; this.src=\'/images/product-placeholder.svg\';" />' +
				'<div>' +
				'<p class="line-clamp-1 text-sm font-medium">' +
				(l.product.name || 'Product') +
				'</p>' +
				'<p class="text-xs text-zinc-500">Qty: ' +
				Number(l.qty || 1) +
				'</p>' +
				'</div>' +
				'</div>' +
				'<p class="text-sm font-semibold">' +
				formatRupiah(Number(l.product.price || 0) * Number(l.qty || 1)) +
				'</p>';
			itemsRoot.appendChild(row);
		});

		var subtotal = lines.reduce(function (s, l) {
			return s + Number(l.product.price || 0) * Number(l.qty || 1);
		}, 0);
		var shipping = 0;
		var total = subtotal + shipping;
		subtotalEl.textContent = formatRupiah(subtotal);
		shippingEl.textContent = shipping === 0 ? 'Free' : formatRupiah(shipping);
		totalEl.textContent = formatRupiah(total);
	}

	function apiFetchJson(path, init) {
		return fetch(
			path,
			Object.assign({}, init || {}, {
				headers: Object.assign({ Accept: 'application/json' }, (init && init.headers) || {}),
			})
		).then(function (res) {
			if (res.status === 204) return undefined;
			return res
				.json()
				.catch(function () {
					return null;
				})
				.then(function (json) {
					if (!res.ok) {
						var message = (json && json.error && json.error.message) || 'Request failed: ' + res.status;
						throw new Error(message);
					}
					return (json && json.data) || json;
				});
		});
	}

	function placeOrder(input) {
		var lines = loadCart();
		if (!lines.length) return Promise.reject(new Error('Cart kamu kosong'));
		var payload = {
			customerId: (input && input.customerId) != null ? input.customerId : null,
			cashierId: input && input.cashierId,
			methodId: (input && input.methodId) != null ? input.methodId : null,
			bankTrans: (input && input.bankTrans) != null ? input.bankTrans : null,
			receiptNumber: (input && input.receiptNumber) != null ? input.receiptNumber : null,
			trackingNumber: (input && input.trackingNumber) != null ? input.trackingNumber : null,
			items: lines.map(function (l) {
				return {
					productId: Number(l.product.id),
					qty: Number(l.qty || 1),
					price: Number(l.product.price || 0),
				};
			}),
		};

		return apiFetchJson('/api/sales', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		}).then(function (data) {
			clearCart();
			return data;
		});
	}

	window.ExclusiveStore = {
		initStoreUi: initStoreUi,
		loadCart: loadCart,
		loadWishlist: loadWishlist,
		addToCart: addToCart,
		toggleWishlist: toggleWishlist,
		moveWishlistToCart: moveWishlistToCart,
		renderWishlistGrid: renderWishlistGrid,
		renderCartTable: renderCartTable,
		renderCheckoutSummary: renderCheckoutSummary,
		placeOrder: placeOrder,
		formatRupiah: formatRupiah,
		clearCart: clearCart,
	};
})();
