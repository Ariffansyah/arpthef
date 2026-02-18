<script lang="ts">
	import { intersect } from '$lib/actions/intersect';
  import { asset } from '$app/paths';

	export let data;
	$: project = data.project;

	$: seoImage =
		project.projectImages && project.projectImages.length > 0 ? project.projectImages[0] : null;

	$: galleryImages = project.projectImages
		? project.projectImages.filter((img) => !img.includes('SourceCode.webp'))
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

<section class="mx-3 flex flex-col justify-center md:mx-auto">
	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="flex w-full flex-col items-start text-white">
			<h1 class="text-3xl font-bold">{project.projectName}</h1>
			<div class="mt-5 flex flex-row items-center gap-2">
				{#each project.technologies as tech (tech.name)}
					<img src={tech.icon} alt={tech.name} class="h-8 w-8" title={tech.name} />
				{/each}
			</div>
		</div>
		<div class="mt-4 flex flex-col items-start justify-center gap-2 text-gray-300">
			<p class="text-justify text-gray-300">
				{project.projectDescription}
			</p>

			{#if project.visitLink}
				<a href={asset(project.visitLink)} target="_blank" rel="noopener noreferrer">
					<button
						type="button"
						class="py-2 text-gray-400 transition duration-300 hover:text-white hover:underline"
					>
						View Project
					</button>
				</a>
			{/if}
		</div>
	</div>

	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 p-6 md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<p class="text-justify text-gray-300">
			{project.projectDetails}
		</p>
	</div>

	{#if galleryImages.length > 0}
		<div
			class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
			use:intersect={{ threshold: 0.3, once: true }}
		>
			<h2 class="text-xl font-bold text-white">Gallery</h2>

			<div
				class="grid w-full gap-4 {galleryImages.length === 1
					? 'grid-cols-1'
					: 'grid-cols-1 md:grid-cols-2'}"
			>
				{#each galleryImages as imgUrl (imgUrl)}
					<button
						type="button"
						class="w-full focus:outline-none"
						on:click={() => openImage(imgUrl)}
					>
						<img
							src={imgUrl}
							alt="{project.projectName} screenshot"
							class="aspect-video w-full cursor-pointer rounded-lg object-cover shadow-sm transition-opacity hover:opacity-80"
						/>
					</button>
				{/each}
			</div>
			<p class="text-xs text-gray-400 italic">Click image to enlarge</p>
		</div>
	{/if}
</section>

{#if selectedImage}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-all"
		on:click={closeImage}
		on:keydown={(e) => e.key === 'Escape' && closeImage()}
		role="button"
		tabindex="0"
	>
		<div class="relative max-h-screen max-w-full">
			<img
				src={selectedImage}
				alt="Enlarged view"
				class="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
			/>
			<button
				on:click={closeImage}
				class="absolute -top-10 right-0 text-white hover:text-gray-300 focus:outline-none"
				aria-label="Close image"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	</div>
{/if}
