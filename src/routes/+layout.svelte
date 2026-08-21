<script lang="ts">
	import Background3D from '$lib/components/Background3D.svelte';
	import Character3D from '$lib/components/Character3D.svelte';
	import '../app.css';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { resolve } from '$app/paths';
	import { goto, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { theme } from '$lib/theme';
	import { lightboxImage, closeLightbox } from '$lib/lightbox';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children } = $props();

	let isOpen = $state(false);
	const toggleMenu = () => (isOpen = !isOpen);

	if (page.url.pathname) {
		isOpen = false;
	}

	const NAV_DELAY = 3000;
	let scrollProgress = $state(0);
	let pendingNav = $state<{ dir: -1 | 1; target: string } | null>(null);
	let navProgress = $state(0);
	let navRaf = 0;
	let holdElapsed = 0;
	let lastTickTime = 0;
	let lastWheelEvent = 0;
	let touchActive = false;
	let notHoldingSince = 0;

	function isAtTop() {
		return (window.scrollY || document.documentElement.scrollTop || 0) <= 0;
	}

	function isAtBottom() {
		const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
		const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
		return scrollHeight > 0 && scrollTop >= scrollHeight - 2;
	}

	function cancelNav() {
		if (pendingNav) {
			pendingNav = null;
			navProgress = 0;
			holdElapsed = 0;
			notHoldingSince = 0;
			cancelAnimationFrame(navRaf);
		}
	}

	async function completeNav() {
		if (!pendingNav) return;
		const { dir, target } = pendingNav;
		pendingNav = null;
		navProgress = 0;
		holdElapsed = 0;
		cancelAnimationFrame(navRaf);
		await goto(target);
		const idx = navLinks.findIndex((l) => l.path === page.url.pathname);
		const next = idx + dir;
		if (next < 0 || next >= navLinks.length) return;
		const now = performance.now();
		const stillHolding = (lastWheelEvent > 0 && now - lastWheelEvent < 300) || touchActive;
		if (!stillHolding) return;
		pendingNav = { dir, target: navLinks[next].path };
		holdElapsed = 0;
		lastTickTime = performance.now();
		navRaf = requestAnimationFrame(holdTick);
	}

	function holdTick() {
		if (!pendingNav) return;
		const now = performance.now();
		const dt = now - lastTickTime;
		lastTickTime = now;

		const atEdge = pendingNav.dir === 1 ? isAtBottom() : isAtTop();
		if (!atEdge) {
			cancelNav();
			return;
		}

		const isHolding = (lastWheelEvent > 0 && now - lastWheelEvent < 300) || touchActive;
		if (isHolding) {
			holdElapsed += dt;
			notHoldingSince = 0;
		} else {
			if (notHoldingSince === 0) {
				notHoldingSince = now;
			} else if (now - notHoldingSince > 3000) {
				cancelNav();
				return;
			}
		}

		navProgress = Math.min(holdElapsed / NAV_DELAY, 1);
		if (navProgress >= 1) {
			completeNav();
			return;
		}
		navRaf = requestAnimationFrame(holdTick);
	}

	function onScroll() {
		const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
		const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
		scrollProgress = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;

		if (pendingNav) {
			if (pendingNav.dir === 1 && !isAtBottom()) cancelNav();
			else if (pendingNav.dir === -1 && !isAtTop()) cancelNav();
		}
	}

	function onWheel(e: WheelEvent) {
		if (isOpen) return;

		const dir = e.deltaY > 0 ? 1 : -1;
		const atEdge = dir === 1 ? isAtBottom() : isAtTop();

		if (pendingNav) {
			if (!atEdge) {
				cancelNav();
				return;
			}
			lastWheelEvent = performance.now();
			return;
		}

		if (!atEdge) return;

		const idx = navLinks.findIndex((l) => l.path === page.url.pathname);
		if (idx === -1) return;
		const next = idx + dir;
		if (next < 0 || next >= navLinks.length) return;

		pendingNav = { dir, target: navLinks[next].path };
		holdElapsed = 0;
		lastWheelEvent = performance.now();
		lastTickTime = performance.now();
		navRaf = requestAnimationFrame(holdTick);
	}

	let touchStartY = 0;

	function onTouchStart(e: TouchEvent) {
		if (isOpen) return;
		touchStartY = e.touches[0].clientY;
	}

	function onTouchMove(e: TouchEvent) {
		if (isOpen || e.touches.length !== 1) return;

		if (pendingNav) {
			const atEdge = pendingNav.dir === 1 ? isAtBottom() : isAtTop();
			if (!atEdge) {
				cancelNav();
				return;
			}
			touchActive = true;
			return;
		}

		const dy = touchStartY - e.touches[0].clientY;
		if (Math.abs(dy) < 40) return;

		const dir = dy > 0 ? 1 : -1;
		const atEdge = dir === 1 ? isAtBottom() : isAtTop();
		if (!atEdge) return;

		const idx = navLinks.findIndex((l) => l.path === page.url.pathname);
		if (idx === -1) return;
		const next = idx + dir;
		if (next < 0 || next >= navLinks.length) return;

		pendingNav = { dir, target: navLinks[next].path };
		holdElapsed = 0;
		lastTickTime = performance.now();
		touchActive = true;
		navRaf = requestAnimationFrame(holdTick);
	}

	function onTouchEnd(_e: TouchEvent) {
		touchActive = false;
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
		window.addEventListener('wheel', onWheel, { passive: true });
		return () => window.removeEventListener('wheel', onWheel);
	});

	$effect(() => {
		window.addEventListener('touchstart', onTouchStart, { passive: true });
		window.addEventListener('touchmove', onTouchMove, { passive: true });
		window.addEventListener('touchend', onTouchEnd, { passive: true });
		return () => {
			window.removeEventListener('touchstart', onTouchStart);
			window.removeEventListener('touchmove', onTouchMove);
			window.removeEventListener('touchend', onTouchEnd);
		};
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

	let pendingName = $derived(navLinks.find((l) => l.path === pendingNav?.target)?.name ?? '');

	let activeIndex = $derived(navLinks.findIndex((l) => l.path === page.url.pathname));

	const socialLinks = [
		{ name: 'GitHub', url: 'https://github.com/Ariffansyah', icon: 'fa-github' },
		{ name: 'LinkedIn', url: 'https://linkedin.com/in/arpthef', icon: 'fa-linkedin' },
		{ name: 'X', url: 'https://x.com/nishimiyaa12', icon: 'fa-x-twitter' },
		{ name: 'Instagram', url: 'https://www.instagram.com/_arpchive/', icon: 'fa-instagram' }
	];
</script>

<div id="app-wrapper" class="relative flex min-h-screen flex-col md:flex-row">
	<nav
		class="nav-sidebar relative z-50 flex w-full flex-col px-6 py-5 md:fixed md:h-screen md:w-64 md:px-8 md:py-0 lg:w-72"
	>
		<svg
			class="pointer-events-none absolute top-0 right-0 hidden md:block"
			width="130"
			height="130"
			viewBox="0 0 130 130"
			aria-hidden="true"
		>
			<g fill="none" stroke="var(--edge-strong)" stroke-width="1" opacity="0.45">
				<line x1="130" y1="0" x2="0" y2="15" />
				<line x1="130" y1="0" x2="0" y2="45" />
				<line x1="130" y1="0" x2="0" y2="75" />
				<line x1="130" y1="0" x2="0" y2="105" />
				<line x1="130" y1="0" x2="105" y2="130" />
				<line x1="130" y1="0" x2="75" y2="130" />
				<line x1="130" y1="0" x2="45" y2="130" />
				<line x1="130" y1="0" x2="15" y2="130" />
				<path
					d="M75.4,6.3 L75.4,18.9 L75.4,31.5 L75.4,44.1 L119.5,54.6 L106.9,54.6 L94.3,54.6 L81.7,54.6"
				/>
			</g>
			<path
				d="M32.5,11.3 L32.5,33.8 L32.5,56.3 L32.5,78.8 L111.3,97.5 L88.8,97.5 L66.3,97.5 L43.8,97.5"
				fill="none"
				stroke="var(--brand)"
				stroke-width="1"
				opacity="0.3"
			/>
		</svg>
		<!-- Top section: logo + subtitle + mobile controls -->
		<div class="flex items-center justify-between pb-4 md:flex-col md:items-start md:pt-10 md:pb-0">
			<div class="flex items-center gap-3 md:flex-col md:items-start md:gap-1">
				<a
					class="glitch group text-ink flex items-center gap-2.5 text-xl font-black tracking-tighter md:text-2xl"
					data-text="arp."
					href={resolve('/')}
				>
					arp<span class="text-brand group-hover:text-brand-hover transition-colors">.</span>
				</a>
				<p
					class="text-ink-faint hidden text-[10px] font-bold tracking-[0.2em] uppercase md:ml-0.5 md:block"
				>
					Software Engineer
				</p>
			</div>

			<div class="flex items-center gap-5 md:hidden">
				<button
					type="button"
					onclick={theme.toggle}
					class="text-brand hover:text-brand-hover transition-colors"
					aria-label="Toggle color theme"
				>
					<i class="fa-regular {$theme === 'dark' ? 'fa-sun' : 'fa-moon'} fa-lg"></i>
				</button>
				<button
					class="relative z-50 flex flex-col gap-1 {isOpen ? 'pointer-events-none opacity-0' : ''}"
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

		<!-- Tab progression bar (desktop) -->
		<div class="relative hidden md:mt-10 md:mb-10 md:block">
			<div class="bg-edge h-px w-full"></div>
			<div
				class="bg-brand absolute top-0 h-px transition-all duration-500 ease-out"
				style="left: {activeIndex >= 0
					? (activeIndex / navLinks.length) * 100
					: 0}%; width: {activeIndex >= 0 ? 100 / navLinks.length : 0}%"
			></div>
		</div>

		<!-- Navigation links (desktop) -->
		<ul class="hidden flex-col gap-1 md:flex">
			{#each navLinks as link (link.path)}
				<li>
					<a
						class="nav-link group flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-bold tracking-[0.3em] uppercase transition-all
						{page.url.pathname === link.path
							? 'nav-link-active bg-brand/10 text-brand'
							: 'text-ink-faint hover:bg-surface/80 hover:text-ink'}"
						href={resolve(link.path)}
					>
						<i
							class="fa-solid {link.icon} w-4 text-center text-[11px] transition-all {page.url
								.pathname === link.path
								? 'text-brand'
								: 'text-ink-faint group-hover:text-ink'}"
						></i>
						{link.name}
					</a>
				</li>
			{/each}
		</ul>

		<!-- Panel decorative line -->
		<div class="hidden md:relative md:mx-3 md:mt-1 md:mb-2 md:block">
			<div class="flex items-center gap-1">
				<span class="border-edge-strong bg-card h-2 w-2 rounded-full border"></span>
				<div
					class="from-edge-strong via-brand/20 h-px flex-1 bg-gradient-to-r to-transparent"
				></div>
				<span class="bg-brand/30 h-1.5 w-1.5 rounded-sm"></span>
			</div>
		</div>

		<!-- Dimension portrait: Gwen in light mode, Miles in dark. -->
		<div class="mt-6 hidden md:block">
			<div class="character-frame">
				<div class="pointer-events-none aspect-4/5 w-full">
					<Character3D />
				</div>
			</div>
			<div class="mt-2 flex items-baseline justify-between px-0.5">
				<span class="text-brand text-[9px] font-bold tracking-[0.25em] uppercase">
					{$theme === 'dark' ? 'Miles' : 'Gwen'}
				</span>
				<span class="text-ink-faint/70 text-[9px] font-bold tracking-[0.2em] uppercase">
					{$theme === 'dark' ? 'Earth-1610' : 'Earth-65'}
				</span>
			</div>
		</div>

		<!-- Scroll progress bar (desktop) -->
		<div
			class="scroll-progress absolute top-0 right-0 z-10 hidden h-full w-0.5 md:block"
			aria-hidden="true"
		>
			<div
				class="bg-brand h-full w-full origin-top transition-transform duration-75 ease-linear"
				style="transform: scaleY({scrollProgress});"
			></div>
		</div>

		<!-- Bottom section (desktop) -->
		<div class="mt-auto hidden flex-col gap-5 pb-8 md:flex">
			<div class="bg-edge h-px w-full"></div>

			<button
				type="button"
				onclick={theme.toggle}
				class="group text-ink-faint hover:bg-surface/80 hover:text-ink flex w-fit items-center gap-3 rounded-md px-3 py-2 text-[10px] font-bold tracking-[0.3em] uppercase transition-all"
				aria-label="Toggle color theme"
			>
				<i class="fa-regular {$theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-brand w-4 text-center"
				></i>
				{$theme === 'dark' ? 'Light' : 'Dark'} Mode
			</button>

			<div class="flex gap-3 px-3">
				{#each socialLinks as s (s.name)}
					<a
						href={s.url}
						target="_blank"
						class="group text-ink-faint hover:bg-surface/80 hover:text-ink relative flex h-8 w-8 items-center justify-center rounded-md text-sm transition-all"
						aria-label={s.name}
					>
						<i class="fa-brands {s.icon}"></i>
						<span
							class="bg-ink text-surface absolute -top-8 left-1/2 -translate-x-1/2 rounded px-2 py-1 text-[9px] font-bold tracking-widest whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100"
						>
							{s.name}
						</span>
					</a>
				{/each}
			</div>

			<p class="text-ink-faint/60 px-3 text-[9px] font-bold tracking-widest uppercase">
				&copy; {new Date().getFullYear()} arpthef
			</p>
		</div>
	</nav>

	<main class="relative z-10 flex-1 md:ml-64 lg:ml-72">
		<div class="min-h-screen">
			{@render children()}
		</div>

		<footer class="soft-divide p-8 text-center md:hidden">
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
			<p class="text-ink-faint/60 text-[9px] font-bold tracking-widest uppercase">
				&copy; {new Date().getFullYear()} arpthef
			</p>
		</footer>
	</main>
</div>

<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.95]">
	<Background3D />
</div>

<!-- Ben-Day halftone plate: drifts slowly, heavier towards the edges -->
<div class="halftone pointer-events-none fixed inset-0 z-0" aria-hidden="true"></div>

<!-- Spider-Verse ambient glow: halftone-friendly wash -->
<div
	class="pointer-events-none fixed inset-0 z-0 {$theme === 'dark'
		? 'opacity-100'
		: 'opacity-[0.55]'} transition-opacity duration-500"
	aria-hidden="true"
	style="background-image:
		radial-gradient(70rem 55rem at 0% 0%, color-mix(in srgb, var(--brand) 13%, transparent), transparent 62%),
		radial-gradient(55rem 55rem at 100% 0%, color-mix(in srgb, var(--edge-strong) 10%, transparent), transparent 60%),
		radial-gradient(45rem 45rem at 100% 100%, color-mix(in srgb, var(--brand) 9%, transparent), transparent 62%);"
