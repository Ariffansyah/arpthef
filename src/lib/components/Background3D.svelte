<script lang="ts">
	import { onMount } from 'svelte';
	import { DIMENSIONS, rgb } from '$lib/dimensions';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const g = ctx;

		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const TAU = Math.PI * 2;

		let w = 0;
		let h = 0;

		/* Flat blocks the film's glitches are printed in. */
		const GLITCH = ['0,229,255', '255,45,150', '255,230,0', '140,90,255', '170,255,60'];

		/* Spider-Verse multiverse palette. Each dimension (theme) has its own
		   web ink, chromatic-aberration pair, wash and nebula blobs. The CA pair
		   is what sells the "two printing plates misaligned" look — additive in
		   the dark dimension, subtractive on the light one. */
		const PAL = {
			dark: {
				web: rgb(DIMENSIONS.dark.ink),
				ca1: rgb(DIMENSIONS.dark.plateA),
				ca2: rgb(DIMENSIONS.dark.plateB),
				comp: 'lighter' as GlobalCompositeOperation,
				alpha: 1,
				wash: [
					[0, 'rgba(58,26,92,0.60)'],
					[0.55, 'rgba(22,8,48,0.50)'],
					[1, 'rgba(6,3,18,0.40)']
				] as [number, string][],
				blobs: [
					{ x: 0.16, y: 0.22, r: 0.34, rgb: '255,138,46' },
					{ x: 0.86, y: 0.62, r: 0.4, rgb: '255,45,140' },
					{ x: 0.62, y: 0.14, r: 0.26, rgb: '70,205,195' },
					{ x: 0.08, y: 0.78, r: 0.3, rgb: '255,210,80' },
					{ x: 0.94, y: 0.12, r: 0.22, rgb: '110,90,255' }
				],
				dust: ['255,255,255', '255,255,255', '255,255,255', '255,180,220', '150,220,255']
			},
			light: {
				web: rgb(DIMENSIONS.light.ink),
				ca1: rgb(DIMENSIONS.light.plateA),
				ca2: rgb(DIMENSIONS.light.plateB),
				comp: 'source-over' as GlobalCompositeOperation,
				alpha: 0.66,
				wash: [
					[0, 'rgba(196,175,255,0.30)'],
					[0.55, 'rgba(255,190,225,0.18)'],
					[1, 'rgba(255,255,255,0)']
				] as [number, string][],
				blobs: [
					{ x: 0.16, y: 0.22, r: 0.34, rgb: '255,150,90' },
					{ x: 0.86, y: 0.62, r: 0.4, rgb: '255,110,199' },
					{ x: 0.62, y: 0.14, r: 0.26, rgb: '111,231,224' },
					{ x: 0.08, y: 0.78, r: 0.3, rgb: '255,222,130' },
					{ x: 0.94, y: 0.12, r: 0.22, rgb: '160,145,255' }
				],
				dust: ['90,40,150', '90,40,150', '90,40,150', '190,30,120', '20,140,150']
			}
		};

		let P = PAL.dark;
		let isDark = false;
		function readTheme() {
			isDark = document.documentElement.classList.contains('dark');
			P = isDark ? PAL.dark : PAL.light;
		}
		readTheme();
		const observer = new MutationObserver(readTheme);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		function rand(seed: number) {
			const s = Math.sin(seed * 12.9898) * 43758.5453;
			return s - Math.floor(s);
		}

		/* ---------- parallax ---------- */
		let targetTX = 0;
		let targetTY = 0;
		let tx = 0;
		let ty = 0;
		function onMouse(e: MouseEvent) {
			targetTX = (e.clientX / window.innerWidth - 0.5) * 90;
			targetTY = (e.clientY / window.innerHeight - 0.5) * 90;
		}
		window.addEventListener('mousemove', onMouse);

		/* ---------- webs ---------- */
		type Web = {
			cx: number;
			cy: number;
			radius: number;
			spokes: number;
			rings: number;
			seed: number;
			rot: number;
			bright: number;
			off: number;
			broken: Set<number>;
		};
		let webs: Web[] = [];
		let stars: { x: number; y: number; size: number; tw: number; twSpeed: number; pal: number }[] = [];

		/* ---------- portals ---------- */
		/* Across the Spider-Verse dimension portal: faceted lavender crystal
		   around a tunnel of orange rings. Same in both themes — it's a hole
		   into somewhere else. `tilt` is the direction the tunnel recedes. */
		const PORTAL = {
			glow: '190,140,255',
			shell: '205,165,255',
			facet: '250,235,255',
			ring: '255,128,24',
			rim: '255,214,110',
			deep: '28,6,60',
			mouth: '112,44,190'
		};
		const RIFTS = [
			{ x: 0.87, y: 0.12, r: 0.2, seed: 3.2, spin: 0.1, phase: 0, period: 0.13, depth: 0.5, tilt: 0.8, label: 'EARTH-928' },
			{ x: 0.13, y: 0.73, r: 0.2, seed: 7.7, spin: -0.13, phase: 2.1, period: 0.1, depth: 0.8, tilt: -0.5, label: 'EARTH-65' },
			{ x: 0.5, y: 1.02, r: 0.15, seed: 11.3, spin: 0.08, phase: 4.0, period: 0.16, depth: 1.2, tilt: -1.6, label: 'EARTH-50101' }
		];

		/* Sparks flung off the portal rims. */
		type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; rgb: string };
		let sparks: Spark[] = [];

		type Suit = { suit: string; legs: string; accent: string; head: 'mask' | 'hood' | 'spikes' };
		const SPIDERS: Suit[] = [
			{ suit: '18,16,24', legs: '18,16,24', accent: '228,28,48', head: 'mask' },
			{ suit: '246,244,250', legs: '246,244,250', accent: '255,92,170', head: 'hood' },
			{ suit: '22,34,102', legs: '22,34,102', accent: '232,40,40', head: 'mask' },
			{ suit: '206,28,40', legs: '32,58,168', accent: '18,16,24', head: 'mask' },
			{ suit: '196,30,44', legs: '28,44,130', accent: '255,226,0', head: 'spikes' },
			{ suit: '222,40,44', legs: '30,70,200', accent: '255,186,40', head: 'mask' }
		];
		const INK = '14,10,26';
		const ARMS = [
			[0.06, -0.4, 0.12, -0.6, 0.14, -0.8],
			[-0.07, -0.38, -0.25, -0.3, -0.33, -0.44]
		];
		const LEGS = [
			[0.05, 0, 0.22, 0.12, 0.12, 0.34],
			[-0.05, 0, -0.1, 0.22, -0.3, 0.28]
		];
		const HAND = { x: 0.14, y: -0.8 };
		const ENDS = [...RIFTS, { x: -0.08, y: 0.3, depth: 0.6 }, { x: 1.08, y: 0.4, depth: 0.6 }];
		type Swinger = { a: number; b: number; ax: number; ay: number; p: number; dur: number; suit: Suit };
		let swingers: Swinger[] = [];
		let swingNext = 1.5;

		type Hole = { x: number; y: number; r: number; age: number; life: number; seed: number };
		let holes: Hole[] = [];
		let holeNext = 4;

		function makeBroken(spokes: number, seed: number): Set<number> {
			const broken = new Set<number>();
			for (let i = 0; i < spokes; i++) if (rand(seed * 800 + i * 41) < 0.12) broken.add(i);
			return broken;
		}

		function build() {
			const short = Math.min(w, h);
			webs = [
				{ cx: w * 0.9, cy: h * 0.12, radius: short * 0.55, spokes: 16, rings: 7, seed: 5.1, rot: -0.02, bright: 0.85, off: 2.2, broken: new Set() },
				{ cx: w * 0.06, cy: h * 0.88, radius: short * 0.46, spokes: 15, rings: 6, seed: 8.7, rot: 0.017, bright: 0.8, off: 1.4, broken: new Set() }
			];
			for (const web of webs) web.broken = makeBroken(web.spokes, web.seed);

			stars = [];
			for (let i = 0; i < 130; i++) {
				stars.push({
					x: rand(i + 900) * w,
					y: rand(i + 1000) * h,
					size: 0.5 + rand(i + 1100) * 1.5,
					tw: rand(i + 1200) * TAU,
					twSpeed: 0.01 + rand(i + 1300) * 0.025,
					pal: i % 5
				});
			}
		}

		function resize() {
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = Math.max(1, Math.floor(w * dpr));
			canvas.height = Math.max(1, Math.floor(h * dpr));
			g.setTransform(dpr, 0, 0, dpr, 0, 0);
			build();
		}

		function spokeAngle(web: Web, i: number, t: number) {
			const spacing = TAU / web.spokes;
			const jig = (rand(web.seed * 200 + i * 13) - 0.5) * spacing * 0.2;
			const wind = Math.sin(t * web.rot + web.seed) * 0.06;
			return (i / web.spokes) * TAU + wind + web.seed + jig;
		}
		function ringR(web: Web, idx: number, spokeIdx: number) {
			const base = web.radius * Math.pow((idx + 1) / web.rings, 0.82);
			return base + (rand(web.seed * 900 + idx * 31 + spokeIdx * 7) - 0.5) * web.radius * 0.05;
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
		/* Capture thread from spoke i to i+1 on ring ri. Drawn the comic-book
		   way: straight spokes, each thread scalloped in towards the hub. */
		function thread(web: Web, ri: number, i: number, t: number) {
			if (rand(web.seed * 1900 + ri * 17 + i * 7) < 0.06) return null;
			const j = (i + 1) % web.spokes;
			const r0 = ringR(web, ri, i);
			const r1 = ringR(web, ri, j);
			if (r0 > spokeReach(web, i) || r1 > spokeReach(web, j)) return null;
			const p0 = pt(web, i, r0, t);
			const p1 = pt(web, j, r1, t);
			const hx = web.cx + tx * 0.22;
			const hy = web.cy + ty * 0.22;
			const k = 0.14 + rand(web.seed * 1100 + ri * 13 + i * 5) * 0.08;
			const mx = (p0.x + p1.x) * 0.5;
			const my = (p0.y + p1.y) * 0.5;
			return { p0, p1, cx: mx + (hx - mx) * k, cy: my + (hy - my) * k };
		}

		/* Stroke a path three times: cyan plate shifted left, magenta plate
		   shifted right, ink plate dead centre. `draw` re-issues the geometry
		   with the given offset. */
		function caStroke(draw: (dx: number, dy: number) => void, a: number, lw: number, off: number, ink = P.web) {
			g.globalCompositeOperation = P.comp;
			g.lineWidth = lw + 0.5;
			g.strokeStyle = `rgba(${P.ca1}, ${a * 0.55})`;
			draw(-off, off * 0.35);
			g.strokeStyle = `rgba(${P.ca2}, ${a * 0.55})`;
			draw(off, -off * 0.35);
			g.globalCompositeOperation = 'source-over';
			g.lineWidth = lw;
			g.strokeStyle = `rgba(${ink}, ${a})`;
			draw(0, 0);
		}

		/* Irregular n-gon. Same seed = same silhouette at any size, which is
		   what lets the tunnel rings nest inside the mouth. */
		type Pt = { x: number; y: number };
		function ngon(n: number, seed: number, cx: number, cy: number, r: number, rot: number, jit: number): Pt[] {
			const out: Pt[] = [];
			for (let i = 0; i < n; i++) {
				const a = rot + ((i + (rand(seed + i) - 0.5) * 0.35) / n) * TAU;
				const rr = r * (1 - jit + rand(seed + i * 7.3) * jit * 2);
				out.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr });
			}
			return out;
		}
		function poly(p: Pt[], dx = 0, dy = 0) {
			g.moveTo(p[0].x + dx, p[0].y + dy);
			for (let i = 1; i < p.length; i++) g.lineTo(p[i].x + dx, p[i].y + dy);
			g.closePath();
		}

		function blob(x: number, y: number, r: number, seed: number, boil: number) {
			g.beginPath();
			for (let i = 0; i < 16; i++) {
				const a = (i / 16) * TAU;
				const rr = r * (0.88 + rand(seed + i * 7 + boil * 101) * 0.24);
				g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
			}
			g.closePath();
		}

		function spider(x: number, y: number, s: number, rot: number, flip: number, sp: Suit, mono?: string) {
			if (s < 1) return;
			g.save();
			g.translate(x, y);
			g.rotate(rot);
			g.scale(flip * s, s);
			g.lineCap = 'round';
			g.lineJoin = 'round';
			const line = (p: number[], lw: number, col: string) => {
				g.lineWidth = lw;
				g.strokeStyle = col;
				g.beginPath();
				g.moveTo(p[0], p[1]);
				for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]);
				g.stroke();
			};
			const oval = (cx: number, cy: number, rx: number, ry: number, r: number, col: string) => {
				g.fillStyle = col;
				g.beginPath();
				g.ellipse(cx, cy, rx, ry, r, 0, TAU);
				g.fill();
			};
			const body = (e: number, top: string, bottom: string) => {
				for (const l of LEGS) line(l, 0.09 + e, bottom);
				for (const a of ARMS) line(a, 0.08 + e, top);
				line([0, 0.02, 0, -0.38], 0.19 + e, top);
				line([-0.06, -0.33, 0.06, -0.33], 0.15 + e, top);
				if (sp.head === 'hood') oval(-0.03, -0.55, 0.15 + e / 2, 0.16 + e / 2, -0.4, top);
				oval(0, -0.53, 0.11 + e / 2, 0.13 + e / 2, 0, top);
			};

			const ink = mono ?? `rgb(${INK})`;
			if (sp.head === 'spikes') {
				g.fillStyle = ink;
				g.beginPath();
				for (let k = 0; k < 4; k++) {
					const a = -2.5 + k * 0.42;
					g.moveTo(Math.cos(a - 0.2) * 0.1, -0.53 + Math.sin(a - 0.2) * 0.12);
					g.lineTo(Math.cos(a) * 0.24, -0.53 + Math.sin(a) * 0.26);
					g.lineTo(Math.cos(a + 0.2) * 0.1, -0.53 + Math.sin(a + 0.2) * 0.12);
				}
				g.fill();
			}
			body(mono ? 0.02 : 0.05, ink, ink);

			if (!mono) {
				body(0, `rgb(${sp.suit})`, `rgb(${sp.legs})`);
				const acc = `rgb(${sp.accent})`;
				if (sp.head === 'hood') {
					oval(0.01, -0.53, 0.12, 0.14, 0, acc);
					oval(0.015, -0.53, 0.095, 0.115, 0, `rgb(${sp.suit})`);
				}
				g.strokeStyle = acc;
				g.lineWidth = 0.025;
				g.beginPath();
				g.moveTo(-0.045, -0.3);
				g.lineTo(0.045, -0.16);
				g.moveTo(0.045, -0.3);
				g.lineTo(-0.045, -0.16);
				g.stroke();
				oval(0, -0.23, 0.025, 0.04, 0, acc);
				for (const e of [-1, 1]) {
					g.beginPath();
					g.ellipse(e * 0.05, -0.545, 0.05, 0.032, -e * 0.5, 0, TAU);
					g.fillStyle = '#fff';
					g.fill();
					g.lineWidth = 0.02;
					g.strokeStyle = `rgb(${INK})`;
					g.stroke();
				}
			}
			g.restore();
		}

		function swingAt(sw: Swinger, p: number) {
			const A = ENDS[sw.a];
			const B = ENDS[sw.b];
			const u = (1 - Math.cos(Math.PI * p)) / 2;
			const sx = A.x * w + tx * A.depth * 0.5;
			const sy = A.y * h + ty * A.depth * 0.5;
			const ex = B.x * w + tx * B.depth * 0.5;
			const ey = B.y * h + ty * B.depth * 0.5;
			const sag = Math.min(h * 0.25, Math.abs(ex - sx) * 0.3);
			return { x: sx + (ex - sx) * u, y: sy + (ey - sy) * u + sag * Math.sin(Math.PI * u) };
		}

		function sfx(text: string, x: number, y: number, size: number, tilt: number) {
			g.save();
			g.translate(x, y);
			g.rotate(tilt);
			g.font = `italic 900 ${Math.round(size)}px Impact, 'Arial Black', sans-serif`;
			g.textAlign = 'center';
			g.lineJoin = 'round';
			g.lineWidth = Math.max(2, size * 0.16);
			g.strokeStyle = `rgb(${INK})`;
			g.strokeText(text, 0, 0);
			g.fillStyle = 'rgb(255,230,0)';
			g.fillText(text, 0, 0);
			g.restore();
		}

		function caption(text: string, x: number, y: number) {
			g.save();
			g.translate(x, y);
			g.rotate(-0.06);
			g.font = "700 11px 'Fira Code', monospace";
			const bw = g.measureText(text).width + 12;
			g.fillStyle = 'rgb(255,230,0)';
			g.fillRect(-bw / 2, -10, bw, 20);
			g.strokeStyle = `rgb(${INK})`;
			g.lineWidth = 1.5;
			g.strokeRect(-bw / 2, -10, bw, 20);
			g.fillStyle = `rgb(${INK})`;
			g.textAlign = 'center';
			g.textBaseline = 'middle';
			g.fillText(text, 0, 1);
			g.restore();
		}

		type Pulse = { webIdx: number; spoke: number; ring: number; along: 'spoke' | 'ring'; t: number; speed: number };
		let pulses: Pulse[] = [];
		let pulseTimer = 0;
		let glitchUntil = 0;
		let glitchNext = 2.5;

		resize();
		window.addEventListener('resize', resize);

		let raf = 0;
		const start = performance.now();
		let lastT = 0;

		function frame() {
			const now = performance.now();
			/* Animated on twos, like the film: motion advances in 12 fps steps,
			   only the mouse parallax (the "camera") runs on ones. */
			const step = Math.floor((now - start) * 0.012);
			const t = step / 12;
			const dt = Math.min(0.1, t - lastT);
			lastT = t;

			tx += (targetTX - tx) * 0.09;
			ty += (targetTY - ty) * 0.09;

			if (dt === 0 && Math.abs(targetTX - tx) < 0.05 && Math.abs(targetTY - ty) < 0.05) {
				raf = requestAnimationFrame(frame);
				return;
			}

			g.clearRect(0, 0, w, h);
			g.globalAlpha = P.alpha;

			/* --- wash --- */
			const wash = g.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, Math.max(w, h) * 0.85);
			for (const [stop, col] of P.wash) wash.addColorStop(stop, col);
			g.fillStyle = wash;
			g.fillRect(0, 0, w, h);

			/* --- nebula blobs --- */
			for (let i = 0; i < P.blobs.length; i++) {
				const b = P.blobs[i];
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
				g.arc(bx, by, br, 0, TAU);
				g.fill();
			}

			g.lineCap = 'round';
			const short = Math.min(w, h);

			if (!prefersReduced) {
				if (t > holeNext) {
					holeNext = t + 5 + Math.random() * 7;
					if (holes.length < 3)
						holes.push({ x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.7, r: 0.025 + Math.random() * 0.04, age: 0, life: 2.5 + Math.random() * 2.5, seed: Math.random() * 100 });
				}
				const boil = step % 3;
				for (let i = holes.length - 1; i >= 0; i--) {
					const o = holes[i];
					o.age += dt;
					if (o.age >= o.life) {
						holes.splice(i, 1);
						continue;
					}
					const R = o.r * short * Math.min(1, o.age / 0.3, (o.life - o.age) / 0.3);
					const x = o.x * w + tx * 0.12;
					const y = o.y * h + ty * 0.12;
					g.fillStyle = 'rgba(6,4,12,0.92)';
					blob(x, y, R, o.seed, boil);
					g.fill();
					for (let d = 0; d < 3; d++) {
						const da = rand(o.seed + d * 3) * TAU;
						const dd = R * (1.25 + rand(o.seed + d * 5) * 0.5);
						blob(x + Math.cos(da) * dd, y + Math.sin(da) * dd, R * (0.1 + rand(o.seed + d * 9) * 0.15), o.seed + d, boil);
						g.fill();
					}
					g.strokeStyle = isDark ? 'rgba(255,255,255,0.5)' : `rgba(${INK},0.45)`;
					g.lineWidth = 0.8;
					for (let k = 0; k < 2; k++) {
						blob(x, y, R * (1.08 + k * 0.08), o.seed + 50 + k, boil);
						g.stroke();
					}
				}
			}

			/* --- portals --- */
			for (const rf of RIFTS) {
				const open = prefersReduced ? 0.93 : 0.86 + 0.14 * Math.sin(t * rf.period * TAU + rf.phase);
				const R = short * rf.r * open;
				const cx = rf.x * w + tx * rf.depth * 0.5;
				const cy = rf.y * h + ty * rf.depth * 0.5;
				const rot = rf.seed + (prefersReduced ? 0 : t * rf.spin * 0.5);
				// out of focus = out of register: nearer portals misprint more
				const off = 2.2 * rf.depth;

				// the tunnel bends away from the viewer; parallax swings its far end
				const vx = cx + Math.cos(rf.tilt) * R * 0.3 - tx * rf.depth * 0.4;
				const vy = cy + Math.sin(rf.tilt) * R * 0.3 - ty * rf.depth * 0.4;
				const mx = cx + (vx - cx) * 0.15;
				const my = cy + (vy - cy) * 0.15;

				const outer = ngon(9, rf.seed * 10, cx, cy, R, rot, 0.1);
				const mid = ngon(9, rf.seed * 20, cx, cy, R * 0.8, rot + TAU / 18, 0.08);
				const mouth = ngon(7, rf.seed * 30, mx, my, R * 0.58, rot * 1.2, 0.06);

				// lavender bloom
				g.globalCompositeOperation = P.comp;
				const halo = g.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.7);
				halo.addColorStop(0, `rgba(${PORTAL.glow}, ${isDark ? 0.5 : 0.4})`);
				halo.addColorStop(1, `rgba(${PORTAL.glow}, 0)`);
				g.fillStyle = halo;
				g.beginPath();
				g.arc(cx, cy, R * 1.7, 0, TAU);
				g.fill();
				g.globalCompositeOperation = 'source-over';

				// crystal shell between rim and mouth
				const shell = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
				shell.addColorStop(0, `rgba(${PORTAL.facet}, 0.5)`);
				shell.addColorStop(0.5, `rgba(${PORTAL.shell}, 0.38)`);
				shell.addColorStop(1, `rgba(${PORTAL.glow}, 0.55)`);
				g.fillStyle = shell;
				g.beginPath();
				poly(outer);
				poly(mouth);
				g.fill('evenodd');

				// wireframe facets
				g.strokeStyle = `rgba(${PORTAL.facet}, 0.55)`;
				g.lineWidth = 0.8;
				g.beginPath();
				poly(mid);
				for (let i = 0; i < 9; i++) {
					const o = outer[i];
					const o2 = outer[(i + 1) % 9];
					const m = mid[i];
					const q = mouth[Math.round((i * 7) / 9) % 7];
					g.moveTo(o.x, o.y);
					g.lineTo(m.x, m.y);
					g.lineTo(o2.x, o2.y);
					g.moveTo(m.x, m.y);
					g.lineTo(q.x, q.y);
					// cracks cutting across facets
					if (rand(rf.seed * 44 + i) < 0.5) {
						const c = mid[(i + 2) % 9];
						g.moveTo(o.x, o.y);
						g.lineTo(c.x, c.y);
					}
				}
				g.stroke();

				// the other dimension: dark violet deepening towards the far end
				g.save();
				g.beginPath();
				poly(mouth);
				g.clip();
				const deep = g.createRadialGradient(vx, vy, 0, vx, vy, R * 0.7);
				deep.addColorStop(0, `rgba(${PORTAL.deep}, 0.95)`);
				deep.addColorStop(1, `rgba(${PORTAL.mouth}, 0.9)`);
				g.fillStyle = deep;
				g.fillRect(cx - R, cy - R, R * 2, R * 2);

				g.strokeStyle = `rgba(${PORTAL.facet}, 0.16)`;
				g.lineWidth = 1;
				g.beginPath();
				for (let k = 0; k < 14; k++) {
					const sa = rand(rf.seed * 40 + k) * TAU;
					const sr = R * 0.55 * rand(rf.seed * 41 + k);
					const sx = mx + Math.cos(sa) * sr;
					const sy = my + Math.sin(sa) * sr;
					const len = R * (0.05 + rand(rf.seed * 42 + k) * 0.15);
					const la = rf.tilt + (rand(rf.seed * 43 + k) - 0.5) * 0.6;
					g.moveTo(sx, sy);
					g.lineTo(sx + Math.cos(la) * len, sy + Math.sin(la) * len);
				}
				g.stroke();

				// tunnel rings flowing towards the far end, deepest drawn first
				const flow = prefersReduced ? 0.3 : t * 0.14;
				const rings = [0, 1, 2, 3, 4].map((i) => (i / 5 + flow) % 1).sort((a, b) => b - a);
				for (const f of rings) {
					const s = (1 - f) ** 1.8;
					const rx = vx + (mx - vx) * s;
					const ry = vy + (my - vy) * s;
					const rr = R * 0.5 * s;
					const lw = R * 0.1 * s + 0.5;
					const fade = Math.min(1, f * 10) * (1 - f * 0.6);
					g.lineWidth = lw;
					g.strokeStyle = `rgba(${PORTAL.ring}, ${fade})`;
					g.beginPath();
					poly(ngon(7, rf.seed * 30, rx, ry, rr, rot * 1.2 + f * 0.9, 0.06));
					g.stroke();
					g.lineWidth = lw * 0.3;
					g.strokeStyle = `rgba(${PORTAL.rim}, ${fade})`;
					g.beginPath();
					poly(ngon(7, rf.seed * 30, rx, ry, rr - lw * 0.3, rot * 1.2 + f * 0.9, 0.06));
					g.stroke();
				}
				g.restore();

				// bright crystal edges, misregistered plates
				caStroke(
					(dx, dy) => {
						g.beginPath();
						poly(outer, dx, dy);
						poly(mouth, dx, dy);
						g.stroke();
					},
					0.85,
					1.4,
					off,
					PORTAL.facet
				);

				// sparks thrown off the rim
				if (!prefersReduced && dt > 0 && Math.random() < 0.7) {
					const a = Math.random() * TAU;
					const rad = R * (0.95 + Math.random() * 0.2);
					sparks.push({
						x: cx + Math.cos(a) * rad,
						y: cy + Math.sin(a) * rad,
						vx: Math.cos(a) * (18 + Math.random() * 45),
						vy: Math.sin(a) * (18 + Math.random() * 45) - 8,
						life: 0,
						max: 0.6 + Math.random() * 0.8,
						rgb: Math.random() < 0.5 ? PORTAL.ring : PORTAL.glow
					});
					if (sparks.length > 60) sparks.shift();
				}

				const la = Math.atan2(h * 0.5 - cy, w * 0.5 - cx);
				caption(rf.label, cx + Math.cos(la) * R * 0.95, cy + Math.sin(la) * R * 0.95);
			}

			/* --- webs --- */
			if (!prefersReduced) {
				pulseTimer += dt;
				if (pulseTimer > 0.5) {
					pulseTimer = 0;
					if (Math.random() < 0.6 && webs.length) {
						const wi = Math.floor(Math.random() * webs.length);
						const web = webs[wi];
						if (Math.random() < 0.5)
							pulses.push({ webIdx: wi, spoke: Math.floor(Math.random() * web.spokes), ring: 0, along: 'spoke', t: 0, speed: 0.55 + Math.random() * 0.6 });
						else
							pulses.push({ webIdx: wi, spoke: Math.floor(Math.random() * web.spokes), ring: Math.floor(Math.random() * web.rings), along: 'ring', t: 0, speed: 0.45 + Math.random() * 0.55 });
						if (pulses.length > 7) pulses.shift();
					}
				}
			}

			for (let wi = 0; wi < webs.length; wi++) {
				const web = webs[wi];
				const centerX = web.cx + tx * 0.22;
				const centerY = web.cy + ty * 0.22;

				for (let i = 0; i < web.spokes; i++) {
					const spokeLen = spokeReach(web, i);
					const end = pt(web, i, spokeLen, t);
					const a = (0.36 + rand(i + wi * 97) * 0.3) * web.bright;
					const lw = 1 + rand(i + wi * 53) * 0.9;
					caStroke(
						(dx, dy) => {
							g.beginPath();
							g.moveTo(centerX + dx, centerY + dy);
							g.lineTo(end.x + dx, end.y + dy);
							g.stroke();
						},
						a,
						lw,
						web.off
					);

					if (web.broken.has(i)) {
						for (let f = 0; f < 2; f++) {
							const fAng = Math.atan2(end.y - centerY, end.x - centerX) + (f === 0 ? 0.5 : -0.4);
							const fLen = spokeLen * (0.08 + rand(web.seed * 1600 + i * 3 + f) * 0.1);
							g.strokeStyle = `rgba(${P.web}, ${a * 0.7})`;
							g.lineWidth = 0.6;
							g.beginPath();
							g.moveTo(end.x, end.y);
							g.lineTo(end.x + Math.cos(fAng) * fLen, end.y + Math.sin(fAng) * fLen);
							g.stroke();
						}
					}
				}

				for (let ri = 0; ri < web.rings; ri++) {
					const a = (0.3 + (ri / web.rings) * 0.3) * web.bright;
					for (let i = 0; i < web.spokes; i++) {
						const th = thread(web, ri, i, t);
						if (!th) continue;
						const lw = 0.6 + rand(web.seed * 2100 + ri * 9 + i) * 0.7;
						caStroke(
							(dx, dy) => {
								g.beginPath();
								g.moveTo(th.p0.x + dx, th.p0.y + dy);
								g.quadraticCurveTo(th.cx + dx, th.cy + dy, th.p1.x + dx, th.p1.y + dy);
								g.stroke();
							},
							a,
							lw,
							web.off * 0.75
						);
					}
				}
			}

			/* --- pulses --- */
			if (!prefersReduced) {
				for (let pi = pulses.length - 1; pi >= 0; pi--) {
					const p = pulses[pi];
					p.t += p.speed * dt;
					if (p.t >= 1) {
						pulses.splice(pi, 1);
						continue;
					}
					const web = webs[p.webIdx];
					if (!web) continue;
					let x = 0;
					let y = 0;
					if (p.along === 'spoke') {
						const pp = pt(web, p.spoke, spokeReach(web, p.spoke) * p.t, t);
						x = pp.x;
						y = pp.y;
					} else {
						const th = thread(web, p.ring, p.spoke, t);
						if (!th) continue;
						const tt = p.t;
						x = (1 - tt) * (1 - tt) * th.p0.x + 2 * (1 - tt) * tt * th.cx + tt * tt * th.p1.x;
						y = (1 - tt) * (1 - tt) * th.p0.y + 2 * (1 - tt) * tt * th.cy + tt * tt * th.p1.y;
					}
					const prog = Math.sin(p.t * Math.PI);
					const glowR = 3 + prog * 5;
					const glow = g.createRadialGradient(x, y, 0, x, y, glowR);
					glow.addColorStop(0, `rgba(${P.web}, ${prog * 0.85})`);
					glow.addColorStop(1, `rgba(${P.ca2}, 0)`);
					g.fillStyle = glow;
					g.beginPath();
					g.arc(x, y, glowR, 0, TAU);
					g.fill();
					g.fillStyle = isDark ? `rgba(255,255,255,${prog})` : `rgba(${P.ca2}, ${prog})`;
					g.beginPath();
					g.arc(x, y, 1.4 + prog * 1.2, 0, TAU);
					g.fill();
				}
			}

			if (!prefersReduced) {
				if (t > swingNext) {
					swingNext = t + 3 + Math.random() * 5;
					if (swingers.length < 2) {
						const a = Math.floor(Math.random() * ENDS.length);
						const b = (a + 1 + Math.floor(Math.random() * (ENDS.length - 1))) % ENDS.length;
						swingers.push({
							a,
							b,
							ax: (ENDS[a].x + ENDS[b].x) / 2 + (Math.random() - 0.5) * 0.2,
							ay: Math.min(ENDS[a].y, ENDS[b].y) - 0.25 - Math.random() * 0.2,
							p: 0,
							dur: 2.4 + Math.random() * 1.2,
							suit: SPIDERS[Math.floor(Math.random() * SPIDERS.length)]
						});
					}
				}
				for (let i = swingers.length - 1; i >= 0; i--) {
					const sw = swingers[i];
					sw.p += dt / sw.dur;
					if (sw.p >= 1) {
						swingers.splice(i, 1);
						continue;
					}
					const { x, y } = swingAt(sw, sw.p);
					const ahead = swingAt(sw, Math.min(1, sw.p + 0.02));
					const dir = ENDS[sw.b].x >= ENDS[sw.a].x ? 1 : -1;
					const s = short * 0.09 * Math.min(1, sw.p / 0.12, (1 - sw.p) / 0.12);
					const ax = sw.ax * w + tx * 0.15;
					const ay = sw.ay * h + ty * 0.15;
					const onWeb = sw.p > 0.08 && sw.p < 0.78;
					const rot = onWeb
						? Math.atan2(ay - y, ax - x) - Math.atan2(HAND.y, dir * HAND.x)
						: Math.atan2(ahead.y - y, ahead.x - x) + Math.PI / 2;

					g.globalCompositeOperation = P.comp;
					for (const [lag, col] of [
						[0.012, P.ca1],
						[0.024, P.ca2]
					] as const) {
						const e = swingAt(sw, Math.max(0, sw.p - lag));
						spider(e.x, e.y, s, rot, dir, sw.suit, `rgba(${col}, 0.5)`);
					}
					g.globalCompositeOperation = 'source-over';

					if (onWeb) {
						const c = Math.cos(rot);
						const sn = Math.sin(rot);
						const hx = x + s * (c * dir * HAND.x - sn * HAND.y);
						const hy = y + s * (sn * dir * HAND.x + c * HAND.y);
						const shot = Math.min(1, (sw.p - 0.08) / 0.05);
						const wx = hx + (ax - hx) * shot;
						const wy = hy + (ay - hy) * shot;
						caStroke(
							(dx, dy) => {
								g.beginPath();
								g.moveTo(hx + dx, hy + dy);
								g.lineTo(wx + dx, wy + dy);
								g.stroke();
							},
							0.8,
							1.3,
							1.6
						);
						if (sw.p < 0.2) sfx('THWIP!', hx + dir * s * 0.3, hy - s * 0.1, s * 0.34, -0.18 * dir);
					}
					spider(x, y, s, rot, dir, sw.suit);
					if (rand(step * 3.1 + sw.ax * 100) < 0.07)
						spider(x + (rand(step + sw.ay) - 0.5) * s * 0.6, y, s, rot, dir, sw.suit, `rgba(${GLITCH[step % GLITCH.length]}, 0.8)`);
				}
			}

			/* --- energy dots --- */
			const drag = Math.pow(0.16, dt);
			g.globalCompositeOperation = P.comp;
			for (let i = sparks.length - 1; i >= 0; i--) {
				const s = sparks[i];
				s.life += dt;
				if (s.life >= s.max) {
					sparks.splice(i, 1);
					continue;
				}
				s.x += s.vx * dt;
				s.y += s.vy * dt;
				s.vx *= drag;
				s.vy *= drag;
				const k = 1 - s.life / s.max;
				g.fillStyle = `rgba(${s.rgb}, ${k * 0.9})`;
				g.beginPath();
				g.arc(s.x, s.y, 1 + k * 3, 0, TAU);
				g.fill();
			}
			g.globalCompositeOperation = 'source-over';

			/* --- dust --- */
			for (const s of stars) {
				s.tw += prefersReduced ? 0 : s.twSpeed * dt * 60;
				const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.tw));
				g.fillStyle = `rgba(${P.dust[s.pal]}, ${twinkle * 0.85})`;
				g.beginPath();
				g.arc(s.x + tx * 0.16, s.y + ty * 0.16, s.size, 0, TAU);
				g.fill();
			}

			g.globalAlpha = 1;

			/* --- glitch: slice the frame, re-print it misaligned, drop flat
			   colour blocks over it. Seeded per step so it holds for a twos frame. --- */
			if (!prefersReduced) {
				if (t > glitchNext) {
					glitchNext = t + 3 + Math.random() * 6;
					glitchUntil = t + 0.15 + Math.random() * 0.2;
				}
				if (t < glitchUntil) {
					for (let i = 0; i < 6; i++) {
						const s = step * 13 + i * 3;
						const sy = rand(s) * h;
						const sh = 4 + rand(s + 1) * 28;
						const dx = (rand(s + 2) - 0.5) * 50;
						g.drawImage(canvas, 0, sy * dpr, w * dpr, sh * dpr, dx, sy, w, sh);
						g.fillStyle = `rgba(${GLITCH[i % GLITCH.length]}, ${isDark ? 0.4 : 0.3})`;
						g.fillRect(rand(s + 4) * w, rand(s + 5) * h, 16 + rand(s + 6) * 150, 3 + rand(s + 7) * 18);
					}
				}
			}

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
