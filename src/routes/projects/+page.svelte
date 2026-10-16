<script lang="ts">
	export let data;
	import { intersect } from '$lib/actions/intersect';
	import { resolve } from '$app/paths';
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
		class="@container mb-20 flex flex-col gap-4"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<h1
			class="font-display plates text-[length:clamp(3rem,15cqw,9rem)] leading-[0.95] text-ink"
		>
			Code &<br /><span class="judul-komik">Contributions</span>
		</h1>
		<p class="narasi">Selected developments and open source works</p>
	</div>

	<div class="w-full">
		<div class="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 xl:grid-cols-3" role="presentation">
			{#each data.projects as project (project.id)}
				<div class="project-card group flex flex-col gap-6" role="presentation" use:intersect={{ threshold: 0.1, once: true }}>
					<a
						href={resolve('/projects/[slug]', { slug: project.slug })}
						class="komik relative aspect-4/5 overflow-hidden rounded-md bg-card transition-transform duration-150 group-hover:-translate-y-1 group-hover:-rotate-1"
					>
						<img
							src={project.images[0] ?? '/assets/placeholder.webp'}
							alt={project.name}
							loading="lazy"
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>

						<div
							class="absolute top-4 left-4 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						>
							{#each project.technologies as tech (tech.name)}
								<div class="rounded-sm border-2 border-edge-ink bg-card p-1">
									<img src={tech.icon} alt={tech.name} class="h-4 w-4" title={tech.name} />
								</div>
							{/each}
						</div>
					</a>

					<div class="flex flex-col gap-3">
						<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
							<h2
								class="font-display text-3xl wrap-anywhere text-ink transition-colors group-hover:text-brand"
							>
								{project.name}
							</h2>
							<span class="text-[10px] font-bold tracking-widest text-ink-faint uppercase"
								>/ Project</span
							>
						</div>

						<p class="line-clamp-3 text-sm leading-relaxed text-ink-muted">
							{project.description}
						</p>

						<a
							href={resolve('/projects/[slug]', { slug: project.slug })}
							class="tekan mt-2 w-fit rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
						>
							View Details
						</a>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="mt-24 py-24 text-center">
		<a href={resolve('/contact')} class="group inline-flex items-center gap-6">
			<span
				class="judul-komik font-display text-5xl transition-transform group-hover:-rotate-2 lg:text-8xl"
				>Have a project in mind?</span
			>
			<span
				class="font-display text-4xl text-ink transition-transform group-hover:translate-x-4 lg:text-7xl"
				>→</span
			>
		</a>
	</div>
</section>

<style>
	img {
		display: block;
	}
</style>
