<script lang="ts">
	import Background3D from '$lib/components/Background3D.svelte';
	import Character3D from '$lib/components/Character3D.svelte';
	import GroqChat from '$lib/components/GroqChat.svelte';
	import '../app.css';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { resolve } from '$app/paths';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { theme } from '$lib/theme';
	import { lightboxImage, closeLightbox } from '$lib/lightbox';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let character = $state<ReturnType<typeof Character3D>>();

	const twos = (frames: number) => (t: number) => cubicOut(Math.ceil(t * frames) / frames);

	let { children } = $props();

	let isOpen = $state(false);
	const toggleMenu = () => (isOpen = !isOpen);

	if (page.url.pathname) {
		isOpen = false;
	}

	let scrollProgress = $state(0);

	function onScroll() {
		const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
		const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
		scrollProgress = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;
	}

	$effect(() => {
		onNavigate((navigation) => {
			if (!document.startViewTransition) return;
			return new Promise((resolve) => {
				document.startViewTransition(() => resolve());
			});
		});
	});

	$effect(() => {
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	});

	$effect(() => {
		if (!isOpen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});

	$effect(() => {
		function onKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') closeLightbox();
		}
		document.addEventListener('keydown', onKeydown);
		return () => document.removeEventListener('keydown', onKeydown);
	});

	const navLinks = [
		{ name: 'Home', path: '/' as const, icon: 'fa-house' },
		{ name: 'About', path: '/about' as const, icon: 'fa-user' },
		{ name: 'Projects', path: '/projects' as const, icon: 'fa-code' },
		{ name: 'Contact', path: '/contact' as const, icon: 'fa-paper-plane' }
	];

	const socialLinks = [
		{ name: 'GitHub', url: 'https://github.com/Ariffansyah', icon: 'fa-github' },
		{ name: 'LinkedIn', url: 'https://linkedin.com/in/arpthef', icon: 'fa-linkedin' },
		{ name: 'X', url: 'https://x.com/nishimiyaa12', icon: 'fa-x-twitter' },
		{ name: 'Instagram', url: 'https://www.instagram.com/_arpchive/', icon: 'fa-instagram' }
	];
</script>

