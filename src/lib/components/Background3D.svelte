<script lang="ts">
	import { onMount } from 'svelte';

	export let nodeCount = 100;
	export let linkDistance = 220;

	let canvas: HTMLCanvasElement;

	type Node = {
		x: number; y: number; z: number;
		vx: number; vy: number; vz: number;
		phase: number;
		twinklePhase: number;
		twinkleSpeed: number;
		sizeMod: number;
	};

	onMount(() => {
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
		if (!ctx) return;
		const g: CanvasRenderingContext2D = ctx;

		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		let w = 0;
		let h = 0;

		let inkRGB = '12, 24, 68';
		let brandRGB = '200, 0, 54';
		let accentRGB = '255, 105, 105';

		function toRGB(value: string, fallback: string): string {
			const v = value.trim();
			const m = v.match(/^#?([0-9a-f]{6})$/i);
			if (m) {
				const n = parseInt(m[1], 16);
				return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
			}
			return fallback;
		}

		function readColors() {
			const s = getComputedStyle(document.documentElement);
			inkRGB = toRGB(s.getPropertyValue('--ink'), inkRGB);
			brandRGB = toRGB(s.getPropertyValue('--brand'), brandRGB);
			accentRGB = toRGB(s.getPropertyValue('--edge-strong'), accentRGB);
		}
		readColors();

		const observer = new MutationObserver(readColors);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		const R = 600;
		const nodes: Node[] = [];
		for (let i = 0; i < nodeCount; i++) {
			const u = Math.random();
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);
			const r = R * Math.cbrt(u);
			nodes.push({
				x: r * Math.sin(phi) * Math.cos(theta),
				y: r * Math.sin(phi) * Math.sin(theta),
				z: r * Math.cos(phi),
				vx: (Math.random() - 0.5) * 0.08,
				vy: (Math.random() - 0.5) * 0.08,
				vz: (Math.random() - 0.5) * 0.08,
				phase: Math.random() * Math.PI * 2,
				twinklePhase: Math.random() * Math.PI * 2,
				twinkleSpeed: 0.01 + Math.random() * 0.03,
				sizeMod: 0.6 + Math.random() * 0.8,
			});
		}

		const starCount = 120;
		const stars: { x: number; y: number; z: number; size: number; twinkle: number; twinkleSpeed: number }[] = [];
		for (let i = 0; i < starCount; i++) {
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);
			const r = R * 2.5 + Math.random() * R * 2;
			stars.push({
				x: r * Math.sin(phi) * Math.cos(theta),
				y: r * Math.sin(phi) * Math.sin(theta),
				z: r * Math.cos(phi),
				size: 0.3 + Math.random() * 0.8,
				twinkle: Math.random() * Math.PI * 2,
				twinkleSpeed: 0.005 + Math.random() * 0.02,
			});
		}

		function resize() {
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = Math.max(1, Math.floor(w * dpr));
			canvas.height = Math.max(1, Math.floor(h * dpr));
			g.setTransform(dpr, 0, 0, dpr, 0, 0);
		}
		resize();
		window.addEventListener('resize', resize);

		let targetTiltX = 0;
		let targetTiltY = 0;
		let tiltX = 0;
		let tiltY = 0;
		function onMouse(e: MouseEvent) {
			targetTiltY = (e.clientX / window.innerWidth - 0.5) * 0.8;
			targetTiltX = (e.clientY / window.innerHeight - 0.5) * 0.8;
		}
		window.addEventListener('mousemove', onMouse);

		let scrollY = 0;
		function onScroll() {
			scrollY = window.scrollY || document.documentElement.scrollTop || 0;
		}
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		const FOV = 1000;
		let angle = 0;
		let raf = 0;

		const projected = nodes.map(() => ({ x: 0, y: 0, scale: 0, depth: 0 }));
		const starProjected = stars.map(() => ({ x: 0, y: 0, scale: 0, depth: 0 }));

		let pulses: { from: number; progress: number; speed: number }[] = [];
		let pulseTimer = 0;

		function frame() {
			angle += prefersReduced ? 0 : 0.0018;
			tiltX += (targetTiltX - tiltX) * 0.04;
			tiltY += (targetTiltY - tiltY) * 0.04;

			const scrollRotY = scrollY * 0.0015;
			const scrollRotX = scrollY * 0.0005;
			const ay = angle + tiltY + scrollRotY;
			const ax = tiltX + Math.sin(angle * 0.5) * 0.15 + scrollRotX;
			const cosY = Math.cos(ay);
			const sinY = Math.sin(ay);
			const cosX = Math.cos(ax);
			const sinX = Math.sin(ax);
			const cx = w / 2;
			const cy = h / 2 + Math.sin(scrollY * 0.0009) * (h * 0.2);

			const t = performance.now() * 0.001;
			for (let i = 0; i < nodes.length; i++) {
				const n = nodes[i];
				if (!prefersReduced) {
					const drift = Math.sin(t * 0.3 + n.phase) * 0.3;
					const driftY = Math.cos(t * 0.25 + n.phase * 1.3) * 0.3;
					const driftZ = Math.sin(t * 0.2 + n.phase * 0.7) * 0.3;
					n.x += n.vx + drift * 0.02;
					n.y += n.vy + driftY * 0.02;
					n.z += n.vz + driftZ * 0.02;
				}
				const x1 = n.x * cosY - n.z * sinY;
				const z1 = n.x * sinY + n.z * cosY;
				const y1 = n.y * cosX - z1 * sinX;
				const z2 = n.y * sinX + z1 * cosX;
				const scale = FOV / (FOV + z2);
				const p = projected[i];
				p.x = cx + x1 * scale;
				p.y = cy + y1 * scale;
				p.scale = scale;
				p.depth = z2;
			}

			for (let i = 0; i < stars.length; i++) {
				const s = stars[i];
				const x1 = s.x * cosY - s.z * sinY;
				const z1 = s.x * sinY + s.z * cosY;
				const y1 = s.y * cosX - z1 * sinX;
				const z2 = s.y * sinX + z1 * cosX;
				const scale = FOV / (FOV + z2);
				const p = starProjected[i];
				p.x = cx + x1 * scale;
				p.y = cy + y1 * scale;
				p.scale = scale;
				p.depth = z2;
			}

			g.clearRect(0, 0, w, h);

			// Distant stars (ink-colored, tiny)
			const starOrder = starProjected.map((_, i) => i).sort((a, b) => starProjected[b].depth - starProjected[a].depth);
			for (const i of starOrder) {
				const s = stars[i];
				const p = starProjected[i];
				if (p.scale < 0.05) continue;
				s.twinkle += s.twinkleSpeed;
				const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(s.twinkle));
				const alpha = Math.min(1, p.scale * 0.8) * twinkle * 0.5;
				if (alpha < 0.01) continue;
				g.fillStyle = `rgba(${inkRGB}, ${alpha})`;
				g.beginPath();
				g.arc(p.x, p.y, s.size * p.scale, 0, Math.PI * 2);
				g.fill();
			}

			// Connection pulse spawn
			if (!prefersReduced) {
				pulseTimer += 0.005;
				if (pulseTimer > 1) {
					pulseTimer = 0;
					if (Math.random() < 0.3) {
						pulses.push({ from: Math.floor(Math.random() * nodes.length), progress: 0, speed: 0.006 + Math.random() * 0.006 });
					}
				}
			}

			// Links
			g.lineWidth = 1;
			for (let i = 0; i < nodes.length; i++) {
				for (let j = i + 1; j < nodes.length; j++) {
					const a = nodes[i];
					const b = nodes[j];
					const dx = a.x - b.x;
					const dy = a.y - b.y;
					const dz = a.z - b.z;
					const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
					if (dist > linkDistance) continue;
					const pa = projected[i];
					const pb = projected[j];
					const closeness = 1 - dist / linkDistance;
					const depthFade = (pa.scale + pb.scale) / 2;
					const alpha = closeness * depthFade * 0.35;
					if (alpha < 0.01) continue;
					g.strokeStyle = `rgba(${brandRGB}, ${alpha})`;
					g.beginPath();
					g.moveTo(pa.x, pa.y);
					g.lineTo(pb.x, pb.y);
					g.stroke();
				}
			}

			// Pulse waves along connections
			if (!prefersReduced) {
				for (let pi = pulses.length - 1; pi >= 0; pi--) {
					const pulse = pulses[pi];
					pulse.progress += pulse.speed;
					if (pulse.progress >= 1) {
						pulses.splice(pi, 1);
						continue;
					}
					const fromNode = nodes[pulse.from];
					for (let j = 0; j < nodes.length; j++) {
						if (j === pulse.from) continue;
						const toNode = nodes[j];
						const dx = fromNode.x - toNode.x;
						const dy = fromNode.y - toNode.y;
						const dz = fromNode.z - toNode.z;
						const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
						if (dist > linkDistance || dist < 10) continue;
						const pa = projected[pulse.from];
						const pb = projected[j];
						if (pa.scale < 0.1 || pb.scale < 0.1) continue;

						const mx = pa.x + (pb.x - pa.x) * pulse.progress;
						const my = pa.y + (pb.y - pa.y) * pulse.progress;

						const pulseAlpha = Math.sin(pulse.progress * Math.PI) * 0.8;
						const r = 2 + pulseAlpha * 3;
						const glow = g.createRadialGradient(mx, my, 0, mx, my, r * 4);
						glow.addColorStop(0, `rgba(${accentRGB}, ${pulseAlpha * 0.6})`);
						glow.addColorStop(1, `rgba(${accentRGB}, 0)`);
						g.fillStyle = glow;
						g.beginPath();
						g.arc(mx, my, r * 4, 0, Math.PI * 2);
						g.fill();

						g.fillStyle = `rgba(${accentRGB}, ${pulseAlpha})`;
						g.beginPath();
						g.arc(mx, my, r, 0, Math.PI * 2);
						g.fill();
					}
				}
			}

			// Nodes — back-to-front, twinkling
			const order = projected.map((_, i) => i).sort((a, b) => projected[b].depth - projected[a].depth);
			for (const i of order) {
				const n = nodes[i];
				const p = projected[i];
				if (p.scale < 0.05) continue;

				n.twinklePhase += n.twinkleSpeed;
				const twinkle = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(n.twinklePhase));

				const radius = Math.max(0.6, 2.2 * p.scale * n.sizeMod) * twinkle;
				const alpha = Math.min(1, p.scale * p.scale) * twinkle;

				// Outer glow (multi-stop for softer falloff)
				const glowRadius = radius * (3 + twinkle * 2);
				const glow = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
				glow.addColorStop(0, `rgba(${brandRGB}, ${alpha * 0.45})`);
				glow.addColorStop(0.4, `rgba(${brandRGB}, ${alpha * 0.2})`);
				glow.addColorStop(1, `rgba(${brandRGB}, 0)`);
				g.fillStyle = glow;
				g.beginPath();
				g.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
				g.fill();

				// Inner core
				g.fillStyle = `rgba(${brandRGB}, ${alpha})`;
				g.beginPath();
				g.arc(p.x, p.y, radius, 0, Math.PI * 2);
				g.fill();

				// Bright point center
				g.fillStyle = `rgba(${inkRGB}, ${alpha * 0.6})`;
				g.beginPath();
				g.arc(p.x, p.y, radius * 0.35, 0, Math.PI * 2);
				g.fill();
			}

			raf = requestAnimationFrame(frame);
		}
		raf = requestAnimationFrame(frame);

		return () => {
			cancelAnimationFrame(raf);
			observer.disconnect();
			window.removeEventListener('resize', resize);
			window.removeEventListener('mousemove', onMouse);
			window.removeEventListener('scroll', onScroll);
		};
	});
</script>

<canvas bind:this={canvas} class="h-full w-full"></canvas>
