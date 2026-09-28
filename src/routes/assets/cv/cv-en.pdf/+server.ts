import { redirect } from '@sveltejs/kit';
import { CV, files } from '$lib/server/db';

// The old static CV URL (sitemap, links already shared) now serves whatever
// was last uploaded in /backstage.
export const GET = () => redirect(307, files.getPublicUrl(CV).data.publicUrl);
