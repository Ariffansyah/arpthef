<script lang="ts">
	import { onMount } from 'svelte';

	export let className: string = '';
	export let quantity: number = 40;
	export let staticity: number = 50;
	export let ease: number = 50;
	export let size: number = 15;
	export let vx: number = 0.5;
	export let vy: number = 0.8;

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
		flip: number;
		flipSpeed: number;
		swing: number;
		swingSpeed: number;
		color: string;
		darkerColor: string;
	}

	let petals: Petal[] = [];
	let mouse = { x: 0, y: 0 };
	let canvasSize = { w: 0, h: 0 };
	const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

	const colors = [
		{ main: '#ffffff', dark: '#f0f0f0' },
		{ main: '#fff5f7', dark: '#ffe0e5' },
		{ main: '#ffdee5', dark: '#ffb7c5' },
		{ main: '#ffb7c5', dark: '#ff8da1' }
	];

	function petalParams(): Petal {
		const colorPair = colors[Math.floor(Math.random() * colors.length)];
		return {
			x: Math.random() * canvasSize.w,
			y: Math.random() * -canvasSize.h,
			translateX: 0,
			translateY: 0,
			size: Math.random() * size + 8,
			alpha: 0,
			targetAlpha: Math.random() * 0.6 + 0.4,
			dx: (Math.random() - 0.5) * 0.5,
			dy: Math.random() * 0.5 + vy,
			magnetism: 0.1 + Math.random() * 2,
			rotation: Math.random() * Math.PI * 2,
			spin: (Math.random() - 0.5) * 0.02,
			flip: Math.random() * Math.PI,
			flipSpeed: 0.02 + Math.random() * 0.03,
			swing: Math.random() * Math.PI,
			swingSpeed: 0.01 + Math.random() * 0.02,
			color: colorPair.main,
			darkerColor: colorPair.dark
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
		const flutterX = Math.sin(p.swing) * 15;
		const flipScale = Math.cos(p.flip);

		context.save();
		context.translate(p.x + p.translateX + flutterX, p.y + p.translateY);
		context.rotate(p.rotation);
		context.scale(flipScale, 1);

		const grad = context.createRadialGradient(0, 0, 0, 0, 0, p.size);
		grad.addColorStop(0, p.color);
		grad.addColorStop(1, p.darkerColor);

		context.beginPath();
		context.moveTo(0, 0);
		context.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
		context.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);

		context.lineTo(0, p.size * 0.1);

		context.fillStyle = grad;
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
			p.x += p.dx + vx + Math.sin(p.swing) * 0.5; // Wind interaction
			p.rotation += p.spin;
			p.swing += p.swingSpeed;
			p.flip += p.flipSpeed;

			p.translateX += (mouse.x / (staticity / p.magnetism) - p.translateX) / ease;
			p.translateY += (mouse.y / (staticity / p.magnetism) - p.translateY) / ease;

			drawPetal(p);

			if (p.y > canvasSize.h + 20 || p.x > canvasSize.w + 40 || p.x < -40) {
				const newParams = petalParams();
				Object.assign(p, newParams);
				p.y = -20;
				p.x = Math.random() * canvasSize.w;
			}
		});
		requestAnimationFrame(animate);
	}

	function onMouseMove(event: MouseEvent) {
		mouse.x = event.clientX - canvasSize.w / 2;
		mouse.y = event.clientY - canvasSize.h / 2;
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
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		z-index: 0;
		background: transparent;
	}
	canvas {
		display: block;
	}
</style>
