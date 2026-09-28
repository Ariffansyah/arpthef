import { getExperiences, getProjects } from '$lib/server/db';

export const load = async () => ({
	projects: await getProjects(3),
	experiences: await getExperiences()
});
