<script lang="ts">
	import projectsdata from '$lib/assets/JSON/projects.json';
	import { intersect } from '$lib/actions/intersect';

	const projects = projectsdata;
</script>

<svelte:head>
	<title>Projects - arp</title>
	<meta name="description" content="Explore some of my projects and works." />
	<meta
		name="keywords"
		content="projects, works, portfolio, arp, arpthef, mohammad, ariffansyah, developer, programmer, backend, frontend, fullstack"
	/>
	<meta name="author" content="mohammad ariffansyah" />
	<meta property="og:title" content="projects - arp" />
	<meta property="og:image" content="https://arpthef.com/logo.webp" />
	<meta property="og:description" content="explore some of my projects and works." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://arpthef.com/projects" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="projects - arp" />
	<meta name="twitter:description" content="explore some of my projects and works." />
	<link rel="canonical" href="https://arpthef.com/projects" />
</svelte:head>

<section class="mx-3 flex flex-col justify-center md:mx-auto">
	<div
		class="my-6 flex w-full flex-col items-start justify-center gap-4 p-6 md:mx-auto md:w-11/12"
		id="projects"
	>
		<div
			class="animate-fade-in flex w-full flex-row items-center justify-center text-white"
			use:intersect={{ threshold: 0.3, once: true }}
		>
			<div class="flex flex-col items-center text-center">
				<h1 class="text-3xl font-bold">Projects</h1>
				<p class="text-sm text-gray-400">Some of my works</p>
			</div>
		</div>

		<div class="w-full">
			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
				{#each projects as project (project.projectName)}
					<div
						class="animate-fade-in group relative flex h-[400px] flex-col items-start justify-center gap-4 overflow-hidden rounded-2xl bg-white/5 shadow-xl transition duration-300 hover:scale-[1.02]"
						use:intersect={{ threshold: 0.3, once: true }}
					>
						<img
							src={project.projectImages && project.projectImages.length > 0
								? project.projectImages[0]
								: '/assets/placeholder.webp'}
							alt={project.projectName}
							loading="lazy"
							class="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-110"
						/>

						<a
							href={project.projectLink}
							class="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/60 to-transparent p-6 transition duration-300 hover:from-black/90"
						>
							<div class="flex flex-col gap-2">
								<h2 class="text-2xl font-bold text-white shadow-black drop-shadow-md">
									{project.projectName}
								</h2>

								<div class="flex flex-row items-center gap-2">
									{#each project.technologies as tech (tech.name)}
										<img
											src={tech.icon}
											alt={tech.name}
											title={tech.name}
											class="h-6 w-6 drop-shadow-md"
										/>
									{/each}
								</div>

								<p class="line-clamp-3 text-sm text-gray-200 shadow-black drop-shadow-md">
									{project.projectDescription}
								</p>
							</div>
						</a>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
