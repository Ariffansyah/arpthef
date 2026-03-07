<script lang="ts">
	import Sakura from '$lib/components/Sakura.svelte';
	import '../app.css';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let isOpen = false;
	const toggleMenu = () => (isOpen = !isOpen);

	if (page.url.pathname) {
		isOpen = false;
	}

	const navLinks = [
		{ name: 'Home', path: '/' as const },
		{ name: 'About', path: '/about' as const },
		{ name: 'Projects', path: '/projects' as const },
		{ name: 'Contact', path: '/contact' as const }
	];
</script>

<div id="app-wrapper" class="relative flex min-h-screen flex-col bg-white md:flex-row">
	<nav
		class="relative z-50 flex w-full flex-col border-b border-gray-100 bg-white px-6 py-6 md:fixed md:h-screen md:w-64 md:border-r md:border-b-0 md:px-10 md:py-12 lg:w-72"
	>
		<div class="flex items-center justify-between md:mb-16 md:flex-col md:items-start md:gap-2">
			<a class="group text-2xl font-black tracking-tighter text-gray-900" href={resolve('/')}>
				arp<span class="text-pink-500 transition-all group-hover:text-pink-600">.</span>
			</a>
			<p class="hidden text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase md:block">
				Software Engineer
			</p>

			<button
				class="flex flex-col gap-1.5 md:hidden"
				on:click={toggleMenu}
				type="button"
				aria-label="Toggle menu"
			>
				<span class="h-0.5 w-6 bg-gray-900 transition-all {isOpen ? 'translate-y-2 rotate-45' : ''}"
				></span>
				<span class="h-0.5 w-6 bg-gray-900 transition-all {isOpen ? 'opacity-0' : ''}"></span>
				<span
					class="h-0.5 w-6 bg-gray-900 transition-all {isOpen ? '-translate-y-2 -rotate-45' : ''}"
				></span>
			</button>
		</div>

		<ul class="hidden flex-col gap-6 md:flex">
			{#each navLinks as link (link.path)}
				<li>
					<a
						class="group flex items-center gap-3 text-xs font-bold tracking-[0.3em] uppercase transition-all
						{page.url.pathname === link.path ? 'text-pink-500' : 'text-gray-400 hover:text-gray-900'}"
						href={resolve(link.path)}
					>
						<span
							class="h-px w-4 bg-current opacity-0 transition-all group-hover:opacity-100 {page.url
								.pathname === link.path
								? 'w-8 opacity-100'
								: ''}"
						></span>
						{link.name}
					</a>
				</li>
			{/each}
		</ul>

		<div class="mt-auto hidden flex-col gap-6 md:flex">
			<div class="flex gap-5 text-gray-300">
				<a
					href="https://github.com/Ariffansyah"
					target="_blank"
					class="transition-colors hover:text-gray-900"
					aria-label="github"><i class="fa-brands fa-github fa-lg"></i></a
				>
				<a
					href="https://linkedin.com/in/arpthef"
					target="_blank"
					class="transition-colors hover:text-gray-900"
					aria-label="linkedin"><i class="fa-brands fa-linkedin fa-lg"></i></a
				>
			</div>
			<p class="text-[9px] font-bold tracking-widest text-gray-300 uppercase">
				&copy; {new Date().getFullYear()} arpthef
			</p>
		</div>

		{#if isOpen}
			<div
				transition:fade={{ duration: 200 }}
				class="fixed inset-0 z-40 flex flex-col items-center justify-center bg-white p-8 md:hidden"
			>
				<ul class="flex flex-col items-center gap-10">
					{#each navLinks as link (link.path)}
						<li>
							<a
								class="text-3xl font-black tracking-tighter text-gray-900 uppercase"
								href={resolve(link.path)}
							>
								{link.name}
							</a>
						</li>
					{/each}
					<li>
						<button
							on:click={toggleMenu}
							class="mt-8 text-xs font-bold tracking-[0.4em] text-pink-500 uppercase">Close</button
						>
					</li>
				</ul>
			</div>
		{/if}
	</nav>

	<main class="relative z-10 flex-1 md:ml-64 lg:ml-72">
		<div class="min-h-screen">
			<slot />
		</div>

		<footer class="p-12 text-center md:hidden">
			<p class="text-[10px] font-bold tracking-[0.3em] text-gray-300 uppercase">
				&copy; {new Date().getFullYear()} arpthef
			</p>
		</footer>
	</main>
</div>

<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-60">
	<Sakura quantity={30} size={12} vx={0.4} vy={1.0} />
</div>

<style>
	nav {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	nav::-webkit-scrollbar {
		display: none;
	}

	:global(body) {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
</style>
