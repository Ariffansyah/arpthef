<script lang="ts">
	import projectsdata from '$lib/assets/JSON/projects.json';
	import { intersect } from '$lib/actions/intersect';
	import { resolve } from '$app/paths';

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

<section class="relative z-10 mx-3 flex flex-col justify-center md:mx-auto">
	<div
		class="my-10 flex w-full flex-col items-start justify-center gap-8 p-6 md:mx-auto md:w-11/12"
		id="projects"
	>
		<div
			class="animate-fade-in flex w-full flex-row items-center justify-center"
			use:intersect={{ threshold: 0.3, once: true }}
		>
			<div class="flex flex-col items-center text-center">
				<h1
					class="border-b-4 border-pink-500 pb-2 text-4xl font-black tracking-tighter text-gray-900 uppercase"
				>
					Projects
				</h1>
				<p class="mt-2 text-xs font-bold tracking-widest text-pink-600 uppercase">
					Portfolio and Works
				</p>
			</div>
		</div>

		<div class="w-full">
			<div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-2">
				{#each projects as project (project.projectName)}
					<div
						class="animate-fade-in group relative flex h-[450px] flex-col items-start justify-center gap-4 overflow-hidden rounded-sm border border-pink-100 bg-white shadow-[0_30px_60px_rgba(255,182,193,0.3)] transition duration-500 hover:scale-[1.01]"
						use:intersect={{ threshold: 0.3, once: true }}
					>
						<img
							src={project.projectImages && project.projectImages.length > 0
								? project.projectImages[0]
								: '/assets/placeholder.webp'}
							alt={project.projectName}
							loading="lazy"
							class="absolute inset-0 h-full w-full object-cover opacity-80 grayscale transition duration-700 group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0"
						/>

						<a
							href={resolve('/projects/[slug]', { slug: project.projectLink })}
							class="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-pink-900/90 via-pink-800/40 to-transparent p-8 transition duration-300 group-hover:from-pink-900/95"
						>
							<div class="flex flex-col gap-3">
								<div class="flex flex-row items-center gap-3">
									{#each project.technologies as tech (tech.name)}
										<img
											src={tech.icon}
											alt={tech.name}
											title={tech.name}
											class="h-6 w-6 brightness-0 drop-shadow-sm invert"
										/>
									{/each}
								</div>

								<h2 class="text-2xl font-black tracking-tighter text-white uppercase">
									{project.projectName}
								</h2>

								<p class="line-clamp-2 text-sm leading-relaxed font-medium text-pink-50">
									{project.projectDescription}
								</p>

								<span
									class="mt-2 inline-block w-max bg-white px-6 py-2 text-xs font-black tracking-widest text-pink-600 uppercase shadow-xl transition-all hover:bg-pink-50"
								>
									Details
								</span>
							</div>
						</a>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
