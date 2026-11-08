import { getExperiences, getProjects } from '$lib/server/db';

export const load = async () => ({
	projects: await getProjects(4),
	experiences: await getExperiences()
});
