export type GoogleUser = {
	sub: string;
	name?: string;
	email?: string;
	picture?: string;
	given_name?: string;
	family_name?: string;
};

const AUTH_KEY = "exclusive_google_user_v1";

function base64UrlDecode(input: string): string {
	const pad = "=".repeat((4 - (input.length % 4)) % 4);
	const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
	if (typeof window === "undefined") return "";
	return decodeURIComponent(
		Array.prototype.map
			.call(atob(b64), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
			.join("")
	);
}

export function decodeJwtPayload<T = any>(jwt: string): T | null {
	try {
		const parts = String(jwt).split(".");
		if (parts.length < 2) return null;
		return JSON.parse(base64UrlDecode(parts[1])) as T;
	} catch {
		return null;
	}
}

export function saveGoogleUser(user: GoogleUser, idToken: string): void {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(AUTH_KEY, JSON.stringify({ user, idToken }));
	window.dispatchEvent(new CustomEvent("auth:changed"));
}

export function loadGoogleUser(): { user: GoogleUser; idToken: string } | null {
	if (typeof window === "undefined") return null;
	const raw = window.localStorage.getItem(AUTH_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as { user: GoogleUser; idToken: string };
	} catch {
		return null;
	}
}

export function clearGoogleUser(): void {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(AUTH_KEY);
	window.dispatchEvent(new CustomEvent("auth:changed"));
}
