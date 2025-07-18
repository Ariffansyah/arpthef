<script lang="ts">
	import AchievementsData from '$lib/assets/JSON/achievements.json';
	import ExperiencesData from '$lib/assets/JSON/experiences.json';
	import { intersect } from '$lib/actions/intersect';
	import { cubicOut } from 'svelte/easing';

	function bioAnimation(node: HTMLElement, { duration }: { duration: number }) {
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
		'text-cyan-400',
		'text-pink-400',
		'text-lime-400',
		'text-yellow-400',
		'text-purple-400',
		'text-green-400',
		'text-red-400',
		'text-blue-400',
		'text-orange-400',
		'text-indigo-400',
		'text-emerald-400',
		'text-fuchsia-400',
		'text-sky-400',
		'text-amber-400',
		'text-violet-400'
	];
	const bgColors = [
		'bg-cyan-400',
		'bg-pink-400',
		'bg-lime-400',
		'bg-yellow-400',
		'bg-purple-400',
		'bg-green-400',
		'bg-red-400',
		'bg-blue-400',
		'bg-orange-400',
		'bg-indigo-400',
		'bg-emerald-400',
		'bg-fuchsia-400',
		'bg-sky-400',
		'bg-amber-400',
		'bg-violet-400'
	];

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

<section class="mx-3 flex flex-col justify-center md:mx-auto">
	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3 }}
	>
		<div class="flex w-full flex-col items-start text-white">
			<h1 class="text-3xl font-bold">About me</h1>
		</div>
		<p class="text-justify text-gray-300">
			I am an undergraduate student passionate about software development. I primarily focus on
			backend development, building and maintaining the systems that operate behind the scenes,
			while also contributing to frontend development to enhance user experience.
		</p>
		<a href="/contact">
			<button
				type="button"
				class="mt-4 py-2 text-gray-400 transition duration-300 hover:text-white hover:underline"
			>
				Contact Me
			</button>
		</a>
	</div>

	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 p-6 md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3 }}
	>
		<p class="text-justify text-gray-300">
			My interest in computers began in elementary school, but it was during my final year of high
			school that I started focusing on programming. My initial exposure to computers came from my
			brother, who introduced me to basic usage. This sparked my journey into the online tech
			community, where I connected with a lot of new friends who inspired me to deepen my
			understanding of computing.
			{#if isBioExpanded}
				<span in:bioAnimation={{ duration: 500 }} out:bioAnimation={{ duration: 500 }}>
					<br /><br />

					In my second year of high school, I participated in the National Science Olympiad in the
					IT Division. I progressed from the school-level selection to the district level and
					ultimately reached the provincial level. Unfortunately, a technical issue prevented me
					from advancing further—the computer provided lacked the necessary IDE to complete the case
					study, resulting in an eighth-place finish and no advancement to the national stage. This
					experience underscored the importance of adaptability and thorough preparation.

					<br /><br />

					Following the Olympiad, I continued to engage in various competitions and expand my
					programming knowledge. One notable experience was participating in a team competition
					involving mathematics, coding, and problem-solving, where my team achieved Runner-Up 1st
					place. This taught me valuable lessons in teamwork, communication, and addressing
					multidisciplinary challenges. Over time, I have developed proficiency in programming
					languages such as Go and TypeScript, and gained hands-on experience with frameworks
					including React and Svelte.

					<br /><br />

					I particularly enjoy working on web development and game development projects, as they
					allow me to combine creativity with technical skills.

					<br /><br />

					Looking forward, I aim to leverage my programming skills to address real-world challenges
					and explore new opportunities within the technology sector.
				</span>
			{/if}
		</p>
		<button on:click={toggleBio} class="text-gray-400 hover:text-white hover:underline">
			{isBioExpanded ? 'Show Less' : 'Show More'}
		</button>
	</div>
	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3 }}
	>
		<div
			class="mb-4 flex w-full scroll-pr-4 scroll-pl-4 flex-row items-center justify-start space-x-4 overflow-x-auto md:justify-between"
		>
			{#each tabs as tab}
				<button
					class="rounded-lg px-4 py-2 font-semibold whitespace-nowrap text-white transition-shadow duration-200 focus:outline-none md:rounded-t-lg {activeTab ===
					tab.value
						? 'shadow-[0_4px_16px_rgba(255,255,255,0.2)]'
						: 'opacity-60'}"
					on:click={() => (activeTab = tab.value)}
				>
					{tab.label}
				</button>
			{/each}
		</div>

		{#if activeTab === 'work'}
			<div class="relative ml-6 border-l border-gray-700">
				{#each showWorkExperiences as exp, i}
					<div class="relative pb-10 pl-6">
						<div
							class="absolute top-1.5 -left-1.5 h-3 w-3 rounded-full {bgColors[
								i % bgColors.length
							]}"
						></div>
						<p class="text-sm font-medium {textColors[i % textColors.length]}">
							{exp.experienceName}
						</p>
						<h3 class="text-lg font-bold">{exp.title}</h3>
						<p class="text-sm text-gray-400">{exp.date}</p>
						<p class="mt-1 text-justify text-gray-300">{exp.description}</p>
					</div>
				{/each}
			</div>
			{#if workExperiences.length > 3}
				<button
					class="mt-2 ml-6 rounded py-2 text-gray-400 transition duration-200 hover:text-white hover:underline"
					on:click={toggleShowMoreWork}
				>
					{#if isShowMoreWork}Show Less{:else}Show More{/if}
				</button>
			{/if}
		{:else if activeTab === 'education'}
			<div class="relative ml-6 border-l border-gray-700">
				{#each showEducationExperiences as edu, i}
					<div class="relative pb-10 pl-6">
						<div
							class="absolute top-1.5 -left-1.5 h-3 w-3 rounded-full {bgColors[
								i % bgColors.length
							]}"
						></div>
						<p class="text-lg font-bold {textColors[i % textColors.length]}">
							{edu.experienceName}
						</p>
						<p class="text-sm text-gray-400">{edu.date}</p>
						<p class="mt-1 text-justify text-gray-300">{edu.description}</p>
					</div>
				{/each}
			</div>
			{#if educationExperiences.length > 3}
				<button
					class="mt-2 ml-6 rounded py-2 text-gray-400 transition duration-200 hover:text-white hover:underline"
					on:click={toggleShowMoreEdu}
				>
					{#if isShowMoreEdu}Show Less{:else}Show More{/if}
				</button>
			{/if}
		{:else if activeTab === 'organization'}
			<div class="relative ml-6 border-l border-gray-700">
				{#each showOrganizationExperiences as org, i}
					<div class="relative pb-10 pl-6">
						<div
							class="absolute top-1.5 -left-1.5 h-3 w-3 rounded-full {bgColors[
								i % bgColors.length
							]}"
						></div>
						<p class="text-sm font-medium {textColors[i % textColors.length]}">
							{org.experienceName}
						</p>
						<h3 class="text-lg font-bold">{org.title}</h3>

						<p class="text-sm text-gray-400">{org.date}</p>
						<p class="mt-1 text-justify text-gray-300">{org.description}</p>
					</div>
				{/each}
			</div>
			{#if organizationExperiences.length > 3}
				<button
					class="mt-2 ml-6 rounded py-2 text-gray-400 transition duration-200 hover:text-white hover:underline"
					on:click={toggleShowMoreOrg}
				>
					{#if isShowMoreOrg}Show Less{:else}Show More{/if}
				</button>
			{/if}
		{:else if activeTab === 'achievement'}
			<div class="relative ml-6 border-l border-gray-700">
				{#each showAchievements as ach, i}
					<div class="relative pb-10 pl-6">
						<div
							class="absolute top-1.5 -left-1.5 h-3 w-3 rounded-full {bgColors[
								i % bgColors.length
							]}"
						></div>
						<p class="text-sm font-medium {textColors[i % textColors.length]}">
							{ach.achievementName}
						</p>
						<p class="text-lg font-bold">{ach.title}</p>
						<p class="text-sm text-gray-400">{ach.date}</p>
						<p class="mt-1 text-justify text-gray-300">{ach.description}</p>
					</div>
				{/each}
			</div>
			{#if achievementItems.length > 3}
				<button
					class="mt-2 ml-6 rounded py-2 text-gray-400 transition duration-200 hover:text-white hover:underline"
					on:click={toggleShowMoreAch}
				>
					{#if isShowMoreAch}Show Less{:else}Show More{/if}
				</button>
			{/if}
		{/if}
	</div>
</section>
