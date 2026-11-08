<script lang="ts">
	import Background3D from '$lib/components/Background3D.svelte';
	import GroqChat from '$lib/components/GroqChat.svelte';
	import '../app.css';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { resolve } from '$app/paths';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { theme } from '$lib/theme';
	import { lightboxImage, closeLightbox } from '$lib/lightbox';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children } = $props();

	let scrollProgress = $state(0);
	let activeHash = $state('');

	function onScroll() {
		const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
		const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
		scrollProgress = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;
		// The last section whose top has passed 40% of the viewport is the one being read.
		activeHash =
			page.url.pathname === '/'
				? (navLinks.findLast(
						(l) =>
							l.hash &&
							(document.querySelector(l.hash)?.getBoundingClientRect().top ?? Infinity) <
								window.innerHeight * 0.4
					)?.hash ?? '')
				: '';
	}

	afterNavigate(onScroll);

	// Home is lit only at the top of the home page, before a section takes over.
	const isActive = (l: (typeof navLinks)[number]) =>
		l.hash
			? l.hash === activeHash
			: l.path === '/'
				? page.url.pathname === '/' && !activeHash
				: page.url.pathname.startsWith(l.path);

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
		function onKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') closeLightbox();
		}
		document.addEventListener('keydown', onKeydown);
		return () => document.removeEventListener('keydown', onKeydown);
	});

	// About and Projects have their own pages; Experience and Contact live on the home page.
	const navLinks: { name: string; path: '/' | '/about' | '/projects'; hash?: string; icon: string }[] =
		[
			{ name: 'Home', path: '/', icon: 'fa-house' },
			{ name: 'About', path: '/about', icon: 'fa-user' },
			{ name: 'Experience', path: '/', hash: '#experience', icon: 'fa-briefcase' },
			{ name: 'Projects', path: '/projects', icon: 'fa-code' },
			{ name: 'Contact', path: '/', hash: '#contact', icon: 'fa-paper-plane' }
		];

	const socialLinks = [
		{ name: 'GitHub', url: 'https://github.com/Ariffansyah', icon: 'fa-github' },
		{ name: 'LinkedIn', url: 'https://linkedin.com/in/arpthef', icon: 'fa-linkedin' },
		{ name: 'X', url: 'https://x.com/nishimiyaa12', icon: 'fa-x-twitter' },
		{ name: 'Instagram', url: 'https://www.instagram.com/_arpchive/', icon: 'fa-instagram' }
	];
</script>

