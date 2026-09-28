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
		<p class="text-ink-faint text-[10px] font-black tracking-[0.5em] uppercase">
			Earth-{page.status} · {copy.tag}
		</p>

		<h1
			class="plates text-ink text-[9rem] leading-none font-black tracking-tighter md:text-[16rem]"
		>
			{page.status}
		</h1>

		<div class="flex flex-col gap-4">
			<h2 class="text-ink text-2xl font-black tracking-tight md:text-3xl">{copy.title}</h2>
			<p class="text-ink-muted text-sm leading-relaxed">{copy.body}</p>
		</div>

		<p
			class="border-edge text-ink-faint max-w-full border px-4 py-2 text-[10px] font-bold tracking-widest break-all uppercase"
		>
			<span class="text-brand motion-safe:animate-pulse">●</span> No signal at
			<span class="normal-case">{page.url.pathname}</span>
		</p>

		<a
			class="group text-ink hover:text-brand-hover flex items-center gap-3 text-xs font-black tracking-widest uppercase transition-all"
			href={resolve('/')}
		>
			<span class="transition-transform group-hover:-translate-x-2">←</span>
			Back to Home
		</a>
	</div>
</section>

<style>
	/* Misregistered cyan/magenta plates, the same inks as DIMENSIONS in $lib/dimensions.ts */
	.plates {
		--plate-a: #00a9c0;
		--plate-b: #e4007f;
		text-shadow:
			-0.03em 0 var(--plate-a),
			0.03em 0 var(--plate-b);
	}
	:global(.dark) .plates {
		--plate-a: #00e5ff;
		--plate-b: #ff2d96;
	}

	@media (prefers-reduced-motion: no-preference) {
		.rise {
			animation: rise 0.7s ease-out both;
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

	/* the plates slip for a moment every few seconds, then snap back */
	@keyframes misregister {
		90% {
			text-shadow:
				0.05em 0.01em var(--plate-a),
				-0.04em -0.01em var(--plate-b);
		}
		94% {
			text-shadow:
				-0.06em 0 var(--plate-a),
				0.02em 0.015em var(--plate-b);
		}
	}
</style>
