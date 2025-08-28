<script lang="ts">
	import { intersect } from '$lib/actions/intersect';

	let modalVisible = false;
	let modalSrc = '';

	function openModal(src: string) {
		modalSrc = src;
		modalVisible = true;
	}

	function closeModal() {
		modalVisible = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}
</script>

<svelte:head>
	<title>Orb OS - arp</title>
	<meta
		name="description"
		content="Orb OS is a Linux-based operating system designed with developers in mind."
	/>
	<meta
		name="keywords"
		content="Orb OS, Linux, Fedora, uBlue Image, Developer-Friendly, Open Source, Operating System"
	/>
	<meta name="author" content="arp" />
	<meta property="og:title" content="Orb OS - arp" />
	<meta
		property="og:description"
		content="Orb OS is a Linux-based operating system designed with developers in mind."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://arpthef.com/projects/orb-os" />
	<meta property="og:image" content="https://arpthef.com/assets/Orb.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Orb OS - arp" />
	<meta
		name="twitter:description"
		content="Orb OS is a Linux-based operating system designed with developers in mind."
	/>
	<meta name="twitter:image" content="https://arpthef.com/assets/Orb.png" />
</svelte:head>

<section class="mx-3 flex flex-col justify-center md:mx-auto">
	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3 }}
	>
		<div class="flex w-full flex-col items-start text-white">
			<h1 class="text-3xl font-bold">Orb OS</h1>
			<div class="mt-5 flex flex-row items-center gap-2">
				<img src="https://cdn.simpleicons.org/docker/ffffff" alt="Docker" class="h-8 w-8" />
				<img src="https://cdn.simpleicons.org/gnubash/ffffff" alt="Shell (Bash)" class="h-8 w-8" />
			</div>
		</div>
		<div class="mt-4 flex flex-col items-start justify-center gap-2 text-gray-300">
			<p class="text-justify text-gray-300">
				Orb OS is a Linux-based operating system designed with developers in mind.
			</p>
			<a href="https://github.com/Ariffansyah/orb-os" target="_blank" rel="noopener noreferrer">
				<button
					type="button"
					class="py-2 text-gray-400 transition duration-300 hover:text-white hover:underline"
				>
					View on GitHub
				</button>
			</a>
		</div>
	</div>

	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 p-6 md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3 }}
	>
		<p class="text-justify text-gray-300">
			Orb OS is a Linux-based operating system based on Fedora, using uBlue Image as its base. It is
			designed to be a developer-friendly environment, providing a robust and flexible platform for
			software development.<br />
			Started as a college project, it has evolved into a personal project that I am actively developing
			and maintaining. The goal of Orb OS is to create a lightweight, customizable, and efficient operating
			system that caters to the needs of developers and tech enthusiasts.
		</p>

		<div class="mt-4">
			<button
				type="button"
				aria-label="Open full-size Orb OS screenshot"
				class="cursor-pointer rounded-lg border-none bg-transparent p-0 shadow-lg"
				on:click={() => openModal('/assets/Orb.png')}
			>
				<img src="/assets/Orb.png" alt="Orb OS screenshot" class="rounded-lg shadow-lg" />
			</button>
		</div>
	</div>
</section>

{#if modalVisible}
	<div
		role="dialog"
		aria-modal="true"
		tabindex="0"
		class="bg-opacity-80 fixed inset-0 z-50 flex items-center justify-center bg-black"
		on:click={closeModal}
		on:keydown={handleKeydown}
	>
		<img
			src={modalSrc}
			alt="Orb OS screenshot in full view"
			class="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
		/>
	</div>
{/if}
