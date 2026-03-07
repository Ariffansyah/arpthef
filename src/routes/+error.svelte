<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let isVisible = false;

	onMount(() => {
		isVisible = true;
	});
</script>

<svelte:head>
	<title>{$page.status} - Error</title>
</svelte:head>

<section
	class="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 lg:px-20"
>
	<div
		class="flex w-full flex-col items-center justify-center gap-8 text-center transition-all duration-700 {isVisible
			? 'translate-y-0 opacity-100'
			: 'translate-y-4 opacity-0'}"
	>
		<div class="flex flex-col items-center">
			<h1
				class="text-[12rem] leading-none font-black tracking-tighter text-pink-500 md:text-[20rem]"
			>
				{$page.status}
			</h1>
			<p class="-mt-4 text-xs font-black tracking-[0.5em] text-gray-900 uppercase md:-mt-8">
				{$page.error?.message || 'Page Not Found'}
			</p>
		</div>

		<div class="max-w-md">
			<p class="text-sm leading-relaxed font-medium text-gray-500">
				The petals have scattered, and the path you are looking for is currently hidden or no longer
				exists.
			</p>
		</div>

		<div class="mt-4">
			<a
				class="group flex items-center gap-3 text-xs font-black tracking-widest text-gray-900 uppercase transition-all hover:text-pink-600"
				href={resolve('/')}
				aria-label="Go back to homepage"
			>
				<span class="transition-transform group-hover:-translate-x-2">←</span>
				Back to Home
			</a>
		</div>
	</div>
</section>

<style>
	/* Subtle noise or texture could go here if you wanted, 
	   but keeping it pure white for the "simple" look */
</style>
