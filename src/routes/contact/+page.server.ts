import { redirect } from '@sveltejs/kit';

// Merged into the home page; keeps old and shared links working.
export const load = () => redirect(308, '/#contact');
