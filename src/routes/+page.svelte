<script lang="ts">
	import TechnologiesData from '$lib/assets/JSON/tehcnologies.json';
	import AchievementsData from '$lib/assets/JSON/achievements.json';
	import ProjectsData from '$lib/assets/JSON/projects.json';
	import ExperiencesData from '$lib/assets/JSON/experiences.json';
	import { intersect } from '$lib/actions/intersect';
	import { handleHistory } from '$lib/components/handleHistory';
	import { onMount } from 'svelte';
	import { asset, resolve } from '$app/paths';

	const textColors = [
		'text-pink-600',
		'text-rose-600',
		'text-fuchsia-600',
		'text-pink-700',
		'text-rose-700'
	];
	const bgColors = ['bg-pink-500', 'bg-rose-500', 'bg-fuchsia-500', 'bg-pink-600', 'bg-rose-600'];

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
	let showWorkExperiences = workExperiences.slice(0, 3);
	function toggleShowMoreWork() {
		isShowMoreWork = !isShowMoreWork;
		showWorkExperiences = isShowMoreWork ? workExperiences : workExperiences.slice(0, 3);
	}

	let isShowMoreEdu = false;
	let showEducationExperiences = educationExperiences.slice(0, 3);
	function toggleShowMoreEdu() {
		isShowMoreEdu = !isShowMoreEdu;
		showEducationExperiences = isShowMoreEdu
			? educationExperiences
			: educationExperiences.slice(0, 3);
	}

	let isShowMoreOrg = false;
	let showOrganizationExperiences = organizationExperiences.slice(0, 3);
	function toggleShowMoreOrg() {
		isShowMoreOrg = !isShowMoreOrg;
		showOrganizationExperiences = isShowMoreOrg
			? organizationExperiences
			: organizationExperiences.slice(0, 3);
	}

	let isShowMoreAch = false;
	let showAchievements = achievementItems.slice(0, 3);
	function toggleShowMoreAch() {
		isShowMoreAch = !isShowMoreAch;
		showAchievements = isShowMoreAch ? achievementItems : achievementItems.slice(0, 3);
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

<section class="relative z-10 mx-3 flex flex-col justify-center md:mx-auto">
	<div
		id="arpthef"
		class="animate-fade-in my-10 flex w-full flex-col items-start justify-center gap-4 rounded-sm border border-pink-200 bg-white/60 p-8 shadow-[0_20px_60px_rgba(255,182,193,0.5)] transition duration-300 hover:scale-[1.01] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="flex w-full flex-row items-start justify-between">
			<div class="flex flex-col">
				<h1 class="text-3xl font-bold tracking-tight text-gray-900">Mohammad "arp" Ariffansyah</h1>
				<p class="mt-1 text-sm font-bold tracking-widest text-pink-600 uppercase">
					Surabaya, Indonesia
				</p>
			</div>
			<div class="flex items-center gap-4">
				<a
					href="https://github.com/Ariffansyah"
					target="_blank"
					class="text-gray-700 transition-colors hover:text-pink-600"
					aria-label="GitHub Profile"
				>
					<i class="fa-brands fa-github fa-xl"></i>
				</a>
				<a
					href="https://www.linkedin.com/in/arpthef/"
					target="_blank"
					class="text-gray-700 transition-colors hover:text-pink-600"
					aria-label="LinkedIn Profile"
				>
					<i class="fa-brands fa-linkedin fa-xl"></i>
				</a>
			</div>
		</div>
		<div class="mt-4 flex flex-col items-start gap-3">
			<p class="text-justify leading-relaxed font-medium text-gray-800">
				I am a informatics engineering student at one of universities in Indonesia. I like
				full-stack web development, focus on back-end development, and i like to explore new
				technologies.
			</p>
			<div class="mt-4 flex w-full flex-row items-center justify-between">
				<a
					href={resolve('/about')}
					class="text-sm font-black tracking-tighter text-pink-700 underline decoration-pink-300 decoration-2 underline-offset-4 transition-colors hover:text-pink-500"
					>LEARN MORE</a
				>
				<a
					href={asset('/assets/cv/cv-en.pdf')}
					download="arpthef-cv-en.pdf"
					class="rounded-sm bg-pink-500 px-6 py-2.5 text-xs font-black tracking-tighter text-white uppercase shadow-[0_10px_20px_rgba(236,72,153,0.4)] transition-all hover:bg-pink-600"
					>Download CV</a
				>
			</div>
		</div>
	</div>

	<div
		id="technologies"
		class="animate-fade-in mx-auto my-6 flex w-full flex-col items-start justify-center gap-4 p-4 md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<h1
			class="mb-2 border-l-8 border-pink-500 pl-4 text-2xl font-black tracking-tighter text-gray-900 uppercase"
		>
			Technologies
		</h1>
		<div class="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
			{#each technologies as tech (tech.name)}
				<div
					class="flex flex-col items-start gap-2 rounded-sm border-r-4 border-b-4 border-pink-200 bg-white/80 p-4 shadow-xl transition duration-200 hover:translate-x-1 hover:translate-y-1 hover:bg-white hover:shadow-none"
				>
					<div class="flex flex-row items-center gap-2">
						<img src={tech.icon} alt={tech.alt} class="h-6 w-6" />
						<span class="text-sm font-black text-gray-900">{tech.name}</span>
					</div>
					<p class="text-xs font-medium text-gray-600">{tech.description}</p>
				</div>
			{/each}
		</div>
	</div>

	<div
		id="experiences"
		class="animate-fade-in my-10 flex w-full flex-col items-start justify-center gap-4 rounded-sm border border-r-4 border-b-4 border-pink-50 border-pink-200 bg-white/70 p-8 shadow-[0_20px_50px_rgba(255,182,193,0.2)] transition duration-300 md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="no-scrollbar mb-6 flex w-full gap-1 overflow-x-auto py-1">
			{#each tabs as tab (tab.value)}
				<button
					class=" rounded-md px-6 py-2 text-xs font-black tracking-widest uppercase transition-all duration-300 {activeTab ===
					tab.value
						? 'bg-pink-500 text-white shadow-[0_10px_25px_rgba(236,72,153,0.4)]'
						: 'border border-pink-100 bg-white text-pink-300 hover:bg-pink-50'}"
					on:click={() => (activeTab = tab.value)}
				>
					{tab.label}
				</button>
			{/each}
		</div>

		<div class="relative ml-4 w-full border-l-4 border-pink-100 pr-4">
			{#if activeTab === 'work'}
				{#each showWorkExperiences as exp, i (exp.experienceName + exp.date)}
					<div class="relative pb-10 pl-8">
						<div
							class="absolute top-1.5 -left-[14px] h-6 w-6 rounded-full border-4 border-white {bgColors[
								i % bgColors.length
							]} shadow-md"
						></div>
						<p
							class="text-xs font-black tracking-tighter uppercase {textColors[
								i % textColors.length
							]}"
						>
							{exp.experienceName}
						</p>
						<h3 class="text-xl leading-tight font-black text-gray-900">{exp.title}</h3>
						<p class="mb-3 text-xs font-bold text-gray-400">{exp.date}</p>
						<p class="text-justify text-sm font-medium text-gray-700">{exp.description}</p>
					</div>
				{/each}
				{#if workExperiences.length > 3}
					<button
						class="mt-2 ml-8 text-xs font-black tracking-widest text-pink-600 uppercase hover:text-pink-400 hover:underline"
						on:click={toggleShowMoreWork}
					>
						{isShowMoreWork ? 'Show Less' : 'Show More'}
					</button>
				{/if}
			{:else if activeTab === 'education'}
				{#each showEducationExperiences as edu, i (edu.experienceName + edu.date)}
					<div class="relative pb-10 pl-8">
						<div
							class="absolute top-1.5 -left-[14px] h-6 w-6 rounded-full border-4 border-white {bgColors[
								i % bgColors.length
							]} shadow-md"
						></div>
						<p class="text-xl leading-tight font-black text-gray-900">{edu.experienceName}</p>
						<p class="mb-3 text-xs font-bold text-gray-400">{edu.date}</p>
						<p class="text-justify text-sm font-medium text-gray-700">{edu.description}</p>
					</div>
				{/each}
				{#if educationExperiences.length > 3}
					<button
						class="mt-2 ml-8 text-xs font-black tracking-widest text-pink-600 uppercase hover:text-pink-400 hover:underline"
						on:click={toggleShowMoreEdu}
					>
						{isShowMoreEdu ? 'Show Less' : 'Show More'}
					</button>
				{/if}
			{:else if activeTab === 'organization'}
				{#each showOrganizationExperiences as org, i (org.experienceName + org.date)}
					<div class="relative pb-10 pl-8">
						<div
							class="absolute top-1.5 -left-[14px] h-6 w-6 rounded-full border-4 border-white {bgColors[
								i % bgColors.length
							]} shadow-md"
						></div>
						<p
							class="text-xs font-black tracking-tighter uppercase {textColors[
								i % textColors.length
							]}"
						>
							{org.experienceName}
						</p>
						<h3 class="text-xl leading-tight font-black text-gray-900">{org.title}</h3>
						<p class="mb-3 text-xs font-bold text-gray-400">{org.date}</p>
						<p class="text-justify text-sm font-medium text-gray-700">{org.description}</p>
					</div>
				{/each}
				{#if organizationExperiences.length > 3}
					<button
						class="mt-2 ml-8 text-xs font-black tracking-widest text-pink-600 uppercase hover:text-pink-400 hover:underline"
						on:click={toggleShowMoreOrg}
					>
						{isShowMoreOrg ? 'Show Less' : 'Show More'}
					</button>
				{/if}
			{:else if activeTab === 'achievement'}
				{#each showAchievements as ach, i (ach.achievementName + ach.date)}
					<div class="relative pb-10 pl-8">
						<div
							class="absolute top-1.5 -left-[14px] h-6 w-6 rounded-full border-4 border-white {bgColors[
								i % bgColors.length
							]} shadow-md"
						></div>
						<p
							class="text-xs font-black tracking-tighter uppercase {textColors[
								i % textColors.length
							]}"
						>
							{ach.achievementName}
						</p>
						<h3 class="text-xl leading-tight font-black text-gray-900">{ach.title}</h3>
						<p class="mb-3 text-xs font-bold text-gray-400">{ach.date}</p>
						<p class="text-justify text-sm font-medium text-gray-700">{ach.description}</p>
					</div>
				{/each}
				{#if achievementItems.length > 3}
					<button
						class="mt-2 ml-8 text-xs font-black tracking-widest text-pink-600 uppercase hover:text-pink-400 hover:underline"
						on:click={toggleShowMoreAch}
					>
						{isShowMoreAch ? 'Show Less' : 'Show More'}
					</button>
				{/if}
			{/if}
		</div>
	</div>

	<div
		id="projects"
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-8 p-6 md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="flex w-full flex-row items-center justify-between">
			<h1 class="border-l-8 border-pink-500 pl-4 text-3xl font-black text-gray-900 uppercase">
				Projects
			</h1>
			<a
				href={resolve('/projects')}
				class="text-sm font-black tracking-tighter text-pink-600 uppercase hover:text-pink-400 hover:underline"
				>View All</a
			>
		</div>
		<div class="grid w-full grid-cols-1 gap-10">
			{#each projects.slice(0, 3) as project (project.projectName)}
				<div
					class="group relative overflow-hidden rounded-sm border border-pink-50 bg-white shadow-[0_30px_60px_rgba(255,182,193,0.3)] transition-all duration-500"
				>
					<img
						src={project.projectImages?.[0] || ''}
						alt={project.projectName}
						class="h-72 w-full object-cover opacity-80 grayscale transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0"
					/>
					<div
						class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-pink-900/90 via-pink-800/40 to-transparent p-8"
					>
						<div class="mb-4 flex flex-wrap gap-2">
							{#each project.technologies as tech (tech.name)}
								<img
									src={tech.icon}
									alt={tech.name}
									class="h-6 w-6 brightness-0 invert"
									title={tech.name}
								/>
							{/each}
						</div>
						<h2 class="mb-1 text-2xl font-black tracking-tighter text-white uppercase">
							{project.projectName}
						</h2>
						<p class="mb-6 line-clamp-2 text-sm font-medium text-pink-50">
							{project.projectDescription}
						</p>
						<a
							href={resolve('/projects/[slug]', { slug: project.projectLink })}
							class="inline-block w-max bg-white px-8 py-3 text-xs font-black tracking-widest text-pink-600 uppercase shadow-xl transition-all hover:bg-pink-50"
							>Details</a
						>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="mt-16 mb-24 flex flex-col items-center gap-6">
		<a
			href={resolve('/contact')}
			class="rounded-sm bg-pink-500 px-12 py-4 text-sm font-black tracking-[0.2em] text-white uppercase shadow-[0_15px_30px_rgba(236,72,153,0.4)] transition-all hover:bg-pink-600"
		>
			Contact me
		</a>
	</div>
</section>

{#if showScrollTop}
	<button
		class="fixed top-8 left-1/2 z-50 -translate-x-1/2 p-2 text-pink-400 drop-shadow-md transition-all hover:text-pink-600"
		on:click={() => scrollToSection(currentSectionIndex - 1)}
		aria-label="Scroll to previous section"
	>
		<i class="fa-solid fa-chevron-up fa-2xl"></i>
	</button>
{/if}

{#if showScrollBottom}
	<button
		class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 p-2 text-pink-400 drop-shadow-md transition-all hover:text-pink-600"
		on:click={() => scrollToSection(currentSectionIndex + 1)}
		aria-label="Scroll to next section"
	>
		<i class="fa-solid fa-chevron-down fa-2xl"></i>
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
</style>
