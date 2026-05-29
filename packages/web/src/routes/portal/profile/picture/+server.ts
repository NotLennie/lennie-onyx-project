import type { RequestHandler } from '@sveltejs/kit';

/** Proxy the profile-picture upload to the API worker.
 *
 * The browser-side JS bundle cannot read `platform.env.PUBLIC_API_URL` (a
 * Cloudflare runtime binding).  `import.meta.env.PUBLIC_API_URL` is
 * undefined unless the variable is explicitly injected at Vite build time,
 * which it is not — causing `fetch(BASE + path)` in api.ts to fall back to
 * `http://localhost:8787` in production and throw "Failed to fetch".
 *
 * By routing the upload through a same-origin SvelteKit endpoint we avoid the
 * need for the client to know the API URL at all.
 */
export const POST: RequestHandler = async ({ request, platform, cookies }) => {
	const apiBase = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';

	// Forward the raw FormData body unchanged.
	const formData = await request.formData();

	const session = cookies.get('session');
	const headers: HeadersInit = session ? { Cookie: `session=${session}` } : {};

	const upstream = await fetch(`${apiBase}/api/client/profile/picture`, {
		method: 'POST',
		headers,
		body: formData,
	});

	const body = await upstream.text();
	return new Response(body, {
		status: upstream.status,
		headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
	});
};
