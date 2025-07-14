<script lang="ts">
	import AchievementsData from '$lib/assets/JSON/achievements.json';
	import ExperiencesData from '$lib/assets/JSON/experiences.json';
	import { intersect } from '$lib/actions/intersect';

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
			Hello! I'm Arifansyah, a software engineer from Surabaya, Indonesia. I specialize in building
			applications using Go and TypeScript. My passion lies in creating efficient, scalable
			solutions that enhance user experiences and streamline processes.
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
			I first became interested in computers when I was in elementary school, but it wasn't until my
			last year of high school that I began to focus on programming. The first time I learned how to
			use a computer was when my brother taught me. That experience sparked my online journey, where
			I began meeting online friends who inspired me to learn more about computers.

			<br /><br />

			In my second year of high school, I had the opportunity to participate in the National Science
			Olympiad in the IT Division. I started at the school-level selection, advanced to the district
			level, and finally reached the provincial level. Unfortunately, at the provincial stage, I was
			unable to continue due to a technical issue—I realized too late that the computer provided was
			not set up with the IDE I needed to solve the case study. As a result, I finished in 8th place
			and was unable to advance to the national level. That experience taught me the importance of
			adaptability and preparation.

			<br /><br />

			After that first Olympiad, I began participating in other competitions and continued learning
			more about programming. One memorable experience was joining a team competition where we had
			to solve a challenging paper that involved mathematics, coding, and problem-solving. Working
			together with my teammates, we managed to secure the Runner Up 1st place. This experience
			taught me about the importance of teamwork, effective communication, and tackling
			multidisciplinary challenges. Over the years, I’ve become comfortable with languages like Go
			and TypeScript, and I’ve experimented with frameworks such as React and Svelte.

			<br /><br />

			Looking ahead, I hope to use my programming skills to solve real-world problems and to explore
			many more exciting opportunities in the world of technology.
		</p>
	</div>
	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3 }}
	>
		<div class="mb-4 flex w-full items-center justify-center space-x-4">
			{#each tabs as tab}
				<button
					class="rounded-t-lg px-4 py-2 font-semibold text-white transition-shadow duration-200 focus:outline-none {activeTab ===
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
			<div class="h-auto">
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
						class="mt-2 rounded py-2 text-gray-300 transition duration-200 hover:underline"
						on:click={toggleShowMoreWork}
					>
						{#if isShowMoreWork}Show Less{:else}Show More{/if}
					</button>
				{/if}
			</div>
		{/if}
		{#if activeTab === 'education'}
			<div class="h-auto">
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
						class="mt-2 rounded py-2 text-gray-300 transition duration-200 hover:underline"
						on:click={toggleShowMoreEdu}
					>
						{#if isShowMoreEdu}Show Less{:else}Show More{/if}
					</button>
				{/if}
			</div>
		{/if}
		{#if activeTab === 'organization'}
			<div class="h-auto">
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
						class="mt-2 rounded py-2 text-gray-300 transition duration-200 hover:underline"
						on:click={toggleShowMoreOrg}
					>
						{#if isShowMoreOrg}Show Less{:else}Show More{/if}
					</button>
				{/if}
			</div>
		{/if}
		{#if activeTab === 'achievement'}
			<div class="h-auto">
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
							<h3 class="text-lg font-bold">{ach.title}</h3>
							<p class="text-sm text-gray-400">{ach.date}</p>
							<p class="mt-1 text-justify text-gray-300">{ach.description}</p>
						</div>
					{/each}
				</div>
				{#if achievementItems.length > 3}
					<button
						class="mt-2 rounded py-2 text-gray-300 transition duration-200 hover:underline"
						on:click={toggleShowMoreAch}
					>
						{#if isShowMoreAch}Show Less{:else}Show More{/if}
					</button>
				{/if}
			</div>
		{/if}
	</div>
</section>
