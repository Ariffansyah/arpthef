import { getProjects, PUBLIC_CACHE } from '$lib/server/db';

export const load = async ({ setHeaders }) => {
	setHeaders(PUBLIC_CACHE);
	return { projects: await getProjects() };
};
