<script lang="ts">
	import TechnologiesData from '$lib/assets/JSON/tehcnologies.json';
	import AchievementsData from '$lib/assets/JSON/achievements.json';
	import ProjectsData from '$lib/assets/JSON/projects.json';
	import ExperiencesData from '$lib/assets/JSON/experiences.json';
	import { intersect } from '$lib/actions/intersect';
	import { handleHistory } from '$lib/components/handleHistory';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';

	const textColors = [
		'text-pink-600',
		'text-rose-600',
		'text-fuchsia-600',
		'text-pink-500',
		'text-rose-500'
	];

	const technologies = TechnologiesData;
	const achievements = AchievementsData;
	const projects = ProjectsData;
	const experiences = ExperiencesData;

	let activeTab = 'work';
	const tabs = [
		{ label: 'Work', value: 'work' },
		{ label: 'Education', value: 'education' },
		{ label: 'Organization', value: 'organization' },
		{ label: 'Achievement', value: 'achievement' }
	];

	const workExperiences = experiences.filter((e) => e.category?.toLowerCase() === 'work');
	const educationExperiences = experiences.filter((e) => e.category?.toLowerCase() === 'education');
	const organizationExperiences = experiences.filter(
		(e) => e.category?.toLowerCase() === 'organization'
	);
	const achievementItems = achievements;

	let isShowMoreWork = false;
	$: showWorkExperiences = isShowMoreWork ? workExperiences : workExperiences.slice(0, 3);
	function toggleShowMoreWork() {
		isShowMoreWork = !isShowMoreWork;
	}

	let isShowMoreEdu = false;
	$: showEducationExperiences = isShowMoreEdu
		? educationExperiences
		: educationExperiences.slice(0, 3);
	function toggleShowMoreEdu() {
		isShowMoreEdu = !isShowMoreEdu;
	}

	let isShowMoreOrg = false;
	$: showOrganizationExperiences = isShowMoreOrg
		? organizationExperiences
		: organizationExperiences.slice(0, 3);
	function toggleShowMoreOrg() {
		isShowMoreOrg = !isShowMoreOrg;
	}

	let isShowMoreAch = false;
	$: showAchievements = isShowMoreAch ? achievementItems : achievementItems.slice(0, 3);
	function toggleShowMoreAch() {
		isShowMoreAch = !isShowMoreAch;
	}

	const sectionIds = ['arpthef', 'technologies', 'experiences', 'projects'];
	let currentSectionIndex = 0;
	let showScrollTop = false;
	let showScrollBottom = false;

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
	<link rel="icon" href="%sveltekit.assets%/Logo.webp" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta property="og:title" content="arpthef" />
	<meta property="og:description" content="Welcome to arpthef portfolio." />
	<meta property="og:image" content="%sveltekit.assets%/Logo.webp" />
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
		class="mb-32 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="flex flex-col gap-4">
			<h1 class="text-5xl font-black tracking-tighter text-gray-900 lg:text-8xl">
				Mohammad<br /><span class="text-pink-500">Ariffansyah</span>
			</h1>
			<p class="text-xs font-black tracking-[0.5em] text-gray-400 uppercase">
				Software Engineering • Surabaya, ID
			</p>
		</div>
		<div class="flex flex-col gap-8 lg:max-w-xl lg:justify-self-end">
			<p class="text-xl leading-relaxed font-medium text-gray-600 md:text-2xl">
				Specializing in <span class="text-gray-900 underline decoration-pink-200 decoration-4"
					>full-stack web development</span
				> and backend architecture. I build clean, efficient digital solutions.
			</p>
			<div class="flex items-center gap-10">
				<a
					href={resolve('/about')}
					class="text-xs font-black tracking-widest text-gray-900 uppercase underline decoration-pink-300 decoration-2 underline-offset-8 transition-all hover:text-pink-600 hover:decoration-pink-500"
					>Learn More</a
				>
				<div class="flex gap-6">
					<a
						href="https://github.com/Ariffansyah"
						target="_blank"
						class="text-gray-300 transition-colors hover:text-gray-900"
						aria-label="github"><i class="fa-brands fa-github fa-xl"></i></a
					>
					<a
						href="https://linkedin.com/in/arpthef/"
						target="_blank"
						class="text-gray-300 transition-colors hover:text-gray-900"
						aria-label="linkedin"><i class="fa-brands fa-linkedin fa-xl"></i></a
					>
				</div>
			</div>
		</div>
	</div>

	<div id="technologies" class="mb-32" use:intersect={{ threshold: 0.3, once: true }}>
		<h2 class="mb-12 text-[10px] font-black tracking-[0.5em] text-gray-400 uppercase">
			Stack / Tools
		</h2>
		<div class="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
			{#each technologies as tech (tech.name)}
				<div
					class="group flex flex-col items-center justify-center gap-4 border border-gray-50 p-8 opacity-40 grayscale transition-all hover:border-pink-50 hover:opacity-100 hover:grayscale-0"
				>
					<img src={tech.icon} alt="" class="h-8 w-8" />
					<span class="text-[10px] font-bold tracking-widest text-gray-800 uppercase"
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
			<h2 class="mb-10 text-[10px] font-black tracking-[0.5em] text-gray-400 uppercase">
				Background
			</h2>
			<div class="flex flex-col gap-4 border-l border-gray-100 pl-4">
				{#each tabs as tab (tab.label)}
					<button
						class="text-left text-xs font-black tracking-widest uppercase transition-all {activeTab ===
						tab.value
							? 'text-pink-500'
							: 'text-gray-300 hover:text-gray-600'}"
						on:click={() => (activeTab = tab.value)}
					>
						{tab.label}
					</button>
				{/each}
			</div>
		</div>

		<div class="lg:col-span-2">
			<div class="flex flex-col gap-12">
				{#if activeTab === 'work'}
					{#each showWorkExperiences as exp, i (i)}
						<div class="flex flex-col gap-2">
							<span
								class="text-[10px] font-bold uppercase {textColors[
									i % textColors.length
								]} tracking-widest">{exp.date}</span
							>
							<h3 class="text-2xl font-black text-gray-900">{exp.title}</h3>
							<p class="text-sm font-bold tracking-tight text-gray-400 uppercase">
								{exp.experienceName}
							</p>
							<p class="mt-2 max-w-2xl leading-relaxed text-gray-600">{exp.description}</p>
						</div>
					{/each}
					{#if workExperiences.length > 3}
						<button
							on:click={toggleShowMoreWork}
							class="w-fit text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase hover:text-pink-500"
						>
							{isShowMoreWork ? '[-] Show Less' : '[+] Show More'}
						</button>
					{/if}
				{:else if activeTab === 'education'}
					{#each showEducationExperiences as edu, i (i)}
						<div class="flex flex-col gap-2">
							<span class="text-[10px] font-bold tracking-widest text-gray-400 uppercase"
								>{edu.date}</span
							>
							<h3 class="text-2xl font-black text-gray-900">{edu.experienceName}</h3>
							<p class="mt-2 max-w-2xl leading-relaxed text-gray-600">{edu.description}</p>
						</div>
					{/each}
					{#if educationExperiences.length > 3}
						<button
							on:click={toggleShowMoreEdu}
							class="w-fit text-[10px] font-black tracking-widest text-gray-400 uppercase hover:text-pink-500"
						>
							{isShowMoreEdu ? '[-] Show Less' : '[+] Show More'}
						</button>
					{/if}
				{:else if activeTab === 'organization'}
					{#each showOrganizationExperiences as org, i (i)}
						<div class="flex flex-col gap-2">
							<span
								class="text-[10px] font-bold uppercase {textColors[
									i % textColors.length
								]} tracking-widest">{org.date}</span
							>
							<h3 class="text-2xl font-black text-gray-900">{org.title}</h3>
							<p class="text-sm font-bold tracking-tight text-gray-400 uppercase">
								{org.experienceName}
							</p>
							<p class="mt-2 max-w-2xl leading-relaxed text-gray-600">{org.description}</p>
						</div>
					{/each}
					{#if organizationExperiences.length > 3}
						<button
							on:click={toggleShowMoreOrg}
							class="w-fit text-[10px] font-black tracking-widest text-gray-400 uppercase hover:text-pink-500"
						>
							{isShowMoreOrg ? '[-] Show Less' : '[+] Show More'}
						</button>
					{/if}
				{:else if activeTab === 'achievement'}
					{#each showAchievements as ach, i (i)}
						<div class="flex flex-col gap-2">
							<span
								class="text-[10px] font-bold uppercase {textColors[
									i % textColors.length
								]} tracking-widest">{ach.date}</span
							>
							<h3 class="text-2xl font-black text-gray-900">{ach.title}</h3>
							<p class="text-sm font-bold tracking-widest text-pink-500 uppercase">
								{ach.achievementName}
							</p>
						</div>
					{/each}
					{#if achievementItems.length > 3}
						<button
							on:click={toggleShowMoreAch}
							class="w-fit text-[10px] font-black tracking-widest text-gray-400 uppercase hover:text-pink-500"
						>
							{isShowMoreAch ? '[-] Show Less' : '[+] Show More'}
						</button>
					{/if}
				{/if}
			</div>
		</div>
	</div>

	<div id="projects" class="mb-32" use:intersect={{ threshold: 0.3, once: true }}>
		<div class="mb-12 flex items-baseline justify-between border-b border-gray-100 pb-8">
			<h2 class="text-[10px] font-black tracking-[0.5em] text-gray-400 uppercase">
				Latest Projects
			</h2>
			<a
				href={resolve('/projects')}
				class="text-[10px] font-black tracking-widest text-pink-500 uppercase hover:underline"
				>View All</a
			>
		</div>
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
			{#each projects.slice(0, 3) as project (project.projectName)}
				<a
					href={resolve('/projects/[slug]', { slug: project.projectLink })}
					class="group flex flex-col gap-6"
				>
					<div
						class="aspect-video w-full overflow-hidden bg-gray-50 grayscale transition-all duration-700 group-hover:grayscale-0"
					>
						<img
							src={project.projectImages?.[0]}
							alt=""
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
					</div>
					<div class="flex flex-col gap-2">
						<h3
							class="text-2xl font-black tracking-tighter text-gray-900 uppercase transition-colors group-hover:text-pink-500"
						>
							{project.projectName}
						</h3>
						<p class="line-clamp-2 text-sm leading-relaxed text-gray-500">
							{project.projectDescription}
						</p>
					</div>
				</a>
			{/each}
		</div>
	</div>

	<div class="border-t border-gray-100 py-32 text-center">
		<a href={resolve('/contact')} class="group inline-flex items-center gap-6">
			<span
				class="text-5xl font-black tracking-tighter text-gray-900 transition-all group-hover:text-pink-500 lg:text-7xl"
				>Contact</span
			>
			<span
				class="text-4xl text-gray-200 transition-transform group-hover:translate-x-6 lg:text-7xl"
				>→</span
			>
		</a>
	</div>
</section>

{#if showScrollTop}
	<button
		class="fixed top-8 right-12 z-50 p-2 text-gray-200 transition-all hover:text-pink-500"
		aria-label="scrollToSection"
		on:click={() => scrollToSection(currentSectionIndex - 1)}
	>
		<i class="fa-solid fa-arrow-up fa-xl"></i>
	</button>
{/if}
{#if showScrollBottom}
	<button
		class="fixed right-12 bottom-8 z-50 p-2 text-gray-200 transition-all hover:text-pink-500"
		aria-label="scrollToSection"
		on:click={() => scrollToSection(currentSectionIndex + 1)}
	>
		<i class="fa-solid fa-arrow-down fa-xl"></i>
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
