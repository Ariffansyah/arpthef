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
	class="relative z-10 flex min-h-[calc(100vh-126px)] flex-col items-center justify-center px-4"
>
	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-6 rounded-sm border border-pink-200 bg-white/60 p-10 shadow-[0_20px_60px_rgba(255,182,193,0.5)] transition duration-300 hover:scale-[1.02] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="flex w-full flex-row items-center justify-between">
			<div class="flex flex-col">
				<h1
					class="border-b-4 border-pink-500 pb-2 text-5xl font-black tracking-tighter text-gray-900 uppercase"
				>
					Contact
				</h1>
			</div>
		</div>

		<div class="mt-2 space-y-4">
			<p class="text-justify leading-relaxed font-medium text-gray-800">
				Feel free to reach out to me for any inquiries, collaborations, or just to say hello! I am
				always open to new opportunities and discussions.
			</p>

			<div class="rounded-sm border-l-4 border-pink-500 bg-white/40 p-4 shadow-sm">
				<p class="mb-1 text-xs font-black tracking-widest text-pink-600 uppercase">Email Me</p>
				<a
					href="mailto:me@arpthef.my.id"
					class="text-lg font-bold text-gray-900 transition-colors hover:text-pink-600"
				>
					me@arpthef.my.id
				</a>
			</div>

			<div class="pt-4">
				<p class="mb-4 text-xs font-black tracking-widest text-gray-400 uppercase">Social Media</p>
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<a
						href="https://github.com/Ariffansyah"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-3 rounded-sm border border-pink-100 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-md transition-all hover:bg-pink-500 hover:text-white"
						aria-label="Visit my GitHub profile"
					>
						<i class="fa-brands fa-github text-lg"></i> GitHub
					</a>
					<a
						href="https://www.linkedin.com/in/arpthef/"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-3 rounded-sm border border-pink-100 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-md transition-all hover:bg-pink-500 hover:text-white"
						aria-label="Visit my LinkedIn profile"
					>
						<i class="fa-brands fa-linkedin text-lg"></i> LinkedIn
					</a>
					<a
						href="https://x.com/nishimiyaa12"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-3 rounded-sm border border-pink-100 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-md transition-all hover:bg-pink-500 hover:text-white"
						aria-label="Visit my X profile"
					>
						<i class="fa-brands fa-x-twitter text-lg"></i> X
					</a>
					<a
						href="https://www.instagram.com/arppthef/"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-3 rounded-sm border border-pink-100 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-md transition-all hover:bg-pink-500 hover:text-white"
						aria-label="Visit my Instagram profile"
					>
						<i class="fa-brands fa-instagram text-lg"></i> Instagram
					</a>
				</div>
			</div>
		</div>
	</div>
</section>
