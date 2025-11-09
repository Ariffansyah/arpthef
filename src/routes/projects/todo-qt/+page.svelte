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
	<title>TODO QT - arp</title>
	<meta
		name="description"
		content="A simple cross-platform desktop application for managing your tasks."
	/>
	<meta name="keywords" content="TODO QT, C++, Qt, SQLite, Task Management, Desktop Application" />
	<meta name="author" content="arp" />
	<meta property="og:title" content="TODO QT - arp" />
	<meta
		property="og:description"
		content="A simple cross-platform desktop application for managing your tasks."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://arpthef.my.id/projects/todo-qt" />
	<meta property="og:image" content="https://arpthef.my.id/assets/todo-qt.webp" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="TODO QT - arp" />
	<meta
		name="twitter:description"
		content="A simple cross-platform desktop application for managing your tasks."
	/>
	<meta name="twitter:image" content="https://arpthef.my.id/assets/todo-qt.webp" />
</svelte:head>

<section class="mx-3 flex flex-col justify-center md:mx-auto">
	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="flex w-full flex-col items-start text-white">
			<h1 class="text-3xl font-bold">TODO QT</h1>
			<div class="mt-5 flex flex-row items-center gap-2">
				<img src="https://cdn.simpleicons.org/cplusplus/ffffff" alt="C++" class="h-8 w-8" />
				<img src="https://cdn.simpleicons.org/qt/ffffff" alt="Qt" class="h-8 w-8" />
				<img src="https://cdn.simpleicons.org/sqlite/ffffff" alt="SQLite" class="h-8 w-8" />
			</div>
		</div>
		<div class="mt-4 flex flex-col items-start justify-center gap-2 text-gray-300">
			<p class="text-justify text-gray-300">
				TODO QT is a simple, cross-platform desktop application for managing your tasks.
			</p>
			<a href="https://github.com/Ariffansyah/TODO-QT" target="_blank" rel="noopener noreferrer">
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
			TODO QT is a simple, cross-platform desktop application for managing your tasks. It is built
			using C++, Qt framework and SQLite, providing a user-friendly interface for task management.
		</p>

		<div class="mt-4 space-y-4">
			<div class="flex gap-4">
				<button
					type="button"
					aria-label="Open full-size TODO QT screenshot"
					class="w-full cursor-pointer rounded-lg border-none bg-transparent p-0 shadow-lg"
					on:click={() => openModal('/assets/todo-qt.webp')}
				>
					<img
						src="/assets/todo-qt.webp"
						alt="TODO QT screenshot"
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
			alt="TODO QT screenshot in full view"
			class="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
		/>
	</div>
{/if}
