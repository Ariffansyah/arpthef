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
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="flex w-full flex-col items-start text-white">
			<h1 class="text-3xl font-bold">Fatebound</h1>
			<div class="mt-5 flex flex-row items-center gap-2">
				<img src="https://cdn.simpleicons.org/unity/ffffff" alt="Unity" class="h-8 w-8" />
				<img
					src="https://img.icons8.com/?size=100&id=111972&format=png&color=ffffff"
					alt="C#"
					class="h-8 w-8"
				/>
				<img src="https://cdn.simpleicons.org/itch.io/ffffff" alt="Itch.io" class="h-8 w-8" />
			</div>
		</div>
		<div class="mt-4 flex flex-col items-start justify-center gap-2 text-gray-300">
			<p class="text-justify text-gray-300">Fatebound is a 2d fighting game developed in Unity.</p>
			<a href="https://arpthef.itch.io/fatebound" target="_blank" rel="noopener noreferrer">
				<button
					type="button"
					class="py-2 text-gray-400 transition duration-300 hover:text-white hover:underline"
				>
					View on Itch.io
				</button>
			</a>
		</div>
	</div>

	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 p-6 md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<p class="text-justify text-gray-300">
			I made this game as a personal project to learn more about Unity and C#. It features a combat
			system with a boss battle.
		</p>

		<div class="mt-4 space-y-4">
			<div class="flex gap-4">
				<button
					type="button"
					aria-label="Open full-size Pymailer screenshot"
					class="w-1/2 cursor-pointer rounded-lg border-none bg-transparent p-0 shadow-lg"
					on:click={() => openModal('/assets/fatebound.png')}
				>
					<img
						src="/assets/fatebound.png"
						alt="Fatebound screenshot"
						class="w-full rounded-lg shadow-lg"
					/>
				</button>

				<button
					type="button"
					aria-label="Open full-size Pymailer2 screenshot"
					class="w-1/2 cursor-pointer rounded-lg border-none bg-transparent p-0 shadow-lg"
					on:click={() => openModal('/assets/fatebound2.png')}
				>
					<img
						src="/assets/fatebound2.png"
						alt="Fatebound screenshot 2"
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
			alt="Pymailer screenshot in full view"
			class="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
		/>
	</div>
{/if}
