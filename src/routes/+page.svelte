<script lang="ts">
	import { technologies } from '$lib/constant/apps';
	import { intersect } from '$lib/actions/intersect';
	import Character3D from '$lib/components/Character3D.svelte';
	import { theme } from '$lib/theme';
	import { resolve, asset } from '$app/paths';

	let { data } = $props();

	let character = $state<ReturnType<typeof Character3D>>();

	const textColors = ['text-brand'];

	let activeTab = $state('work');
	const tabs = [
		{ label: 'Work', value: 'work' },
		{ label: 'Achievement', value: 'achievement' },
		{ label: 'Education', value: 'education' },
		{ label: 'Organization', value: 'organization' }
	];

	const byCategory = (c: string) => data.experiences.filter((e) => e.category === c);
	let workExperiences = $derived(byCategory('work'));
	let educationExperiences = $derived(byCategory('education'));
	let organizationExperiences = $derived(byCategory('organization'));
	let achievementItems = $derived(byCategory('achievement'));

	let isShowMoreWork = $state(false);
	let showWorkExperiences = $derived(isShowMoreWork ? workExperiences : workExperiences.slice(0, 3));
	function toggleShowMoreWork() {
		isShowMoreWork = !isShowMoreWork;
	}

	let isShowMoreEdu = $state(false);
	let showEducationExperiences = $derived(isShowMoreEdu
		? educationExperiences
		: educationExperiences.slice(0, 3));
	function toggleShowMoreEdu() {
		isShowMoreEdu = !isShowMoreEdu;
	}

	let isShowMoreOrg = $state(false);
	let showOrganizationExperiences = $derived(isShowMoreOrg
		? organizationExperiences
		: organizationExperiences.slice(0, 3));
	function toggleShowMoreOrg() {
		isShowMoreOrg = !isShowMoreOrg;
	}

	let isShowMoreAch = $state(false);
	let showAchievements = $derived(isShowMoreAch ? achievementItems : achievementItems.slice(0, 3));
	function toggleShowMoreAch() {
		isShowMoreAch = !isShowMoreAch;
	}

	const socials = [
		{ name: 'GitHub', url: 'https://github.com/Ariffansyah', icon: 'fa-github' },
		{ name: 'LinkedIn', url: 'https://www.linkedin.com/in/arpthef/', icon: 'fa-linkedin' },
		{ name: 'X (Twitter)', url: 'https://x.com/nishimiyaa12', icon: 'fa-x-twitter' },
		{ name: 'Instagram', url: 'https://www.instagram.com/_arpchive/', icon: 'fa-instagram' }
	];

	const EMAIL = 'arppthef@outlook.co.id';
</script>

<svelte:head>
	<title>arp - Home</title>
	<link rel="icon" href={asset('/Logo.webp')} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta property="og:title" content="arpthef" />
	<meta property="og:description" content="Welcome to arpthef portfolio." />
	<meta property="og:image" content="https://arpthef.my.id/Logo.webp" />
	<meta property="og:url" content="https://arpthef.my.id/" />
	<meta property="og:type" content="website" />
	<meta name="description" content="Arpthef personal website." />
	<meta
		name="keywords"
		content="arpthef, portfolio, personal website, web developer, programmer, Ariffansyah, Mohammad Ariffansyah"
	/>
	<meta name="author" content="Mohammad Ariffansyah" />
	<link rel="canonical" href="https://arpthef.my.id/" />
</svelte:head>

