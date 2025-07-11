<script lang="ts">
	import TechnologiesData from '$lib/assets/JSON/tehcnologies.json';
	import ExperienceData from '$lib/assets/JSON/experience.json';
	import ProjectsData from '$lib/assets/JSON/projects.json';
	import { intersect } from '$lib/actions/intersect';
	import { customAlert } from '$lib/components/customAlerts';
	import { handleHistory } from '$lib/components/handleHistory';
	import { onMount } from 'svelte';

	const textColors = [
		'text-cyan-400',
		'text-pink-400',
		'text-lime-400',
		'text-yellow-400',
		'text-purple-400',
		'text-green-400',
		'text-red-400',
		'text-blue-400',
		'text-orange-400',
		'text-indigo-400',
		'text-emerald-400',
		'text-fuchsia-400',
		'text-sky-400',
		'text-amber-400',
		'text-violet-400'
	];
	const bgColors = [
		'bg-cyan-400',
		'bg-pink-400',
		'bg-lime-400',
		'bg-yellow-400',
		'bg-purple-400',
		'bg-green-400',
		'bg-red-400',
		'bg-blue-400',
		'bg-orange-400',
		'bg-indigo-400',
		'bg-emerald-400',
		'bg-fuchsia-400',
		'bg-sky-400',
		'bg-amber-400',
		'bg-violet-400'
	];

	const technologies = TechnologiesData;
	const experience = ExperienceData;
	const projects = ProjectsData;

	function openTiktaktoe() {
		tiktaktoeVisible = true;
	}

	function closeTiktaktoe() {
		tiktaktoeVisible = false;
	}

	function resetTiktaktoe() {
		board = Array(9).fill(null);
	}

	function handleTiktaktoeKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeTiktaktoe();
		}
	}

	let tiktaktoeVisible = false;
	let board = Array(9).fill(null);
	let currentPlayer = 'x';

	function handleTiktaktoeClick(index: any) {
		if (!board[index]) {
			board[index] = currentPlayer;
			const row = Math.floor(index / 3);
			const col = index % 3;

			const rowWin =
				board[row * 3] === currentPlayer &&
				board[row * 3 + 1] === currentPlayer &&
				board[row * 3 + 2] === currentPlayer;

			const colWin =
				board[col] === currentPlayer &&
				board[col + 3] === currentPlayer &&
				board[col + 6] === currentPlayer;

			const diag1Win =
				index % 4 === 0 &&
				board[0] === currentPlayer &&
				board[4] === currentPlayer &&
				board[8] === currentPlayer;

			const diag2Win =
				index % 2 === 0 &&
				index !== 0 &&
				index !== 8 &&
				board[2] === currentPlayer &&
				board[4] === currentPlayer &&
				board[6] === currentPlayer;

			const isDraw = board.every((cell) => cell !== null);

			if (rowWin || colWin || diag1Win || diag2Win) {
				customAlert(`${currentPlayer} wins!`);
				resetTiktaktoe();
				return;
			}

			if (isDraw) {
				customAlert('Draw!');
				resetTiktaktoe();
				return;
			}

			currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
		}
	}

	const sectionIds = ['arpthef', 'technologies', 'experiences', 'projects'];
	let currentSectionIndex = 0;
	let showScrollTop = false;
	let showScrollBottom = false;

	function isSectionInView(el: HTMLElement | null): boolean {
		if (!el) return false;
		const rect = el.getBoundingClientRect();
		return Math.abs(rect.top) < 5;
	}

	function updateSectionIndexAndVisibility() {
		let closestSection = 0;
		let minDistance = Infinity;
		sectionIds.forEach((id, i) => {
			const el = document.getElementById(id);
			if (el) {
				const rect = el.getBoundingClientRect();
				const distance = Math.abs(rect.top);
				if (distance < minDistance) {
					minDistance = distance;
					closestSection = i;
				}
			}
		});
		currentSectionIndex = closestSection;

		showScrollTop =
			currentSectionIndex > 0 &&
			!isSectionInView(document.getElementById(sectionIds[currentSectionIndex - 1]));
		showScrollBottom =
			currentSectionIndex < sectionIds.length - 1 &&
			!isSectionInView(document.getElementById(sectionIds[currentSectionIndex + 1]));
	}

	function scrollToSection(index: number) {
		const section = document.getElementById(sectionIds[index]);
		if (section) {
			(e: any) => handleHistory(e, `#${sectionIds[index]}`);
			section.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', updateSectionIndexAndVisibility);
	}

	onMount(() => {
		updateSectionIndexAndVisibility();
	});
</script>

<section class="mx-3 flex flex-col justify-center md:mx-auto">
	<div
		id="arpthef"
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 shadow-[0_0_10px_rgba(255,255,255,0.15)] transition duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3 }}
	>
		<div class="flex w-full flex-row items-start justify-between text-white">
			<div class="flex flex-col">
				<h1 class="text-3xl font-bold">arpthef</h1>
				<p class="text-sm text-gray-400">Surabaya, Indonesia</p>
			</div>

			<div class="flex items-center">
				<a
					href="https://github.com/Ariffansyah"
					aria-label="GitHub Profile"
					target="_blank"
					rel="noopener noreferrer"
					class="text-gray-400 hover:text-white"
				>
					<i class="fa-brands fa-github fa-xl"></i>
				</a>
				<a
					href="https://www.linkedin.com/in/arpthef/"
					aria-label="LinkedIn Profile"
					target="_blank"
					rel="noopener noreferrer"
					class="ml-4 text-gray-400 hover:text-white"
				>
					<i class="fa-brands fa-linkedin fa-xl"></i>
				</a>
			</div>
		</div>
		<div class="mt-4 flex flex-col items-start justify-center gap-2">
			<p class="text-justify text-gray-300">
				Hi, I'm an undergraduate college student passionate about technology and software
				development. I’m more into backend, but I also work with frontend.
			</p>
			<button
				class="mt-2 rounded py-2 text-gray-300 transition duration-200 hover:underline"
				on:click={openTiktaktoe}
			>
				Tiktaktoe
			</button>
		</div>
	</div>
	<div
		id="technologies"
		class="animate-fade-in mx-auto my-6 flex w-full flex-col items-start justify-center gap-4 p-4 md:w-1/3"
		use:intersect={{ threshold: 0.3 }}
	>
		<h1 class="mb-2 text-2xl font-bold text-white md:text-3xl">Most use technologies</h1>
		<div class="grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
			{#each technologies as tech}
				<div
					class="bg-darkgray flex w-full flex-col items-start gap-2 rounded px-2 py-1 transition duration-200 hover:scale-105 md:px-3 md:py-2"
				>
					<div class="flex flex-row items-center gap-2">
						<img src={tech.icon} alt={tech.alt} class="h-5 w-5 md:h-6 md:w-6" />
						<span class="text-sm text-gray-200">{tech.name}</span>
					</div>
					<p class="text-xs text-gray-400 md:text-sm">{tech.description}</p>
				</div>
			{/each}
		</div>
	</div>
	<div
		id="experiences"
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 p-6 md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3 }}
	>
		<div class="flex w-full flex-row items-center justify-between">
			<h1 class="mb-2 text-3xl font-bold text-white">Experiences</h1>
			<a href="/about" class="text-sm text-gray-400 hover:text-white"> See all</a>
		</div>
		<div class="h-auto">
			<div class="relative ml-6 border-l border-gray-700">
				{#each experience.slice(0, 3) as exp, i}
					<div class="relative pb-10 pl-6">
						<div
							class="absolute top-1.5 -left-1.5 h-3 w-3 rounded-full {bgColors[
								i % bgColors.length
							]}"
						></div>
						<p class="text-sm font-medium {textColors[i % textColors.length]}">{exp.company}</p>
						<h3 class="text-lg font-bold">{exp.title}</h3>
						<p class="text-sm text-gray-400">{exp.date}</p>
						<p class="mt-1 text-justify text-gray-300">{exp.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
	<div
		id="projects"
		class="animate-fade-in my-6 flex w-full flex-col items-start justify-center gap-4 p-6 md:mx-auto md:w-1/3"
		use:intersect={{ threshold: 0.3 }}
	>
		<div class="flex w-full flex-row items-center justify-between">
			<h1 class="mb-2 text-3xl font-bold text-white">Recent projects</h1>
			<a href="/projects" class="text-sm text-gray-400 hover:text-white"> See all</a>
		</div>

		<div class="h-full w-full pr-2">
			{#each projects.slice(0, 3) as project}
				<div
					class="mb-4 flex w-full flex-col items-start justify-center gap-2 transition duration-300 hover:scale-105"
				>
					<div class="relative w-full">
						<img
							src={project.projectImage}
							alt={project.projectName}
							class=" h-64 w-full rounded-lg object-cover opacity-70 shadow-lg"
						/>
						<a href={project.projectLink} rel="noopener noreferrer">
							<div
								class="absolute bottom-0 left-0 h-full w-full rounded-b-lg bg-gradient-to-t from-black/100 via-black/70 to-transparent transition duration-300 hover:bg-gradient-to-t hover:from-black/80 hover:via-black/30 hover:to-transparent"
							>
								<div class="absolute bottom-2 left-2 m-3 flex flex-col gap-2">
									<h2 class="text-xl font-bold text-white">{project.projectName}</h2>
									<div class="flex flex-row items-center gap-2">
										{#each project.technologies as tech}
											<img src={tech.icon} alt={tech.name} class="h-8 w-8" />
										{/each}
									</div>
									<p class="text-sm text-gray-300">{project.projectDescription}</p>
								</div>
							</div>
						</a>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<a
		href="/contact"
		class="animate-fade-in mx-auto mb-6 w-full max-w-md"
		use:intersect={{ threshold: 0.3 }}
	>
		<button
			class="w-full px-4 py-2 font-bold text-gray-400 transition duration-200 hover:text-white hover:underline"
		>
			Contact me
		</button>
	</a>
</section>

{#if showScrollTop}
	<button
		class="text-gray-white fixed top-4 left-1/2 z-50 min-w-[120px] -translate-x-1/2 rounded-lg px-4 py-2 text-base shadow transition md:top-8 md:text-lg md:text-gray-400 md:hover:text-white"
		on:click={() => scrollToSection(currentSectionIndex - 1)}
		aria-label="Scroll Top"
	>
		<i class="fa-solid fa-chevron-up"></i>
	</button>
{/if}

{#if showScrollBottom}
	<button
		class="fixed bottom-4 left-1/2 z-50 min-w-[120px] -translate-x-1/2 rounded-lg px-4 py-2 text-base text-white shadow transition md:bottom-8 md:text-lg md:text-gray-400 md:hover:text-white"
		on:click={() => scrollToSection(currentSectionIndex + 1)}
		aria-label="Scroll Bottom"
	>
		<i class="fa-solid fa-chevron-down"></i>
	</button>
{/if}

{#if tiktaktoeVisible}>Here are some of my recent projects that I have worked on. You can find more
	on my GitHub.
	<div
		role="dialog"
		aria-modal="true"
		tabindex="0"
		class="bg-opacity-80 fixed inset-0 z-50 flex items-center justify-center bg-black"
		on:keydown={handleTiktaktoeKeydown}
	>
		<div
			class="
			bg-darkgray relative flex h-[500px] w-[500px] flex-col items-center justify-center rounded-lg p-5 shadow-lg"
		>
			<button
				class="absolute top-2 right-2 text-gray-400 hover:text-white"
				on:click={closeTiktaktoe}
				aria-label="Close Tiktaktoe"
			>
				<i class="fa-solid fa-xmark fa-lg"></i>
			</button>
			<table class="h-full w-full">
				<thead>
					<tr>
						<th colspan="3" class="text-center text-lg font-bold text-white">Tiktaktoe</th>
					</tr>
				</thead>
				<tbody>
					{#each [0, 1, 2] as row}
						<tr>
							{#each [0, 1, 2] as col}
								<td class="w-1/3 items-center justify-center">
									<button
										class="h-28 w-28 border border-white text-3xl"
										on:click={() => handleTiktaktoeClick(row * 3 + col)}
									>
										{board[row * 3 + col] ?? ' '}
									</button>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
			<button
				class="mt-x absolute right-2 bottom-2 text-gray-400 hover:text-white"
				on:click={resetTiktaktoe}
				aria-label="Reset Tiktaktoe"
			>
				<i class="fa-solid fa-rotate-right"></i>
			</button>
		</div>
	</div>
{/if}

<style>
	.bg-darkgray {
		background-color: #222222;
	}
	.max-h-\[500px\]::-webkit-scrollbar {
		height: 8px;
		width: 8px;
	}
	.max-h-\[500px\]::-webkit-scrollbar-thumb {
		background: #444;
		border-radius: 4px;
	}
	.max-h-\[500px\]::-webkit-scrollbar-track {
		background: #222;
		border-radius: 4px;
	}
</style>
