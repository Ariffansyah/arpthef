<script lang="ts">
	import Sakura from '$lib/components/Sakura.svelte';
	import '../app.css';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { resolve } from '$app/paths';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let isOpen = false;

	function handleHumberg() {
		isOpen = !isOpen;
	}
</script>

<div id="main-container" class="relative z-10 flex min-h-screen flex-col bg-transparent">
	<nav class="relative z-50 px-4 py-6">
		<div class="mx-auto flex max-w-7xl flex-col md:max-w-2/5 md:flex-row md:items-center">
			<div class="flex w-full items-center justify-between">
				<a class="text-xl font-bold text-gray-800" href={resolve('/')}>arpthef</a>
				<button
					class="relative flex h-6 w-8 flex-col justify-between md:hidden"
					onclick={handleHumberg}
					type="button"
					aria-label="Toggle navigation menu"
				>
					<span
						class="block h-0.5 w-full bg-gray-800 transition-all"
						style:transform={isOpen ? 'rotate(45deg) translateY(7px)' : 'none'}
					></span>
					<span
						class="block h-0.5 w-full bg-gray-800 transition-all"
						style:opacity={isOpen ? '0' : '1'}
					></span>
					<span
						class="block h-0.5 w-full bg-gray-800 transition-all"
						style:transform={isOpen ? 'rotate(-45deg) translateY(-7px)' : 'none'}
					></span>
				</button>
			</div>

			<ul id="nav-menu" class="flex-col gap-8 md:flex md:flex-row {isOpen ? 'flex' : 'hidden'}">
				<li><a class="text-gray-700 hover:text-pink-500" href={resolve('/about')}>About</a></li>
				<li>
					<a class="text-gray-700 hover:text-pink-500" href={resolve('/projects')}>Projects</a>
				</li>
				<li><a class="text-gray-700 hover:text-pink-500" href={resolve('/contact')}>Contact</a></li>
			</ul>
		</div>
	</nav>

	<main class="relative z-10 flex-1">
		<slot />
	</main>

	<footer class="relative z-10 p-4 text-center text-gray-400">
		<p>&copy; {new Date().getFullYear()} arpthef. All rights reserved.</p>
	</footer>
</div>

<div class="pointer-events-none fixed top-0 left-0 z-0 h-full w-full overflow-hidden">
	<Sakura quantity={80} size={15} vx={0.8} vy={1.5} />
</div>