<div id="app-wrapper" class="relative flex min-h-screen flex-col">
	<!-- Fixed left on phones so it clears the chat button; centred once there's room.
	     Centred with margins, not translate: app.css's glitch frames overwrite translate on .komik. -->
	<nav
		class="dock komik bg-card fixed bottom-6 left-4 z-50 overflow-hidden rounded-full md:right-0 md:left-0 md:mx-auto md:w-fit"
		aria-label="Main"
	>
		<div class="flex items-center gap-0.5 p-1.5 md:gap-1">
			{#each navLinks as link (link.name)}
				<a
					class="font-display flex h-9 min-w-9 items-center justify-center gap-2 rounded-full text-xl md:px-3
					{isActive(link)
						? 'bg-pop text-on-pop'
						: 'text-ink hover:bg-pop hover:text-on-pop'}"
					href="{resolve(link.path)}{link.hash ?? ''}"
					aria-label={link.name}
					aria-current={isActive(link) ? 'location' : undefined}
				>
					<!-- Wrapped: Font Awesome's unlayered CSS beats Tailwind's display utilities on the <i>. -->
					<span class="md:hidden"><i class="fa-solid {link.icon} text-sm"></i></span>
					<span class="hidden md:inline">{link.name}</span>
				</a>
			{/each}
			<button
				type="button"
				onclick={theme.toggle}
				class="text-ink hover:bg-pop hover:text-on-pop flex h-9 w-9 items-center justify-center rounded-full"
				aria-label="Toggle color theme"
			>
				<i class="fa-regular {$theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
			</button>
		</div>
		<div
			class="bg-cta absolute inset-x-0 bottom-0 h-0.5 origin-left transition-transform duration-75 ease-linear"
			style="transform: scaleX({scrollProgress});"
			aria-hidden="true"
		></div>
	</nav>

	<main class="relative z-10 flex-1">
		<div class="min-h-screen">
			{@render children()}
		</div>

		<!-- pb clears the floating dock. -->
		<footer class="border-edge-ink bg-surface border-t-3 px-6 pt-10 pb-28 lg:px-10">
			<div
				class="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left"
			>
				<div class="flex flex-col items-center gap-3 md:items-start">
					<p class="narasi -rotate-2">To be continued…</p>
					<a class="font-display judul-komik text-5xl" href={resolve('/')}>
						arp<span class="text-pop">.</span>
					</a>
				</div>

				<div class="flex flex-col items-center gap-4 md:items-end">
					<div class="flex flex-wrap justify-center gap-3">
						<a
							href={resolve('/assets/cv/cv-en.pdf')}
							target="_blank"
							class="tekan bg-cta text-cta-ink hover:bg-ink hover:text-surface font-display flex h-10 items-center gap-2 rounded-md px-4 text-xl [text-shadow:none]"
						>
							<i class="fa-solid fa-file-arrow-down text-base"></i> CV
						</a>
						{#each socialLinks as s (s.name)}
							<a
								href={s.url}
								target="_blank"
								class="tekan bg-card text-ink hover:bg-pop hover:text-on-pop flex h-10 w-10 items-center justify-center rounded-md"
								aria-label={s.name}
							>
								<i class="fa-brands {s.icon}"></i>
							</a>
						{/each}
					</div>
					<p class="text-ink-faint text-[10px] font-bold tracking-widest uppercase">
						&copy; {new Date().getFullYear()} Mohammad Ariffansyah · Surabaya, ID
					</p>
				</div>
			</div>
			<p
				class="text-ink-faint [&_a]:hover:text-ink mx-auto mt-6 max-w-7xl text-center text-[11px] leading-relaxed md:text-left [&_a]:underline [&_a]:underline-offset-2"
			>
				3D models:
				<a
					href="https://sketchfab.com/3d-models/spider-gwen-across-the-spider-verse-297c91b697f7428ea634ab454a598219"
					target="_blank"
					rel="noopener noreferrer">Spider-Gwen - Across the Spider-Verse</a
				>
				by
				<a href="https://sketchfab.com/kabiidev" target="_blank" rel="noopener noreferrer">Kabiidev</a>
				and
				<a
					href="https://sketchfab.com/3d-models/fortnite-miles-morales-2eeed4f44ff64efda054b83325146842"
					target="_blank"
					rel="noopener noreferrer">Fortnite Miles Morales</a
				>
				by
				<a href="https://sketchfab.com/sinner.chd" target="_blank" rel="noopener noreferrer"
					>sinner.chd</a
				>, licensed under
				<a
					href="https://creativecommons.org/licenses/by/4.0/"
					target="_blank"
					rel="noopener noreferrer">CC BY 4.0</a
				>. Slimmed down and restyled as comic art.
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
	.dock {
		view-transition-name: dock;
	}
	.reading-scrim {
		background: color-mix(in srgb, var(--surface) 50%, transparent);
	}
	main {
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

	/* clip, not hidden: hidden turns body into a scroll container and unsticks the bar. */
	:global(html) {
		overflow-x: clip;
		scroll-padding-top: 2rem;
	}
	:global(body) {
		overflow-x: clip;
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
	:global(::view-transition-old(dock)) {
		display: none;
	}
	:global(::view-transition-new(dock)) {
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
		.halftone,
		:global(::view-transition-old(root)),
		:global(::view-transition-new(root)) {
			animation: none;
		}
	}
</style>
