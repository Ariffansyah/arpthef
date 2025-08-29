<script lang="ts">
	import Particles from '$lib/components/Particles.svelte';
	import '../app.css';
	import AmongUsCursor from '$lib/components/Amogus.svelte';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let targetX = 0,
		targetY = 0;
	let amogusX = 0,
		amogusY = 0;
	let angle = 0;
	let floatPhase = 0;

	function handleMouseMove(event: MouseEvent) {
		targetX = event.clientX;
		targetY = event.clientY;
	}

	function animate() {
		const lerp = (start: number, end: number, amt: number) => start + (end - start) * amt;
		amogusX = lerp(amogusX, targetX, 0.1);
		amogusY = lerp(amogusY, targetY, 0.1);
		angle = (Math.atan2(targetY - amogusY, targetX - amogusX) * 180) / Math.PI;

		floatPhase += 0.05;

		requestAnimationFrame(animate);
	}

	import { onMount } from 'svelte';
	onMount(() => {
		animate();
	});

	let isOpen = false;

	function handleHumberg() {
		isOpen = !isOpen;
	}
</script>

<svelte:window on:mousemove={handleMouseMove} />

<div id="main-container" class="relative z-1 flex min-h-screen flex-col">
	<nav class="relative z-50 px-4 py-6">
		<div class="mx-auto flex max-w-7xl flex-col md:max-w-2/5 md:flex-row md:items-center">
			<div class="flex w-full items-center justify-between">
				<a class="text-xl font-bold" href="/">arpthef</a>

				<button
					class="relative flex h-6 w-8 flex-col justify-between md:hidden"
					onclick={handleHumberg}
					aria-label="Toggle navigation"
					aria-expanded={isOpen}
					aria-controls="nav-menu"
					type="button"
				>
					<span
						class="block h-0.5 w-full origin-center bg-white transition-transform duration-300"
						style:transform={isOpen ? 'rotate(45deg) translateY(7px)' : 'none'}
					></span>
					<span
						class="block h-0.5 w-full origin-center bg-white transition-opacity duration-300"
						style:opacity={isOpen ? '0' : '1'}
					></span>
					<span
						class="block h-0.5 w-full origin-center bg-white transition-transform duration-300"
						style:transform={isOpen ? 'rotate(-45deg) translateY(-7px)' : 'none'}
					></span>
				</button>
			</div>

			<ul
				id="nav-menu"
				class={`flex-col items-start gap-2 px-2 py-4 transition-all duration-300 sm:w-full md:static md:mt-0 md:flex md:w-auto md:flex-row md:gap-8 md:bg-transparent md:p-0 ${
					isOpen ? 'flex' : 'hidden'
				} md:flex`}
			>
				<li><a href="/about">About</a></li>
				<li><a href="/projects">Projects</a></li>
				<li><a href="/contact">Contact</a></li>
			</ul>
		</div>
	</nav>

	<main class="flex-1">
		<slot />
	</main>

	<footer class="p-4 text-center text-gray-500">
		<p>&copy; 2025 arpthef. All rights reserved.</p>
	</footer>
</div>

<Particles className="pointer-events-none absolute top-0 left-0 -z-10 w-full" refresh={true} />

<AmongUsCursor x={amogusX} y={amogusY} {angle} {floatPhase} />

<style>
	.bg-softblack {
		background-color: #0f0f0f;
	}
</style>
