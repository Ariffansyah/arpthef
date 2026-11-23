<script lang="ts">
	import type { Experience } from '$lib/server/db';

	/** Renders siblings, not a wrapper, so a parent `use:intersect` still cascades the cards in. */
	let { experiences, class: listClass }: { experiences: Experience[]; class: string } = $props();

	const tabs: { label: string; value: Experience['category'] }[] = [
		{ label: 'Work', value: 'work' },
		{ label: 'Achievement', value: 'achievement' },
		{ label: 'Education', value: 'education' },
		{ label: 'Organization', value: 'organization' }
	];

	let active = $state<Experience['category']>('work');
	let expanded = $state(false);
	let items = $derived(experiences.filter((e) => e.category === active));
</script>

<div class="mb-8 flex flex-wrap gap-3">
	{#each tabs as tab (tab.value)}
		<button
			class="tekan font-display rounded-md px-4 py-1.5 text-xl {active === tab.value
				? 'bg-pop text-on-pop'
				: 'bg-card text-ink hover:bg-pop hover:text-on-pop'}"
			aria-pressed={active === tab.value}
			onclick={() => ((active = tab.value), (expanded = false))}
		>
			{tab.label}
		</button>
	{/each}
</div>

<div class={listClass}>
	{#each expanded ? items : items.slice(0, 3) as exp (exp.id)}
		<div class="komik bg-card flex flex-col gap-2 rounded-md p-6">
			<span
				class="text-[10px] font-bold tracking-widest uppercase {active === 'education'
					? 'text-ink-faint'
					: 'text-brand'}">{exp.date}</span
			>
			{#if active === 'education'}
				<h3 class="font-display text-ink text-2xl">{exp.name}</h3>
			{:else if active === 'achievement'}
				<h3 class="judul-komik font-display text-3xl">{exp.title}</h3>
				<p class="text-brand text-sm font-bold tracking-widest uppercase">{exp.name}</p>
			{:else}
				<h3 class="font-display text-ink text-2xl">{exp.title}</h3>
				<p class="text-ink-faint text-sm font-bold tracking-tight uppercase">{exp.name}</p>
			{/if}
			<p class="text-ink-muted mt-1 max-w-2xl leading-relaxed">{exp.description}</p>
		</div>
	{/each}
</div>

{#if items.length > 3}
	<button
		onclick={() => (expanded = !expanded)}
		class="tekan bg-card text-ink hover:bg-pop hover:text-on-pop mt-6 w-fit rounded-md px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase"
	>
		{expanded ? '[-] Show Less' : '[+] Show More'}
	</button>
{/if}
