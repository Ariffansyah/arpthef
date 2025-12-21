import { error } from '@sveltejs/kit';
import projects from '$lib/assets/JSON/projects.json';

export const load = ({ params }: any) => {
	const slug = params.slug;

	const project = projects.find((p) => {
		const projectSlug = p.projectLink.split('/').pop();
		return projectSlug === slug;
	});

	if (!project) {
		throw error(404, 'Project not found');
	}

	return {
		project
	};
};
