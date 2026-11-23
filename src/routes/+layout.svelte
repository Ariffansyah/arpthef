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
	import { ooze, symbioteNavigate, symbioteToggle } from '$lib/symbiote';
	import { crossfade } from 'svelte/transition';

	// The active pill slides to the next link on twos instead of blinking between them.
	const [send, receive] = crossfade({
		duration: () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 250),
		easing: (t) => Math.ceil(t * 3) / 3
	});

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children } = $props();

	let scrollProgress = $state(0);
	let activeHash = $state('');
	let chatOpen = $state(false);
	let tucked = $state(false);
	let lastY = 0;
	// A dock link's own smooth scroll shouldn't tuck the dock away from under the click.
	let pinnedUntil = 0;

	function onScroll() {
		const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
		const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
		scrollProgress = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;
		// Tucked while reading down the page; scrolling back up, the top, or the end bring it back.
		const delta = scrollTop - lastY;
		if (scrollTop < 120 || scrollTop > scrollHeight - 80) tucked = false;
		else if (delta > 8 && performance.now() > pinnedUntil) tucked = true;
		else if (delta < -8) tucked = false;
		if (Math.abs(delta) > 8) lastY = scrollTop;
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

	onNavigate(symbioteNavigate);

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
	<!-- Centred with margins, not translate: app.css's glitch frames overwrite translate on .komik.
	     The wrapper also anchors the chat panel to the dock's right end, where its toggle sits. -->
	<div class="dock-wrap pointer-events-none fixed inset-x-0 bottom-4 z-50 mx-auto w-fit">
		<!-- Holds the dock's spot while it's tucked away, so hovering there brings it back. -->
		<div class="dock-sensor" aria-hidden="true"></div>
		<GroqChat bind:open={chatOpen} />
		<nav
			class="dock komik bg-card pointer-events-auto relative isolate rounded-full"
			class:tucked={tucked && !chatOpen}
			aria-label="Main"
		>
			<div class="flex items-center gap-1 p-1.5 pb-2.5 md:gap-1.5">
				<ul class="flex items-center md:gap-1">
					{#each navLinks as link (link.name)}
						<li>
							<a
								class="font-display relative flex h-10 min-w-10 items-center justify-center gap-2 rounded-full text-xl active:translate-y-px md:h-9 md:min-w-9 md:px-3
								{isActive(link) ? 'text-on-pop' : 'text-ink hover:bg-pop/25'}"
								href="{resolve(link.path)}{link.hash ?? ''}"
								aria-label={link.name}
								aria-current={isActive(link) ? 'location' : undefined}
								onclick={() => (pinnedUntil = performance.now() + 1200)}
							>
								<!-- Behind the label via the dock's own stacking context, so a sliding pill never covers a neighbour. -->
								{#if isActive(link)}
									<span
										class="bg-pop absolute inset-0 -z-10 rounded-full"
										in:receive={{ key: 'pill' }}
										out:send={{ key: 'pill' }}
									></span>
								{/if}
								<!-- Wrapped: Font Awesome's unlayered CSS beats Tailwind's display utilities on the <i>. -->
								<span class="md:hidden"><i class="fa-solid {link.icon} text-sm"></i></span>
								<span class="hidden md:inline">{link.name}</span>
							</a>
						</li>
					{/each}
				</ul>
				<span class="bg-edge-ink h-6 w-0.5 rounded-full opacity-25" aria-hidden="true"></span>
				<!-- Filled with the ink the goo will be, so the symbiote visibly comes out of this drop. -->
				<button
					type="button"
					onclick={(e) => symbioteToggle(e.currentTarget)}
					class="goo bg-ink text-surface flex h-10 w-10 items-center justify-center rounded-full active:translate-y-px md:h-9 md:w-9"
					aria-label="Switch to {$theme === 'dark' ? 'light' : 'dark'} theme"
				>
					<!-- Drawn, not Font Awesome: its sun's pointed rays read as a settings cog at this size. -->
					<svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
						{#if $theme === 'dark'}
							<circle cx="12" cy="12" r="4.5" />
							<path
								d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
							/>
						{:else}
							<path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7Z" />
						{/if}
					</svg>
				</button>
				<button
					id="chat-toggle"
					type="button"
					onclick={() => (chatOpen = !chatOpen)}
					aria-expanded={chatOpen}
					aria-controls="arp-chat"
					aria-label={chatOpen ? 'Close chat' : 'Chat with arp AI'}
					class="bot bg-cta text-cta-ink hover:bg-ink hover:text-surface flex h-10 w-10 items-center justify-center rounded-full active:translate-y-px md:h-9 md:w-9"
				>
					<i class="fa-solid {chatOpen ? 'fa-xmark' : 'fa-robot'}"></i>
				</button>
			</div>
			<div
				class="bg-cta absolute inset-x-5 bottom-1 h-[3px] origin-left rounded-full transition-transform duration-75 ease-linear"
				style="transform: scaleX({scrollProgress});"
				aria-hidden="true"
			></div>
		</nav>
	</div>

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

<div class="halftone pointer-events-none fixed inset-0 z-0" aria-hidden="true"></div>

<div class="reading-scrim pointer-events-none fixed inset-0 z-0" aria-hidden="true"></div>

{#if $lightboxImage}
	<div
		class="bg-surface/95 fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-xl"
		transition:ooze
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
		transition: transform 250ms steps(3);
	}
	/* transform, not translate, so the glitch frames' translate can't pull it back on screen.
	   Hovering its spot or focusing inside brings it back; the delay keeps a brushing cursor
	   from snapping it away. */
	.dock-wrap:not(:hover) .dock.tucked:not(:focus-within) {
		transform: translateY(calc(100% + 2rem));
		transition-delay: 250ms;
	}
	/* Down to the screen edge, and only live while tucked so it never blocks the page otherwise. */
	.dock-sensor {
		position: absolute;
		inset: 0 0 -1rem;
	}
	.dock-wrap:has(.tucked) .dock-sensor {
		pointer-events: auto;
	}
	/* Idles like the old floating button did, on twos. */
	.bot:not([aria-expanded='true']) i {
		animation: bot-idle 5s steps(30) infinite;
	}
	@keyframes bot-idle {
		50% {
			scale: 0.75;
		}
	}
	/* The drop boils on hover, a taste of what the click lets loose. */
	.goo:hover {
		animation: ooze 333ms steps(1) infinite;
	}
	@keyframes ooze {
		0% {
			border-radius: 46% 54% 58% 42% / 52% 44% 56% 48%;
		}
		25% {
			border-radius: 58% 42% 45% 55% / 44% 58% 42% 56%;
		}
		50% {
			border-radius: 42% 58% 54% 46% / 56% 46% 54% 44%;
		}
		75% {
			border-radius: 54% 46% 40% 60% / 46% 54% 48% 52%;
		}
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
	}
	:global(.dark) .halftone {
		mix-blend-mode: screen;
		opacity: 0.16;
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

	@media (prefers-reduced-motion: reduce) {
		.dock {
			transition: opacity 150ms;
		}
		.dock-wrap:not(:hover) .dock.tucked:not(:focus-within) {
			transform: none;
			opacity: 0;
			pointer-events: none;
		}
		.goo:hover,
		.bot:not([aria-expanded='true']) i {
			animation: none;
		}
	}
</style>
