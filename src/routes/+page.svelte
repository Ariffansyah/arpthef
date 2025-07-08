<script lang="ts">
	import TechnologiesData from '$lib/assets/JSON/tehcnologies.json';
	import ExperienceData from '$lib/assets/JSON/experience.json';
	import ProjectsData from '$lib/assets/JSON/projects.json';

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

	const technologies = TechnologiesData;

	const experience = ExperienceData;

	const projects = ProjectsData;
</script>

<section class="mx-3 flex flex-col justify-center md:mx-auto">
	<div
		class="my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
	>
		<div class="flex w-full flex-row items-start justify-between text-white">
			<div class="flex flex-col">
				<h1 class="text-3xl font-bold">arpthef</h1>
				<p class="text-sm text-gray-400">Surabaya, Indonesia</p>
			</div>

			<div class="flex items-center">
				<a
					href="https://github.com/Ariffansyah"
					aria-label="GitHub Profile"
					target="_blank"
					rel="noopener noreferrer"
				>
					<i class="fa-brands fa-github fa-xl" style="color: #deddda;"></i>
				</a>
				<a
					href="https://www.linkedin.com/in/arpthef/"
					aria-label="LinkedIn Profile"
					target="_blank"
					rel="noopener noreferrer"
					class="ml-4"
				>
					<i class="fa-brands fa-linkedin fa-xl" style="color: #deddda;"></i>
				</a>
			</div>
		</div>
		<div class="mt-4">
			<p class="text-justify text-gray-300">
				Hi, I'm an undergraduate collage student with a passion for technology and software
				development. I enjoy building projects, exploring new tools, and connecting with others in
				tech.
			</p>
		</div>
	</div>
	<div class="mx-auto my-6 flex w-full flex-col items-start justify-center gap-4 p-6 md:w-1/3">
		<h1 class="mb-2 text-3xl font-bold text-white">Technologies i work with</h1>
		<div class="flex flex-wrap justify-between gap-4">
			{#each technologies as tech}
				<div
					class="bg-darkgray flex items-center gap-2 rounded px-3 py-1 transition duration-200 hover:scale-105"
				>
					<img src={tech.icon} alt={tech.alt} class="h-3 w-3 md:h-6 md:w-6" />
					<span class="text-sm text-gray-200">{tech.name}</span>
				</div>
			{/each}
		</div>
	</div>
	<div class="my-6 flex w-full flex-col items-start justify-center gap-4 p-6 md:mx-auto md:w-1/3">
		<div class="flex w-full flex-row items-center justify-between">
			<h1 class="mb-2 text-3xl font-bold text-white">Experience</h1>
			<!-- <a href="/experience" class="text-sm text-gray-400 hover:text-white"> See all</a> -->
		</div>
		<div class="h-150 overflow-auto">
			<div class="relative ml-6 border-l border-gray-700">
				{#each experience as exp, i}
					<div class="relative pb-10 pl-6">
						<div
							class="absolute top-1.5 -left-1.5 h-3 w-3 rounded-full {bgColors[
								i % bgColors.length
							]}"
						></div>
						<p class="text-sm font-medium {textColors[i % textColors.length]}">{exp.company}</p>
						<h3 class="text-lg font-bold">{exp.title}</h3>
						<p class="text-sm text-gray-400">{exp.date}</p>
						<p class="mt-1 text-justify text-gray-300">{exp.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
	<div
		class="my-6 flex w-full flex-col items-start justify-center gap-4 p-6 md:mx-auto md:w-1/3"
		id="projects"
	>
		<div class="flex w-full flex-row items-center justify-between">
			<h1 class="mb-2 text-3xl font-bold text-white">Project</h1>
			<a href="/projects" class="text-sm text-gray-400 hover:text-white"> See all</a>
		</div>
		<div class="max-h-[500px] w-full overflow-auto pr-2">
			{#each projects as project}
				<div
					class="mb-4 flex w-full flex-col items-start justify-center gap-2 transition duration-300 hover:scale-105"
				>
					<div class="relative w-full">
						<img
							src={project.projectImage}
							alt={project.projectName}
							class=" h-64 w-full rounded-lg opacity-70 shadow-lg"
						/>
						<a href={project.projectLink} rel="noopener noreferrer">
							<div
								class="absolute bottom-0 left-0 h-1/3 w-full rounded-b-lg bg-gradient-to-t from-black/100 via-black/70 to-transparent transition duration-300 hover:bg-gradient-to-t hover:from-black/80 hover:via-black/30 hover:to-transparent"
							>
								<div class="absolute bottom-2 left-2 m-3 flex flex-col gap-2">
									<h2 class="text-xl font-bold text-white">{project.projectName}</h2>
									<div class="flex flex-row items-center gap-2">
										{#each project.technologies as tech}
											<img src={tech.icon} alt={tech.name} class="h-8 w-8" />
										{/each}
									</div>
									<p class="text-sm text-gray-300">{project.projectDescription}</p>
								</div>
							</div>
						</a>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.bg-darkgray {
		background-color: #222222;
	}
	.max-h-\[500px\]::-webkit-scrollbar {
		height: 8px;
		width: 8px;
	}
	.max-h-\[500px\]::-webkit-scrollbar-thumb {
		background: #444;
		border-radius: 4px;
	}
	.max-h-\[500px\]::-webkit-scrollbar-track {
		background: #222;
		border-radius: 4px;
	}
</style>
