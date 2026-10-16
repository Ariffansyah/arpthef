<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	const copy = $derived(
		page.status === 404
			? {
					tag: 'Uncharted',
					title: 'Lost in an unknown universe',
					body: 'This page drifted out of the known multiverse, or it never existed in this one.'
				}
			: page.status >= 500
				? {
						tag: 'Signal lost',
						title: 'This universe collapsed',
						body: 'Something broke on my side of the multiverse. Give it a moment and try again.'
					}
				: {
						tag: 'Unknown',
						title: page.error?.message ?? 'Something went wrong',
						body: 'Something pulled you off course.'
					}
	);
</script>

<svelte:head>
	<title>{page.status} - arp</title>
</svelte:head>

<section
	class="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 py-24 lg:px-20"
>
	<div class="rise flex max-w-xl flex-col items-center gap-8 text-center">
		<p class="narasi">Earth-{page.status} · {copy.tag}</p>

		<h1 class="plates font-display text-ink text-[10rem] leading-none md:text-[18rem]">
			{page.status}
		</h1>

		<div class="flex flex-col gap-4">
			<h2 class="font-display text-ink text-4xl md:text-5xl">{copy.title}</h2>
			<p class="text-ink-muted text-sm leading-relaxed">{copy.body}</p>
		</div>

		<p
			class="balon bg-card text-ink-faint max-w-full px-4 py-2 text-[10px] font-bold tracking-widest break-all uppercase"
		>
			<span class="text-brand motion-safe:animate-pulse">●</span> No signal at
			<span class="normal-case">{page.url.pathname}</span>
		</p>

		<a
			class="tekan group bg-cta text-cta-ink hover:bg-ink hover:text-surface font-display mt-4 flex items-center gap-3 rounded-md px-5 py-2 text-2xl [text-shadow:none]"
			href={resolve('/')}
		>
			<span class="transition-transform group-hover:-translate-x-2">←</span>
			Back to Home
		</a>
	</div>
</section>

<style>
	@media (prefers-reduced-motion: no-preference) {
		.rise {
			animation: rise 0.5s steps(6) both;
		}
		.plates {
			animation: misregister 4s steps(1) infinite;
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(1rem);
		}
	}

	@keyframes misregister {
		90% {
			--ca: 0.07;
		}
		94% {
			--ca: -0.05;
		}
	}
</style>
