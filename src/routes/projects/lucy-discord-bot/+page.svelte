<script lang="ts">
	import { intersect } from '$lib/actions/intersect';
</script>

<section class="mx-3 flex flex-col justify-center md:mx-auto">
	<div
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3, once: true }}
	>
		<div class="flex w-full flex-col items-start text-white">
			<h1 class="text-3xl font-bold">Lucy - Discord bot</h1>
			<div class="mt-5 flex flex-row items-center gap-2">
				<img src="https://cdn.simpleicons.org/go/ffffff" alt="GO" class="h-8 w-8" />
				<img src="https://cdn.simpleicons.org/discord/ffffff" alt="Discord" class="h-8 w-8" />
				<img src="https://cdn.simpleicons.org/sqlite/ffffff" alt="Sqlite" class="h-8 w-8" />
			</div>
		</div>
		<div class="mt-4 flex flex-col items-start justify-center gap-2 text-gray-300">
			<p class="text-justify text-gray-300">
				Lucy is a Discord bot designed to enchance your Discord server experience with Join To
				Create feature.
			</p>
			<a href="https://github.com/Ariffansyah/Lucy" target="_blank" rel="noopener noreferrer">
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
			Lucy is a Discord bot written in Go, primarily designed to facilitate the "join to create"
			feature—allowing users to automatically generate their own temporary voice channels when they
			join a designated channel. Built for performance and reliability, Lucy makes server management
			easier and enhances the user experience with seamless, automated voice channel creation.
		</p>
	</div>
</section>
