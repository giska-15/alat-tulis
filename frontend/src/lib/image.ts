import img6 from "../../assets/shopping (6).webp?url";
import img7 from "../../assets/shopping (7).webp?url";
import img8 from "../../assets/shopping (8).webp?url";
import img9 from "../../assets/shopping (9).webp?url";
import img10 from "../../assets/shopping (10).webp?url";
import img11 from "../../assets/shopping (11).webp?url";

import at1 from "../../assets/download (1).png?url";
import at2 from "../../assets/download (2).png?url";
import at3 from "../../assets/download (3).png?url";
import at4 from "../../assets/download (4).png?url";
import at5 from "../../assets/download (5).png?url";
import at6 from "../../assets/download (6).png?url";
import at7 from "../../assets/download (7).png?url";
import at8 from "../../assets/download (8).png?url";
import at9 from "../../assets/download (9).png?url";
import at10 from "../../assets/download (10).png?url";
import at11 from "../../assets/download (11).png?url";
import at12 from "../../assets/download (12).png?url";

import genericDownload from "../../assets/download.png?url";

const FALLBACKS = [img6, img7, img8, img9, img10, img11] as const;
const AT_IMAGES = [at1, at2, at3, at4, at5, at6, at7, at8, at9, at10, at11, at12] as const;

const CATEGORY_IMAGES: Record<string, string> = {
	// Map & File
	PF: at12,
	FB: at12,
	BD: at12,
	// Penggaris / alat gambar
	PG: at4,
	AR: at4,
	// Buku / Kertas
	BK: at3,
	KP: at3,
	NT: at3,
	EN: at3,
};

function parseAtIndex(name?: string): number | null {
	if (!name) return null;
	const m = name.match(/\bAT\s*(\d{1,2})\b/i);
	if (!m) return null;
	const n = Number(m[1]);
	if (!Number.isFinite(n) || n < 1 || n > 12) return null;
	return n;
}

export function fallbackProductImage(id?: number, name?: string, categoryId?: string): string {
	if (categoryId && CATEGORY_IMAGES[categoryId]) return CATEGORY_IMAGES[categoryId] as string;

	const atIndex = parseAtIndex(name);
	if (atIndex) return AT_IMAGES[atIndex - 1] ?? AT_IMAGES[0];

	// Keyword override for common items
	const nm = String(name ?? "").toLowerCase();
	if (nm.includes("map plastik")) return CATEGORY_IMAGES.PF ?? genericDownload;
	if (nm.includes("penggaris")) return CATEGORY_IMAGES.PG ?? genericDownload;

	const safeId = typeof id === "number" && Number.isFinite(id) ? Math.abs(id) : 0;
	return FALLBACKS[safeId % FALLBACKS.length] ?? img6;
}

export function imgOnErrorTo(fallbackUrl: string): string {
	// Note: used as HTML attribute value.
	return `this.onerror=null; this.src='${fallbackUrl}';`;
}
