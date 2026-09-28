import { getExperiences } from '$lib/server/db';

export const load = async () => ({ experiences: await getExperiences() });
