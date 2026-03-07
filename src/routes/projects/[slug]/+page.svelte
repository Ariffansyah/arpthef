<script lang="ts">
	import { intersect } from '$lib/actions/intersect';
	import { asset } from '$app/paths';

	export let data;
	$: project = data.project;

	$: seoImage =
		project.projectImages && project.projectImages.length > 0 ? project.projectImages[0] : null;

	$: galleryImages = project.projectImages
		? project.projectImages.filter((img: string) => !img.toLowerCase().includes('sourcecode'))
		: [];

	let selectedImage: string | null = null;

	function openImage(url: string) {
		selectedImage = url;
	}

	function closeImage() {
		selectedImage = null;
	}
</script>

<svelte:head>
	<title>{project.projectName} - arp</title>
	<meta name="description" content={project.projectDescription} />
	<meta name="keywords" content={project.technologies?.map((t) => t.name).join(', ')} />
	<meta name="author" content="arp" />
	<meta property="og:title" content="{project.projectName} - arp" />
	<meta property="og:description" content={project.projectDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://arpthef.my.id{project.projectLink}" />

	{#if seoImage}
		<meta property="og:image" content="https://arpthef.my.id{seoImage}" />
		<meta name="twitter:image" content="https://arpthef.my.id{seoImage}" />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{project.projectName} - arp" />
	<meta name="twitter:description" content={project.projectDescription} />
</svelte:head>

<section class="relative z-10 w-full px-6 py-12 lg:px-20 lg:py-24">
	<div
		id="header"
		class="mb-20 flex flex-col gap-6 lg:gap-10"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="flex flex-col gap-4">
			<h1 class="text-5xl font-black tracking-tighter text-gray-900 lg:text-9xl">
				{project.projectName.split(' ').slice(0, -1).join(' ')}<br />
				<span class="text-pink-500">{project.projectName.split(' ').slice(-1)}</span>
			</h1>
			<p class="text-[10px] font-black tracking-[0.5em] text-gray-400 uppercase">
				Case Study / Project Details
			</p>
		</div>

		<div class="flex flex-wrap gap-4 lg:gap-8">
			{#each project.technologies as tech (tech.name)}
				<div
					class="flex items-center gap-3 opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0"
				>
					<img src={tech.icon} alt={tech.name} class="h-6 w-6" />
					<span class="text-[10px] font-bold tracking-widest text-gray-800 uppercase"
						>{tech.name}</span
					>
				</div>
			{/each}
		</div>
	</div>

	<div class="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-32">
		<div class="flex flex-col gap-8" use:intersect={{ threshold: 0.3, once: true }}>
			<p class="text-xl leading-relaxed font-medium text-gray-600 md:text-2xl">
				{project.projectDescription}
			</p>

			{#if project.visitLink}
				<a
					href={asset(project.visitLink)}
					target="_blank"
					rel="noopener noreferrer"
					class="w-fit border-b-2 border-gray-900 pb-1 text-xs font-black tracking-widest uppercase transition-all hover:border-pink-500 hover:text-pink-500"
				>
					Visit Project →
				</a>
			{/if}
		</div>

		{#if project.projectDetails}
			<div
				class="flex flex-col gap-6 border-l border-gray-100 pl-8 leading-relaxed text-gray-500 lg:pl-16"
			>
				<p class="whitespace-pre-line">{project.projectDetails}</p>
			</div>
		{/if}
	</div>

	{#if galleryImages.length > 0}
		<div class="mt-32 border-t border-gray-100 pt-16">
			<div class="mb-12 flex items-baseline justify-between">
				<h2 class="text-[10px] font-black tracking-[0.5em] text-gray-400 uppercase">Gallery</h2>
				<span class="text-[10px] font-bold text-gray-300 uppercase">Click to expand</span>
			</div>

			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each galleryImages as imgUrl (imgUrl)}
					<button
						type="button"
						class="group overflow-hidden border border-gray-100 bg-gray-50 focus:outline-none"
						on:click={() => openImage(imgUrl)}
						aria-label="View screenshot"
					>
						<img
							src={imgUrl}
							alt="{project.projectName} screenshot"
							class="aspect-video w-full cursor-pointer object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
						/>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</section>

{#if selectedImage}
	<div
		class="fixed inset-0 z-100 flex items-center justify-center bg-white/95 p-4 backdrop-blur-xl transition-all"
		on:click={closeImage}
		on:keydown={(e) => e.key === 'Escape' && closeImage()}
		role="button"
		tabindex="0"
	>
		<div class="relative flex flex-col items-center gap-6">
			<img
				src={selectedImage}
				alt="Enlarged view"
				class="max-h-[80vh] max-w-[90vw] object-contain shadow-2xl"
			/>
			<button
				on:click={closeImage}
				class="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase transition-colors hover:text-pink-500"
			>
				Close [esc]
			</button>
		</div>
	</div>
{/if}

<style>
	:global(body) {
		background-color: white;
	}
</style>
