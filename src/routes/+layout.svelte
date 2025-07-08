<script lang="ts">
	import '../app.css';

	let isOpen = false;

	function handleHumberg() {
		isOpen = !isOpen;
	}
</script>

<nav class="relative z-50 px-4 py-6">
	<div
		class="bg-softblack mx-auto flex max-w-7xl flex-col md:max-w-2/5 md:flex-row md:items-center"
	>
		<div class="flex w-full items-center justify-between">
			<a class="text-xl font-bold" href="/">arpthef</a>

			<button
				class="relative flex h-6 w-8 flex-col justify-between md:hidden"
				onclick={handleHumberg}
				aria-label="Toggle navigation"
				aria-expanded={isOpen}
				aria-controls="nav-menu"
				type="button"
			>
				<span
					class="block h-0.5 w-full origin-center bg-white transition-transform duration-300"
					style:transform={isOpen ? 'rotate(45deg) translateY(7px)' : 'none'}
				></span>
				<span
					class="block h-0.5 w-full origin-center bg-white transition-opacity duration-300"
					style:opacity={isOpen ? '0' : '1'}
				></span>
				<span
					class="block h-0.5 w-full origin-center bg-white transition-transform duration-300"
					style:transform={isOpen ? 'rotate(-45deg) translateY(-7px)' : 'none'}
				></span>
			</button>
		</div>

		<ul
			id="nav-menu"
			class={`bg-softblack flex-col items-start gap-2 px-2 py-4 transition-all duration-300 sm:w-full md:static md:mt-0 md:flex md:w-auto md:flex-row md:gap-8 md:bg-transparent md:p-0 ${
				isOpen ? 'flex' : 'hidden'
			} md:flex`}
		>
			<!-- <li><a href="/about">About</a></li> -->
			<li><a href="/projects">Project</a></li>
			<li><a href="/contact">Contact</a></li>
		</ul>
	</div>
</nav>

<slot />

<footer class="bg-softblack px-4 py-6 text-center text-gray-400">
	<p>&copy; {new Date().getFullYear()} arpthef. All rights reserved.</p>
</footer>

<style>
	.bg-softblack {
		background-color: #0f0f0f;
	}
</style>
