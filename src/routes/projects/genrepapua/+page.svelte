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
			<h1 class="text-3xl font-bold">GenRe Papua</h1>
			<div class="mt-5 flex flex-row items-center gap-2">
				<img src="https://cdn.simpleicons.org/svelte/ffffff" alt="SvelteKit" class="h-8 w-8" />
				<img src="https://cdn.simpleicons.org/typescript/ffffff" alt="TypeScript" class="h-8 w-8" />
			</div>
		</div>
		<div class="mt-4 flex flex-col items-start justify-center gap-2 text-gray-300">
			<p class="text-justify text-gray-300">
				GenRe Papua Official Website. Contributed to the design and development of the GenRe Papua
				official website, empowering youth initiatives and organizational outreach in Papua.
			</p>
			<a href="https://genrepapua.id" target="_blank" rel="noopener noreferrer">
				<button
					type="button"
					class="py-2 text-gray-400 transition duration-300 hover:text-white hover:underline"
				>
					View on GenRe Papua
				</button>
			</a>
		</div>
	</div>

	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 p-6 md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<p class="text-justify text-gray-300">
			As a member of the organization, I collaborated on the GenRe Papua official website project to
			support youth empowerment and health education initiatives in Papua. My responsibilities
			included developing user interfaces using Svelte, optimizing the website for accessibility and
			performance, and ensuring seamless content management for organizational stakeholders. This
			project showcases my ability to work in a team environment, deliver impactful digital
			solutions, and contribute to the mission of a non-profit organization serving the Papua
			communitye
		</p>

		<div class="mt-4 space-y-4">
			<button
				type="button"
				class="w-full py-2 text-gray-400 transition duration-300 hover:text-white hover:underline"
				on:click={() => openModal('/assets/genrepapua.png')}
			>
				<img
					src="/assets/genrepapua.png"
					alt="genrepapua screenshot"
					class="h-[300px] w-full rounded-lg object-cover object-top shadow-lg"
				/>
			</button>

			<div class="flex gap-4">
				<button
					type="button"
					aria-label="Open full-size Pymailer screenshot"
					class="w-1/2 cursor-pointer rounded-lg border-none bg-transparent p-0 shadow-lg"
					on:click={() => openModal('/assets/genrepapua2.png')}
				>
					<img
						src="/assets/genrepapua2.png"
						alt="genrepapua screenshot 2"
						class="object-center-top h-[500px] w-full rounded-lg object-cover shadow-lg"
					/>
				</button>

				<button
					type="button"
					aria-label="Open full-size Pymailer2 screenshot"
					class="w-1/2 cursor-pointer rounded-lg border-none bg-transparent p-0 shadow-lg"
					on:click={() => openModal('/assets/genrepapua3.png')}
				>
					<img
						src="/assets/genrepapua3.png"
						alt="genrepapua screenshot 3"
						class="object-center-top h-[500px] w-full rounded-lg object-cover shadow-lg"
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
