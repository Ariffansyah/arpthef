<script lang="ts">
	import { intersect } from '$lib/actions/intersect';
	import { cubicOut } from 'svelte/easing';
	import { resolve } from '$app/paths';

	function bioAnimation(_node: HTMLElement, { duration }: { duration: number }) {
		return {
			duration,
			css: (t: number) => {
				const eased = cubicOut(Math.ceil(t * 5) / 5);
				return `
					opacity: ${eased};
					transform: translateX(${10 * (1 - eased)}px);
					filter: blur(${4 * (1 - eased)}px);
				`;
			}
		};
	}

	const textColors = ['text-brand'];

	const tabs = [
		{ label: 'Work', value: 'work' },
		{ label: 'Education', value: 'education' },
		{ label: 'Organization', value: 'organization' },
		{ label: 'Achievement', value: 'achievement' }
	];

	let activeTab = 'work';

	export let data;

	$: byCategory = (c: string) => data.experiences.filter((e) => e.category === c);
	$: workExperiences = byCategory('work');
	$: educationExperiences = byCategory('education');
	$: organizationExperiences = byCategory('organization');
	$: achievementItems = byCategory('achievement');

	let isShowMoreWork = false;
	$: showWorkExperiences = isShowMoreWork ? workExperiences : workExperiences.slice(0, 3);
	function toggleShowMoreWork() {
		isShowMoreWork = !isShowMoreWork;
	}

	let isShowMoreEdu = false;
	$: showEducationExperiences = isShowMoreEdu
		? educationExperiences
		: educationExperiences.slice(0, 3);
	function toggleShowMoreEdu() {
		isShowMoreEdu = !isShowMoreEdu;
	}

	let isShowMoreOrg = false;
	$: showOrganizationExperiences = isShowMoreOrg
		? organizationExperiences
		: organizationExperiences.slice(0, 3);
	function toggleShowMoreOrg() {
		isShowMoreOrg = !isShowMoreOrg;
	}

	let isShowMoreAch = false;
	$: showAchievements = isShowMoreAch ? achievementItems : achievementItems.slice(0, 3);
	function toggleShowMoreAch() {
		isShowMoreAch = !isShowMoreAch;
	}

	let isBioExpanded = false;
	function toggleBio() {
		isBioExpanded = !isBioExpanded;
	}
</script>

<svelte:head>
	<title>About me - arp</title>
	<meta name="description" content="Learn more about Mohammad Ariffansyah." />
	<meta
		name="keywords"
		content="about, arp, arpthef, mohammad, ariffansyah, developer, programmer, backend, frontend, fullstack"
	/>
	<meta name="author" content="Mohammad Ariffansyah" />
	<meta property="og:title" content="About me - arp" />
	<meta property="og:image" content="https://arpthef.my.id/Logo.webp" />
	<meta property="og:description" content="Learn more about Mohammad Ariffansyah." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://arpthef.my.id/about" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="About me - arp" />
	<meta name="twitter:description" content="Learn more about Mohammad Ariffansyah." />
	<link rel="canonical" href="https://arpthef.my.id/about" />
</svelte:head>

