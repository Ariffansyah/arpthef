<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let isVisible = false;

	onMount(() => {
		isVisible = true;
	});
</script>

<section class="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-6 rounded-sm border border-pink-200 bg-white/60 p-10 shadow-[0_20px_60px_rgba(255,182,193,0.5)] transition duration-300 hover:scale-[1.02] md:mx-auto md:w-1/3 {isVisible
			? 'visible'
			: ''}"
	>
		<div class="flex w-full flex-row items-center justify-between">
			<div class="flex flex-col">
				<h1 class="text-7xl font-black tracking-tighter text-pink-600">
					{$page.status}
				</h1>
				<p class="mt-2 text-xl font-bold tracking-widest text-gray-900 uppercase">
					{$page.error?.message || 'Page Not Found'}
				</p>
			</div>
		</div>

		<div class="mt-2">
			<p class="text-justify leading-relaxed font-medium text-gray-700">
				An error occurred while processing your request. The petals have scattered, and the path you
				are looking for is currently hidden or no longer exists.
			</p>
		</div>

		<a
			class="mt-4 inline-block rounded-sm bg-pink-500 px-8 py-3 text-sm font-black tracking-widest text-white uppercase shadow-[0_10px_20px_rgba(236,72,153,0.4)] transition-all hover:bg-pink-600"
			href={resolve('/')}
			aria-label="Go back to homepage"
		>
			← Back to Home
		</a>
	</div>
</section>
