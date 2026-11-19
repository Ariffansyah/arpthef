<script lang="ts">
	import { tick } from 'svelte';
	import { scale } from 'svelte/transition';

	/** The toggle lives in the dock (#chat-toggle); this is only the panel. */
	let { open = $bindable(false) } = $props();

	let messages = $state<{ role: string; content: string }[]>([
		{ role: 'assistant', content: 'yo, ask me about arp.' }
	]);
	let input = $state('');
	let loading = $state(false);
	let chatEnd = $state<HTMLDivElement>();
	let inputEl = $state<HTMLInputElement>();

	const twos = (t: number) => Math.ceil(t * 3) / 3;
	const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

	$effect(() => {
		if (!open) return;
		tick().then(() => {
			inputEl?.focus();
			scroll();
		});
	});

	function close() {
		open = false;
		document.getElementById('chat-toggle')?.focus();
	}

	function scroll() {
		chatEnd?.scrollIntoView({ behavior: 'smooth' });
	}

	async function send() {
		const msg = input.trim();
		if (!msg || loading) return;
		messages = [...messages, { role: 'user', content: msg }];
		input = '';
		loading = true;
		scroll();

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: messages.filter(m => m.role === 'user') })
			});
			const data = await res.json();
			messages = [...messages, { role: 'assistant', content: data.reply || 'no response' }];
		} catch {
			messages = [...messages, { role: 'assistant', content: 'connection error' }];
		}
		loading = false;
		scroll();
	}

	function keydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && open && close()} />

{#if open}
	<!-- Right-aligned to the dock so the tail sits over the toggle. 50vw + 9rem is the dock's right
	     end on a phone (about half its 19rem width past centre), so the left edge stays on screen. -->
	<div
		id="arp-chat"
		role="dialog"
		aria-label="Chat with arp AI"
		class="pointer-events-auto absolute right-0 bottom-full mb-5 w-[min(24rem,calc(50vw+9rem))] origin-bottom-right"
		style="height: min(32rem, calc(100dvh - 8rem))"
		transition:scale={{ start: 0.6, duration: reduceMotion() ? 0 : 250, easing: twos }}
	>
		<div class="balon balon-kanan flex h-full flex-col bg-card shadow-[5px_5px_0_var(--shadow)]">
			<div class="flex items-center gap-3 border-b-3 border-edge-ink px-4 py-3">
				<div class="komik flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cta">
					<i class="fa-solid fa-robot text-lg text-cta-ink"></i>
				</div>
				<div class="min-w-0 flex-1">
					<h2 class="font-display text-2xl leading-none text-ink">Chat w/ arp AI</h2>
					<p class="mt-1 text-[10px] font-bold tracking-wider text-ink-faint">
						powered by Groq — ask me anything about arp
					</p>
				</div>
				<button
					onclick={close}
					aria-label="Close chat"
					class="tekan flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-card text-ink hover:bg-pop hover:text-on-pop"
				>
					<i class="fa-solid fa-xmark"></i>
				</button>
			</div>

			<div class="chat-page flex flex-1 flex-col gap-6 overflow-y-auto bg-surface px-4 pt-4 pb-6">
				{#each messages as msg, i (i)}
					{@const isUser = msg.role === 'user'}
					<div
						class="flex {isUser ? 'justify-end' : 'justify-start'} animate-in"
						style="animation-delay:{i * 30}ms"
					>
						<div
							class="balon max-w-[85%] px-4 py-3 text-sm leading-relaxed {isUser
								? 'balon-kanan bg-cta text-cta-ink whitespace-pre-wrap [--balon-bg:var(--cta)] [text-shadow:none]'
								: 'markdown prose prose-sm bg-card text-ink prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5'}"
						>
							{#if isUser}{msg.content}{:else}{@html msg.content}{/if}
						</div>
					</div>
				{/each}
				{#if loading}
					<div class="flex justify-start">
						<div class="balon flex gap-2 bg-card px-4 py-3">
							<span class="h-2 w-2 animate-bounce rounded-full bg-brand" style="animation-delay:0ms"></span>
							<span class="h-2 w-2 animate-bounce rounded-full bg-brand/70" style="animation-delay:150ms"></span>
							<span class="h-2 w-2 animate-bounce rounded-full bg-brand/40" style="animation-delay:300ms"></span>
						</div>
					</div>
				{/if}
				<div bind:this={chatEnd}></div>
			</div>

			<div class="border-t-3 border-edge-ink p-3">
				<div class="flex gap-3">
					<input
						bind:this={inputEl}
						bind:value={input}
						onkeydown={keydown}
						placeholder="ask about arp..."
						aria-label="Message"
						class="min-w-0 flex-1 rounded-md border-2 border-edge-ink bg-surface px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint transition-all focus:border-brand"
					/>
					<button
						onclick={send}
						disabled={loading || !input.trim()}
						aria-label="Send message"
						class="tekan flex h-11 w-11 items-center justify-center rounded-md bg-cta text-cta-ink hover:bg-ink hover:text-surface disabled:opacity-40"
					>
						<i class="fa-solid fa-arrow-up"></i>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}


<style>
	.chat-page {
		background-image: radial-gradient(
			color-mix(in srgb, var(--edge-ink) 10%, transparent) 1.2px,
			transparent 1.6px
		);
		background-size: 9px 9px;
	}

	.animate-in {
		animation: msg-in 0.25s steps(3) both;
	}

	@keyframes msg-in {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.8);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
