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

	const twos = (frames: number) => (t: number) => cubicOut(Math.ceil(t * frames) / frames);

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

	const WEB = 150;
	const cornerWeb = (() => {
		const rand = (n: number) => {
			const s = Math.sin(n * 12.9898) * 43758.5453;
			return s - Math.floor(s);
		};
		const f = (n: number) => n.toFixed(1);
		const spokes = 7;
		const rings = 6;
		const ang = Array.from(
			{ length: spokes },
			(_, i) => Math.PI / 2 + ((i + 0.5) / spokes) * (Math.PI / 2) + (rand(i + 1) - 0.5) * 0.12
		);
		const pt = (i: number, k: number) => {
			const r = WEB * ((k + 1) / rings) ** 0.85 * (0.96 + rand(i * 7 + k) * 0.08);
			return [WEB + Math.cos(ang[i]) * r, Math.sin(ang[i]) * r];
		};
		let d = '';
		for (let i = 0; i < spokes; i++) {
			const [x, y] = pt(i, rings);
			d += `M${WEB},0L${f(x)},${f(y)}`;
		}
		for (let k = 0; k < rings; k++) {
			for (let i = 0; i < spokes - 1; i++) {
				if (rand(k * 31 + i * 5) < 0.08) continue;
				const [x0, y0] = pt(i, k);
				const [x1, y1] = pt(i + 1, k);
				const mx = (x0 + x1) / 2;
				const my = (y0 + y1) / 2;
				const s = 0.16 + rand(k + i * 3) * 0.08;
				d += `M${f(x0)},${f(y0)}Q${f(mx + (WEB - mx) * s)},${f(my * (1 - s))} ${f(x1)},${f(y1)}`;
			}
		}
		const [ax, ay] = pt(1, 2);
		return { d, ax: +f(ax), ay: +f(ay) };
	})();
	const SILK = 40;
</script>

