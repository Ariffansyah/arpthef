import { getProjects } from '$lib/server/db';

export const load = async () => ({ projects: await getProjects() });
