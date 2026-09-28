<script lang="ts">
	import { enhance, deserialize } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { Project, Experience } from '$lib/server/db';
	import { renderMarkdown } from '$lib/markdown';
	import { technologies as skills } from '$lib/constant/apps';

	let { data, form } = $props();

	type ProjectForm = Omit<Project, 'id'> & { id?: number };
	type ExperienceForm = Omit<Experience, 'id'> & { id?: number };

	const categories = ['work', 'education', 'organization', 'achievement'] as const;

	const field =
		'w-full border border-edge bg-card px-3 py-2 text-sm font-normal tracking-normal normal-case text-ink focus:border-brand focus:outline-none';
	const label =
		'flex flex-col gap-2 text-[10px] font-black tracking-[0.2em] text-ink-faint uppercase';
	const link = 'text-[10px] font-black tracking-[0.2em] text-ink-faint uppercase hover:text-brand';
	const primary =
		'w-fit bg-cta px-6 py-3 text-xs font-black tracking-widest text-cta-ink uppercase hover:bg-brand-hover disabled:opacity-50';

	let tab = $state<'projects' | 'experiences' | 'cv'>('projects');
	let project = $state<ProjectForm | null>(null);
	let experience = $state<ExperienceForm | null>(null);
	let uploading = $state(false);
	let notice = $state('');
	let preview = $state(false);
	let query = $state('');
	let category = $state<'all' | Experience['category']>('all');

	let rows = $derived.by(() => {
		const list: (Project | Experience)[] =
			tab === 'projects'
				? data.projects
				: data.experiences.filter((x) => category === 'all' || x.category === category);
		const q = query.trim().toLowerCase();
		if (!q) return list;
		return list.filter((r) =>
			[
				r.name,
				r.description,
				'slug' in r ? r.slug : r.title,
				'slug' in r ? r.technologies.map((t) => t.name).join(' ') : r.date
			]
				.join(' ')
				.toLowerCase()
				.includes(q)
		);
	});

	type Tech = Project['technologies'][number];
	const sameTech = (a: Tech, b: Tech) => a.name.toLowerCase() === b.name.toLowerCase();

	// every tech already used in a project, plus the skills list, one per name
	let techCatalog = $derived(
		[...data.projects.flatMap((p) => p.technologies), ...skills]
			.map(({ name, icon }) => ({ name, icon }))
			.filter((t, i, all) => all.findIndex((u) => sameTech(t, u)) === i)
			.sort((a, b) => a.name.localeCompare(b.name))
	);
	let newTech = $state({ name: '', icon: '' });

	function addTech(t: Tech) {
		const tech = { name: t.name.trim(), icon: t.icon.trim() };
		if (tech.name && !project!.technologies.some((u) => sameTech(u, tech))) {
			project!.technologies.push(tech);
		}
	}

	function addNewTech() {
		if (!newTech.name.trim() || !newTech.icon.trim()) return;
		addTech(newTech);
		newTech = { name: '', icon: '' };
	}

	// Enter in the new-tech fields adds the tech instead of submitting the project form
	const addOnEnter = (e: KeyboardEvent) => {
		if (e.key !== 'Enter') return;
		e.preventDefault();
		addNewTech();
	};

	// Starter outline for a project write-up; delete the sections you don't need.
	function useTemplate() {
		const p = project!;
		if (p.details.trim() && !confirm('Replace the current details with the template?')) return;
		const builtWith = p.technologies.length
			? p.technologies.map((t) => `- **${t.name}**: what you used it for`)
			: ['- **Tech**: what you used it for'];
		p.details = [
			'## Overview',
			'What it is, who it is for, and the problem it solves.',
			'',
			'## Features',
			'- **Feature**: what it does',
			'- **Feature**: what it does',
			'',
			'## How it works',
			'1. First step',
			'2. Second step',
			'',
			'## Built with',
			...builtWith,
			'',
			'## My role',
			'What you built yourself, and who you worked with.',
			'',
			'## Challenges',
			'The hardest problem you hit, and how you solved it.',
			'',
			'## Status',
			'Live, in active development, or archived.'
		].join('\n');
		preview = false;
	}

	function editProject(p?: Project) {
		preview = false;
		newTech = { name: '', icon: '' };
		project = p
			? $state.snapshot(p)
			: {
					slug: '',
					name: '',
					description: '',
					details: '',
					visit_link: '',
					images: [],
					technologies: [],
					sort: 0
				};
	}

	function editExperience(x?: Experience) {
		experience = x
			? $state.snapshot(x)
			: { category: 'work', name: '', title: '', date: '', description: '', sort: 0 };
	}

	const closeOnSuccess: SubmitFunction = () => {
		notice = '';
		return async ({ result, update }) => {
			await update();
			if (result.type === 'success') project = experience = null;
		};
	};

	const confirmDelete =
		(name: string): SubmitFunction =>
		({ cancel }) => {
			if (!confirm(`Delete "${name}"?`)) cancel();
		};

	// Re-encodes raster images to WebP in the browser. SVG, GIF (animation) and
	// WebP pass through untouched, as does anything the browser can't encode to
	// WebP (older Safari hands back PNG).
	async function toWebp(file: File) {
		if (!/^image\/(png|jpeg|bmp|avif)$/.test(file.type)) return file;
		const bitmap = await createImageBitmap(file);
		const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
		canvas.getContext('2d')!.drawImage(bitmap, 0, 0);
		bitmap.close();
		const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.85 });
		if (blob.type !== 'image/webp') return file;
		return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
	}

	// Uploads each file on its own request, then keeps the URL in the form until Save.
	// ponytail: removing an image only unlinks it; the file stays in the bucket
	async function upload(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		uploading = true;
		notice = '';
		for (const file of input.files ?? []) {
			const body = new FormData();
			body.append('file', await toWebp(file).catch(() => file));
			const result = await fetch('?/upload', {
				method: 'POST',
				body,
				headers: { 'x-sveltekit-action': 'true' }
			})
				.then((r) => r.text())
				.then(deserialize)
				.catch(() => null);
			if (result?.type !== 'success') {
				notice =
					(result?.type === 'failure' && String(result.data?.message)) ||
					`Upload failed: ${file.name}`;
				break;
			}
			project!.images.push(String(result.data?.url));
		}
		uploading = false;
		input.value = '';
	}