></div>

<!-- Page navigation confirmation overlay -->
{#if pendingNav}
	<div
		class="fixed z-50 flex items-center justify-center transition-all duration-500 ease-out {pendingNav.dir ===
		1
			? 'right-0 bottom-0 left-0 md:left-64 lg:left-72'
			: 'top-0 right-0 left-0 md:left-64 lg:left-72'}"
	>
		<div class="relative h-14 w-full overflow-hidden">
			<div
				class="bg-surface/80 absolute inset-0 backdrop-blur-md"
				style="border-{pendingNav.dir === 1 ? 'top' : 'bottom'}: 1px solid var(--edge);"
			></div>
			<div
				class="bg-brand absolute bottom-0 left-0 h-0.5 transition-none"
				style="width: {navProgress * 100}%"
			></div>
			<div class="relative flex h-full items-center justify-center gap-3 px-6">
				<i
					class="fa-solid {pendingNav.dir === 1
						? 'fa-arrow-down'
						: 'fa-arrow-up'} text-brand text-xs"
				></i>
				<span class="text-ink-faint text-[10px] font-bold tracking-[0.3em] uppercase">
					{pendingNav.dir === 1 ? 'Next' : 'Back'}
				</span>
				<span class="text-ink text-xs font-black tracking-tighter">
					{pendingName}
				</span>
				<span class="text-ink-faint/50 text-[10px] font-bold tracking-widest uppercase">
					{Math.round(navProgress * 100)}%
				</span>
				<button
					onclick={cancelNav}
					class="border-edge text-ink-faint hover:border-brand hover:text-brand ml-2 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition-colors"
					aria-label="Cancel navigation"
				>
					<i class="fa-solid fa-xmark"></i>
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Mobile overlay menu. Must live OUTSIDE <nav>: the sidebar sets
	 backdrop-filter, which makes it the containing block for fixed
	 descendants, so an overlay nested inside it gets clipped to the nav.
	 z sits above the nav's z-50 so the bar underneath doesn't show through. -->
{#if isOpen}
	<div
		transition:fly={{ x: -300, duration: 250, easing: cubicOut }}
		class="bg-surface/95 fixed inset-0 z-[60] flex flex-col backdrop-blur-lg md:hidden"
	>
		<div class="flex items-center justify-between px-6 pt-5 pb-4">
			<a
				class="text-ink text-xl font-black tracking-tighter"
				href={resolve('/')}
				onclick={() => (isOpen = false)}
			>
				arp<span class="text-brand">.</span>
			</a>
			<button
				onclick={toggleMenu}
				type="button"
				class="text-ink hover:bg-surface/80 flex h-8 w-8 items-center justify-center rounded-md transition-colors"
				aria-label="Close menu"
			>
				<i class="fa-solid fa-xmark text-xl"></i>
			</button>
		</div>

		<div class="flex-1 overflow-y-auto px-6 py-8">
			<ul class="flex flex-col gap-2">
				{#each navLinks as link, i (link.path)}
					<li>
						<a
							in:fly={{ x: -40, duration: 300, delay: i * 60, easing: cubicOut }}
							class="text-ink flex items-center gap-4 rounded-lg px-4 py-3.5 text-lg font-black tracking-tighter uppercase transition-all active:scale-[0.98]
							{page.url.pathname === link.path ? 'bg-brand/10 text-brand' : 'hover:bg-surface/80'}"
							href={resolve(link.path)}
							onclick={() => (isOpen = false)}
						>
							<i
								class="fa-solid {link.icon} w-6 text-center text-base {page.url.pathname ===
								link.path
									? 'text-brand'
									: 'text-ink-faint'}"
							></i>
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
					class="text-ink-faint hover:text-ink flex items-center gap-3 text-xs font-bold tracking-[0.3em] uppercase transition-colors"
				>
					<i class="fa-regular {$theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-brand"></i>
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

				<p class="text-ink-faint/60 text-[9px] font-bold tracking-widest uppercase">
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
				class="max-h-[80vh] max-w-[90vw] object-contain shadow-2xl"
			/>
			<button
				onclick={closeLightbox}
				class="text-ink-faint hover:text-brand text-[10px] font-black tracking-[0.3em] uppercase transition-colors"
			>
				Close [esc]
			</button>
		</div>
	</div>
{/if}

<style>
	/* Positioning comes from the element's own `relative` / `md:fixed` classes —
	   setting it here would out-specify them and drop the sidebar back in flow. */
	.nav-sidebar {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.nav-sidebar::-webkit-scrollbar {
		display: none;
	}

	/*
	 * The sidebar "plate": wash + comic grid that dissolves into the page rather
	 * than ending on a border, so panel and background read as one surface. The
	 * blur rides the same mask, so its edge fades out too. Both layers sit behind
	 * the nav's content on a negative z-index — the nav is `z-50`, so it
	 * establishes the stacking context that keeps them contained.
	 */
	.nav-sidebar::before,
	.nav-sidebar::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		mask-image: linear-gradient(to right, #000 55%, transparent);
	}

	.nav-sidebar::before {
		backdrop-filter: blur(10px);
		background-image:
			linear-gradient(
				to right,
				color-mix(in srgb, var(--surface) 88%, transparent),
				color-mix(in srgb, var(--surface) 60%, transparent) 55%,
				transparent
			),
			repeating-linear-gradient(
				0deg,
				transparent,
				transparent 28px,
				color-mix(in srgb, var(--edge-strong) 6%, transparent) 28px,
				color-mix(in srgb, var(--edge-strong) 6%, transparent) 29px
			),
			repeating-linear-gradient(
				90deg,
				transparent,
				transparent 28px,
				color-mix(in srgb, var(--edge-strong) 6%, transparent) 28px,
				color-mix(in srgb, var(--edge-strong) 6%, transparent) 29px
			);
	}

	:global(.dark) .nav-sidebar::before {
		background-image:
			linear-gradient(
				to right,
				color-mix(in srgb, var(--surface) 84%, transparent),
				color-mix(in srgb, var(--surface) 55%, transparent) 55%,
				transparent
			),
			repeating-linear-gradient(
				0deg,
				transparent,
				transparent 28px,
				color-mix(in srgb, var(--edge-strong) 8%, transparent) 28px,
				color-mix(in srgb, var(--edge-strong) 8%, transparent) 29px
			),
			repeating-linear-gradient(
				90deg,
				transparent,
				transparent 28px,
				color-mix(in srgb, var(--edge-strong) 8%, transparent) 28px,
				color-mix(in srgb, var(--edge-strong) 8%, transparent) 29px
			);
	}

	/* On mobile the panel is a top bar, so the falloff runs downwards. */
	@media (max-width: 767px) {
		.nav-sidebar::before,
		.nav-sidebar::after {
			mask-image: linear-gradient(to bottom, #000 50%, transparent);
		}
		.nav-sidebar::before,
		:global(.dark) .nav-sidebar::before {
			background-image:
				linear-gradient(
					to bottom,
					color-mix(in srgb, var(--surface) 90%, transparent),
					color-mix(in srgb, var(--surface) 60%, transparent) 65%,
					transparent
				),
				repeating-linear-gradient(
					0deg,
					transparent,
					transparent 28px,
					color-mix(in srgb, var(--edge-strong) 7%, transparent) 28px,
					color-mix(in srgb, var(--edge-strong) 7%, transparent) 29px
				),
				repeating-linear-gradient(
					90deg,
					transparent,
					transparent 28px,
					color-mix(in srgb, var(--edge-strong) 7%, transparent) 28px,
					color-mix(in srgb, var(--edge-strong) 7%, transparent) 29px
				);
		}
	}

	/* Divider that fades out at both ends instead of butting into the edges. */
	.soft-divide {
		background-image: linear-gradient(
			to right,
			transparent,
			var(--edge) 25%,
			var(--edge) 75%,
			transparent
		);
		background-size: 100% 1px;
		background-repeat: no-repeat;
		background-position: top;
	}

	/* Dimension-glitch sweep: a chromatic band crosses the panel now and then.
	   Shares the plate's mask so it fades out with the rest of the panel. */
	.nav-sidebar::after {
		background: linear-gradient(
			to bottom,
			transparent 45%,
			rgba(0, 229, 255, 0.14) 47%,
			rgba(255, 45, 150, 0.14) 50%,
			transparent 53%
		);
		background-size: 100% 200%;
		animation: panel-sweep 7s ease-in-out infinite;
	}

	@keyframes panel-sweep {
		0%,
		70%,
		100% {
			background-position: 0 -120%;
			opacity: 0;
		}
		74% {
			opacity: 1;
		}
		92% {
			background-position: 0 220%;
			opacity: 1;
		}
		96% {
			opacity: 0;
		}
	}

	/* Misregistered ink plates on the wordmark, snapping every few seconds */
	.glitch {
		position: relative;
	}
	.glitch::before,
	.glitch::after {
		content: attr(data-text);
		position: absolute;
		left: 0;
		top: 0;
		pointer-events: none;
		opacity: 0;
	}
	.glitch::before {
		color: #00e5ff;
		animation: glitch-cyan 5s steps(1) infinite;
	}
	.glitch::after {
		color: #ff2d96;
		animation: glitch-magenta 5s steps(1) infinite;
	}

	@keyframes glitch-cyan {
		0%,
		88%,
		100% {
			opacity: 0;
			transform: none;
		}
		89% {
			opacity: 0.85;
			transform: translate(-2px, 1px);
		}
		92% {
			opacity: 0.85;
			transform: translate(2px, -1px);
		}
		95% {
			opacity: 0.6;
			transform: translate(-1px, 0);
		}
	}
	@keyframes glitch-magenta {
		0%,
		88%,
		100% {
			opacity: 0;
			transform: none;
		}
		89% {
			opacity: 0.85;
			transform: translate(2px, -1px);
		}
		92% {
			opacity: 0.85;
			transform: translate(-2px, 1px);
		}
		95% {
			opacity: 0.6;
			transform: translate(1px, 0);
		}
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
		animation: halftone-drift 24s linear infinite;
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

	/* Comic panel the portrait sits in: halftone ground, brand wash from above,
	   torn bottom-right corner. */
	.character-frame {
		position: relative;
		overflow: hidden;
		border: 1px solid var(--edge);
		clip-path: polygon(0 0, 100% 0, 100% 86%, 86% 100%, 0 100%);
		background-image:
			radial-gradient(
				115% 85% at 50% 12%,
				color-mix(in srgb, var(--brand) 18%, transparent),
				transparent 72%
			),
			radial-gradient(
				circle at center,
				color-mix(in srgb, var(--edge-strong) 30%, transparent) 0.8px,
				transparent 1.1px
			);
		background-size:
			auto,
			4px 4px;
	}
	/* Torn edge highlight along the cut corner */
	.character-frame::after {
		content: '';
		position: absolute;
		right: -1px;
		bottom: -1px;
		width: 24%;
		height: 24%;
		background: linear-gradient(
			135deg,
			transparent 48%,
			color-mix(in srgb, var(--brand) 70%, transparent) 50%,
			transparent 52%
		);
		pointer-events: none;
	}

	.nav-link {
		position: relative;
		letter-spacing: 0.25em;
		transition: text-shadow 0.15s ease;
	}
	.nav-link:hover {
		text-shadow:
			-1px 0 rgba(0, 229, 255, 0.5),
			1px 0 rgba(255, 45, 150, 0.5);
	}
	/* Active tab is a torn panel corner, printed slightly out of register */
	.nav-link-active {
		clip-path: polygon(0 0, 100% 0, 100% 58%, 93% 100%, 0 100%);
		text-shadow:
			-1px 0 rgba(0, 229, 255, 0.55),
			1px 0 rgba(255, 45, 150, 0.55);
	}
	.nav-link::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		translate: 0 -50%;
		width: 2px;
		height: 0;
		border-radius: 0 2px 2px 0;
		background: var(--brand);
		transition: height 0.25s ease;
	}
	.nav-link:hover::before {
		height: 60%;
	}
	.nav-link-active::before {
		height: 70% !important;
	}

	.nav-link::after {
		content: '';
		position: absolute;
		right: 8px;
		top: 50%;
		translate: 0 -50%;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--edge-strong);
		opacity: 0;
		transition:
			opacity 0.25s ease,
			box-shadow 0.25s ease;
	}
	.nav-link:hover::after {
		opacity: 1;
		box-shadow: 0 0 6px var(--brand);
	}
	.nav-link-active::after {
		opacity: 1;
		background: var(--brand);
		box-shadow: 0 0 8px var(--brand);
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
		animation: vt-fade-out 0.35s ease-out;
	}
	:global(::view-transition-new(root)) {
		animation: vt-fade-in 0.35s ease-out;
	}

	@keyframes vt-fade-out {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}
	@keyframes vt-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.nav-sidebar::after,
		.glitch::before,
		.glitch::after,
		.halftone {
			animation: none;
		}
		.nav-sidebar::after {
			opacity: 0;
		}
	}
</style>