<section class="relative z-10 w-full px-6 py-12 lg:px-20 lg:py-24">
	<div class="mb-24 flex flex-col gap-4">
		<h1 class="font-display plates text-7xl leading-[0.95] text-ink lg:text-9xl">
			About<br /><span class="judul-komik">Me</span>
		</h1>
		<p class="narasi">The story so far</p>
	</div>

	<div class="grid grid-cols-1 gap-20 xl:grid-cols-2">
		<div class="flex flex-col gap-10">
			<div class="flex flex-col gap-6" use:intersect={{ threshold: 0.1, once: true }}>
				<p class="text-xl leading-relaxed font-medium text-ink-muted md:text-2xl">
					I am an undergraduate student primarily focused on <span class="bg-pop px-1 text-on-pop box-decoration-clone">backend development</span>, building the invisible engines that power the web.
				</p>

				<div class="flex flex-col gap-6 leading-relaxed text-ink-muted">
					<p>
						My journey began in elementary school, but it wasn't until my final year of high school
						that I realized programming was my calling. Inspired by my brother and the online tech
						community, I dove deep into the world of computing.
					</p>

					{#if isBioExpanded}
						<div
							in:bioAnimation={{ duration: 400 }}
							out:bioAnimation={{ duration: 400 }}
							class="komik flex flex-col gap-6 rounded-md bg-card p-6"
						>
							<p>
								In high school, I reached the provincial level of the National Science Olympiad (IT
								Division). A technical hurdle involving a missing IDE cost me a spot at Nationals,
								but it taught me the most valuable lesson in software: <strong
									>adaptability is everything.</strong
								>
							</p>
							<p>
								Since then, I've moved into languages like Go and TypeScript, working with React and
								Svelte to bridge the gap between technical complexity and user-friendly design.
							</p>
						</div>
					{/if}

					<button
						on:click={toggleBio}
						class="tekan w-fit rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
					>
						{isBioExpanded ? '[-] Read Less' : '[+] Read Full Story'}
					</button>
				</div>
			</div>

			<a
				href={resolve('/contact')}
				class="tekan w-fit rounded-md bg-cta px-5 py-2 font-display text-2xl text-cta-ink [text-shadow:none] hover:bg-ink hover:text-surface"
			>
				Get in touch
			</a>
		</div>

		<div class="flex flex-col gap-12" use:intersect={{ threshold: 0.1, once: true }}>
			<div class="flex w-full flex-wrap gap-3">
				{#each tabs as tab (tab.label)}
					<button
						class="tekan rounded-md px-4 py-1.5 font-display text-xl whitespace-nowrap {activeTab ===
						tab.value
							? 'bg-pop text-on-pop'
							: 'bg-card text-ink hover:bg-pop hover:text-on-pop'}"
						aria-pressed={activeTab === tab.value}
						on:click={() => (activeTab = tab.value)}
					>
						{tab.label}
					</button>
				{/each}
			</div>

			<div class="flex flex-col gap-8">
				{#if activeTab === 'work'}
					{#each showWorkExperiences as exp, i (i)}
						<div class="komik flex flex-col gap-1 rounded-md bg-card p-5">
							<span
								class="text-[10px] font-bold tracking-widest uppercase {textColors[
									i % textColors.length
								]}">{exp.date}</span
							>
							<h3 class="font-display text-2xl text-ink">{exp.title}</h3>
							<p class="text-sm font-bold tracking-tight text-ink-faint uppercase">
								{exp.name}
							</p>
							<p class="mt-2 text-sm leading-relaxed text-ink-muted">{exp.description}</p>
						</div>
					{/each}
					{#if workExperiences.length > 3}
						<button
							on:click={toggleShowMoreWork}
							class="tekan w-fit rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
						>
							{isShowMoreWork ? '[-] Show Less' : '[+] Show More'}
						</button>
					{/if}
				{:else if activeTab === 'education'}
					{#each showEducationExperiences as edu, i (i)}
						<div class="komik flex flex-col gap-1 rounded-md bg-card p-5">
							<span class="text-[10px] font-bold tracking-widest text-ink-faint uppercase"
								>{edu.date}</span
							>
							<h3 class="font-display text-2xl text-ink">{edu.name}</h3>
							<p class="mt-2 text-sm leading-relaxed text-ink-muted">{edu.description}</p>
						</div>
					{/each}
					{#if educationExperiences.length > 3}
						<button
							on:click={toggleShowMoreEdu}
							class="tekan w-fit rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
						>
							{isShowMoreEdu ? '[-] Show Less' : '[+] Show More'}
						</button>
					{/if}
				{:else if activeTab === 'organization'}
					{#each showOrganizationExperiences as org, i (i)}
						<div class="komik flex flex-col gap-1 rounded-md bg-card p-5">
							<span
								class="text-[10px] font-bold tracking-widest uppercase {textColors[
									i % textColors.length
								]}">{org.date}</span
							>
							<h3 class="font-display text-2xl text-ink">{org.title}</h3>
							<p class="text-sm font-bold tracking-tight text-ink-faint uppercase">
								{org.name}
							</p>
							<p class="mt-2 text-sm leading-relaxed text-ink-muted">{org.description}</p>
						</div>
					{/each}
					{#if organizationExperiences.length > 3}
						<button
							on:click={toggleShowMoreOrg}
							class="tekan w-fit rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
						>
							{isShowMoreOrg ? '[-] Show Less' : '[+] Show More'}
						</button>
					{/if}
				{:else if activeTab === 'achievement'}
					{#each showAchievements as ach, i (i)}
						<div class="komik flex flex-col gap-1 rounded-md bg-card p-5">
							<span
								class="text-[10px] font-bold tracking-widest uppercase {textColors[
									i % textColors.length
								]}">{ach.date}</span
							>
							<h3 class="font-display text-2xl text-ink">{ach.title}</h3>
							<p class="text-sm font-bold tracking-widest text-brand uppercase">
								{ach.name}
							</p>
							<p class="mt-2 text-sm leading-relaxed text-ink-muted">{ach.description}</p>
						</div>
					{/each}
					{#if achievementItems.length > 3}
						<button
							on:click={toggleShowMoreAch}
							class="tekan w-fit rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
						>
							{isShowMoreAch ? '[-] Show Less' : '[+] Show More'}
						</button>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</section>

