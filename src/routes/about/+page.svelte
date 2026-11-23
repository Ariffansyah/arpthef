<script lang="ts">
	import { intersect } from '$lib/actions/intersect';
	import { cubicOut } from 'svelte/easing';
	import { resolve } from '$app/paths';
	import ExperienceTabs from '$lib/components/ExperienceTabs.svelte';

	function bioAnimation(_node: HTMLElement, { duration }: { duration: number }) {
		return {
			duration,
			css: (t: number) => {
				const eased = cubicOut(Math.ceil(t * 5) / 5);
				return `
					opacity: ${eased};
					transform: translateX(${10 * (1 - eased)}px);
					filter: blur(${4 * (1 - eased)}px);
				`;
			}
		};
	}

	export let data;

	let isBioExpanded = false;
	function toggleBio() {
		isBioExpanded = !isBioExpanded;
	}
</script>

<svelte:head>
	<title>About me - arp</title>
	<meta name="description" content="Learn more about Mohammad Ariffansyah." />
	<meta
		name="keywords"
		content="about, arp, arpthef, mohammad, ariffansyah, developer, programmer, backend, frontend, fullstack"
	/>
	<meta name="author" content="Mohammad Ariffansyah" />
	<meta property="og:title" content="About me - arp" />
	<meta property="og:image" content="https://arpthef.my.id/Logo.webp" />
	<meta property="og:description" content="Learn more about Mohammad Ariffansyah." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://arpthef.my.id/about" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="About me - arp" />
	<meta name="twitter:description" content="Learn more about Mohammad Ariffansyah." />
	<link rel="canonical" href="https://arpthef.my.id/about" />
</svelte:head>

<section class="relative z-10 mx-auto w-full max-w-7xl px-6 py-12 lg:px-10 lg:py-24">
	<div class="mb-24 flex flex-col gap-4">
		<h1 class="font-display plates text-7xl leading-[0.95] text-ink lg:text-9xl">
			About<br /><span class="judul-komik">Me</span>
		</h1>
		<p class="narasi">The story so far</p>
	</div>

	<div class="grid grid-cols-1 gap-20 xl:grid-cols-2">
		<div class="flex flex-col gap-10">
			<div class="flex flex-col gap-6" use:intersect>
				<p class="kotak-narasi w-fit max-w-xl -rotate-1 text-lg leading-relaxed font-medium md:text-xl">
					I am an undergraduate student primarily focused on <span class="bg-pop px-1 text-on-pop box-decoration-clone">backend development</span>, building the invisible engines that power the web.
				</p>

				<div class="flex flex-col gap-6 leading-relaxed text-ink-muted">
					<p>
						My journey began in elementary school, but it wasn't until my final year of high school
						that I realized programming was my calling. Inspired by my brother and the online tech
						community, I dove deep into the world of computing.
					</p>

					{#if isBioExpanded}
						<div
							in:bioAnimation={{ duration: 400 }}
							out:bioAnimation={{ duration: 400 }}
							class="komik flex flex-col gap-6 rounded-md bg-card p-6"
						>
							<p>
								In high school, I reached the provincial level of the National Science Olympiad (IT
								Division). A technical hurdle involving a missing IDE cost me a spot at Nationals,
								but it taught me the most valuable lesson in software: <strong
									>adaptability is everything.</strong
								>
							</p>
							<p>
								Since then, I've moved into languages like Go and TypeScript, working with React and
								Svelte to bridge the gap between technical complexity and user-friendly design.
							</p>
						</div>
					{/if}

					<button
						on:click={toggleBio}
						class="tekan w-fit rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
					>
						{isBioExpanded ? '[-] Read Less' : '[+] Read Full Story'}
					</button>
				</div>
			</div>

			<a
				href="{resolve('/')}#contact"
				class="tekan w-fit rounded-md bg-cta px-5 py-2 font-display text-2xl text-cta-ink [text-shadow:none] hover:bg-ink hover:text-surface"
			>
				Get in touch
			</a>
		</div>

		<div use:intersect>
			<ExperienceTabs experiences={data.experiences} class="grid gap-8" />
		</div>
	</div>
</section>
