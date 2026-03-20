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
	<div class="mb-20 flex flex-col gap-4" use:intersect={{ threshold: 0.3, once: true }}>
		<h1 class="text-5xl font-black tracking-tighter text-gray-900 lg:text-9xl">
			Get in<br /><span class="text-pink-500">Touch</span>
		</h1>
		<p class="text-[10px] font-black tracking-[0.5em] text-gray-400 uppercase">
			Collaborations & Inquiries
		</p>
	</div>

	<div class="grid grid-cols-1 gap-16 lg:grid-cols-2">
		<div class="flex flex-col gap-8">
			<p class="text-xl leading-relaxed font-medium text-gray-600 md:text-2xl lg:max-w-xl">
				Feel free to reach out for inquiries, collaborations, or just to say hello. I am always open
				to <span class="text-gray-900 underline decoration-pink-200 decoration-4"
					>new opportunities</span
				> and discussions.
			</p>

			<div class="group flex flex-col gap-2">
				<p class="text-[10px] font-black tracking-widest text-pink-500 uppercase">Email Me</p>
				<a
					href="mailto:arppthef@outlook.co.id"
					class="text-2xl font-black tracking-tighter text-gray-900 transition-colors hover:text-pink-600 md:text-4xl"
				>
					arppthef@outlook.co.id
				</a>
			</div>
		</div>

		<div class="flex flex-col gap-8 lg:items-end lg:justify-end">
			<p class="text-[10px] font-black tracking-widest text-gray-400 uppercase lg:text-right">
				Social Media
			</p>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:w-full lg:max-w-md">
				<a
					href="https://github.com/Ariffansyah"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center justify-between border-b border-gray-100 py-4 text-xs font-black tracking-widest text-gray-700 uppercase transition-all hover:border-pink-500 hover:text-pink-500"
					aria-label="Visit my GitHub profile"
				>
					<span>GitHub</span> <i class="fa-brands fa-github text-lg"></i>
				</a>
				<a
					href="https://www.linkedin.com/in/arpthef/"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center justify-between border-b border-gray-100 py-4 text-xs font-black tracking-widest text-gray-700 uppercase transition-all hover:border-pink-500 hover:text-pink-500"
					aria-label="Visit my LinkedIn profile"
				>
					<span>LinkedIn</span> <i class="fa-brands fa-linkedin text-lg"></i>
				</a>
				<a
					href="https://x.com/nishimiyaa12"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center justify-between border-b border-gray-100 py-4 text-xs font-black tracking-widest text-gray-700 uppercase transition-all hover:border-pink-500 hover:text-pink-500"
					aria-label="Visit my X profile"
				>
					<span>X (Twitter)</span> <i class="fa-brands fa-x-twitter text-lg"></i>
				</a>
				<a
					href="https://www.instagram.com/_arpchive/"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center justify-between border-b border-gray-100 py-4 text-xs font-black tracking-widest text-gray-700 uppercase transition-all hover:border-pink-500 hover:text-pink-500"
					aria-label="Visit my Instagram profile"
				>
					<span>Instagram</span> <i class="fa-brands fa-instagram text-lg"></i>
				</a>
			</div>
		</div>
	</div>
</section>
