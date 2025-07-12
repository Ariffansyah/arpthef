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
			<h1 class="text-3xl font-bold">Wonderful Papua</h1>
			<div class="mt-5 flex flex-row items-center gap-2">
				<img src="https://cdn.simpleicons.org/react/ffffff" alt="React" class="h-8 w-8" />
				<img src="https://cdn.simpleicons.org/typescript/ffffff" alt="Typescript" class="h-8 w-8" />
				<img src="https://cdn.simpleicons.org/vite/ffffff" alt="Vite" class="h-8 w-8" />
				<img src="https://cdn.simpleicons.org/bootstrap/ffffff" alt="Bootstrap" class="h-8 w-8" />
			</div>
		</div>
		<div class="mt-4 flex flex-col items-start justify-center gap-2 text-gray-300">
			<p class="text-justify text-gray-300">
				Website for my home island, Wonderful Papua, showcasing its beauty and culture.
			</p>
			<a href="https://paradiseisland.arpthef.my.id" target="_blank" rel="noopener noreferrer">
				<button
					type="button"
					class="py-2 text-gray-400 transition duration-300 hover:text-white hover:underline"
				>
					Open Website
				</button>
			</a>
		</div>
	</div>

	<div class="my-6 flex w-full flex-col items-start justify-center gap-4 p-6 md:mx-auto md:w-1/3">
		<p class="text-justify text-gray-300">
			Paradise Island is a college project created to showcase the unique features and beauty of my
			home island. Built primarily with TypeScript, this web application highlights the local
			culture, attractions, and history of the island, offering an interactive and informative
			experience for visitors and those interested in learning more about the region.
		</p>

		<div class="mt-4 space-y-4">
			<button
				type="button"
				aria-label="Open full-size Paradiseisland screenshot"
				class="block w-full cursor-pointer rounded-lg border-none bg-transparent p-0 shadow-lg"
				on:click={() => openModal('/assets/Paradiseisland.png')}
			>
				<img
					src="/assets/Paradiseisland.png"
					alt="Wonderful Papua screenshot"
					class="w-full rounded-lg shadow-lg"
				/>
			</button>

			<div class="flex gap-4">
				<button
					type="button"
					aria-label="Open full-size Paradiseisland2 screenshot"
					class="w-1/2 cursor-pointer rounded-lg border-none bg-transparent p-0 shadow-lg"
					on:click={() => openModal('/assets/Paradiseisland2.png')}
				>
					<img
						src="/assets/Paradiseisland2.png"
						alt="Wonderful Papua screenshot 2"
						class="w-full rounded-lg shadow-lg"
					/>
				</button>

				<button
					type="button"
					aria-label="Open full-size Paradiseisland3 screenshot"
					class="w-1/2 cursor-pointer rounded-lg border-none bg-transparent p-0 shadow-lg"
					on:click={() => openModal('/assets/Paradiseisland3.png')}
				>
					<img
						src="/assets/Paradiseisland3.png"
						alt="Wonderful Papua screenshot 3"
						class="w-full rounded-lg shadow-lg"
					/>
				</button>
			</div>
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
			alt="Wonderful Papua screenshot in full view"
			class="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
		/>
	</div>
{/if}
