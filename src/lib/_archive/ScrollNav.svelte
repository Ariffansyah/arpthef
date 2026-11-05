<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { links, blocked = false }: { links: { name: string; path: string }[]; blocked?: boolean } =
		$props();

	const NAV_DELAY = 3000;
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
		const idx = links.findIndex((l) => l.path === page.url.pathname);
		const next = idx + dir;
		if (next < 0 || next >= links.length) return;
		const now = performance.now();
		const stillHolding = (lastWheelEvent > 0 && now - lastWheelEvent < 300) || touchActive;
		if (!stillHolding) return;
		pendingNav = { dir, target: links[next].path };
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
		if (pendingNav) {
			if (pendingNav.dir === 1 && !isAtBottom()) cancelNav();
			else if (pendingNav.dir === -1 && !isAtTop()) cancelNav();
		}
	}

	function onWheel(e: WheelEvent) {
		if (blocked) return;

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

		const idx = links.findIndex((l) => l.path === page.url.pathname);
		if (idx === -1) return;
		const next = idx + dir;
		if (next < 0 || next >= links.length) return;

		pendingNav = { dir, target: links[next].path };
		holdElapsed = 0;
		lastWheelEvent = performance.now();
		lastTickTime = performance.now();
		navRaf = requestAnimationFrame(holdTick);
	}

	let touchStartY = 0;

	function onTouchStart(e: TouchEvent) {
		if (blocked) return;
		touchStartY = e.touches[0].clientY;
	}

	function onTouchMove(e: TouchEvent) {
		if (blocked || e.touches.length !== 1) return;

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

		const idx = links.findIndex((l) => l.path === page.url.pathname);
		if (idx === -1) return;
		const next = idx + dir;
		if (next < 0 || next >= links.length) return;

		pendingNav = { dir, target: links[next].path };
		holdElapsed = 0;
		lastTickTime = performance.now();
		touchActive = true;
		navRaf = requestAnimationFrame(holdTick);
	}

	function onTouchEnd() {
		touchActive = false;
	}

	let pendingName = $derived(links.find((l) => l.path === pendingNav?.target)?.name ?? '');

	$effect(() => () => cancelAnimationFrame(navRaf));
</script>

<svelte:window
	onscroll={onScroll}
	onwheel={onWheel}
	ontouchstart={onTouchStart}
	ontouchmove={onTouchMove}
	ontouchend={onTouchEnd}
/>

{#if pendingNav}
	<div
		class="fixed z-50 flex items-center justify-center transition-all duration-500 ease-out {pendingNav.dir ===
		1
			? 'right-0 bottom-0 left-0 md:left-56'
			: 'top-0 right-0 left-0 md:left-56'}"
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
