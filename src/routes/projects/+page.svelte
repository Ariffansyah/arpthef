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

<section class="relative z-10 w-full px-6 py-12 lg:px-20 lg:py-24">
	<div
		class="mb-24 flex flex-col gap-4 border-b border-gray-100 pb-12"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<h1 class="text-6xl font-black tracking-tighter text-gray-900 lg:text-9xl">
			My<br /><span class="text-pink-500">Works</span>
		</h1>
		<p class="text-[10px] font-black tracking-[0.5em] text-gray-400 uppercase">
			Selected Projects {new Date().getFullYear()}
		</p>
	</div>

	<div class="w-full">
		<div class="grid grid-cols-1 gap-x-12 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
			{#each projects as project (project.projectName)}
				<div class="group flex flex-col gap-6" use:intersect={{ threshold: 0.1, once: true }}>
					<a
						href={resolve('/projects/[slug]', { slug: project.projectLink })}
						class="relative aspect-square overflow-hidden border border-gray-100 bg-gray-50"
					>
						<img
							src={project.projectImages && project.projectImages.length > 0
								? project.projectImages[0]
								: '/assets/placeholder.webp'}
							alt={project.projectName}
							loading="lazy"
							class="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
						/>

						<div
							class="absolute top-4 left-4 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						>
							{#each project.technologies as tech (tech.name)}
								<div class="bg-white/90 p-1.5 shadow-sm backdrop-blur-sm">
									<img src={tech.icon} alt={tech.name} class="h-4 w-4" title={tech.name} />
								</div>
							{/each}
						</div>
					</a>

					<div class="flex flex-col gap-3">
						<div class="flex items-center justify-between">
							<h2
								class="text-2xl font-black tracking-tighter text-gray-900 uppercase transition-colors group-hover:text-pink-500"
							>
								{project.projectName}
							</h2>
							<span class="text-[10px] font-bold tracking-widest text-gray-300 uppercase"
								>/ Project</span
							>
						</div>

						<p class="line-clamp-3 text-sm leading-relaxed text-gray-500">
							{project.projectDescription}
						</p>

						<a
							href={resolve('/projects/[slug]', { slug: project.projectLink })}
							class="mt-2 w-fit border-b border-gray-900 pb-1 text-xs font-black tracking-widest uppercase transition-all hover:border-pink-500 hover:text-pink-500"
						>
							View Details
						</a>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="mt-32 border-t border-gray-100 py-32 text-center">
		<a href={resolve('/contact')} class="group inline-flex items-center gap-6">
			<span
				class="text-4xl font-black tracking-tighter text-gray-900 transition-all group-hover:text-pink-500 lg:text-7xl"
				>Have a project in mind?</span
			>
			<span
				class="text-3xl text-gray-200 transition-transform group-hover:translate-x-4 lg:text-5xl"
				>→</span
			>
		</a>
	</div>
</section>

<style>
	/* Ensures images maintain their containers without stretching weirdly */
	img {
		display: block;
	}
</style>
