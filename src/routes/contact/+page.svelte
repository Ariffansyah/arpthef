<script lang="ts">
	import { intersect } from '$lib/actions/intersect';
</script>

<svelte:head>
	<title>Contact - arp</title>
	<meta
		name="description"
		content="Reach out to Mohammad Ariffansyah for collaborations and inquiries."
	/>
	<meta
		name="keywords"
		content="contact, arp, arpthef, mohammad, ariffansyah, developer, programmer, backend, frontend, fullstack"
	/>
	<meta name="author" content="Mohammad Ariffansyah" />
	<meta property="og:title" content="Contact - arp" />
	<meta property="og:image" content="https://arpthef.my.id/Logo.webp" />
	<meta property="og:description" content="Mohammad Ariffansyah Contact." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://arpthef.my.id/contact" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Contact - arp" />
	<meta name="twitter:description" content="Mohammad Ariffansyah Contact." />
	<link rel="canonical" href="https://arpthef.my.id/contact" />
</svelte:head>

<section
	class="relative z-10 flex min-h-[calc(100vh-126px)] w-full flex-col justify-center px-6 py-12 lg:px-20 lg:py-24"
>
	<div class="mb-20 flex flex-col gap-8" use:intersect={{ threshold: 0.3, once: true }}>
		<h1 class="font-display plates text-7xl leading-none text-ink lg:text-[10rem]">
			Get in<br /><span class="judul-komik">Touch</span>
		</h1>
		<p class="narasi">Collaborations & Inquiries</p>
	</div>

	<div class="grid grid-cols-1 gap-16 xl:grid-cols-2">
		<div class="flex flex-col gap-8">
			<p class="text-xl leading-relaxed font-medium text-ink-muted md:text-2xl lg:max-w-xl">
				Feel free to reach out for inquiries, collaborations, or just to say hello. I am always open
				to <span class="bg-pop px-1 text-on-pop box-decoration-clone">new opportunities</span> and discussions.
			</p>

			<div class="komik flex w-fit max-w-full flex-col gap-3 rounded-md bg-card p-6">
				<p class="narasi">Email Me</p>
				<a
					href="mailto:arppthef@outlook.co.id"
					class="text-xl font-bold wrap-anywhere text-ink underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:text-brand md:text-2xl"
				>
					arppthef@outlook.co.id
				</a>
			</div>
		</div>

		<div class="flex flex-col gap-8 xl:items-end xl:justify-end">
			<p class="narasi">Social Media</p>
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:w-full xl:max-w-md">
				<a
					href="https://github.com/Ariffansyah"
					target="_blank"
					rel="noopener noreferrer"
					class="tekan bg-card text-ink hover:bg-pop hover:text-on-pop flex items-center justify-between rounded-md px-4 py-3 text-xs font-bold tracking-widest uppercase"
					aria-label="Visit my GitHub profile"
				>
					<span>GitHub</span> <i class="fa-brands fa-github text-lg"></i>
				</a>
				<a
					href="https://www.linkedin.com/in/arpthef/"
					target="_blank"
					rel="noopener noreferrer"
					class="tekan bg-card text-ink hover:bg-pop hover:text-on-pop flex items-center justify-between rounded-md px-4 py-3 text-xs font-bold tracking-widest uppercase"
					aria-label="Visit my LinkedIn profile"
				>
					<span>LinkedIn</span> <i class="fa-brands fa-linkedin text-lg"></i>
				</a>
				<a
					href="https://x.com/nishimiyaa12"
					target="_blank"
					rel="noopener noreferrer"
					class="tekan bg-card text-ink hover:bg-pop hover:text-on-pop flex items-center justify-between rounded-md px-4 py-3 text-xs font-bold tracking-widest uppercase"
					aria-label="Visit my X profile"
				>
					<span>X (Twitter)</span> <i class="fa-brands fa-x-twitter text-lg"></i>
				</a>
				<a
					href="https://www.instagram.com/_arpchive/"
					target="_blank"
					rel="noopener noreferrer"
					class="tekan bg-card text-ink hover:bg-pop hover:text-on-pop flex items-center justify-between rounded-md px-4 py-3 text-xs font-bold tracking-widest uppercase"
					aria-label="Visit my Instagram profile"
				>
					<span>Instagram</span> <i class="fa-brands fa-instagram text-lg"></i>
				</a>
			</div>
		</div>
	</div>
</section>
