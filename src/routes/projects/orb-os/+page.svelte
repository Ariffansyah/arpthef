<script lang="ts">
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

<section class="mx-3 flex flex-col justify-center md:mx-auto">
	<div
		class="my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
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
					class="rounded-lg px-4 py-2 text-white shadow-lg transition duration-300 hover:bg-gray-300 hover:text-gray-800 hover:shadow-lg"
				>
					View on GitHub
				</button>
			</a>
		</div>
	</div>

	<div class="my-6 flex w-full flex-col items-start justify-center gap-4 p-6 md:mx-auto md:w-1/3">
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
