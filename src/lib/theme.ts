import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

function apply(theme: Theme) {
	if (!browser) return;
	document.documentElement.classList.toggle('dark', theme === 'dark');
	try {
		localStorage.setItem('theme', theme);
	} catch {
		/* storage unavailable — ignore */
	}
}

function initial(): Theme {
	// The inline script in app.html has already set the .dark class before
	// hydration (avoiding FOUC); mirror that decision into the store.
	if (browser) return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
	return 'light';
}

function createTheme() {
	const { subscribe, set } = writable<Theme>(initial());

	return {
		subscribe,
		set(theme: Theme) {
			apply(theme);
			set(theme);
		},
		toggle() {
			const next: Theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
			apply(next);
			set(next);
		}
	};
}

export const theme = createTheme();