<section class="relative z-10 mx-auto w-full max-w-[96rem] px-6 py-10 lg:px-10 xl:px-20">
	<!-- The first screen previews every section, so a recruiter gets the whole picture without scrolling. -->
	<div
		id="arpthef"
		class="mb-32 grid grid-cols-1 gap-8 lg:min-h-[calc(100svh-10rem)] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:content-center lg:gap-x-10 lg:gap-y-12"
		use:intersect={{ threshold: 0.2, once: true }}
	>
		<div class="halo @container flex flex-col gap-3 lg:col-start-1 lg:row-start-1 lg:self-start">
			<h1
				class="font-display plates text-[length:clamp(2.5rem,15cqw,4.5rem)] leading-[0.95] text-ink"
			>
				Mohammad<br /><span class="judul-komik">Ariffansyah</span>
			</h1>
			<p class="narasi w-fit">Software Engineer • Surabaya, ID</p>
			<p class="leading-relaxed text-ink-muted">
				Full-stack web development and backend architecture.
				<a
					href={resolve('/about')}
					class="font-bold whitespace-nowrap text-ink underline decoration-brand decoration-2 underline-offset-4 hover:text-brand"
					>More about me →</a
				>
			</p>
			<div class="flex flex-wrap items-center gap-3 pt-2">
				<a
					href={resolve('/assets/cv/cv-en.pdf')}
					target="_blank"
					class="tekan flex items-center gap-2 rounded-md bg-cta px-4 py-2 font-display text-xl text-cta-ink sm:px-5 sm:text-2xl [text-shadow:none] hover:bg-ink hover:text-surface"
				>
					<i class="fa-solid fa-file-arrow-down text-lg"></i> Download CV
				</a>
				{#each socials.slice(0, 2) as s (s.name)}
					<a
						href={s.url}
						target="_blank"
						class="tekan flex h-11 w-11 items-center justify-center rounded-md bg-card text-ink hover:bg-pop hover:text-on-pop"
						aria-label={s.name}><i class="fa-brands {s.icon} fa-lg"></i></a
					>
				{/each}
			</div>
		</div>

		<button
			type="button"
			class="hidden w-64 cursor-pointer justify-self-center md:block lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center xl:w-80"
			aria-label="Poke {$theme === 'dark' ? 'Miles' : 'Gwen'}"
			onclick={() => character?.poke()}
		>
			<div class="pointer-events-none aspect-4/5 w-full mask-b-from-55% mask-b-to-95%">
				<Character3D bind:this={character} />
			</div>
			<p class="narasi relative mx-auto -mt-4 w-fit">
				{$theme === 'dark' ? 'Miles · Earth-1610' : 'Gwen · Earth-65'}
			</p>
		</button>

		<div class="halo flex flex-col gap-3 lg:col-start-3 lg:row-start-1 lg:self-start">
			<h2 class="narasi w-fit">Latest Projects</h2>
			<ul class="flex flex-col">
				{#each data.projects as project (project.id)}
					<li class="border-b-2 border-edge last:border-b-0">
						<a
							href={resolve('/projects/[slug]', { slug: project.slug })}
							class="group flex items-center justify-between gap-4 py-2.5"
						>
							<span class="font-display text-2xl text-ink transition-colors group-hover:text-brand"
								>{project.name}</span
							>
							<span class="flex shrink-0 gap-1.5">
								{#each project.technologies.slice(0, 3) as tech (tech.name)}
									<img src={tech.icon} alt={tech.name} title={tech.name} class="h-4 w-4 dark:brightness-200" />
								{/each}
							</span>
						</a>
					</li>
				{/each}
			</ul>
			<a
				href={resolve('/projects')}
				class="tekan w-fit self-end rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
				>All projects →</a
			>
		</div>

		<div class="halo flex flex-col gap-3 lg:col-start-1 lg:row-start-2 lg:self-start">
			<h2 class="narasi w-fit">Experience & Awards</h2>
			<ul class="flex flex-col">
				{#each [...workExperiences.slice(0, 2), ...achievementItems.slice(0, 2)] as exp (exp.id)}
					{@const award = exp.category === 'achievement'}
					<li class="flex items-start gap-3 border-b-2 border-edge py-1.5 last:border-b-0">
						<span class="mt-1 w-4 shrink-0 text-center text-brand">
							<i class="fa-solid {award ? 'fa-trophy' : 'fa-briefcase'}"></i>
						</span>
						<span class="flex min-w-0 flex-col">
							<span class="font-display truncate text-xl text-ink">
								{award ? `${exp.title} · ${exp.name}` : exp.title}
							</span>
							<span class="truncate text-[11px] font-bold tracking-wider text-ink-faint uppercase">
								{award ? exp.date : `${exp.name} · ${exp.date}`}
							</span>
						</span>
					</li>
				{/each}
			</ul>
			<a
				href="#experience"
				class="tekan w-fit self-end rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
				>Full background ↓</a
			>
		</div>

		<div class="halo flex flex-col gap-4 lg:col-start-3 lg:row-start-2 lg:self-start">
			<h2 class="narasi w-fit">Stack & Contact</h2>
			<ul class="flex flex-wrap gap-2">
				{#each technologies.slice(0, 12) as tech (tech.name)}
					<li
						class="flex items-center gap-1.5 rounded-md border-2 border-edge-ink bg-card px-2 py-1 text-[10px] font-bold tracking-widest text-ink uppercase"
					>
						<img src={tech.icon} alt="" class="h-3.5 w-3.5 dark:brightness-200" />{tech.name}
					</li>
				{/each}
			</ul>
			<div class="flex flex-col gap-3 border-t-2 border-edge pt-3">
				<a
					href="mailto:{EMAIL}"
					class="flex items-center gap-2 font-bold wrap-anywhere text-ink underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:text-brand"
				>
					<i class="fa-regular fa-envelope"></i>{EMAIL}
				</a>
				<div class="flex flex-wrap gap-2">
					{#each socials as s (s.name)}
						<a
							href={s.url}
							target="_blank"
							rel="noopener noreferrer"
							class="tekan flex h-9 w-9 items-center justify-center rounded-md bg-card text-ink hover:bg-pop hover:text-on-pop"
							aria-label={s.name}><i class="fa-brands {s.icon}"></i></a
						>
					{/each}
				</div>
			</div>
			<a
				href="#contact"
				class="tekan w-fit self-end rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
				>All contacts ↓</a
			>
		</div>
	</div>

	<div id="technologies" class="mb-32" use:intersect={{ threshold: 0.3, once: true }}>
		<h2 class="narasi mb-10">Stack / Tools</h2>
		<ul class="flex flex-wrap gap-3">
			{#each technologies as tech (tech.name)}
				<li
					class="flex items-center gap-2 rounded-md border-2 border-edge-ink bg-card px-3 py-1.5 shadow-[2px_2px_0_var(--shadow)] odd:-rotate-1 even:rotate-1"
				>
					<img src={tech.icon} alt="" class="h-4 w-4" />
					<span class="text-[11px] font-bold tracking-widest text-ink uppercase">{tech.name}</span>
				</li>
			{/each}
		</ul>
	</div>

	<div id="experience" class="mb-32" use:intersect={{ threshold: 0.1, once: true }}>
		<h2 class="font-display plates mb-8 text-6xl leading-[0.95] text-ink lg:text-7xl">
			Experience
		</h2>
		<div class="mb-8 flex flex-wrap gap-3">
			{#each tabs as tab (tab.value)}
				<button
					class="tekan rounded-md px-4 py-1.5 font-display text-xl {activeTab === tab.value
						? 'bg-pop text-on-pop'
						: 'bg-card text-ink hover:bg-pop hover:text-on-pop'}"
					aria-pressed={activeTab === tab.value}
					onclick={() => (activeTab = tab.value)}
				>
					{tab.label}
				</button>
			{/each}
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			{#if activeTab === 'work'}
				{#each showWorkExperiences as exp, i (i)}
					<div class="komik flex flex-col gap-2 rounded-md bg-card p-6">
						<span
							class="text-[10px] font-bold uppercase {textColors[
								i % textColors.length
							]} tracking-widest">{exp.date}</span
						>
						<h3 class="font-display text-2xl text-ink">{exp.title}</h3>
						<p class="text-sm font-bold tracking-tight text-ink-faint uppercase">
							{exp.name}
						</p>
						<p class="mt-1 max-w-2xl leading-relaxed text-ink-muted">{exp.description}</p>
					</div>
				{/each}
			{:else if activeTab === 'education'}
				{#each showEducationExperiences as edu, i (i)}
					<div class="komik flex flex-col gap-2 rounded-md bg-card p-6">
						<span class="text-[10px] font-bold tracking-widest text-ink-faint uppercase"
							>{edu.date}</span
						>
						<h3 class="font-display text-2xl text-ink">{edu.name}</h3>
						<p class="mt-1 max-w-2xl leading-relaxed text-ink-muted">{edu.description}</p>
					</div>
				{/each}
			{:else if activeTab === 'organization'}
				{#each showOrganizationExperiences as org, i (i)}
					<div class="komik flex flex-col gap-2 rounded-md bg-card p-6">
						<span
							class="text-[10px] font-bold uppercase {textColors[
								i % textColors.length
							]} tracking-widest">{org.date}</span
						>
						<h3 class="font-display text-2xl text-ink">{org.title}</h3>
						<p class="text-sm font-bold tracking-tight text-ink-faint uppercase">
							{org.name}
						</p>
						<p class="mt-1 max-w-2xl leading-relaxed text-ink-muted">{org.description}</p>
					</div>
				{/each}
			{:else if activeTab === 'achievement'}
				{#each showAchievements as ach, i (i)}
					<div class="komik flex flex-col gap-2 rounded-md bg-card p-6">
						<span
							class="text-[10px] font-bold uppercase {textColors[
								i % textColors.length
							]} tracking-widest">{ach.date}</span
						>
						<h3 class="judul-komik font-display text-3xl">{ach.title}</h3>
						<p class="text-sm font-bold tracking-widest text-brand uppercase">
							{ach.name}
						</p>
						<p class="mt-1 max-w-2xl leading-relaxed text-ink-muted">{ach.description}</p>
					</div>
				{/each}
			{/if}
		</div>

		{#if activeTab === 'work' && workExperiences.length > 3}
			<button
				onclick={toggleShowMoreWork}
				class="tekan mt-6 w-fit rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
			>
				{isShowMoreWork ? '[-] Show Less' : '[+] Show More'}
			</button>
		{:else if activeTab === 'education' && educationExperiences.length > 3}
			<button
				onclick={toggleShowMoreEdu}
				class="tekan mt-6 w-fit rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
			>
				{isShowMoreEdu ? '[-] Show Less' : '[+] Show More'}
			</button>
		{:else if activeTab === 'organization' && organizationExperiences.length > 3}
			<button
				onclick={toggleShowMoreOrg}
				class="tekan mt-6 w-fit rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
			>
				{isShowMoreOrg ? '[-] Show Less' : '[+] Show More'}
			</button>
		{:else if activeTab === 'achievement' && achievementItems.length > 3}
			<button
				onclick={toggleShowMoreAch}
				class="tekan mt-6 w-fit rounded-md bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
			>
				{isShowMoreAch ? '[-] Show Less' : '[+] Show More'}
			</button>
		{/if}
	</div>

	<div
		id="projects"
		class="splash komik mb-32 rounded-md p-6 md:p-8"
		use:intersect={{ threshold: 0.05, once: true }}
	>
		<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
			<h2 class="splash-title font-display text-5xl leading-none 2xl:text-6xl">Latest Projects</h2>
			<a
				href={resolve('/projects')}
				class="tekan rounded-md bg-card px-4 py-2 text-[11px] font-bold tracking-[0.2em] text-ink uppercase hover:bg-pop hover:text-on-pop"
				>View All →</a
			>
		</div>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2" role="presentation">
			{#each data.projects as project (project.id)}
				<a
					href={resolve('/projects/[slug]', { slug: project.slug })}
					class="project-card komik group flex flex-col overflow-hidden rounded-md bg-card transition-transform duration-150 hover:-translate-y-1 hover:-rotate-1 sm:flex-row"
				>
					<div
						class="relative aspect-video shrink-0 overflow-hidden border-b-3 border-edge-ink sm:aspect-auto sm:w-2/5 sm:border-r-3 sm:border-b-0"
					>
						<img
							src={project.images[0]}
							alt=""
							loading="lazy"
							class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
					</div>
					<div class="flex flex-1 flex-col gap-1.5 p-4">
						<h3 class="font-display text-2xl text-ink transition-colors group-hover:text-brand">
							{project.name}
						</h3>
						<p class="line-clamp-3 text-sm leading-relaxed text-ink-muted">
							{project.description}
						</p>
						{#if project.technologies?.length}
							<div class="mt-auto flex flex-wrap gap-2 pt-2">
								{#each project.technologies as tech (tech.name)}
									<img src={tech.icon} alt={tech.name} title={tech.name} class="h-4 w-4" />
								{/each}
							</div>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	</div>

	<div
		id="contact"
		class="grid grid-cols-1 gap-16 xl:grid-cols-2"
		use:intersect={{ threshold: 0.2, once: true }}
	>
		<div class="flex flex-col gap-8">
			<h2 class="font-display plates text-7xl leading-none text-ink lg:text-8xl">
				Get in<br /><span class="judul-komik">Touch</span>
			</h2>
			<p class="kotak-narasi w-fit max-w-xl -rotate-1 text-lg leading-relaxed font-medium md:text-xl">
				Feel free to reach out for inquiries, collaborations, or just to say hello. I am always open
				to <span class="bg-pop px-1 text-on-pop box-decoration-clone">new opportunities</span> and discussions.
			</p>
			<div class="komik flex w-fit max-w-full flex-col gap-3 rounded-md bg-card p-6">
				<p class="narasi">Email Me</p>
				<a
					href="mailto:{EMAIL}"
					class="text-xl font-bold wrap-anywhere text-ink underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:text-brand md:text-2xl"
				>
					{EMAIL}
				</a>
			</div>
		</div>

		<div class="flex flex-col gap-8 xl:items-end xl:justify-end">
			<p class="narasi">Social Media</p>
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:w-full xl:max-w-md">
				{#each socials as s (s.name)}
					<a
						href={s.url}
						target="_blank"
						rel="noopener noreferrer"
						class="tekan bg-card text-ink hover:bg-pop hover:text-on-pop flex items-center justify-between rounded-md px-4 py-3 text-xs font-bold tracking-widest uppercase"
						aria-label="Visit my {s.name} profile"
					>
						<span>{s.name}</span> <i class="fa-brands {s.icon} text-lg"></i>
					</a>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	/* Spider-Man red: web lines spun from the top-right corner over Ben-Day dots. */
	.splash {
		--shadow: #0c1844;
		position: relative;
		isolation: isolate;
		background:
			radial-gradient(circle, rgb(12 24 68 / 0.2) 1.2px, transparent 1.6px) 0 0 / 8px 8px,
			#c80036;
	}
	.splash::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background:
			repeating-conic-gradient(
				from 180deg at 100% 0%,
				rgb(12 24 68 / 0.45) 0deg 0.3deg,
				transparent 0.3deg 11deg
			),
			repeating-radial-gradient(
				circle at 100% 0%,
				transparent 0 62px,
				rgb(12 24 68 / 0.45) 62px 64px
			);
		mask-image: radial-gradient(circle at 100% 0%, black, transparent 70%);
	}
	.splash-title {
		color: #fff5e1;
		-webkit-text-stroke: 0.04em #0c1844;
		paint-order: stroke fill;
		text-shadow:
			calc(var(--ca) * -1em) 0 var(--plate-a),
			calc(var(--ca) * 1em) 0 var(--plate-b),
			0.06em 0.06em 0 #0c1844;
	}

	/* No panel, just a feathered wash so small text and icons stay legible over the busy background. */
	.halo {
		position: relative;
		isolation: isolate;
	}
	.halo::before {
		content: '';
		position: absolute;
		inset: -1.5rem;
		z-index: -1;
		pointer-events: none;
		background: color-mix(in srgb, var(--surface) 60%, transparent);
		mask-image:
			linear-gradient(to right, transparent, black 1.5rem, black calc(100% - 1.5rem), transparent),
			linear-gradient(to bottom, transparent, black 1.5rem, black calc(100% - 1.5rem), transparent);
		mask-composite: intersect;
	}

	:global(html) {
		scroll-behavior: smooth;
	}
</style>
