<script lang="ts">
	import Background3D from '$lib/components/Background3D.svelte';
	import '../app.css';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { resolve } from '$app/paths';
	import { goto, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { theme } from '$lib/theme';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children } = $props();

	let isOpen = $state(false);
	const toggleMenu = () => (isOpen = !isOpen);

	if (page.url.pathname) {
		isOpen = false;
	}

	const NAV_DELAY = 3000;
	let scrollProgress = $state(0);
	let pendingNav = $state<{ dir: -1 | 1; startedAt: number; target: string } | null>(null);
	let navProgress = $state(0);
	let navRaf = 0;

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
			cancelAnimationFrame(navRaf);
		}
	}

	function startNav(dir: -1 | 1) {
		if (isOpen) return;
		if (pendingNav) return;
		const idx = navLinks.findIndex((l) => l.path === page.url.pathname);
		if (idx === -1) return;
		const next = idx + dir;
		if (next < 0 || next >= navLinks.length) return;
		pendingNav = { dir, startedAt: performance.now(), target: navLinks[next].path };
		navProgress = 0;

		function tick() {
			if (!pendingNav) return;
			const elapsed = performance.now() - pendingNav.startedAt;
			navProgress = Math.min(elapsed / NAV_DELAY, 1);
			if (navProgress >= 1) {
				const t = pendingNav.target;
				pendingNav = null;
				navProgress = 0;
				goto(t);
				return;
			}
			navRaf = requestAnimationFrame(tick);
		}
		navRaf = requestAnimationFrame(tick);
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
		if (pendingNav) return;
		if (e.deltaY > 0 && isAtBottom()) startNav(1);
		else if (e.deltaY < 0 && isAtTop()) startNav(-1);
	}

	let touchStartY = 0;
	function onTouchStart(e: TouchEvent) {
		touchStartY = e.touches[0].clientY;
	}
	function onTouchEnd(e: TouchEvent) {
		if (pendingNav) return;
		const dy = touchStartY - e.changedTouches[0].clientY;
		if (Math.abs(dy) < 40) return;
		if (dy > 0 && isAtBottom()) startNav(1);
		else if (dy < 0 && isAtTop()) startNav(-1);
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
		window.addEventListener('touchend', onTouchEnd, { passive: true });
		return () => {
			window.removeEventListener('touchstart', onTouchStart);
			window.removeEventListener('touchend', onTouchEnd);
		};
	});

	const navLinks = [
		{ name: 'Home', path: '/' as const, icon: 'fa-house' },
		{ name: 'About', path: '/about' as const, icon: 'fa-user' },
		{ name: 'Projects', path: '/projects' as const, icon: 'fa-code' },
		{ name: 'Contact', path: '/contact' as const, icon: 'fa-paper-plane' }
	];

	let pendingName = $derived(
		navLinks.find((l) => l.path === pendingNav?.target)?.name ?? ''
	);

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
		class="nav-sidebar relative z-50 flex w-full flex-col border-b border-edge bg-surface px-6 py-5 md:fixed md:h-screen md:w-64 md:border-r md:border-b-0 md:px-8 md:py-0 lg:w-72"
	>
		<!-- Top section: logo + subtitle + mobile controls -->
		<div
			class="flex items-center justify-between border-b border-edge pb-4 md:flex-col md:items-start md:border-b-0 md:pb-0 md:pt-10"
		>
			<div class="flex items-center gap-3 md:flex-col md:items-start md:gap-1">
				<a class="group flex items-center gap-2.5 text-xl font-black tracking-tighter text-ink md:text-2xl" href={resolve('/')}>
					arp<span class="text-brand transition-colors group-hover:text-brand-hover">.</span>
				</a>
				<p class="hidden text-[10px] font-bold tracking-[0.2em] text-ink-faint uppercase md:block md:ml-0.5">
					Software Engineer
				</p>
			</div>

			<div class="flex items-center gap-5 md:hidden">
				<button
					type="button"
					onclick={theme.toggle}
					class="text-brand transition-colors hover:text-brand-hover"
					aria-label="Toggle color theme"
				>
					<i class="fa-regular {$theme === 'dark' ? 'fa-sun' : 'fa-moon'} fa-lg"></i>
				</button>
				<button
					class="relative z-50 flex flex-col gap-1"
					onclick={toggleMenu}
					type="button"
					aria-label="Toggle menu"
				>
					<span
						class="h-0.5 w-5 rounded bg-ink transition-all {isOpen ? 'translate-y-1.5 rotate-45' : ''}"
					></span>
					<span
						class="h-0.5 w-5 rounded bg-ink transition-all {isOpen ? 'opacity-0' : ''}"
					></span>
					<span
						class="h-0.5 w-5 rounded bg-ink transition-all {isOpen ? '-translate-y-1.5 -rotate-45' : ''}"
					></span>
				</button>
			</div>
		</div>

		<!-- Tab progression bar (desktop) -->
		<div class="relative hidden md:mt-10 md:mb-10 md:block">
			<div class="h-px w-full bg-edge"></div>
			<div
				class="absolute top-0 h-px bg-brand transition-all duration-500 ease-out"
				style="left: {activeIndex >= 0 ? (activeIndex / navLinks.length) * 100 : 0}%; width: {activeIndex >= 0 ? 100 / navLinks.length : 0}%"
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
							class="fa-solid {link.icon} w-4 text-center text-[11px] transition-all {page.url.pathname === link.path ? 'text-brand' : 'text-ink-faint group-hover:text-ink'}"
						></i>
						{link.name}
						{#if page.url.pathname === link.path}
							<span class="ml-auto h-1.5 w-1.5 rounded-full bg-brand"></span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>

		<!-- Scroll progress bar (desktop) -->
		<div
			class="scroll-progress absolute right-0 top-0 hidden h-full w-0.5 md:block"
			aria-hidden="true"
		>
			<div
				class="h-full w-full origin-top bg-brand transition-transform duration-75 ease-linear"
				style="transform: scaleY({scrollProgress});"
			></div>
		</div>

		<!-- Bottom section (desktop) -->
		<div class="mt-auto hidden flex-col gap-5 pb-8 md:flex">
			<div class="h-px w-full bg-edge"></div>

			<button
				type="button"
				onclick={theme.toggle}
				class="group flex w-fit items-center gap-3 rounded-md px-3 py-2 text-[10px] font-bold tracking-[0.3em] text-ink-faint uppercase transition-all hover:bg-surface/80 hover:text-ink"
				aria-label="Toggle color theme"
			>
				<i class="fa-regular {$theme === 'dark' ? 'fa-sun' : 'fa-moon'} w-4 text-center text-brand"></i>
				{$theme === 'dark' ? 'Light' : 'Dark'} Mode
			</button>

			<div class="flex gap-3 px-3">
				{#each socialLinks as s (s.name)}
					<a
						href={s.url}
						target="_blank"
						class="group relative flex h-8 w-8 items-center justify-center rounded-md text-sm text-ink-faint transition-all hover:bg-surface/80 hover:text-ink"
						aria-label={s.name}
					>
						<i class="fa-brands {s.icon}"></i>
						<span
							class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[9px] font-bold tracking-widest text-surface opacity-0 transition-opacity group-hover:opacity-100"
						>
							{s.name}
						</span>
					</a>
				{/each}
			</div>

			<p class="px-3 text-[9px] font-bold tracking-widest text-ink-faint/60 uppercase">
				&copy; {new Date().getFullYear()} arpthef
			</p>
		</div>

		<!-- Mobile overlay menu -->
		{#if isOpen}
			<div
				transition:fly={{ x: -300, duration: 250, easing: cubicOut }}
				class="fixed inset-0 z-40 flex flex-col bg-surface/95 backdrop-blur-lg md:hidden"
			>
				<div class="flex items-center justify-between px-6 pt-5 pb-4">
					<a
						class="text-xl font-black tracking-tighter text-ink"
						href={resolve('/')}
						onclick={() => (isOpen = false)}
					>
						arp<span class="text-brand">.</span>
					</a>
					<button
						onclick={toggleMenu}
						type="button"
						class="flex h-8 w-8 items-center justify-center rounded-md text-ink transition-colors hover:bg-surface/80"
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
									class="flex items-center gap-4 rounded-lg px-4 py-3.5 text-lg font-black tracking-tighter text-ink uppercase transition-all active:scale-[0.98]
									{page.url.pathname === link.path ? 'bg-brand/10 text-brand' : 'hover:bg-surface/80'}"
									href={resolve(link.path)}
									onclick={() => (isOpen = false)}
								>
									<i class="fa-solid {link.icon} w-6 text-center text-base {page.url.pathname === link.path ? 'text-brand' : 'text-ink-faint'}"></i>
									{link.name}
								</a>
							</li>
						{/each}
					</ul>

					<div class="mt-12 flex flex-col gap-6">
						<button
							type="button"
							onclick={() => { theme.toggle(); }}
							class="flex items-center gap-3 text-xs font-bold tracking-[0.3em] text-ink-faint uppercase transition-colors hover:text-ink"
						>
							<i class="fa-regular {$theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-brand"></i>
							{$theme === 'dark' ? 'Light' : 'Dark'} Mode
						</button>

						<div class="flex gap-5">
							{#each socialLinks as s (s.name)}
								<a
									href={s.url}
									target="_blank"
									class="text-ink-faint transition-colors hover:text-ink"
									aria-label={s.name}
								>
									<i class="fa-brands {s.icon} fa-lg"></i>
								</a>
							{/each}
						</div>

						<p class="text-[9px] font-bold tracking-widest text-ink-faint/60 uppercase">
							&copy; {new Date().getFullYear()} arpthef
						</p>
					</div>
				</div>
			</div>
		{/if}
	</nav>

	<main class="relative z-10 flex-1 md:ml-64 lg:ml-72">
		<div class="min-h-screen">
			{@render children()}
		</div>

		<footer class="border-t border-edge p-8 text-center md:hidden">
			<div class="flex justify-center gap-6 pb-4">
				{#each socialLinks as s (s.name)}
					<a
						href={s.url}
						target="_blank"
						class="text-ink-faint transition-colors hover:text-ink"
						aria-label={s.name}
					>
						<i class="fa-brands {s.icon} fa-lg"></i>
					</a>
				{/each}
			</div>
			<p class="text-[9px] font-bold tracking-widest text-ink-faint/60 uppercase">
				&copy; {new Date().getFullYear()} arpthef
			</p>
		</footer>
	</main>
</div>

<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-90">
	<Background3D nodeCount={95} linkDistance={220} />
</div>

<!-- Page navigation confirmation overlay -->
{#if pendingNav}
	<div
		class="fixed z-50 flex items-center justify-center transition-all duration-500 ease-out {pendingNav.dir === 1
			? 'bottom-0 left-0 right-0 md:left-64 lg:left-72'
			: 'top-0 left-0 right-0 md:left-64 lg:left-72'}"
	>
		<div
			class="relative w-full overflow-hidden h-14"
		>
			<div
				class="absolute inset-0 bg-surface/80 backdrop-blur-md"
				style="border-{pendingNav.dir === 1 ? 'top' : 'bottom'}: 1px solid var(--edge);"
			></div>
			<div
				class="absolute bottom-0 left-0 h-0.5 bg-brand transition-none"
				style="width: {navProgress * 100}%"
			></div>
			<div class="relative flex h-full items-center justify-center gap-3 px-6">
				<i class="fa-solid {pendingNav.dir === 1 ? 'fa-arrow-down' : 'fa-arrow-up'} text-xs text-brand"></i>
				<span class="text-[10px] font-bold tracking-[0.3em] text-ink-faint uppercase">
					{pendingNav.dir === 1 ? 'Next' : 'Back'}
				</span>
				<span class="text-xs font-black tracking-tighter text-ink">
					{pendingName}
				</span>
				<span class="text-[10px] font-bold tracking-widest text-ink-faint/50 uppercase">
					{Math.ceil((1 - navProgress) * 3)}s
				</span>
				<button
					onclick={cancelNav}
					class="ml-2 flex h-6 w-6 items-center justify-center rounded-full border border-edge text-[10px] text-ink-faint transition-colors hover:border-brand hover:text-brand"
					aria-label="Cancel navigation"
				>
					<i class="fa-solid fa-xmark"></i>
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.nav-sidebar {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.nav-sidebar::-webkit-scrollbar {
		display: none;
	}

	.nav-link {
		position: relative;
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

	:global(body) {
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
		from { opacity: 1; }
		to { opacity: 0; }
	}
	@keyframes vt-fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}
</style>