<div id="app-wrapper" class="relative flex min-h-screen flex-col md:flex-row">
	<nav
		class="nav-sidebar bg-surface border-edge-ink relative z-50 flex w-full flex-col border-b-3 px-6 py-5 md:fixed md:h-screen md:w-64 md:overflow-y-auto md:border-r-3 md:border-b-0 md:px-8 md:py-0 lg:w-72"
	>
		<svg
			class="pointer-events-none absolute top-0 right-0 hidden md:block"
			width={WEB}
			height={WEB}
			viewBox="0 0 {WEB} {WEB}"
			aria-hidden="true"
		>
			<defs>
				<path id="corner-web" d={cornerWeb.d} />
				<radialGradient id="corner-web-fade" cx="1" cy="0" r="1">
					<stop offset="0.4" stop-color="#fff" />
					<stop offset="1" stop-color="#fff" stop-opacity="0" />
				</radialGradient>
				<mask id="corner-web-mask">
					<rect width={WEB} height={WEB} fill="url(#corner-web-fade)" />
				</mask>
			</defs>
			<g fill="none" stroke-linecap="round" mask="url(#corner-web-mask)">
				<use
					href="#corner-web"
					stroke="var(--plate-a)"
					stroke-width="1.2"
					opacity="0.5"
					x="-1.6"
					y="1"
				/>
				<use
					href="#corner-web"
					stroke="var(--plate-b)"
					stroke-width="1.2"
					opacity="0.5"
					x="1.6"
					y="-1"
				/>
				<use href="#corner-web" stroke="var(--edge-ink)" stroke-width="1" opacity="0.85" />
			</g>

			<g class="dangle" style="transform-origin: {cornerWeb.ax}px {cornerWeb.ay}px">
				<line
					class="silk"
					style="transform-origin: {cornerWeb.ax}px {cornerWeb.ay}px"
					x1={cornerWeb.ax}
					y1={cornerWeb.ay}
					x2={cornerWeb.ax}
					y2={cornerWeb.ay + SILK}
					stroke="var(--edge-ink)"
					stroke-width="0.6"
					opacity="0.55"
				/>
				<g transform="translate({cornerWeb.ax} {cornerWeb.ay + SILK})">
					<g class="spider">
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
						<text
							x="0"
							y="5.7"
							text-anchor="middle"
							font-size="4.6"
							font-weight="700"
							fill="#ff2d55">42</text
						>
					</g>
				</g>
			</g>
		</svg>
		<div class="flex items-center justify-between pb-4 md:flex-col md:items-start md:pt-10 md:pb-0">
			<div class="flex items-center gap-3 md:flex-col md:items-start md:gap-1">
				<a class="font-display judul-komik text-4xl md:text-6xl" href={resolve('/')}>
					arp<span class="text-pop">.</span>
				</a>
				<p
					class="border-edge-ink bg-pop text-on-pop hidden -rotate-2 border-2 px-2 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase md:mt-2 md:block"
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

		<div class="relative hidden md:mt-10 md:mb-10 md:block">
			<div class="border-edge-ink bg-card h-3 w-full border-2"></div>
			<div
				class="bg-cta border-edge-ink absolute top-0 h-3 border-2 transition-all duration-500 ease-out"
				style="left: {activeIndex >= 0
					? (activeIndex / navLinks.length) * 100
					: 0}%; width: {activeIndex >= 0 ? 100 / navLinks.length : 0}%"
			></div>
		</div>

		<ul class="hidden flex-col gap-3 md:flex">
			{#each navLinks as link (link.path)}
				<li>
					<a
						class="tekan font-display flex items-center gap-3 rounded-md px-3 py-1.5 text-2xl
						{page.url.pathname === link.path
							? 'bg-pop text-on-pop'
							: 'bg-card text-ink hover:bg-pop hover:text-on-pop'}"
						href={resolve(link.path)}
						aria-current={page.url.pathname === link.path ? 'page' : undefined}
					>
						<i class="fa-solid {link.icon} w-5 text-center text-sm"></i>
						{link.name}
					</a>
				</li>
			{/each}
		</ul>

		<div class="mt-8 hidden md:block">
			<div class="character-frame komik rounded-md">
				<div class="pointer-events-none aspect-4/5 w-full">
					<Character3D />
				</div>
			</div>
			<div class="mt-3 flex items-baseline justify-between px-0.5">
				<span class="font-display text-ink text-xl">
					{$theme === 'dark' ? 'Miles' : 'Gwen'}
				</span>
				<span class="text-ink-faint text-[10px] font-bold tracking-[0.2em] uppercase">
					{$theme === 'dark' ? 'Earth-1610' : 'Earth-65'}
				</span>
			</div>
		</div>

		<div
			class="scroll-progress fixed top-0 left-[calc(16rem-3px)] z-10 hidden h-full w-[3px] md:block lg:left-[calc(18rem-3px)]"
			aria-hidden="true"
		>
			<div
				class="bg-cta h-full w-full origin-top transition-transform duration-75 ease-linear"
				style="transform: scaleY({scrollProgress});"
			></div>
		</div>

		<div class="mt-auto hidden flex-col gap-5 pt-8 pb-8 md:flex">
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

	<main class="relative z-10 flex-1 md:ml-64 lg:ml-72">
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

<div class="halftone pointer-events-none fixed inset-0 z-0" aria-hidden="true"></div>

<div class="reading-scrim pointer-events-none fixed inset-0 z-0" aria-hidden="true"></div>

{#if pendingNav}
	<div
		class="fixed z-50 flex items-center justify-center transition-all duration-500 ease-out {pendingNav.dir ===
		1
			? 'right-0 bottom-0 left-0 md:left-64 lg:left-72'
			: 'top-0 right-0 left-0 md:left-64 lg:left-72'}"
	>
		<div class="relative h-14 w-full overflow-hidden">
			<div
				class="bg-pop absolute inset-0"
				style="border-{pendingNav.dir === 1 ? 'top' : 'bottom'}: 3px solid #0c1844;"
			></div>
			<div
				class="bg-cta absolute bottom-0 left-0 h-1.5 transition-none"
				style="width: {navProgress * 100}%"
			></div>
			<div class="relative flex h-full items-center justify-center gap-3 px-6">
				<i
					class="fa-solid {pendingNav.dir === 1
						? 'fa-arrow-down'
						: 'fa-arrow-up'} text-on-pop text-xs"
				></i>
				<span class="text-on-pop text-[10px] font-bold tracking-[0.3em] uppercase">
					{pendingNav.dir === 1 ? 'Next' : 'Back'}
				</span>
				<span class="font-display text-on-pop text-2xl">
					{pendingName}
				</span>
				<span class="text-on-pop text-[10px] font-bold tracking-widest uppercase">
					{Math.round(navProgress * 100)}%
				</span>
				<button
					onclick={cancelNav}
					class="text-on-pop border-on-pop bg-cta-ink hover:bg-cta hover:text-cta-ink ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] transition-colors"
					aria-label="Cancel navigation"
				>
					<i class="fa-solid fa-xmark"></i>
				</button>
			</div>
		</div>
	</div>
{/if}

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

	.nav-sidebar::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background-image: radial-gradient(
			color-mix(in srgb, var(--edge-ink) 9%, transparent) 1.2px,
			transparent 1.6px
		);
		background-size: 9px 9px;
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
	.silk,
	.spider {
		transition: transform 0.7s cubic-bezier(0.3, 1.4, 0.5, 1);
	}
	.nav-sidebar:hover .silk {
		transform: scaleY(0.3);
	}
	.nav-sidebar:hover .spider {
		transform: translateY(-28px);
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
		.halftone,
		.dangle,
		:global(::view-transition-old(root)),
		:global(::view-transition-new(root)) {
			animation: none;
		}
		.silk,
		.spider {
			transition: none;
		}
	}
</style>
