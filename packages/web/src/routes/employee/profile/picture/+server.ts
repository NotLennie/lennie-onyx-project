import type { RequestHandler } from '@sveltejs/kit';

/** Proxy the employee profile-picture upload to the API worker.
 *
 * See packages/web/src/routes/portal/profile/picture/+server.ts for the
 * full explanation.  The root cause is identical: import.meta.env.PUBLIC_API_URL
 * is undefined at Vite build time because PUBLIC_API_URL is a Cloudflare
 * runtime binding, not a build-time env var.
 */
export const POST: RequestHandler = async ({ request, platform, cookies }) => {
	const apiBase = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';

	const formData = await request.formData();

	const session = cookies.get('session');
	const headers: HeadersInit = session ? { Cookie: `session=${session}` } : {};

	const upstream = await fetch(`${apiBase}/api/employee/profile/picture`, {
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
