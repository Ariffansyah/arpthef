<script lang="ts">
	import AchievementsData from '$lib/assets/JSON/achievements.json';
	import ExperiencesData from '$lib/assets/JSON/experiences.json';
	import { intersect } from '$lib/actions/intersect';
	import { cubicOut } from 'svelte/easing';
	import { resolve } from '$app/paths';

	function bioAnimation(_node: HTMLElement, { duration }: { duration: number }) {
		return {
			duration,
			css: (t: number) => {
				const eased = cubicOut(t);
				return `
                opacity: ${eased};
                transform: translateX(${20 * (1 - eased)}px);
                filter: blur(${8 * (1 - eased)}px);
            `;
			}
		};
	}

	const textColors = [
		'text-pink-600',
		'text-rose-600',
		'text-fuchsia-600',
		'text-pink-700',
		'text-rose-700'
	];
	const bgColors = ['bg-pink-500', 'bg-rose-500', 'bg-fuchsia-500', 'bg-pink-600', 'bg-rose-600'];

	const tabs = [
		{ label: 'Work', value: 'work' },
		{ label: 'Education', value: 'education' },
		{ label: 'Organization', value: 'organization' },
		{ label: 'Achievement', value: 'achievement' }
	];

	let activeTab = 'work';

	const workExperiences = ExperiencesData.filter((e) => e.category?.toLowerCase() === 'work');
	const educationExperiences = ExperiencesData.filter(
		(e) => e.category?.toLowerCase() === 'education'
	);
	const organizationExperiences = ExperiencesData.filter(
		(e) => e.category?.toLowerCase() === 'organization'
	);
	const achievementItems = AchievementsData;

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

<section class="relative z-10 mx-3 flex flex-col justify-center md:mx-auto">
	<div
		class="animate-fade-in my-10 flex w-full flex-col items-start justify-center gap-4 rounded-sm border border-pink-200 bg-white/60 p-8 shadow-[0_20px_60px_rgba(255,182,193,0.5)] transition duration-300 hover:scale-[1.01] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="flex w-full flex-col items-start">
			<h1
				class="border-b-4 border-pink-500 pb-1 text-3xl font-black tracking-tighter text-gray-900 uppercase"
			>
				About me
			</h1>
		</div>
		<p class="text-justify leading-relaxed font-medium text-gray-800">
			I am an undergraduate student passionate about software development. I primarily focus on
			backend development, building and maintaining the systems that operate behind the scenes,
			while also contributing to frontend development to enhance user experience.
		</p>
		<a href={resolve('/contact')}>
			<button
				type="button"
				class="mt-4 rounded-sm bg-pink-500 px-8 py-3 text-sm font-black tracking-widest text-white uppercase shadow-xl transition-all hover:bg-pink-600"
			>
				Contact Me
			</button>
		</a>
	</div>

	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-sm border border-pink-50 bg-white/70 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<p class="text-justify leading-relaxed font-medium text-gray-700">
			My interest in computers began in elementary school, but it was during my final year of high
			school that I started focusing on programming. My initial exposure to computers came from my
			brother, who introduced me to basic usage. This sparked my journey into the online tech
			community, where I connected with a lot of new friends who inspired me to deepen my
			understanding of computing.
			{#if isBioExpanded}
				<span in:bioAnimation={{ duration: 500 }} out:bioAnimation={{ duration: 500 }}>
					<br /><br />
					In my second year of high school, I participated in the National Science Olympiad in the IT
					Division. I progressed from the school-level selection to the district level and ultimately
					reached the provincial level. Unfortunately, a technical issue prevented me from advancing further—the
					computer provided lacked the necessary IDE to complete the case study, resulting in an eighth-place
					finish and no advancement to the national stage. This experience underscored the importance
					of adaptability and thorough preparation.

					<br /><br />
					Following the Olympiad, I continued to engage in various competitions and expand my programming
					knowledge. One notable experience was participating in a team competition involving mathematics,
					coding, and problem-solving, where my team achieved Runner-Up 1st place. This taught me valuable
					lessons in teamwork, communication, and addressing multidisciplinary challenges. Over time,
					I have developed proficiency in programming languages such as Go and TypeScript, and gained
					hands-on experience with frameworks including React and Svelte.

					<br /><br />
					I particularly enjoy working on web development and game development projects, as they allow
					me to combine creativity with technical skills.

					<br /><br />
					Looking forward, I aim to leverage my programming skills to address real-world challenges and
					explore new opportunities within the technology sector.
				</span>
			{/if}
		</p>
		<button
			on:click={toggleBio}
			class="text-xs font-black tracking-widest text-pink-600 uppercase hover:text-pink-400 hover:underline"
		>
			{isBioExpanded ? 'Show Less' : 'Show More'}
		</button>
	</div>

	<div
		class="animate-fade-in my-10 flex w-full flex-col items-start justify-center gap-6 rounded-sm border border-r-4 border-b-4 border-pink-100 border-pink-200 bg-white/60 p-8 shadow-[0_20px_50px_rgba(255,182,193,0.3)] transition duration-300 md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="no-scrollbar mb-4 flex w-full gap-1 overflow-x-auto py-1">
			{#each tabs as tab (tab.value)}
				<button
					class="rounded-md px-6 py-2 text-xs font-black tracking-widest uppercase transition-all duration-300 {activeTab ===
					tab.value
						? 'bg-pink-500 text-white shadow-lg'
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
						class="mt-2 ml-8 text-xs font-black tracking-widest text-pink-600 uppercase hover:underline"
						on:click={toggleShowMoreWork}
					>
						{isShowMoreWork ? 'Show Less' : 'Show More'}
					</button>
				{/if}
			{:else if activeTab === 'education'}
				{#each showEducationExperiences as edu, i (edu.experienceName + edu.date)}
					<div class="relative pb-10 pl-8">
						<div
							class="absolute top-1.5 -left-[14px] h-6 w-6 rounded-sm border-4 border-white {bgColors[
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
						class="mt-2 ml-8 text-xs font-black tracking-widest text-pink-600 uppercase hover:underline"
						on:click={toggleShowMoreEdu}
					>
						{isShowMoreEdu ? 'Show Less' : 'Show More'}
					</button>
				{/if}
			{:else if activeTab === 'organization'}
				{#each showOrganizationExperiences as org, i (org.experienceName + org.date)}
					<div class="relative pb-10 pl-8">
						<div
							class="absolute top-1.5 -left-[14px] h-6 w-6 rounded-sm border-4 border-white {bgColors[
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
						class="mt-2 ml-8 text-xs font-black tracking-widest text-pink-600 uppercase hover:underline"
						on:click={toggleShowMoreOrg}
					>
						{isShowMoreOrg ? 'Show Less' : 'Show More'}
					</button>
				{/if}
			{:else if activeTab === 'achievement'}
				{#each showAchievements as ach, i (ach.achievementName + ach.date)}
					<div class="relative pb-10 pl-8">
						<div
							class="absolute top-1.5 -left-[14px] h-6 w-6 rounded-sm border-4 border-white {bgColors[
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
						class="mt-2 ml-8 text-xs font-black tracking-widest text-pink-600 uppercase hover:underline"
						on:click={toggleShowMoreAch}
					>
						{isShowMoreAch ? 'Show Less' : 'Show More'}
					</button>
				{/if}
			{/if}
		</div>
	</div>
</section>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
