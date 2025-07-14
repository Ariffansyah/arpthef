<script>
	export let x = 0;
	export let y = 0;
	export let angle = 0;
	export let floatPhase = 0; // For floating animation
</script>

<div
	class="cursor"
	style="transform: translate({x - 24}px, {y -
		24 +
		Math.sin(floatPhase) * 8}px) rotate({angle}deg);"
>
	<!-- Among Us Crewmate SVG -->
	<svg viewBox="0 0 64 64" width="48" height="48">
		<!-- Body -->
		<ellipse cx="32" cy="36" rx="18" ry="24" fill="#e43f5a" />
		<!-- Visor -->
		<ellipse cx="38" cy="30" rx="8" ry="6" fill="#a8eafc" stroke="#444" stroke-width="2" />
		<!-- Backpack -->
		<ellipse cx="16" cy="36" rx="5" ry="12" fill="#c32f4a" />
		<!-- Legs -->
	</svg>
</div>

<style>
	.cursor {
		position: fixed;
		left: 0;
		top: 0;
		pointer-events: none;
		z-index: 0; /* Behind main content */
		width: 48px;
		height: 48px;
		will-change: transform;
	}
</style>