</script>

<svelte:head>
	<title>Backstage - arp</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="relative z-10 w-full px-6 py-12 lg:px-20 lg:py-24">
	<h1 class="text-ink mb-12 text-5xl font-black tracking-tighter lg:text-8xl">
		Back<span class="text-brand">stage</span>
	</h1>

	<p role="status" class="text-brand mb-6 min-h-5 text-sm">{notice || form?.message || ''}</p>

	{#if !data.email}
		<form method="POST" action="?/login" use:enhance class="flex max-w-sm flex-col gap-6">
			<label class={label}>
				Email
				<input class={field} name="email" type="email" autocomplete="username" required />
			</label>
			<label class={label}>
				Password
				<input
					class={field}
					name="password"
					type="password"
					autocomplete="current-password"
					required
				/>
			</label>
			<button class={primary}>Sign in</button>
		</form>
	{:else}
		<div class="border-edge mb-10 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
			<div class="flex flex-wrap gap-x-8 gap-y-2">
				<button
					class="text-xs font-black tracking-widest uppercase {tab === 'projects'
						? 'text-brand'
						: 'text-ink-faint hover:text-ink-muted'}"
					onclick={() => ((tab = 'projects'), (project = experience = null))}>Projects</button
				>
				<button
					class="text-xs font-black tracking-widest uppercase {tab === 'experiences'
						? 'text-brand'
						: 'text-ink-faint hover:text-ink-muted'}"
					onclick={() => ((tab = 'experiences'), (project = experience = null))}
					>Experience & achievements</button
				>
				<button
					class="text-xs font-black tracking-widest uppercase {tab === 'cv'
						? 'text-brand'
						: 'text-ink-faint hover:text-ink-muted'}"
					onclick={() => ((tab = 'cv'), (project = experience = null))}>CV</button
				>
			</div>
			<form method="POST" action="?/logout" use:enhance class="flex items-center gap-6">
				<span class="text-ink-faint text-xs">{data.email}</span>
				<button class={link}>Sign out</button>
			</form>
		</div>

		{#if tab === 'cv'}
			<form
				method="POST"
				action="?/uploadCv"
				enctype="multipart/form-data"
				use:enhance
				class="flex max-w-xl flex-col gap-6"
			>
				<p class="text-ink-muted text-sm">
					{#if data.cv}
						Current CV{data.cv.updatedAt
							? `, updated ${new Date(data.cv.updatedAt).toLocaleString()}`
							: ''} ({Math.round(data.cv.size / 1024)} KB).
						<a
							class="text-brand underline"
							href="/assets/cv/cv-en.pdf"
							target="_blank"
							rel="noopener noreferrer">View it</a
						>
					{:else}
						No CV uploaded yet.
					{/if}
				</p>
				<label class={label}>
					New CV (PDF)
					<input class={field} type="file" name="cv" accept="application/pdf" required />
				</label>
				<button class={primary}>Upload</button>
				<p class="text-ink-faint text-xs">
					Replaces the file at arpthef.my.id/assets/cv/cv-en.pdf, so links you've already shared
					keep working.
				</p>
			</form>
		{:else if project}
			<form
				method="POST"
				action="?/saveProject"
				use:enhance={closeOnSuccess}
				class="grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2"
			>
				<input type="hidden" name="id" value={project.id ?? ''} />
				<label class={label}>
					Name
					<input class={field} name="name" required value={project.name} />
				</label>
				<label class={label}>
					Slug (URL)
					<input
						class={field}
						name="slug"
						pattern="[a-z0-9-]*"
						placeholder="auto from name"
						value={project.slug}
					/>
				</label>
				<label class="{label} md:col-span-2">
					Short description
					<textarea class={field} name="description" rows="2" value={project.description}
					></textarea>
				</label>
				<div class="flex flex-col gap-2 md:col-span-2">
					<div class="flex items-baseline justify-between gap-4">
						<label for="details" class={label}>Details (Markdown)</label>
						<div class="flex gap-6">
							<button type="button" class={link} onclick={useTemplate}>Use template</button>
							<button
								type="button"
								class={link}
								aria-pressed={preview}
								onclick={() => (preview = !preview)}>{preview ? 'Write' : 'Preview'}</button
							>
						</div>
					</div>
					<textarea
						id="details"
						class={field}
						class:hidden={preview}
						name="details"
						rows="18"
						placeholder={'## Overview\nWhat it is and why you built it.\n\n## How it works\n- **Frontend:** …\n- **Backend:** …'}
						bind:value={project.details}
					></textarea>
					{#if preview}
						<div class="markdown prose border-edge bg-card max-w-none border p-6">
							{@html renderMarkdown(project.details)}
						</div>
					{/if}
				</div>
				<label class={label}>
					Visit link
					<input class={field} name="visit_link" type="url" value={project.visit_link ?? ''} />
				</label>
				<label class={label}>
					Order (lower shows first)
					<input class={field} name="sort" type="number" value={project.sort} />
				</label>
				<fieldset class="flex flex-col gap-3 md:col-span-2">
					<legend class="{label} mb-2">Technologies</legend>
					{#if project.technologies.length}
						<ul class="flex flex-wrap gap-2">
							{#each project.technologies as t, i}
								<li class="border-edge text-ink flex items-center gap-2 border px-2 py-1 text-xs">
									<input type="hidden" name="tech_name" value={t.name} />
									<input type="hidden" name="tech_icon" value={t.icon} />
									<img src={t.icon} alt="" class="h-4 w-4" />
									{t.name}
									<button
										type="button"
										class="text-ink-faint hover:text-brand px-1"
										aria-label="Remove {t.name}"
										onclick={() => project!.technologies.splice(i, 1)}>×</button
									>
								</li>
							{/each}
						</ul>
					{/if}

					<select
						class={field}
						aria-label="Add an existing technology"
						onchange={(e) => {
							const t = techCatalog.find((x) => x.name === e.currentTarget.value);
							if (t) addTech(t);
							e.currentTarget.value = '';
						}}
					>
						<option value="">+ Add existing…</option>
						{#each techCatalog.filter((t) => !project!.technologies.some( (u) => sameTech(t, u) )) as t (t.name)}
							<option value={t.name}>{t.name}</option>
						{/each}
					</select>

					<div class="grid grid-cols-1 items-center gap-2 sm:grid-cols-[12rem_1fr_auto]">
						<input
							class={field}
							placeholder="New tech name"
							aria-label="New technology name"
							bind:value={newTech.name}
							onkeydown={addOnEnter}
						/>
						<div class="flex items-center gap-2">
							<input
								class={field}
								placeholder="Icon URL, e.g. https://cdn.simpleicons.org/svelte/c80036"
								aria-label="New technology icon URL"
								bind:value={newTech.icon}
								onkeydown={addOnEnter}
							/>
							{#if newTech.icon.trim()}
								<img src={newTech.icon.trim()} alt="Icon preview" class="h-5 w-5 shrink-0" />
							{/if}
						</div>
						<button
							type="button"
							class="{link} disabled:opacity-40"
							disabled={!newTech.name.trim() || !newTech.icon.trim()}
							onclick={addNewTech}>+ Add new</button
						>
					</div>
				</fieldset>

				<fieldset class="flex flex-col gap-4 md:col-span-2">
					<legend class="{label} mb-2">Images (the first one is the cover)</legend>
					{#if project.images.length}
						<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
							{#each project.images as img, i}
								<div class="flex flex-col gap-2">
									<input type="hidden" name="images" value={img} />
									<img
										src={img}
										alt=""
										class="border-edge aspect-video w-full border object-cover"
									/>
									<div class="flex flex-wrap gap-x-4 gap-y-1">
										<button
											type="button"
											class={link}
											onclick={() =>
												navigator.clipboard
													.writeText(`![${project!.name} screenshot](${img})`)
													.then(() => (notice = 'Image Markdown copied, paste it into Details.'))}
											>Copy MD</button
										>
										{#if i > 0}
											<button
												type="button"
												class={link}
												onclick={() => project!.images.unshift(...project!.images.splice(i, 1))}
												>Make cover</button
											>
										{/if}
										<button type="button" class={link} onclick={() => project!.images.splice(i, 1)}
											>Remove</button
										>
									</div>
								</div>
							{/each}
						</div>
					{/if}
					<input
						type="file"
						accept="image/*"
						multiple
						disabled={uploading}
						onchange={upload}
						class="text-ink-muted text-sm"
						aria-label="Upload images"
					/>
				</fieldset>

				<div class="flex items-center gap-6 md:col-span-2">
					<button class={primary} disabled={uploading}>Save</button>
					<button type="button" class={link} onclick={() => (project = null)}>Cancel</button>
				</div>
			</form>
		{:else if experience}
			<form
				method="POST"
				action="?/saveExperience"
				use:enhance={closeOnSuccess}
				class="grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2"
			>
				<input type="hidden" name="id" value={experience.id ?? ''} />
				<label class={label}>
					Category
					<select class={field} name="category" value={experience.category}>
						{#each categories as c (c)}
							<option value={c}>{c}</option>
						{/each}
					</select>
				</label>
				<label class={label}>
					Date
					<input
						class={field}
						name="date"
						placeholder="Feb, 2026 – Present"
						value={experience.date}
					/>
				</label>
				<label class={label}>
					Name (organization, school or competition)
					<input class={field} name="name" required value={experience.name} />
				</label>
				<label class={label}>
					Title (role or result)
					<input class={field} name="title" value={experience.title} />
				</label>
				<label class="{label} md:col-span-2">
					Description
					<textarea class={field} name="description" rows="5" value={experience.description}
					></textarea>
				</label>
				<label class={label}>
					Order (lower shows first)
					<input class={field} name="sort" type="number" value={experience.sort} />
				</label>

				<div class="flex items-center gap-6 md:col-span-2">
					<button class={primary}>Save</button>
					<button type="button" class={link} onclick={() => (experience = null)}>Cancel</button>
				</div>
			</form>
		{:else}
			<div class="flex flex-wrap items-end justify-between gap-4">
				<button
					class={primary}
					onclick={() => (tab === 'projects' ? editProject() : editExperience())}>+ New</button
				>
				<div class="flex flex-wrap items-end gap-4">
					{#if tab === 'experiences'}
						<label class={label}>
							Category
							<select class={field} bind:value={category}>
								<option value="all">all</option>
								{#each categories as c (c)}
									<option value={c}>{c}</option>
								{/each}
							</select>
						</label>
					{/if}
					<label class={label}>
						Search
						<input class={field} type="search" placeholder="Name, tech, date…" bind:value={query} />
					</label>
				</div>
			</div>
			<p class="text-ink-faint mt-6 text-xs">
				{rows.length} of {tab === 'projects' ? data.projects.length : data.experiences.length}
			</p>
			<ul class="divide-edge border-edge mt-2 flex flex-col divide-y border-y">
				{#each rows as row (row.id)}
					<li class="flex flex-wrap items-center gap-4 py-4">
						<span class="text-ink-faint w-8 text-xs">{row.sort}</span>
						<div class="min-w-0 flex-1">
							<p class="text-ink font-black">{row.name}</p>
							<p class="text-ink-faint text-xs">
								{'slug' in row ? `/projects/${row.slug}` : `${row.category} · ${row.date}`}
							</p>
						</div>
						<button
							class={link}
							onclick={() => ('slug' in row ? editProject(row) : editExperience(row))}>Edit</button
						>
						<form method="POST" action="?/delete" use:enhance={confirmDelete(row.name)}>
							<input type="hidden" name="table" value={tab} />
							<input type="hidden" name="id" value={row.id} />
							<button class={link}>Delete</button>
						</form>
					</li>
				{:else}
					<li class="text-ink-faint py-4 text-sm">No matches.</li>
				{/each}
			</ul>
		{/if}
	{/if}
</section>
