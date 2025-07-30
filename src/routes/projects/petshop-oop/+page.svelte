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

<section class="mx-3 flex flex-col justify-center md:mx-auto">
	<div
		class="animation-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="flex w-full flex-col items-start text-white">
			<h1 class="text-3xl font-bold">Petshop</h1>
			<div class="mt-5 flex flex-row items-center gap-2">
				<img src="https://cdn.simpleicons.org/kotlin/ffffff" alt="Kotlin" class="h-8 w-8" />
				<img src="https://cdn.simpleicons.org/sqlite/ffffff" alt="Sqlite" class="h-8 w-8" />
			</div>
		</div>
		<div class="mt-4 flex flex-col items-start justify-center gap-2 text-gray-300">
			<p class="text-justify text-gray-300">
				OOP collage project for a pet shop management system using Kotlin and SQLite.
			</p>
			<a href="https://github.com/Ariffansyah/petshop" target="_blank" rel="noopener noreferrer">
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
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<p class="text-justify text-gray-300">
			This project is a simple pet shop management system that allows users to manage pets,
			customers, and transactions. It features a user-friendly interface and utilizes SQLite for
			data storage. The project demonstrates object-oriented programming principles and is designed
			to be easily extensible for future enhancements.
		</p>

		<div class="mt-4">
			<button
				type="button"
				aria-label="Open full-size petshop screenshot"
				class="cursor-pointer rounded-lg border-none bg-transparent p-0 shadow-lg"
				on:click={() => openModal('/assets/petshop.png')}
			>
				<img src="/assets/petshop.png" alt="Petshop screenshot" class="rounded-lg shadow-lg" />
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
			alt="Petshop screenshot in full view"
			class="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
		/>
	</div>
{/if}
