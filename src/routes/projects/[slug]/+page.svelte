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

<section class="relative z-10 mx-3 flex flex-col justify-center md:mx-auto">
	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-sm border border-pink-200 bg-white/60 p-8 shadow-[0_20px_60px_rgba(255,182,193,0.4)] transition duration-300 hover:scale-[1.01] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="flex w-full flex-col items-start">
			<h1
				class="border-b-4 border-pink-500 pb-1 text-3xl font-black tracking-tighter text-gray-900 uppercase"
			>
				{project.projectName}
			</h1>
			<div class="mt-5 flex flex-row items-center gap-3">
				{#each project.technologies as tech (tech.name)}
					<img
						src={tech.icon}
						alt={tech.name}
						class="h-8 w-8 drop-shadow-sm filter"
						title={tech.name}
					/>
				{/each}
			</div>
		</div>
		<div class="mt-4 flex flex-col items-start justify-center gap-4">
			<p class="text-justify leading-relaxed font-medium text-gray-800">
				{project.projectDescription}
			</p>

			{#if project.visitLink}
				<a
					href={asset(project.visitLink)}
					target="_blank"
					rel="noopener noreferrer"
					class="w-full md:w-auto"
				>
					<button
						type="button"
						class="w-full rounded-sm bg-pink-500 px-8 py-3 text-sm font-black tracking-widest text-white uppercase shadow-xl transition-all hover:bg-pink-600 active:scale-95"
					>
						View Project
					</button>
				</a>
			{/if}
		</div>
	</div>

	{#if project.projectDetails}
		<div
			class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-sm border border-pink-50 bg-white/70 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.05)] md:mx-auto md:w-1/3"
			use:intersect={{ threshold: 0.3, once: true }}
		>
			<p class="text-justify leading-relaxed font-medium text-gray-700">
				{project.projectDetails}
			</p>
		</div>
	{/if}

	{#if galleryImages.length > 0}
		<div
			class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-6 rounded-sm border border-pink-100 bg-white/60 p-8 shadow-[0_20px_50px_rgba(255,182,193,0.3)] md:mx-auto md:w-1/3"
			use:intersect={{ threshold: 0.3, once: true }}
		>
			<h2
				class="border-l-4 border-pink-500 pl-3 text-xl font-black tracking-tighter text-gray-900 uppercase"
			>
				Gallery
			</h2>

			<div
				class="grid w-full gap-4 {galleryImages.length === 1
					? 'grid-cols-1'
					: 'grid-cols-1 md:grid-cols-2'}"
			>
				{#each galleryImages as imgUrl (imgUrl)}
					<button
						type="button"
						class="group w-full focus:outline-none"
						on:click={() => openImage(imgUrl)}
						aria-label="View screenshot"
					>
						<img
							src={imgUrl}
							alt="{project.projectName} screenshot"
							class="aspect-video w-full cursor-pointer rounded-sm border border-pink-50 object-cover shadow-md transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-pink-200/50"
						/>
					</button>
				{/each}
			</div>
			<p class="text-[10px] font-black tracking-widest text-pink-400 uppercase">
				Click image to enlarge
			</p>
		</div>
	{/if}
</section>

{#if selectedImage}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-pink-950/40 p-4 backdrop-blur-md transition-all"
		on:click={closeImage}
		on:keydown={(e) => e.key === 'Escape' && closeImage()}
		role="button"
		tabindex="0"
	>
		<div class="relative max-h-screen max-w-full p-2">
			<img
				src={selectedImage}
				alt="Enlarged view"
				class="max-h-[85vh] max-w-[90vw] rounded-sm border-2 border-white object-contain shadow-[0_0_80px_rgba(0,0,0,0.5)]"
			/>
			<button
				on:click={closeImage}
				class="absolute -top-12 right-2 text-white transition-colors hover:text-pink-300 focus:outline-none"
				aria-label="Close image"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-10 w-10"
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
