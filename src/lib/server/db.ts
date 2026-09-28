import { createClient, type User } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { Cookies } from '@sveltejs/kit';
import {
	SUPABASE_URL,
	SUPABASE_PUBLISHABLE_KEY,
	SUPABASE_SECRET_KEY,
	ADMIN_EMAIL
} from '$env/static/private';

// Full access. anon/authenticated have no grants on our tables (see supabase/schema.sql),
// so this server is the only way in.
export const db = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
	auth: { persistSession: false, autoRefreshToken: false }
});

// The CV lives at one fixed path in the public "files" bucket, so uploading a
// new one replaces it and every link keeps working.
export const files = db.storage.from('files');
export const CV = 'cv.pdf';

// Per-request auth client; the session lives in httpOnly cookies, never in page JS.
export function auth(cookies: Cookies) {
	return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		cookies: {
			getAll: () => cookies.getAll(),
			setAll: (list) =>
				list.forEach(({ name, value, options }) =>
					cookies.set(name, value, { ...options, path: '/', httpOnly: true })
				)
		}
	});
}

export const isAdmin = (user: User | null) => user?.email === ADMIN_EMAIL.toLowerCase();

// getUser() asks Supabase Auth, so a signed-out/revoked session fails immediately.
export async function getAdmin(cookies: Cookies) {
	const { data } = await auth(cookies).auth.getUser();
	return isAdmin(data.user) ? data.user : null;
}

export type Project = {
	id: number;
	slug: string;
	name: string;
	description: string;
	details: string;
	visit_link: string | null;
	images: string[];
	technologies: { name: string; icon: string }[];
	sort: number;
};

export type Experience = {
	id: number;
	category: 'work' | 'education' | 'organization' | 'achievement';
	name: string;
	title: string;
	date: string;
	description: string;
	sort: number;
};

export async function getProjects(limit?: number) {
	let query = db
		.from('projects')
		.select('*')
		.order('sort')
		.order('created_at', { ascending: false });
	if (limit) query = query.limit(limit);
	const { data, error } = await query;
	if (error) throw new Error(error.message); // supabase errors are plain objects; SvelteKit logs them as "undefined"
	return data as Project[];
}

export async function getExperiences() {
	const { data, error } = await db
		.from('experiences')
		.select('*')
		.order('sort')
		.order('created_at', { ascending: false });
	if (error) throw new Error(error.message);
	return data as Experience[];
}
