<script lang="ts">
	import { technologies } from '$lib/constant/apps';
	import { intersect } from '$lib/actions/intersect';
	import { handleHistory } from '$lib/components/handleHistory';
	import { onMount } from 'svelte';
	import { resolve, asset } from '$app/paths';

	let { data } = $props();

	const textColors = ['text-brand'];

	let activeTab = $state('work');
	const tabs = [
		{ label: 'Work', value: 'work' },
		{ label: 'Achievement', value: 'achievement' },
		{ label: 'Education', value: 'education' },
		{ label: 'Organization', value: 'organization' }
	];

	const byCategory = (c: string) => data.experiences.filter((e) => e.category === c);
	let workExperiences = $derived(byCategory('work'));
	let educationExperiences = $derived(byCategory('education'));
	let organizationExperiences = $derived(byCategory('organization'));
	let achievementItems = $derived(byCategory('achievement'));

	let isShowMoreWork = $state(false);
	let showWorkExperiences = $derived(isShowMoreWork ? workExperiences : workExperiences.slice(0, 3));
	function toggleShowMoreWork() {
		isShowMoreWork = !isShowMoreWork;
	}

	let isShowMoreEdu = $state(false);
	let showEducationExperiences = $derived(isShowMoreEdu
		? educationExperiences
		: educationExperiences.slice(0, 3));
	function toggleShowMoreEdu() {
		isShowMoreEdu = !isShowMoreEdu;
	}

	let isShowMoreOrg = $state(false);
	let showOrganizationExperiences = $derived(isShowMoreOrg
		? organizationExperiences
		: organizationExperiences.slice(0, 3));
	function toggleShowMoreOrg() {
		isShowMoreOrg = !isShowMoreOrg;
	}

	let isShowMoreAch = $state(false);
	let showAchievements = $derived(isShowMoreAch ? achievementItems : achievementItems.slice(0, 3));
	function toggleShowMoreAch() {
		isShowMoreAch = !isShowMoreAch;
	}

	// Jagged POW burst for the contact link: alternating outer and inner points.
	const burst = Array.from({ length: 26 }, (_, i) => {
		const a = (i / 26) * Math.PI * 2;
		const r = i % 2 ? 0.64 : 1 - (i % 3) * 0.07;
		return `${(Math.cos(a) * r * 96).toFixed(1)},${(Math.sin(a) * r * 62).toFixed(1)}`;
	}).join(' ');

	const sectionIds = ['arpthef', 'technologies', 'experiences'];
	let currentSectionIndex = 0;
	let showScrollTop = $state(false);
	let showScrollBottom = $state(false);

	function updateSectionIndexAndVisibility() {
		let closestSection = 0;
		let minDistance = Infinity;
		sectionIds.forEach((id, i) => {
			const el = document.getElementById(id);
			if (el) {
				const rect = el.getBoundingClientRect();
				const distance = Math.abs(rect.top);
				if (distance < minDistance) {
					minDistance = distance;
					closestSection = i;
				}
			}
		});
		currentSectionIndex = closestSection;
		showScrollTop = currentSectionIndex > 0;
		showScrollBottom = currentSectionIndex < sectionIds.length - 1;
	}

	function scrollToSection(index: number) {
		const section = document.getElementById(sectionIds[index]);
		if (section) {
			handleHistory(new Event('scroll'), `#${sectionIds[index]}`);
			section.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', updateSectionIndexAndVisibility);
	}

	onMount(() => {
		updateSectionIndexAndVisibility();
	});
</script>

<svelte:head>
	<title>arp - Home</title>
	<link rel="icon" href={asset('/Logo.webp')} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta property="og:title" content="arpthef" />
	<meta property="og:description" content="Welcome to arpthef portfolio." />
	<meta property="og:image" content="https://arpthef.my.id/Logo.webp" />
	<meta property="og:url" content="https://arpthef.my.id/" />
	<meta property="og:type" content="website" />
	<meta name="description" content="Arpthef personal website." />
	<meta
		name="keywords"
		content="arpthef, portfolio, personal website, web developer, programmer, Ariffansyah, Mohammad Ariffansyah"
	/>
	<meta name="author" content="Mohammad Ariffansyah" />
	<link rel="canonical" href="https://arpthef.my.id/" />
</svelte:head>

<section class="relative z-10 w-full px-6 py-12 lg:px-20 lg:py-24">
	<div
		id="arpthef"
		class="mb-32 grid grid-cols-1 gap-12 xl:grid-cols-2 xl:items-center"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<!-- @container: the name scales to its column so it never runs into the paragraph -->
		<div class="@container flex flex-col gap-4">
			<h1
				class="font-display plates text-[length:clamp(3rem,17cqw,7.5rem)] leading-[0.95] text-ink"
			>
				Mohammad<br /><span class="judul-komik">Ariffansyah</span>
			</h1>
			<p class="narasi">Software Engineering • Surabaya, ID</p>
		</div>
		<div class="flex flex-col gap-8 xl:max-w-xl xl:justify-self-end">
			<div class="flex flex-col gap-4 text-lg leading-relaxed font-medium md:text-xl">
				<p class="kotak-narasi w-fit max-w-md -rotate-1">
					Specializing in <span class="bg-pop px-1 text-on-pop box-decoration-clone">full-stack web development</span>
					and backend architecture.
				</p>
				<p class="kotak-narasi ml-6 w-fit max-w-lg rotate-1 md:ml-12">
					Just a dev who likes shipping features, messing around with new frameworks, and making sure
					<span class="bg-pop px-1 text-on-pop box-decoration-clone">production stays up</span>.
				</p>
			</div>
			<div class="flex items-center gap-10">
				<a
					href={resolve('/about')}
					class="tekan rounded-md bg-cta px-5 py-2 font-display text-2xl text-cta-ink [text-shadow:none] hover:bg-ink hover:text-surface"
					>Learn More</a
				>
				<div class="flex gap-4">
					<a
						href="https://github.com/Ariffansyah"
						target="_blank"
						class="tekan flex h-11 w-11 items-center justify-center rounded-md bg-card text-ink hover:bg-pop hover:text-on-pop"
						aria-label="github"><i class="fa-brands fa-github fa-lg"></i></a
					>
					<a
						href="https://linkedin.com/in/arpthef/"
						target="_blank"
						class="tekan flex h-11 w-11 items-center justify-center rounded-md bg-card text-ink hover:bg-pop hover:text-on-pop"
						aria-label="linkedin"><i class="fa-brands fa-linkedin fa-lg"></i></a
					>
				</div>
			</div>
		</div>
	</div>

	<div id="technologies" class="mb-32" use:intersect={{ threshold: 0.3, once: true }}>
		<h2 class="narasi mb-10">Stack / Tools</h2>
		<ul class="flex flex-wrap gap-3">
			{#each technologies as tech (tech.name)}
				<li
					class="flex items-center gap-2 rounded-md border-2 border-edge-ink bg-card px-3 py-1.5 shadow-[2px_2px_0_var(--shadow)] odd:-rotate-1 even:rotate-1"
				>
					<img src={tech.icon} alt="" class="h-4 w-4" />
					<span class="text-[11px] font-bold tracking-widest text-ink uppercase">{tech.name}</span>
				</li>
			{/each}
		</ul>
	</div>

	<div
		id="experiences"
		class="mb-20 grid grid-cols-1 gap-x-10 gap-y-20 xl:grid-cols-2"
	>
		<div class="@container" use:intersect={{ threshold: 0.2, once: true }}>
			<h2 class="narasi mb-8">Background</h2>
			<div class="mb-8 grid grid-cols-2 gap-3 @2xl:grid-cols-4">
				{#each tabs as tab (tab.value)}
					<button
						class="tekan rounded-md px-4 py-1.5 font-display text-xl {activeTab === tab.value
							? 'bg-pop text-on-pop'
							: 'bg-card text-ink hover:bg-pop hover:text-on-pop'}"
						aria-pressed={activeTab === tab.value}
						onclick={() => (activeTab = tab.value)}
					>
						{tab.label}
					</button>
				{/each}
			</div>

			<div class="flex flex-col gap-6">
				{#if activeTab === 'work'}
					{#each showWorkExperiences as exp, i (i)}
						<div class="komik flex flex-col gap-2 rounded-md bg-card p-6">
							<span
								class="text-[10px] font-bold uppercase {textColors[
									i % textColors.length
								]} tracking-widest">{exp.date}</span
							>
							<h3 class="font-display text-2xl text-ink">{exp.title}</h3>
							<p class="text-sm font-bold tracking-tight text-ink-faint uppercase">
								{exp.name}
							</p>
							<p class="mt-1 max-w-2xl leading-relaxed text-ink-muted">{exp.description}</p>
						</div>
					{/each}
					{#if workExperiences.length > 3}
						<button
							onclick={toggleShowMoreWork}
							class="tekan w-fit rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
						>
							{isShowMoreWork ? '[-] Show Less' : '[+] Show More'}
						</button>
					{/if}
				{:else if activeTab === 'education'}
					{#each showEducationExperiences as edu, i (i)}
						<div class="komik flex flex-col gap-2 rounded-md bg-card p-6">
							<span class="text-[10px] font-bold tracking-widest text-ink-faint uppercase"
								>{edu.date}</span
							>
							<h3 class="font-display text-2xl text-ink">{edu.name}</h3>
							<p class="mt-1 max-w-2xl leading-relaxed text-ink-muted">{edu.description}</p>
						</div>
					{/each}
					{#if educationExperiences.length > 3}
						<button
							onclick={toggleShowMoreEdu}
							class="tekan w-fit rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
						>
							{isShowMoreEdu ? '[-] Show Less' : '[+] Show More'}
						</button>
					{/if}
				{:else if activeTab === 'organization'}
					{#each showOrganizationExperiences as org, i (i)}
						<div class="komik flex flex-col gap-2 rounded-md bg-card p-6">
							<span
								class="text-[10px] font-bold uppercase {textColors[
									i % textColors.length
								]} tracking-widest">{org.date}</span
							>
							<h3 class="font-display text-2xl text-ink">{org.title}</h3>
							<p class="text-sm font-bold tracking-tight text-ink-faint uppercase">
								{org.name}
							</p>
							<p class="mt-1 max-w-2xl leading-relaxed text-ink-muted">{org.description}</p>
						</div>
					{/each}
					{#if organizationExperiences.length > 3}
						<button
							onclick={toggleShowMoreOrg}
							class="tekan w-fit rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
						>
							{isShowMoreOrg ? '[-] Show Less' : '[+] Show More'}
						</button>
					{/if}
				{:else if activeTab === 'achievement'}
					{#each showAchievements as ach, i (i)}
						<div class="komik flex flex-col gap-2 rounded-md bg-card p-6">
							<span
								class="text-[10px] font-bold uppercase {textColors[
									i % textColors.length
								]} tracking-widest">{ach.date}</span
							>
							<h3 class="judul-komik font-display text-3xl">{ach.title}</h3>
							<p class="text-sm font-bold tracking-widest text-brand uppercase">
								{ach.name}
							</p>
							<p class="mt-1 max-w-2xl leading-relaxed text-ink-muted">{ach.description}</p>
						</div>
					{/each}
					{#if achievementItems.length > 3}
						<button
							onclick={toggleShowMoreAch}
							class="tekan w-fit rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
						>
							{isShowMoreAch ? '[-] Show Less' : '[+] Show More'}
						</button>
					{/if}
				{/if}
			</div>
		</div>

		<div
			id="projects"
			class="splash komik flex flex-col rounded-md p-6 md:p-8"
			use:intersect={{ threshold: 0.2, once: true }}
		>
			<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
				<h2 class="splash-title font-display text-5xl leading-none 2xl:text-6xl">Latest Projects</h2>
				<a
					href={resolve('/projects')}
					class="tekan rounded-md bg-card px-4 py-2 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
					>View All</a
				>
			</div>
			<div class="flex flex-1 flex-col gap-6" role="presentation">
				{#each data.projects as project (project.id)}
					<a
						href={resolve('/projects/[slug]', { slug: project.slug })}
						class="project-card komik group flex flex-col overflow-hidden rounded-md bg-card transition-transform duration-150 hover:-translate-y-1 hover:-rotate-1 sm:flex-row xl:max-h-80 xl:flex-1"
					>
						<div
							class="relative aspect-video shrink-0 overflow-hidden border-b-3 border-edge-ink sm:aspect-auto sm:w-2/5 sm:border-r-3 sm:border-b-0"
						>
							<img
								src={project.images[0]}
								alt=""
								class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
							/>
						</div>
						<div class="flex flex-1 flex-col gap-1.5 p-4">
							<h3 class="font-display text-2xl text-ink transition-colors group-hover:text-brand">
								{project.name}
							</h3>
							<p class="line-clamp-2 text-sm leading-relaxed text-ink-muted xl:line-clamp-4">
								{project.description}
							</p>
							{#if project.technologies?.length}
								<div class="mt-auto flex flex-wrap gap-2 pt-2">
									{#each project.technologies as tech (tech.name)}
										<img src={tech.icon} alt={tech.name} title={tech.name} class="h-4 w-4" />
									{/each}
								</div>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		</div>
	</div>

	<div class="text-center">
		<a
			href={resolve('/contact')}
			class="group inline-grid w-full max-w-sm place-items-center group-hover:[--ca-box:4px] lg:max-w-md"
		>
			<svg
				class="col-start-1 row-start-1 w-full overflow-visible transition-transform group-hover:-rotate-3 group-hover:scale-105"
				viewBox="-100 -66 200 132"
				aria-hidden="true"
			>
				<polygon class="plate-a" points={burst} fill="var(--plate-a)" />
				<polygon class="plate-b" points={burst} fill="var(--plate-b)" />
				<polygon
					points={burst}
					fill="var(--cta)"
					stroke="var(--edge-ink)"
					stroke-width="3"
					stroke-linejoin="round"
					vector-effect="non-scaling-stroke"
				/>
			</svg>
			<span class="burst-text font-display col-start-1 row-start-1 text-6xl lg:text-7xl"
				>Contact!</span
			>
		</a>
	</div>
</section>

{#if showScrollTop}
	<button
		class="tekan fixed top-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-card text-ink hover:bg-pop hover:text-on-pop lg:right-12"
		aria-label="scrollToSection"
		onclick={() => scrollToSection(currentSectionIndex - 1)}
	>
		<i class="fa-solid fa-arrow-up"></i>
	</button>
{/if}
{#if showScrollBottom}
	<button
		class="tekan fixed right-6 bottom-24 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-card text-ink hover:bg-pop hover:text-on-pop lg:right-12"
		aria-label="scrollToSection"
		onclick={() => scrollToSection(currentSectionIndex + 1)}
	>
		<i class="fa-solid fa-arrow-down"></i>
	</button>
{/if}

<style>
	/* Spider-Man red: web lines spun from the top-right corner over Ben-Day dots. */
	.splash {
		--shadow: #0c1844;
		position: relative;
		isolation: isolate;
		background:
			radial-gradient(circle, rgb(12 24 68 / 0.2) 1.2px, transparent 1.6px) 0 0 / 8px 8px,
			#c80036;
	}
	.splash::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background:
			repeating-conic-gradient(
				from 180deg at 100% 0%,
				rgb(12 24 68 / 0.45) 0deg 0.3deg,
				transparent 0.3deg 11deg
			),
			repeating-radial-gradient(
				circle at 100% 0%,
				transparent 0 62px,
				rgb(12 24 68 / 0.45) 62px 64px
			);
		mask-image: radial-gradient(circle at 100% 0%, black, transparent 70%);
	}
	.splash-title {
		color: #fff5e1;
		-webkit-text-stroke: 0.04em #0c1844;
		paint-order: stroke fill;
		text-shadow:
			calc(var(--ca) * -1em) 0 var(--plate-a),
			calc(var(--ca) * 1em) 0 var(--plate-b),
			0.06em 0.06em 0 #0c1844;
	}

	.plate-a,
	.plate-b {
		transition: translate 83ms steps(1);
	}
	.plate-a {
		translate: calc(-2px - var(--ca-box)) 0;
	}
	.plate-b {
		translate: calc(2px + var(--ca-box)) 0;
	}
	.burst-text {
		rotate: -6deg;
		color: var(--cta-ink);
		-webkit-text-stroke: 0.05em #0c1844;
		paint-order: stroke fill;
		text-shadow: 0.06em 0.06em 0 #0c1844;
	}

	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	:global(html) {
		scroll-behavior: smooth;
	}
</style>
