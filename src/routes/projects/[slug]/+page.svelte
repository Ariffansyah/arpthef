<script lang="ts">
	import { intersect } from '$lib/actions/intersect';
	import { asset } from '$app/paths';
	import { openLightbox } from '$lib/lightbox';

	export let data;
	$: project = data.project;

	// images are either site-relative (/assets/…) or absolute Supabase Storage URLs
	$: seoImage = project.images[0] ? new URL(project.images[0], 'https://arpthef.my.id').href : null;

	$: galleryImages = project.images.filter((img) => !img.toLowerCase().includes('sourcecode'));

	// shown under the button so visitors know where it goes (live site, GitHub, itch.io…)
	$: host = URL.canParse(project.visit_link ?? '')
		? new URL(project.visit_link!).hostname.replace(/^www\./, '')
		: '';
</script>

{#snippet visitButton()}
	<div class="flex flex-wrap items-center gap-x-5 gap-y-2">
		<a
			href={asset(project.visit_link!)}
			target="_blank"
			rel="noopener noreferrer"
			class="bg-cta text-cta-ink hover:bg-brand-hover inline-flex items-center gap-3 px-6 py-3 text-xs font-black tracking-widest uppercase transition-colors"
		>
			Visit Project <span aria-hidden="true">↗</span>
		</a>
		{#if host}
			<span class="text-ink-faint text-[10px] font-bold tracking-widest">{host}</span>
		{/if}
	</div>
{/snippet}

<svelte:head>
	<title>{project.name} - arp</title>
	<meta name="description" content={project.description} />
	<meta name="keywords" content={project.technologies?.map((t) => t.name).join(', ')} />
	<meta name="author" content="arp" />
	<meta property="og:title" content="{project.name} - arp" />
	<meta property="og:description" content={project.description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://arpthef.my.id/projects/{project.slug}" />

	{#if seoImage}
		<meta property="og:image" content={seoImage} />
		<meta name="twitter:image" content={seoImage} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{project.name} - arp" />
	<meta name="twitter:description" content={project.description} />
</svelte:head>

<section class="relative z-10 w-full px-6 py-12 lg:px-20 lg:py-24">
	<div
		id="header"
		class="mb-20 flex flex-col gap-6 lg:gap-10"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="@container flex flex-col gap-4">
			<h1
				class="text-ink text-[length:clamp(2.5rem,11cqw,8rem)] leading-none font-black tracking-tighter wrap-anywhere"
			>
				{project.name.split(' ').slice(0, -1).join(' ')}<br />
				<span class="text-brand">{project.name.split(' ').slice(-1)}</span>
			</h1>
			<p class="text-ink-faint text-[10px] font-black tracking-[0.5em] uppercase">
				Case Study / Project Details
			</p>
		</div>

		<div class="flex flex-wrap gap-4 lg:gap-8">
			{#each project.technologies as tech (tech.name)}
				<div
					class="flex items-center gap-3 opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0"
				>
					<img src={tech.icon} alt={tech.name} class="h-6 w-6" />
					<span class="text-ink text-[10px] font-bold tracking-widest uppercase">{tech.name}</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="flex max-w-3xl flex-col gap-8" use:intersect={{ threshold: 0.3, once: true }}>
		<p class="text-ink-muted text-xl leading-relaxed font-medium md:text-2xl">
			{project.description}
		</p>

		{#if project.visit_link}
			{@render visitButton()}
		{/if}
	</div>

	{#if data.html}
		<!-- rendered server-side by $lib/markdown, which escapes raw HTML -->
		<article class="markdown prose border-edge md:prose-lg mt-20 max-w-3xl border-t pt-16">
			{@html data.html}
		</article>

		<!-- repeated after the write-up so readers don't have to scroll back up -->
		{#if project.visit_link}
			<div class="border-edge mt-16 max-w-3xl border-t pt-10">
				{@render visitButton()}
			</div>
		{/if}
	{/if}

	{#if galleryImages.length > 0}
		<div class="border-edge mt-32 border-t pt-16">
			<div class="mb-12 flex items-baseline justify-between">
				<h2 class="text-ink-faint text-[10px] font-black tracking-[0.5em] uppercase">Gallery</h2>
				<span class="text-ink-faint text-[10px] font-bold uppercase">Click to expand</span>
			</div>

			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each galleryImages as imgUrl (imgUrl)}
					<button
						type="button"
						class="group border-edge bg-card overflow-hidden border focus:outline-none"
						on:click={() => openLightbox(imgUrl)}
						aria-label="View screenshot"
					>
						<img
							src={imgUrl}
							alt="{project.name} screenshot"
							class="aspect-video w-full cursor-pointer object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
						/>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</section>

<style>
	:global(body) {
		background: transparent;
	}
</style>