<div id="app-wrapper" class="relative flex min-h-screen flex-col md:flex-row">
	<nav
		class="nav-sidebar relative z-50 flex w-full flex-col px-6 py-5 md:fixed md:h-screen md:w-56 md:overflow-y-auto md:px-5 md:py-6"
	>
		<div class="flex items-center justify-between pb-4 md:flex-col md:items-start md:pb-0">
			<div class="flex items-center gap-3 md:flex-col md:items-start md:gap-1">
				<a class="font-display judul-komik text-4xl md:-rotate-3 md:text-6xl" href={resolve('/')}>
					arp<span class="text-pop">.</span>
				</a>
				<p
					class="border-edge-ink bg-pop text-on-pop hidden -rotate-2 border-2 px-2 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase md:block"
				>
					Software Engineer
				</p>
			</div>

			<div class="flex items-center gap-5 md:hidden">
				<button
					type="button"
					onclick={theme.toggle}
					class="tekan bg-card text-ink hover:bg-pop hover:text-on-pop flex h-9 w-9 items-center justify-center rounded-md"
					aria-label="Toggle color theme"
				>
					<i class="fa-regular {$theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
				</button>
				<button
					class="tekan bg-card hover:bg-pop relative z-50 flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-md {isOpen
						? 'pointer-events-none opacity-0'
						: ''}"
					onclick={toggleMenu}
					type="button"
					aria-label="Toggle menu"
				>
					<span class="bg-ink h-0.5 w-5 rounded transition-all"></span>
					<span class="bg-ink h-0.5 w-5 rounded transition-all"></span>
					<span class="bg-ink h-0.5 w-5 rounded transition-all"></span>
				</button>
			</div>
		</div>

		<div class="mt-6 hidden w-40 md:block">
			<button
				type="button"
				class="character-frame komik bg-card block w-full rotate-2 cursor-pointer rounded-md"
				aria-label="Poke {$theme === 'dark' ? 'Miles' : 'Gwen'}"
				onclick={() => character?.poke()}
			>
				<div class="pointer-events-none aspect-4/5 w-full">
					<Character3D bind:this={character} />
				</div>
			</button>
			<div class="relative -mt-3 pl-1">
				<p class="narasi">{$theme === 'dark' ? 'Miles' : 'Gwen'}</p>
				<p class="text-ink-faint mt-1.5 text-[10px] font-bold tracking-[0.2em] uppercase">
					{$theme === 'dark' ? 'Earth-1610' : 'Earth-65'}
				</p>
			</div>
		</div>

		<div class="relative mt-8 hidden flex-1 md:block">
			<div class="thread absolute top-0 bottom-0 left-2 w-0.5" aria-hidden="true">
				<div
					class="bg-cta h-full w-full origin-top transition-transform duration-75 ease-linear"
					style="transform: scaleY({scrollProgress});"
				></div>
			</div>
			<svg
				class="pointer-events-none absolute left-[calc(0.5rem-11px)] overflow-visible"
				style="top: calc({scrollProgress * 100}% - 2px);"
				width="24"
				height="24"
				viewBox="-12 -2 24 24"
				aria-hidden="true"
			>
				<g class="dangle">
					<path
						d="M-2,9L-7,5L-9,0M-2,10.5L-8,9L-11,6M-2,12L-8,13L-10,17M-1.5,13L-5,16L-6,21M2,9L7,5L9,0M2,10.5L8,9L11,6M2,12L8,13L10,17M1.5,13L5,16L6,21"
						fill="none"
						stroke="var(--edge-ink)"
						stroke-width="0.9"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<ellipse
						cx="0"
						cy="4"
						rx="4.2"
						ry="5"
						fill="#2b3bb5"
						stroke="var(--edge-ink)"
						stroke-width="0.6"
					/>
					<ellipse cx="0" cy="11" rx="2.8" ry="2.6" fill="var(--edge-ink)" />
					<text x="0" y="5.7" text-anchor="middle" font-size="4.6" font-weight="700" fill="#ff2d55"
						>42</text
					>
				</g>
			</svg>

			<ul class="flex flex-col gap-3 pl-6">
				{#each navLinks as link, i (link.path)}
					<li class="strand relative">
						<a
							class="tekan font-display block w-fit rounded-md px-3 py-1 text-2xl
							{i % 2 ? 'rotate-1' : '-rotate-1'}
							{page.url.pathname === link.path
								? 'bg-pop text-on-pop [--ca-box:3px]'
								: 'bg-card text-ink hover:bg-pop hover:text-on-pop'}"
							href={resolve(link.path)}
							aria-current={page.url.pathname === link.path ? 'page' : undefined}
						>
							{link.name}
						</a>
						{#if page.url.pathname === link.path}
							<span
								class="sfx judul-komik font-display pointer-events-none absolute -top-5 right-1 text-3xl"
								aria-hidden="true">Thwip!</span
							>
						{/if}
					</li>
				{/each}
			</ul>
		</div>

		<div class="mt-auto hidden flex-col gap-5 pt-8 md:flex">
			<button
				type="button"
				onclick={theme.toggle}
				class="tekan bg-card text-ink hover:bg-pop hover:text-on-pop flex w-fit items-center gap-3 rounded-md px-3 py-2 text-[11px] font-bold tracking-[0.2em] uppercase"
				aria-label="Toggle color theme"
			>
				<i class="fa-regular {$theme === 'dark' ? 'fa-sun' : 'fa-moon'} w-4 text-center"></i>
				{$theme === 'dark' ? 'Light' : 'Dark'} Mode
			</button>

			<div class="flex gap-3">
				{#each socialLinks as s (s.name)}
					<a
						href={s.url}
						target="_blank"
						class="tekan group bg-card text-ink hover:bg-pop hover:text-on-pop relative flex h-9 w-9 items-center justify-center rounded-md text-sm"
						aria-label={s.name}
					>
						<i class="fa-brands {s.icon}"></i>
						<span
							class="bg-ink text-surface pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded px-2 py-1 text-[10px] font-bold tracking-widest whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100"
						>
							{s.name}
						</span>
					</a>
				{/each}
			</div>

			<p class="text-ink-faint text-[10px] font-bold tracking-widest uppercase">
				&copy; {new Date().getFullYear()} arpthef
			</p>
		</div>
	</nav>

	<main class="relative z-10 flex-1 md:ml-56">
		<div class="min-h-screen">
			{@render children()}
		</div>

		<footer class="border-edge-ink bg-surface border-t-3 p-8 text-center md:hidden">
			<div class="flex justify-center gap-6 pb-4">
				{#each socialLinks as s (s.name)}
					<a
						href={s.url}
						target="_blank"
						class="text-ink-faint hover:text-ink transition-colors"
						aria-label={s.name}
					>
						<i class="fa-brands {s.icon} fa-lg"></i>
					</a>
				{/each}
			</div>
			<p class="text-ink-faint text-[10px] font-bold tracking-widest uppercase">
				&copy; {new Date().getFullYear()} arpthef
			</p>
		</footer>
	</main>
</div>

<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.95]">
	<Background3D />
</div>

<GroqChat />

<div class="halftone pointer-events-none fixed inset-0 z-0" aria-hidden="true"></div>

<div class="reading-scrim pointer-events-none fixed inset-0 z-0" aria-hidden="true"></div>

<!-- z above the nav's z-50 so the bar doesn't show through -->
{#if isOpen}
	<div
		transition:fly={{ x: -300, duration: 250, easing: twos(3) }}
		class="bg-surface fixed inset-0 z-[60] flex flex-col md:hidden"
	>
		<div class="flex items-center justify-between px-6 pt-5 pb-4">
			<a
				class="font-display judul-komik text-4xl"
				href={resolve('/')}
				onclick={() => (isOpen = false)}
			>
				arp<span class="text-pop">.</span>
			</a>
			<button
				onclick={toggleMenu}
				type="button"
				class="tekan bg-card text-ink hover:bg-pop hover:text-on-pop flex h-9 w-9 items-center justify-center rounded-md"
				aria-label="Close menu"
			>
				<i class="fa-solid fa-xmark text-xl"></i>
			</button>
		</div>

		<div class="flex-1 overflow-y-auto px-6 py-8">
			<ul class="flex flex-col gap-4">
				{#each navLinks as link, i (link.path)}
					<li>
						<a
							in:fly={{ x: -40, duration: 250, delay: i * 83, easing: twos(3) }}
							class="tekan font-display flex items-center gap-4 rounded-md px-4 py-2.5 text-3xl
							{page.url.pathname === link.path
								? 'bg-pop text-on-pop'
								: 'bg-card text-ink hover:bg-pop hover:text-on-pop'}"
							href={resolve(link.path)}
							onclick={() => (isOpen = false)}
							aria-current={page.url.pathname === link.path ? 'page' : undefined}
						>
							<i class="fa-solid {link.icon} w-6 text-center text-base"></i>
							{link.name}
						</a>
					</li>
				{/each}
			</ul>

			<div class="mt-12 flex flex-col gap-6">
				<button
					type="button"
					onclick={() => {
						theme.toggle();
					}}
					class="tekan bg-card text-ink hover:bg-pop hover:text-on-pop flex w-fit items-center gap-3 rounded-md px-3 py-2 text-xs font-bold tracking-[0.2em] uppercase"
				>
					<i class="fa-regular {$theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
					{$theme === 'dark' ? 'Light' : 'Dark'} Mode
				</button>

				<div class="flex gap-5">
					{#each socialLinks as s (s.name)}
						<a
							href={s.url}
							target="_blank"
							class="text-ink-faint hover:text-ink transition-colors"
							aria-label={s.name}
						>
							<i class="fa-brands {s.icon} fa-lg"></i>
						</a>
					{/each}
				</div>

				<p class="text-ink-faint text-[10px] font-bold tracking-widest uppercase">
					&copy; {new Date().getFullYear()} arpthef
				</p>
			</div>
		</div>
	</div>
{/if}

{#if $lightboxImage}
	<div
		class="bg-surface/95 fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-xl transition-all"
		onclick={closeLightbox}
		onkeydown={(e) => e.key === 'Escape' && closeLightbox()}
		role="button"
		tabindex="0"
	>
		<div class="relative flex flex-col items-center gap-6">
			<img
				src={$lightboxImage}
				alt="Enlarged view"
				class="komik max-h-[80vh] max-w-[90vw] rounded-md object-contain"
			/>
			<button
				onclick={closeLightbox}
				class="tekan bg-card text-ink hover:bg-pop hover:text-on-pop rounded-md px-4 py-2 text-[11px] font-bold tracking-[0.2em] uppercase"
			>
				Close [esc]
			</button>
		</div>
	</div>
{/if}

<style>
	/* No position here: it would out-specify the `md:fixed` class. */
	.nav-sidebar {
		view-transition-name: sidebar;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.nav-sidebar::-webkit-scrollbar {
		display: none;
	}
	/* Fades the multiverse out behind the rail so its portal tags don't read as nav. */
	@media (min-width: 48rem) {
		.nav-sidebar {
			background: linear-gradient(
				90deg,
				color-mix(in srgb, var(--surface) 80%, transparent) 55%,
				transparent
			);
		}
	}

	.thread,
	.strand::before {
		background: color-mix(in srgb, var(--edge-ink) 40%, transparent);
	}
	.thread {
		box-shadow:
			-1.5px 0 0 color-mix(in srgb, var(--plate-a) 60%, transparent),
			1.5px 0 0 color-mix(in srgb, var(--plate-b) 60%, transparent);
	}
	/* Spans the gap from the thread (left-2, 2px wide) to the tab column (pl-6). */
	.strand::before {
		content: '';
		position: absolute;
		top: 50%;
		right: 100%;
		width: calc(1rem - 1px);
		height: 2px;
	}
	.strand:has([aria-current])::before {
		background: var(--cta);
	}

	/* Mounts with each new active tab, so it fires once per page change. steps(2) per segment ≈ twos. */
	.sfx {
		rotate: 12deg;
		animation: thwip 1s steps(2) forwards;
	}
	@keyframes thwip {
		0% {
			scale: 0.3;
		}
		17% {
			scale: 1.3;
		}
		33% {
			scale: 1;
		}
		75% {
			opacity: 1;
			translate: 0 -4px;
		}
		100% {
			opacity: 0;
			translate: 0 -10px;
		}
	}

	/* steps(11) per 0.9 s segment ≈ 12 fps; the keyframes trace the ease. */
	.dangle {
		animation: dangle 3.6s steps(11) infinite alternate;
	}
	@keyframes dangle {
		0% {
			transform: rotate(-6deg);
		}
		25% {
			transform: rotate(-4.2deg);
		}
		50% {
			transform: rotate(0deg);
		}
		75% {
			transform: rotate(4.2deg);
		}
		100% {
			transform: rotate(6deg);
		}
	}
	.reading-scrim {
		background: color-mix(in srgb, var(--surface) 50%, transparent);
	}
	main,
	.nav-sidebar {
		text-shadow:
			0 0 2px var(--surface),
			0 0 8px color-mix(in srgb, var(--surface) 75%, transparent);
	}

	.halftone {
		background-image: radial-gradient(
			circle at center,
			var(--edge-strong) 0.9px,
			transparent 1.1px
		);
		background-size: 5px 5px;
		opacity: 0.14;
		mix-blend-mode: multiply;
		mask-image: radial-gradient(125% 125% at 50% 45%, transparent 28%, black 100%);
		animation: halftone-drift 24s steps(288) infinite;
	}
	:global(.dark) .halftone {
		mix-blend-mode: screen;
		opacity: 0.16;
	}
	@keyframes halftone-drift {
		to {
			background-position: 40px 25px;
		}
	}

	.character-frame {
		position: relative;
		overflow: hidden;
		background-image:
			radial-gradient(
				115% 85% at 50% 12%,
				color-mix(in srgb, var(--cta) 22%, transparent),
				transparent 72%
			),
			radial-gradient(
				circle at center,
				color-mix(in srgb, var(--edge-ink) 28%, transparent) 0.8px,
				transparent 1.1px
			);
		background-size:
			auto,
			4px 4px;
	}

	:global(html) {
		overflow-x: hidden;
	}
	:global(body) {
		overflow-x: hidden;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(::view-transition-old(root)) {
		animation: vt-tear-out 250ms steps(1) forwards;
	}
	:global(::view-transition-new(root)) {
		animation: vt-tear-in 333ms steps(1);
	}

	/* No crossfade: two opaque plus-lighter snapshots would flash white. */
	:global(::view-transition-old(sidebar)) {
		display: none;
	}
	:global(::view-transition-new(sidebar)) {
		animation: none;
	}

	@keyframes vt-tear-out {
		0% {
			clip-path: inset(0 0 46% 0);
			translate: -18px 0;
		}
		33% {
			clip-path: inset(38% 0 12% 0);
			translate: 14px 0;
		}
		66% {
			clip-path: inset(70% 0 0 0);
			translate: -8px 0;
		}
		100% {
			opacity: 0;
		}
	}
	@keyframes vt-tear-in {
		0% {
			clip-path: inset(22% 0 30% 0);
			translate: 16px 0;
		}
		25% {
			clip-path: inset(0 0 18% 0);
			translate: -10px 0;
		}
		50% {
			clip-path: inset(0);
			translate: 4px 0;
		}
		75% {
			translate: -1px 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sfx {
			display: none;
		}
		.halftone,
		.dangle,
		:global(::view-transition-old(root)),
		:global(::view-transition-new(root)) {
			animation: none;
		}
	}
</style>
