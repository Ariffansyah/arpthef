import { getExperiences, getProjects, PUBLIC_CACHE } from '$lib/server/db';

export const load = async ({ setHeaders }) => {
	setHeaders(PUBLIC_CACHE);
	const [projects, experiences] = await Promise.all([getProjects(4), getExperiences()]);
	return { projects, experiences };
};
