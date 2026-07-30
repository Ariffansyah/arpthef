<script lang="ts">
	import { onMount } from 'svelte';

	let messages = $state<{ role: string; content: string }[]>([
		{ role: 'assistant', content: 'yo, ask me about arp.' }
	]);
	let input = $state('');
	let loading = $state(false);
	let chatEnd = $state<HTMLDivElement>();
	let robotPulse = $state(0);

	onMount(() => {
		let raf: number;
		function tick() { robotPulse = Math.sin(performance.now() / 800) * 0.15 + 0.85; raf = requestAnimationFrame(tick); }
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

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

<div class="relative w-full px-6 py-12 lg:px-20 lg:py-24">
	<div class="mx-auto max-w-4xl">
		<div class="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-4">
				<div class="robot-glow relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10" style="transform: scale({robotPulse})">
					<i class="fa-solid fa-robot text-2xl text-brand"></i>
					<div class="robot-ring absolute inset-0 rounded-2xl border border-brand/30"></div>
				</div>
				<div>
					<h2 class="text-[10px] font-black tracking-[0.5em] text-ink-faint uppercase">
						Chat w/ arp AI
					</h2>
					<p class="text-[9px] font-bold tracking-wider text-ink-faint/60">
						powered by Groq — ask me anything about arp
					</p>
				</div>
			</div>
			<div class="hidden items-center gap-2 sm:flex">
				<span class="h-1.5 w-1.5 rounded-full bg-brand"></span>
				<span class="text-[9px] font-bold tracking-widest text-ink-faint uppercase">Live</span>
			</div>
		</div>

		<div class="chat-box overflow-hidden rounded-2xl border border-edge bg-surface/50">
			<div class="flex h-80 flex-col gap-3 overflow-y-auto px-5 py-5">
				{#each messages as msg, i (i)}
					{@const isUser = msg.role === 'user'}
					<div
						class="flex {isUser ? 'justify-end' : 'justify-start'} animate-in"
						style="animation-delay:{i * 30}ms"
					>
						<div
							class="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed {isUser
								? 'bg-brand text-cta-ink'
								: 'border border-edge bg-card text-ink'}"
						>
							{msg.content}
						</div>
					</div>
				{/each}
				{#if loading}
					<div class="flex justify-start">
						<div class="flex gap-2 rounded-2xl border border-edge bg-card px-4 py-3">
							<span class="h-2 w-2 animate-bounce rounded-full bg-brand" style="animation-delay:0ms"></span>
							<span class="h-2 w-2 animate-bounce rounded-full bg-brand/70" style="animation-delay:150ms"></span>
							<span class="h-2 w-2 animate-bounce rounded-full bg-brand/40" style="animation-delay:300ms"></span>
						</div>
					</div>
				{/if}
				<div bind:this={chatEnd}></div>
			</div>

			<div class="border-t border-edge p-4">
				<div class="flex gap-3">
					<input
						bind:value={input}
						onkeydown={keydown}
						placeholder="ask about arp..."
						class="flex-1 rounded-xl border border-edge bg-card px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint/50 transition-all focus:border-brand"
					/>
					<button
						onclick={send}
						disabled={loading || !input.trim()}
						aria-label="Send message"
						class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-cta-ink transition-all hover:bg-brand-hover disabled:opacity-40"
					>
						<i class="fa-solid fa-arrow-up"></i>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.chat-box {
		box-shadow: 0 0 40px color-mix(in srgb, var(--brand) 8%, transparent);
	}

	.robot-glow {
		transition: transform 0.1s ease;
	}

	.robot-ring {
		animation: ring-pulse 2s ease-in-out infinite;
	}

	@keyframes ring-pulse {
		0%, 100% { opacity: 0.3; transform: scale(1); }
		50% { opacity: 0.6; transform: scale(1.08); }
	}

	.animate-in {
		animation: msg-in 0.3s ease-out both;
	}

	@keyframes msg-in {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.97);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
