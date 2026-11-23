import { error } from '@sveltejs/kit';
import { db, PUBLIC_CACHE, type Project } from '$lib/server/db';
import { renderMarkdown } from '$lib/markdown';

export const load = async ({ params, setHeaders }) => {
	const { data: project, error: err } = await db
		.from('projects')
		.select('*')
		.eq('slug', params.slug)
		.maybeSingle();

	if (err) throw new Error(err.message);
	if (!project) {
		throw error(404, 'Project not found');
	}

	setHeaders(PUBLIC_CACHE);
	return {
		project: project as Project,
		html: renderMarkdown(project.details)
	};
};
