<script lang="ts">
	import { resolve } from '$app/paths';
  import { page } from '$app/stores';
</script>

<section class="flex min-h-screen flex-col items-center justify-center px-4">
	<div
		class="my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
	>
		<div class="flex w-full flex-row items-center justify-between text-white">
			<div class="flex flex-col">
				<h1 class="text-5xl font-bold text-red-400">{$page.status}</h1>
				<p class="mt-1 text-lg text-gray-400">
					{$page.error?.message || 'The page you are looking for does not exist.'}
				</p>
			</div>
		</div>
		<div class="mt-4">
			<p class="text-justify text-gray-300">
				An error occurred while processing your request. Please try again later or contact support
				if the problem persists.
			</p>
		</div>
		<a
			class="mt-4 rounded px-6 py-2 font-bold text-gray-400 transition hover:bg-gray-300 hover:text-black"
			href={resolve("/")}
			aria-label="Go back to homepage"
		>
			← Back to Home
		</a>
	</div>
</section>
