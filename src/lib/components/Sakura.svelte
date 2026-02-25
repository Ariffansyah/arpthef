<script lang="ts">
	import { onMount } from 'svelte';

	export let className: string = '';
	export let quantity: number = 60;
	export let staticity: number = 50;
	export let ease: number = 50;
	export let size: number = 12;
	export let vx: number = 0.5;
	export let vy: number = 1.2;

	let canvasRef: HTMLCanvasElement;
	let canvasContainerRef: HTMLDivElement;
	let context: CanvasRenderingContext2D | null = null;

	interface Petal {
		x: number;
		y: number;
		translateX: number;
		translateY: number;
		size: number;
		alpha: number;
		targetAlpha: number;
		dx: number;
		dy: number;
		magnetism: number;
		rotation: number;
		spin: number;
		swing: number;
		swingSpeed: number;
		color: string;
	}

	let petals: Petal[] = [];
	let mouse = { x: 0, y: 0 };
	let canvasSize = { w: 0, h: 0 };
	const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
	const colors = ['#ffffff', '#fff5f7', '#ffdee5', '#ffb7c5', '#ffa1b5'];

	function petalParams(): Petal {
		return {
			x: Math.random() * canvasSize.w,
			y: Math.random() * canvasSize.h,
			translateX: 0,
			translateY: 0,
			size: Math.random() * size + 5,
			alpha: 0,
			targetAlpha: Math.random() * 0.5 + 0.4,
			dx: (Math.random() - 0.5) * 0.6,
			dy: Math.random() * 0.5 + vy,
			magnetism: 0.1 + Math.random() * 4,
			rotation: Math.random() * Math.PI * 2,
			spin: (Math.random() - 0.5) * 0.04,
			swing: Math.random() * Math.PI,
			swingSpeed: 0.01 + Math.random() * 0.02,
			color: colors[Math.floor(Math.random() * colors.length)]
		};
	}

	function resizeCanvas() {
		if (canvasContainerRef && canvasRef) {
			context = canvasRef.getContext('2d');
			if (!context) return;

			canvasSize.w = window.innerWidth;
			canvasSize.h = window.innerHeight;

			canvasRef.width = canvasSize.w * dpr;
			canvasRef.height = canvasSize.h * dpr;
			canvasRef.style.width = `${canvasSize.w}px`;
			canvasRef.style.height = `${canvasSize.h}px`;

			context.scale(dpr, dpr);

			petals = Array.from({ length: quantity }, petalParams);
		}
	}

	function drawPetal(p: Petal) {
		if (!context) return;
		const flutterX = Math.sin(p.swing) * 10;
		context.save();
		context.translate(p.x + p.translateX + flutterX, p.y + p.translateY);
		context.rotate(p.rotation);
		context.beginPath();
		context.moveTo(0, 0);
		context.bezierCurveTo(-p.size, -p.size, -p.size, p.size, 0, p.size);
		context.bezierCurveTo(p.size, p.size, p.size, -p.size, 0, 0);
		context.fillStyle = p.color;
		context.globalAlpha = p.alpha;
		context.fill();
		context.restore();
	}

	function animate() {
		if (!context) return;
		context.clearRect(0, 0, canvasSize.w, canvasSize.h);

		petals.forEach((p) => {
			if (p.alpha < p.targetAlpha) p.alpha += 0.01;
			p.y += p.dy;
			p.x += p.dx + vx;
			p.rotation += p.spin;
			p.swing += p.swingSpeed;
			p.translateX += (mouse.x / (staticity / p.magnetism) - p.translateX) / ease;
			p.translateY += (mouse.y / (staticity / p.magnetism) - p.translateY) / ease;

			drawPetal(p);

			if (p.y > canvasSize.h + 20 || p.x > canvasSize.w + 20 || p.x < -20) {
				const newParams = petalParams();
				Object.assign(p, newParams);
				p.y = -20;
				p.x = Math.random() * canvasSize.w;
			}
		});
		requestAnimationFrame(animate);
	}

	function onMouseMove(event: MouseEvent) {
		if (canvasRef) {
			const rect = canvasRef.getBoundingClientRect();
			mouse.x = event.clientX - rect.left - canvasSize.w / 2;
			mouse.y = event.clientY - rect.top - canvasSize.h / 2;
		}
	}

	onMount(() => {
		resizeCanvas();
		animate();
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('resize', resizeCanvas);
		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('resize', resizeCanvas);
		};
	});
</script>

<div class="sakura-container {className}" bind:this={canvasContainerRef} aria-hidden="true">
	<canvas bind:this={canvasRef}></canvas>
</div>

<style>
	.sakura-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		pointer-events: none;
		z-index: 0;
	}
	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
