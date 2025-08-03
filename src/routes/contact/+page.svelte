<script lang="ts">
	import { intersect } from '$lib/actions/intersect';
</script>

<section class="flex min-h-[calc(100vh-126px)] flex-col items-center justify-center px-4">
	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="flex w-full flex-row items-center justify-between text-white">
			<div class="flex flex-col">
				<h1 class="text-5xl font-bold text-gray-300">Contact</h1>
			</div>
		</div>
		<div class="mt-4">
			<p class="text-justify text-gray-300">
				Feel free to reach out to me for any inquiries, collaborations, or just to say hello!<br />
				I’m always open to new opportunities and discussions.
			</p>
			<p class="mt-4 text-gray-300">
				You can contact me via email at <a href="mailto:me@arpthef.my.id" class="text-blue-500"
					>me@arpthef.my.id</a
				>
			</p>
			<p class="mt-4 text-gray-300">Or connect with me on social media:</p>
			<div class="mt-4 flex flex-col gap-2">
				<a
					href="https://github.com/Ariffansyah"
					target="_blank"
					rel="noopener noreferrer"
					class="text-blue-500 hover:underline"
					aria-label="Visit my GitHub profile"
				>
					<i class="fa-brands fa-github" style="color: #deddda;"></i> GitHub
				</a>
				<a
					href="https://www.linkedin.com/in/arpthef/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-blue-500 hover:underline"
					aria-label="Visit my LinkedIn profile"
				>
					<i class="fa-brands fa-linkedin" style="color: #deddda;"></i> LinkedIn
				</a>
				<a
					href="https://x.com/nishimiyaa12"
					target="_blank"
					rel="noopener noreferrer"
					class="text-blue-500 hover:underline"
					aria-label="Visit my X profile"
				>
					<i class="fa-brands fa-x-twitter" style="color: #deddda;"></i> X
				</a>
				<a
					href="https://www.instagram.com/arppthef/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-blue-500 hover:underline"
					aria-label="Visit my Instagram profile"
				>
					<i class="fa-brands fa-instagram" style="color: #deddda;"></i> Instagram
				</a>
			</div>
		</div>
	</div>
</section>
