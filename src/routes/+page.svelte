<script lang="ts">
	import { technologies } from '$lib/constant/apps';
	import { intersect } from '$lib/actions/intersect';
	import { handleHistory } from '$lib/components/handleHistory';
	import GroqChat from '$lib/components/GroqChat.svelte';
	import { onMount } from 'svelte';
	import { resolve, asset } from '$app/paths';

	let { data } = $props();

	const textColors = ['text-brand'];

	let activeTab = $state('work');
	const tabs = [
		{ label: 'Work', value: 'work' },
		{ label: 'Education', value: 'education' },
		{ label: 'Organization', value: 'organization' },
		{ label: 'Achievement', value: 'achievement' }
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

	const sectionIds = ['arpthef', 'technologies', 'experiences', 'projects'];
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
			<p class="text-xl leading-relaxed font-medium text-ink-muted md:text-2xl">
				Specializing in <span class="bg-pop px-1 text-on-pop box-decoration-clone">full-stack web development</span>
				and backend architecture. Just a dev who likes shipping features, messing around with new frameworks,
				and making sure
				<span class="bg-pop px-1 text-on-pop box-decoration-clone">production stays up</span>.
			</p>
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
		<div class="tech-grid grid grid-cols-2 gap-6 md:grid-cols-4 xl:grid-cols-6" role="presentation">
			{#each technologies as tech, i (tech.name)}
				<div
					class="komik flex flex-col items-center justify-center gap-4 rounded-md bg-card px-2 py-7 text-center odd:-rotate-1 even:rotate-1"
					role="presentation"
				>
					<img src={tech.icon} alt="" class="h-8 w-8" />
					<span class="text-[11px] font-bold tracking-widest text-ink uppercase"
						>{tech.name}</span
					>
				</div>
			{/each}
		</div>
	</div>

	<div
		id="experiences"
		class="mb-32 grid grid-cols-1 gap-16 lg:grid-cols-3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="lg:col-span-1">
			<h2 class="narasi mb-10">Background</h2>
			<div class="flex flex-wrap gap-3 lg:flex-col lg:items-start">
				{#each tabs as tab (tab.label)}
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
		</div>

		<div class="lg:col-span-2">
			<div class="flex flex-col gap-8">
				{#if activeTab === 'work'}
					{#each showWorkExperiences as exp, i (i)}
						<div class="komik flex flex-col gap-2 rounded-md bg-card p-6">
							<span
								class="text-[10px] font-bold uppercase {textColors[
									i % textColors.length
								]} tracking-widest">{exp.date}</span
							>
							<h3 class="font-display text-3xl text-ink">{exp.title}</h3>
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
							<h3 class="font-display text-3xl text-ink">{edu.name}</h3>
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
							<h3 class="font-display text-3xl text-ink">{org.title}</h3>
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
							<h3 class="font-display text-3xl text-ink">{ach.title}</h3>
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
	</div>

	<div id="projects" class="mb-32" use:intersect={{ threshold: 0.3, once: true }}>
		<div class="mb-10 flex items-center justify-between gap-4">
			<h2 class="narasi">Latest Projects</h2>
			<a
				href={resolve('/projects')}
				class="tekan rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
				>View All</a
			>
		</div>
		<div class="grid grid-cols-1 gap-10 lg:grid-cols-3" role="presentation">
			{#each data.projects as project (project.id)}
				<a
					href={resolve('/projects/[slug]', { slug: project.slug })}
					class="project-card group flex flex-col gap-5"
				>
					<div
						class="komik aspect-video w-full overflow-hidden rounded-md bg-card transition-transform duration-150 group-hover:-translate-y-1 group-hover:-rotate-1"
					>
						<img
							src={project.images[0]}
							alt=""
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
					</div>
					<div class="flex flex-col gap-2">
						<h3 class="font-display text-3xl text-ink transition-colors group-hover:text-brand">
							{project.name}
						</h3>
						<p class="line-clamp-2 text-sm leading-relaxed text-ink-muted">
							{project.description}
						</p>
					</div>
				</a>
			{/each}
		</div>
	</div>

	<GroqChat />

	<div class="py-32 text-center">
		<a href={resolve('/contact')} class="group inline-flex items-center gap-6">
			<span
				class="judul-komik font-display text-6xl transition-transform group-hover:-rotate-2 lg:text-8xl"
				>Contact</span
			>
			<span
				class="font-display text-5xl text-ink transition-transform group-hover:translate-x-6 lg:text-8xl"
				>→</span
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
		class="tekan fixed right-6 bottom-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-card text-ink hover:bg-pop hover:text-on-pop lg:right-12"
		aria-label="scrollToSection"
		onclick={() => scrollToSection(currentSectionIndex + 1)}
	>
		<i class="fa-solid fa-arrow-down"></i>
	</button>
{/if}

<style>
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
