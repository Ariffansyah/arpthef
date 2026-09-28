import { fail } from '@sveltejs/kit';
import {
	auth,
	CV,
	db,
	files,
	getAdmin,
	getExperiences,
	getProjects,
	isAdmin
} from '$lib/server/db';

export const load = async ({ cookies }) => {
	const admin = await getAdmin(cookies);
	if (!admin) return { email: null, projects: [], experiences: [], cv: null };
	const { data: cvList } = await files.list('', { search: CV });
	const cv = cvList?.find((f) => f.name === CV);
	return {
		email: admin.email,
		projects: await getProjects(),
		experiences: await getExperiences(),
		cv: cv ? { updatedAt: cv.updated_at, size: Number(cv.metadata?.size ?? 0) } : null
	};
};

const str = (f: FormData, key: string) => String(f.get(key) ?? '').trim();
const expired = () => fail(401, { message: 'Session expired, sign in again.' });

async function write(table: 'projects' | 'experiences', id: string, row: object) {
	const { error } = id
		? await db.from(table).update(row).eq('id', Number(id))
		: await db.from(table).insert(row);
	return error ? fail(400, { message: error.message }) : { message: 'Saved.' };
}

export const actions = {
	login: async ({ request, cookies }) => {
		const f = await request.formData();
		const supabase = auth(cookies);
		const { data, error } = await supabase.auth.signInWithPassword({
			email: str(f, 'email'),
			password: String(f.get('password') ?? '')
		});
		if (error) return fail(400, { message: error.message });
		if (!isAdmin(data.user)) {
			await supabase.auth.signOut();
			return fail(403, { message: 'Not allowed.' });
		}
	},

	logout: async ({ cookies }) => {
		await auth(cookies).auth.signOut();
	},

	saveProject: async ({ request, cookies }) => {
		if (!(await getAdmin(cookies))) return expired();
		const f = await request.formData();
		const name = str(f, 'name');
		const techIcons = f.getAll('tech_icon').map(String);
		return write('projects', str(f, 'id'), {
			name,
			slug:
				str(f, 'slug') ||
				name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, '-')
					.replace(/^-|-$/g, ''),
			description: str(f, 'description'),
			details: str(f, 'details'),
			visit_link: str(f, 'visit_link') || null,
			sort: Number(str(f, 'sort')) || 0,
			images: f.getAll('images').map(String),
			// each tech chip posts a tech_name + tech_icon pair
			technologies: f
				.getAll('tech_name')
				.map((n, i) => ({ name: String(n).trim(), icon: (techIcons[i] ?? '').trim() }))
				.filter((t) => t.name)
		});
	},

	saveExperience: async ({ request, cookies }) => {
		if (!(await getAdmin(cookies))) return expired();
		const f = await request.formData();
		return write('experiences', str(f, 'id'), {
			category: str(f, 'category'),
			name: str(f, 'name'),
			title: str(f, 'title'),
			date: str(f, 'date'),
			description: str(f, 'description'),
			sort: Number(str(f, 'sort')) || 0
		});
	},

	delete: async ({ request, cookies }) => {
		if (!(await getAdmin(cookies))) return expired();
		const f = await request.formData();
		const table = str(f, 'table') === 'projects' ? 'projects' : 'experiences';
		const { error } = await db
			.from(table)
			.delete()
			.eq('id', Number(str(f, 'id')));
		return error ? fail(400, { message: error.message }) : { message: 'Deleted.' };
	},

	// ponytail: one file per request stays under Vercel's 4.5 MB body limit; bigger files need signed upload URLs
	upload: async ({ request, cookies }) => {
		if (!(await getAdmin(cookies))) return expired();
		const file = (await request.formData()).get('file');
		if (!(file instanceof File) || !file.type.startsWith('image/')) {
			return fail(400, { message: 'Not an image.' });
		}
		const path = `projects/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
		const { error } = await db.storage
			.from('images')
			.upload(path, file, { contentType: file.type });
		if (error) return fail(400, { message: error.message });
		return { url: db.storage.from('images').getPublicUrl(path).data.publicUrl };
	},

	uploadCv: async ({ request, cookies }) => {
		if (!(await getAdmin(cookies))) return expired();
		const file = (await request.formData()).get('cv');
		if (!(file instanceof File) || file.type !== 'application/pdf') {
			return fail(400, { message: 'Pick a PDF.' });
		}
		// short cache so the new CV shows up within a minute
		const { error } = await files.upload(CV, file, {
			upsert: true,
			contentType: 'application/pdf',
			cacheControl: '60'
		});
		return error ? fail(400, { message: error.message }) : { message: 'CV updated.' };
	}
};
