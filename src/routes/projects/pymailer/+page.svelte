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
	<title>PyMailer - arp</title>
	<meta
		name="description"
		content="A desktop email sender built with Python and CustomTkinter, supporting both Mailtrap sandbox and transactional SMTP for sending plain text or HTML emails."
	/>
	<meta
		name="keywords"
		content="PyMailer, Python, CustomTkinter, Mailtrap, SMTP, Email Sender, Desktop Application"
	/>
	<meta name="author" content="arp" />
	<meta property="og:title" content="PyMailer - arp" />
	<meta
		property="og:description"
		content="A desktop email sender built with Python and CustomTkinter, supporting both Mailtrap sandbox and transactional SMTP for sending plain text or HTML emails."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://arpthef.my.id/projects/pymailer" />
	<meta property="og:image" content="https://arpthef.my.id/assets/pymailer.webp" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="PyMailer - arp" />
	<meta
		name="twitter:description"
		content="A desktop email sender built with Python and CustomTkinter, supporting both Mailtrap sandbox and transactional SMTP for sending plain text or HTML emails."
	/>
	<meta name="twitter:image" content="https://arpthef.my.id/assets/pymailer.webp" />
</svelte:head>

<section class="mx-3 flex flex-col justify-center md:mx-auto">
	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="flex w-full flex-col items-start text-white">
			<h1 class="text-3xl font-bold">PyMailer - Mailtrap Email Sender</h1>
			<div class="mt-5 flex flex-row items-center gap-2">
				<img src="https://cdn.simpleicons.org/python/ffffff" alt="Python" class="h-8 w-8" />
				<img src="https://cdn.simpleicons.org/mailtrap/ffffff" alt="Mailtrap" class="h-8 w-8" />
			</div>
		</div>
		<div class="mt-4 flex flex-col items-start justify-center gap-2 text-gray-300">
			<p class="text-justify text-gray-300">
				A desktop email sender built with Python and CustomTkinter, supporting both Mailtrap sandbox
				and transactional SMTP for sending plain text or HTML emails.
			</p>
			<a href="https://github.com/Ariffansyah/PyMailer" target="_blank" rel="noopener noreferrer">
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
			PyMailer is a modern desktop application designed for sending emails conveniently from your
			computer. Built using Python and CustomTkinter, it provides a stylish, user-friendly interface
			for composing and sending both plain text and HTML emails. The application integrates with
			Mailtrap’s SMTP services, supporting both sandbox (testing) and transactional (real delivery)
			modes. With PyMailer, users can send emails to one or multiple recipients, save their email
			and SMTP credentials securely, and enjoy an enhanced composition experience with a resizable
			window and keyboard shortcuts.
		</p>

		<div class="mt-4 space-y-4">
			<div class="flex gap-4">
				<button
					type="button"
					aria-label="Open full-size Pymailer screenshot"
					class="w-1/2 cursor-pointer rounded-lg border-none bg-transparent p-0 shadow-lg"
					on:click={() => openModal('/assets/pymailer.webp')}
				>
					<img
						src="/assets/pymailer.webp"
						alt="PyMailer screenshot"
						class="w-full rounded-lg shadow-lg"
					/>
				</button>

				<button
					type="button"
					aria-label="Open full-size Pymailer2 screenshot"
					class="w-1/2 cursor-pointer rounded-lg border-none bg-transparent p-0 shadow-lg"
					on:click={() => openModal('/assets/pymailer2.webp')}
				>
					<img
						src="/assets/pymailer2.webp"
						alt="PyMailer screenshot 2"
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
