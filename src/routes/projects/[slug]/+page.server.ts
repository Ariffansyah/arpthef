import { error } from '@sveltejs/kit';
import { db, type Project } from '$lib/server/db';
import { renderMarkdown } from '$lib/markdown';

export const load = async ({ params }) => {
	const { data: project, error: err } = await db
		.from('projects')
		.select('*')
		.eq('slug', params.slug)
		.maybeSingle();

	if (err) throw new Error(err.message);
	if (!project) {
		throw error(404, 'Project not found');
	}

	return {
		project: project as Project,
		html: renderMarkdown(project.details)
	};
};
