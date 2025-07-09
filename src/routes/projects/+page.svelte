<script lang="ts">
	import ProjectsData from '$lib/assets/JSON/projects.json';

	const projects = ProjectsData;
</script>

<section class="mx-3 flex flex-col justify-center md:mx-auto">
	<div
		class="my-6 flex w-full flex-col items-start justify-center gap-4 p-6 md:mx-auto md:w-11/12"
		id="projects"
	>
		<div class="flex w-full flex-row items-center justify-center text-white">
			<div class="flex flex-col">
				<h1 class="text-3xl font-bold">Projects</h1>
				<p class="text-sm text-gray-400">Some of my works</p>
			</div>
		</div>
		<div class="w-full">
			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
				{#each projects as project}
					<div
						class="flex min-h-[430px] flex-col items-start justify-center gap-4 rounded-2xl bg-white/5 p-6 shadow-xl transition duration-300 hover:scale-105"
					>
						<div class="relative w-full">
							<img
								src={project.projectImage}
								alt={project.projectName}
								class="h-80 w-full rounded-lg object-cover opacity-80 shadow-lg"
							/>
							<a href={project.projectLink} rel="noopener noreferrer">
								<div
									class="absolute bottom-0 left-0 h-full w-full rounded-b-lg bg-gradient-to-t from-black/100 via-black/70 to-transparent transition duration-300 hover:bg-gradient-to-t hover:from-black/80 hover:via-black/30 hover:to-transparent"
								>
									<div class="absolute bottom-4 left-4 m-3 flex flex-col gap-2">
										<h2 class="text-2xl font-bold text-white">{project.projectName}</h2>
										<div class="flex flex-row items-center gap-2">
											{#each project.technologies as tech}
												<img src={tech.icon} alt={tech.name} class="h-8 w-8" />
											{/each}
										</div>
										<p class="text-base text-gray-200">{project.projectDescription}</p>
									</div>
								</div>
							</a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
