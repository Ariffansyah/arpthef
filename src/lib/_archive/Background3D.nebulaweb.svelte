<script lang="ts">
	let canvas: HTMLCanvasElement;

	import { onMount } from 'svelte';

	onMount(() => {
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
		if (!ctx) return;
		const g: CanvasRenderingContext2D = ctx;

		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		let w = 0;
		let h = 0;

		const WEB_DARK = '235, 226, 255';
		const WEB_HALO_DARK = '178, 132, 255';
		const WEB_LIGHT = '200, 0, 54';
		const WEB_HALO_LIGHT = '255, 90, 90';
		let WEB = WEB_DARK;
		let WEB_HALO = WEB_HALO_DARK;

		let isDark = false;
		function readTheme() {
			isDark = document.documentElement.classList.contains('dark');
			WEB = isDark ? WEB_DARK : WEB_LIGHT;
			WEB_HALO = isDark ? WEB_HALO_DARK : WEB_HALO_LIGHT;
		}
		readTheme();
		const observer = new MutationObserver(readTheme);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		function resize() {
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = Math.max(1, Math.floor(w * dpr));
			canvas.height = Math.max(1, Math.floor(h * dpr));
			g.setTransform(dpr, 0, 0, dpr, 0, 0);
			build();
		}

		let targetTX = 0;
		let targetTY = 0;
		let tx = 0;
		let ty = 0;
		function onMouse(e: MouseEvent) {
			targetTX = (e.clientX / window.innerWidth - 0.5) * 90;
			targetTY = (e.clientY / window.innerHeight - 0.5) * 90;
		}
		window.addEventListener('mousemove', onMouse);

		const BLOBS = [
			{ x: 0.16, y: 0.22, r: 0.34, rgb: '255, 138, 46' },
			{ x: 0.86, y: 0.62, r: 0.4, rgb: '255, 45, 140' },
			{ x: 0.62, y: 0.14, r: 0.26, rgb: '70, 205, 195' },
			{ x: 0.08, y: 0.78, r: 0.3, rgb: '255, 210, 80' },
			{ x: 0.94, y: 0.12, r: 0.22, rgb: '110, 90, 255' }
		];

		type Chord = { r1: number; i1: number; r2: number; i2: number };
		type Web = {
			cx: number; cy: number; radius: number;
			spokes: number; rings: number;
			seed: number; rot: number; bright: number;
			chords: Chord[];
			broken: Set<number>;
		};
		let webs: Web[] = [];
		let stars: { x: number; y: number; size: number; tw: number; twSpeed: number; pal: number }[] = [];
		const DUST_DARK = ['255,255,255', '255,255,255', '255,255,255', '255,180,220', '150,220,255'];
		const DUST_LIGHT = ['90,40,150', '90,40,150', '90,40,150', '190,30,120', '20,140,150'];

		function rand(seed: number) {
			const s = Math.sin(seed * 12.9898) * 43758.5453;
			return s - Math.floor(s);
		}

		function makeChords(spokes: number, rings: number, seed: number): Chord[] {
			const chords: Chord[] = [];
			const count = Math.round(spokes * 1.3);
			for (let c = 0; c < count; c++) {
				const r1 = Math.floor(rand(seed * 300 + c * 11) * rings);
				const r2 = Math.floor(rand(seed * 400 + c * 17) * rings);
				const i1 = Math.floor(rand(seed * 500 + c * 23) * spokes);
				let i2 = Math.floor(rand(seed * 600 + c * 29) * spokes);
				if (i2 === i1) i2 = (i2 + 1 + Math.floor(rand(seed * 700 + c) * (spokes - 2))) % spokes;
				chords.push({ r1, i1, r2, i2 });
			}
			return chords;
		}

		function makeBroken(spokes: number, seed: number): Set<number> {
			const broken = new Set<number>();
			for (let i = 0; i < spokes; i++) {
				if (rand(seed * 800 + i * 41) < 0.12) broken.add(i);
			}
			return broken;
		}

		function build() {
			const short = Math.min(w, h);
			webs = [
				{ cx: w * 0.9, cy: h * 0.12, radius: short * 0.55, spokes: 16, rings: 6, seed: 5.1, rot: -0.02, bright: 0.85, chords: [], broken: new Set() },
				{ cx: w * 0.06, cy: h * 0.88, radius: short * 0.46, spokes: 15, rings: 6, seed: 8.7, rot: 0.017, bright: 0.8, chords: [], broken: new Set() }
			];
			for (const web of webs) {
				web.chords = makeChords(web.spokes, web.rings, web.seed);
				web.broken = makeBroken(web.spokes, web.seed);
			}

			stars = [];
			const starCount = 130;
			for (let i = 0; i < starCount; i++) {
				stars.push({
					x: rand(i + 900) * w,
					y: rand(i + 1000) * h,
					size: 0.5 + rand(i + 1100) * 1.5,
					tw: rand(i + 1200) * Math.PI * 2,
					twSpeed: 0.01 + rand(i + 1300) * 0.025,
					pal: i % DUST_DARK.length
				});
			}
		}

		function spokeAngle(web: Web, i: number, t: number) {
			const spacing = (Math.PI * 2) / web.spokes;
			const jig = (rand(web.seed * 200 + i * 13) - 0.5) * spacing * 0.2;
			const wind = Math.sin(t * web.rot + web.seed) * 0.06;
			return (i / web.spokes) * Math.PI * 2 + wind + web.seed + jig;
		}
		function ringR(web: Web, idx: number, spokeIdx = -1) {
			const base = web.radius * Math.pow((idx + 1) / web.rings, 0.82);
			if (spokeIdx < 0) return base;
			const jitter = (rand(web.seed * 900 + idx * 31 + spokeIdx * 7) - 0.5) * web.radius * 0.05;
			return base + jitter;
		}
		function spokeReach(web: Web, i: number) {
			return web.broken.has(i) ? web.radius * (0.35 + rand(web.seed * 1500 + i) * 0.3) : web.radius;
		}
		function pt(web: Web, i: number, r: number, t: number) {
			const ang = spokeAngle(web, i, t);
			const swayAmp = prefersReduced ? 0 : (r / web.radius) * 7;
			const sway = prefersReduced ? 0 : Math.sin(t * 0.7 + i * 0.9 + web.seed) * swayAmp;
			const px = web.cx + tx * (r / web.radius) * 0.22;
			const py = web.cy + ty * (r / web.radius) * 0.22;
			return {
				x: px + Math.cos(ang) * r - Math.sin(ang) * sway,
				y: py + Math.sin(ang) * r + Math.cos(ang) * sway
			};
		}

		type Pulse = { webIdx: number; spoke: number; ring: number; along: 'spoke' | 'ring'; t: number; speed: number };
		let pulses: Pulse[] = [];
		let pulseTimer = 0;

		resize();
		window.addEventListener('resize', resize);

		let raf = 0;
		let last = performance.now();

		function frame() {
			const now = performance.now();
			const dt = Math.min(0.033, Math.max(0.008, (now - last) / 1000));
			last = now;
			const t = now * 0.001;

			tx += (targetTX - tx) * 0.09;
			ty += (targetTY - ty) * 0.09;

			g.clearRect(0, 0, w, h);
			g.globalAlpha = isDark ? 1 : 0.62;

			const wash = g.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, Math.max(w, h) * 0.85);
			if (isDark) {
				wash.addColorStop(0, 'rgba(58, 26, 92, 0.55)');
				wash.addColorStop(0.55, 'rgba(24, 10, 48, 0.45)');
				wash.addColorStop(1, 'rgba(8, 4, 20, 0.35)');
			} else {
				wash.addColorStop(0, 'rgba(196, 175, 255, 0.28)');
				wash.addColorStop(0.55, 'rgba(214, 195, 255, 0.16)');
				wash.addColorStop(1, 'rgba(255, 255, 255, 0)');
			}
			g.fillStyle = wash;
			g.fillRect(0, 0, w, h);

			for (let i = 0; i < BLOBS.length; i++) {
				const b = BLOBS[i];
				const float = prefersReduced ? 0 : Math.sin(t * 0.15 + i * 1.7) * 14;
				const bx = b.x * w + tx * 0.09 + float;
				const by = b.y * h + ty * 0.09 + float * 0.6;
				const br = b.r * Math.max(w, h);
				const glow = g.createRadialGradient(bx, by, 0, bx, by, br);
				glow.addColorStop(0, `rgba(${b.rgb}, 0.34)`);
				glow.addColorStop(0.5, `rgba(${b.rgb}, 0.15)`);
				glow.addColorStop(1, `rgba(${b.rgb}, 0)`);
				g.fillStyle = glow;
				g.beginPath();
				g.arc(bx, by, br, 0, Math.PI * 2);
				g.fill();
			}

			g.lineCap = 'round';

			if (!prefersReduced) {
				pulseTimer += dt;
				if (pulseTimer > 0.5) {
					pulseTimer = 0;
					if (Math.random() < 0.6 && webs.length) {
						const wi = Math.floor(Math.random() * webs.length);
						const web = webs[wi];
						if (Math.random() < 0.5) {
							pulses.push({ webIdx: wi, spoke: Math.floor(Math.random() * web.spokes), ring: 0, along: 'spoke', t: 0, speed: 0.55 + Math.random() * 0.6 });
						} else {
							pulses.push({ webIdx: wi, spoke: Math.floor(Math.random() * web.spokes), ring: Math.floor(Math.random() * web.rings), along: 'ring', t: 0, speed: 0.45 + Math.random() * 0.55 });
						}
						if (pulses.length > 7) pulses.shift();
					}
				}
			}

			for (let wi = 0; wi < webs.length; wi++) {
				const web = webs[wi];
				const centerX = web.cx + tx * 0.22;
				const centerY = web.cy + ty * 0.22;

				for (let i = 0; i < web.spokes; i++) {
					const isBroken = web.broken.has(i);
					const spokeLen = spokeReach(web, i);
					const end = pt(web, i, spokeLen, t);
					const a = (0.32 + rand(i + wi * 97) * 0.35) * web.bright;
					const lw = 0.8 + rand(i + wi * 53) * 0.9;
					g.strokeStyle = `rgba(${WEB_HALO}, ${a * 0.4})`;
					g.lineWidth = lw + 1.5;
					g.beginPath();
					g.moveTo(centerX, centerY);
					g.lineTo(end.x, end.y);
					g.stroke();
					g.strokeStyle = `rgba(${WEB}, ${a})`;
					g.lineWidth = lw;
					g.beginPath();
					g.moveTo(centerX, centerY);
					g.lineTo(end.x, end.y);
					g.stroke();

					if (isBroken) {
						for (let f = 0; f < 2; f++) {
							const fAng = Math.atan2(end.y - centerY, end.x - centerX) + (f === 0 ? 0.5 : -0.4);
							const fLen = spokeLen * (0.08 + rand(web.seed * 1600 + i * 3 + f) * 0.1);
							const fx = end.x + Math.cos(fAng) * fLen;
							const fy = end.y + Math.sin(fAng) * fLen;
							g.strokeStyle = `rgba(${WEB}, ${a * 0.7})`;
							g.lineWidth = 0.6;
							g.beginPath();
							g.moveTo(end.x, end.y);
							g.lineTo(fx, fy);
							g.stroke();
						}
					}
				}

				for (let ri = 0; ri < web.rings; ri++) {
					const a = (0.26 + (ri / web.rings) * 0.28) * web.bright;
					for (let i = 0; i < web.spokes; i++) {
						if (rand(web.seed * 1900 + ri * 17 + i * 7) < 0.08) continue;
						const j = (i + 1) % web.spokes;
						const r0 = ringR(web, ri, i);
						const r1 = ringR(web, ri, j);
						if (r0 > spokeReach(web, i) || r1 > spokeReach(web, j)) continue;
						const p0 = pt(web, i, r0, t);
						const p1 = pt(web, j, r1, t);
						const sagJig = 0.4 + rand(web.seed * 1100 + ri * 13 + i * 5) * 0.5;
						const mx = (p0.x + p1.x) * 0.5;
						const my = (p0.y + p1.y) * 0.5 + (r0 / web.radius) * 9 * sagJig;
						const lw = 0.5 + rand(web.seed * 2100 + ri * 9 + i) * 0.7;
						g.strokeStyle = `rgba(${WEB_HALO}, ${a * 0.5})`;
						g.lineWidth = lw + 0.85;
						g.beginPath();
						g.moveTo(p0.x, p0.y);
						g.quadraticCurveTo(mx, my, p1.x, p1.y);
						g.stroke();
						g.strokeStyle = `rgba(${WEB}, ${a})`;
						g.lineWidth = lw;
						g.beginPath();
						g.moveTo(p0.x, p0.y);
						g.quadraticCurveTo(mx, my, p1.x, p1.y);
						g.stroke();
					}
				}

				for (const c of web.chords) {
					const cr1 = ringR(web, c.r1, c.i1);
					const cr2 = ringR(web, c.r2, c.i2);
					if (cr1 > spokeReach(web, c.i1) || cr2 > spokeReach(web, c.i2)) continue;
					const p0 = pt(web, c.i1, cr1, t);
					const p1 = pt(web, c.i2, cr2, t);
					const a = 0.16 * web.bright;
					g.strokeStyle = `rgba(${WEB_HALO}, ${a * 0.6})`;
					g.lineWidth = 1.2;
					g.beginPath();
					g.moveTo(p0.x, p0.y);
					g.lineTo(p1.x, p1.y);
					g.stroke();
					g.strokeStyle = `rgba(${WEB}, ${a})`;
					g.lineWidth = 0.65;
					g.beginPath();
					g.moveTo(p0.x, p0.y);
					g.lineTo(p1.x, p1.y);
					g.stroke();
				}
			}

			if (!prefersReduced) {
				for (let pi = pulses.length - 1; pi >= 0; pi--) {
					const p = pulses[pi];
					p.t += p.speed * dt;
					if (p.t >= 1) { pulses.splice(pi, 1); continue; }
					const web = webs[p.webIdx];
					if (!web) continue;
					let x = 0, y = 0;
					if (p.along === 'spoke') {
						const pp = pt(web, p.spoke, web.radius * p.t, t);
						x = pp.x; y = pp.y;
					} else {
						const r = ringR(web, p.ring);
						const a = pt(web, p.spoke, r, t);
						const b = pt(web, (p.spoke + 1) % web.spokes, r, t);
						const mx = (a.x + b.x) * 0.5, my = (a.y + b.y) * 0.5 + (r / web.radius) * 9;
						const tt = p.t;
						x = (1 - tt) * (1 - tt) * a.x + 2 * (1 - tt) * tt * mx + tt * tt * b.x;
						y = (1 - tt) * (1 - tt) * a.y + 2 * (1 - tt) * tt * my + tt * tt * b.y;
					}
					const prog = Math.sin(p.t * Math.PI);
					const glowR = 3 + prog * 5;
					const glow = g.createRadialGradient(x, y, 0, x, y, glowR);
					glow.addColorStop(0, `rgba(${WEB}, ${prog * 0.85})`);
					glow.addColorStop(1, `rgba(${WEB_HALO}, 0)`);
					g.fillStyle = glow;
					g.beginPath();
					g.arc(x, y, glowR, 0, Math.PI * 2);
					g.fill();
					g.fillStyle = isDark ? `rgba(255, 255, 255, ${prog})` : `rgba(${WEB_HALO}, ${prog})`;
					g.beginPath();
					g.arc(x, y, 1.4 + prog * 1.2, 0, Math.PI * 2);
					g.fill();
				}
			}

			for (const s of stars) {
				s.tw += prefersReduced ? 0 : s.twSpeed;
				const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.tw));
				const rgb = isDark ? DUST_DARK[s.pal] : DUST_LIGHT[s.pal];
				g.fillStyle = `rgba(${rgb}, ${twinkle * 0.85})`;
				g.beginPath();
				g.arc(s.x + tx * 0.16, s.y + ty * 0.16, s.size, 0, Math.PI * 2);
				g.fill();
			}

			g.globalAlpha = 1;
			raf = requestAnimationFrame(frame);
		}
		raf = requestAnimationFrame(frame);

		return () => {
			cancelAnimationFrame(raf);
			observer.disconnect();
			window.removeEventListener('resize', resize);
			window.removeEventListener('mousemove', onMouse);
		};
	});
</script>

<canvas bind:this={canvas} class="h-full w-full"></canvas>
