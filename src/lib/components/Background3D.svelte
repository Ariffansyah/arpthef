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
				riftCore: '255,255,255',
				riftBoost: 1,
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
				riftCore: '255,245,225',
				riftBoost: 1.9,
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
		type Chord = { r1: number; i1: number; r2: number; i2: number };
		type Web = {
			cx: number;
			cy: number;
			radius: number;
			spokes: number;
			rings: number;
			seed: number;
			rot: number;
			bright: number;
			chords: Chord[];
			broken: Set<number>;
		};
		let webs: Web[] = [];
		let stars: { x: number; y: number; size: number; tw: number; twSpeed: number; pal: number }[] = [];

		/* ---------- dimension rifts ---------- */
		const RIFTS = [
			{ x: 0.79, y: 0.2, r: 0.3, pts: 30, seed: 3.2, spin: 0.1, phase: 0, period: 0.13, depth: 0.5 },
			{ x: 0.13, y: 0.73, r: 0.24, pts: 26, seed: 7.7, spin: -0.13, phase: 2.1, period: 0.1, depth: 0.8 },
			{ x: 0.5, y: 1.02, r: 0.15, pts: 24, seed: 11.3, spin: 0.08, phase: 4.0, period: 0.16, depth: 1.2 }
		];

		/* Krackle sparks flung off the rift edges. */
		type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; rgb: string };
		let sparks: Spark[] = [];

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
			for (let i = 0; i < spokes; i++) if (rand(seed * 800 + i * 41) < 0.12) broken.add(i);
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
		function ringR(web: Web, idx: number, spokeIdx = -1) {
			const base = web.radius * Math.pow((idx + 1) / web.rings, 0.82);
			if (spokeIdx < 0) return base;
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

		/* Stroke a path three times: cyan plate shifted left, magenta plate
		   shifted right, ink plate dead centre. `draw` re-issues the geometry
		   with the given offset. */
		function caStroke(draw: (dx: number, dy: number) => void, a: number, lw: number, off: number) {
			g.globalCompositeOperation = P.comp;
			g.lineWidth = lw + 0.5;
			g.strokeStyle = `rgba(${P.ca1}, ${a * 0.55})`;
			draw(-off, off * 0.35);
			g.strokeStyle = `rgba(${P.ca2}, ${a * 0.55})`;
			draw(off, -off * 0.35);
			g.globalCompositeOperation = 'source-over';
			g.lineWidth = lw;
			g.strokeStyle = `rgba(${P.web}, ${a})`;
			draw(0, 0);
		}

		function riftPath(rf: (typeof RIFTS)[number], t: number, cx: number, cy: number, R: number, scale: number, dx: number, dy: number) {
			g.beginPath();
			for (let i = 0; i <= rf.pts; i++) {
				const k = i % rf.pts;
				const a = (k / rf.pts) * TAU + t * rf.spin;
				const spike = (k % 2 ? 1 : 0.74) * (0.78 + rand(rf.seed * 100 + k) * 0.42);
				const wob = prefersReduced ? 1 : 1 + Math.sin(t * 1.6 + k * 1.3 + rf.seed) * 0.09;
				const rad = R * scale * spike * wob;
				const px = cx + dx + Math.cos(a) * rad;
				const py = cy + dy + Math.sin(a) * rad * 0.78;
				if (i === 0) g.moveTo(px, py);
				else g.lineTo(px, py);
			}
			g.closePath();
		}

		type Pulse = { webIdx: number; spoke: number; ring: number; along: 'spoke' | 'ring'; t: number; speed: number };
		let pulses: Pulse[] = [];
		let pulseTimer = 0;
		let glitchUntil = 0;
		let glitchNext = 2.5;

		resize();
		window.addEventListener('resize', resize);

		let raf = 0;
		let last = performance.now();
		const start = last;

		function frame() {
			const now = performance.now();
			const dt = Math.min(0.033, Math.max(0.008, (now - last) / 1000));
			last = now;
			const t = (now - start) * 0.001;

			tx += (targetTX - tx) * 0.09;
			ty += (targetTY - ty) * 0.09;

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

			/* --- dimension rifts --- */
			for (const rf of RIFTS) {
				const open = prefersReduced ? 0.8 : 0.55 + 0.45 * Math.sin(t * rf.period * TAU + rf.phase);
				const ink = open * P.riftBoost;
				const R = short * rf.r * open;
				const cx = rf.x * w + tx * rf.depth * 0.5;
				const cy = rf.y * h + ty * rf.depth * 0.5;

				// glow bleeding out of the tear
				const halo = g.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5);
				halo.addColorStop(0, `rgba(${P.ca2}, ${0.3 * ink})`);
				halo.addColorStop(0.45, `rgba(${P.ca1}, ${0.14 * ink})`);
				halo.addColorStop(1, `rgba(${P.ca1}, 0)`);
				g.globalCompositeOperation = P.comp;
				g.fillStyle = halo;
				g.beginPath();
				g.arc(cx, cy, R * 1.5, 0, TAU);
				g.fill();

				// the other dimension showing through
				const core = g.createRadialGradient(cx, cy, 0, cx, cy, R);
				core.addColorStop(0, `rgba(${P.riftCore}, ${0.3 * ink})`);
				core.addColorStop(0.35, `rgba(${P.ca2}, ${0.16 * ink})`);
				core.addColorStop(1, `rgba(${P.ca1}, 0)`);
				g.fillStyle = core;
				riftPath(rf, t, cx, cy, R, 1, 0, 0);
				g.fill();
				g.globalCompositeOperation = 'source-over';

				// jagged edges, misregistered plates
				const off = 2.5 + open * 2;
				caStroke(
					(dx, dy) => {
						riftPath(rf, t, cx, cy, R, 1, dx, dy);
						g.stroke();
					},
					0.55 * ink,
					1.4,
					off
				);
				for (const s of [0.72, 0.46]) {
					caStroke(
						(dx, dy) => {
							riftPath(rf, t, cx * 1, cy, R, s, dx, dy);
							g.stroke();
						},
						0.22 * ink,
						0.9,
						off * 0.6
					);
				}

				// spark emission
				if (!prefersReduced && Math.random() < 0.35 * open) {
					const a = Math.random() * TAU;
					const rad = R * (0.9 + Math.random() * 0.3);
					sparks.push({
						x: cx + Math.cos(a) * rad,
						y: cy + Math.sin(a) * rad * 0.78,
						vx: Math.cos(a) * (18 + Math.random() * 45),
						vy: Math.sin(a) * (18 + Math.random() * 45) - 8,
						life: 0,
						max: 0.6 + Math.random() * 0.8,
						rgb: Math.random() < 0.5 ? P.ca1 : P.ca2
					});
					if (sparks.length > 90) sparks.shift();
				}
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
					const a = (0.32 + rand(i + wi * 97) * 0.35) * web.bright;
					const lw = 0.8 + rand(i + wi * 53) * 0.9;
					caStroke(
						(dx, dy) => {
							g.beginPath();
							g.moveTo(centerX + dx, centerY + dy);
							g.lineTo(end.x + dx, end.y + dy);
							g.stroke();
						},
						a,
						lw,
						1.6
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
						caStroke(
							(dx, dy) => {
								g.beginPath();
								g.moveTo(p0.x + dx, p0.y + dy);
								g.quadraticCurveTo(mx + dx, my + dy, p1.x + dx, p1.y + dy);
								g.stroke();
							},
							a,
							lw,
							1.2
						);
					}
				}

				for (const c of web.chords) {
					const cr1 = ringR(web, c.r1, c.i1);
					const cr2 = ringR(web, c.r2, c.i2);
					if (cr1 > spokeReach(web, c.i1) || cr2 > spokeReach(web, c.i2)) continue;
					const p0 = pt(web, c.i1, cr1, t);
					const p1 = pt(web, c.i2, cr2, t);
					g.strokeStyle = `rgba(${P.web}, ${0.16 * web.bright})`;
					g.lineWidth = 0.65;
					g.beginPath();
					g.moveTo(p0.x, p0.y);
					g.lineTo(p1.x, p1.y);
					g.stroke();
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
						const pp = pt(web, p.spoke, web.radius * p.t, t);
						x = pp.x;
						y = pp.y;
					} else {
						const r = ringR(web, p.ring);
						const a = pt(web, p.spoke, r, t);
						const b = pt(web, (p.spoke + 1) % web.spokes, r, t);
						const mx = (a.x + b.x) * 0.5;
						const my = (a.y + b.y) * 0.5 + (r / web.radius) * 9;
						const tt = p.t;
						x = (1 - tt) * (1 - tt) * a.x + 2 * (1 - tt) * tt * mx + tt * tt * b.x;
						y = (1 - tt) * (1 - tt) * a.y + 2 * (1 - tt) * tt * my + tt * tt * b.y;
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

			/* --- krackle sparks: little four-point stars --- */
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
				s.vx *= 0.97;
				s.vy *= 0.97;
				const k = 1 - s.life / s.max;
				const r = 2 + k * 5;
				g.strokeStyle = `rgba(${s.rgb}, ${k * 0.9})`;
				g.lineWidth = 1;
				g.beginPath();
				g.moveTo(s.x - r, s.y);
				g.lineTo(s.x + r, s.y);
				g.moveTo(s.x, s.y - r);
				g.lineTo(s.x, s.y + r);
				g.stroke();
			}
			g.globalCompositeOperation = 'source-over';

			/* --- dust --- */
			for (const s of stars) {
				s.tw += prefersReduced ? 0 : s.twSpeed;
				const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.tw));
				g.fillStyle = `rgba(${P.dust[s.pal]}, ${twinkle * 0.85})`;
				g.beginPath();
				g.arc(s.x + tx * 0.16, s.y + ty * 0.16, s.size, 0, TAU);
				g.fill();
			}

			g.globalAlpha = 1;

			/* --- glitch: slice the frame and re-print it misaligned --- */
			if (!prefersReduced) {
				if (t > glitchNext) {
					glitchNext = t + 3 + Math.random() * 6;
					glitchUntil = t + 0.1 + Math.random() * 0.14;
				}
				if (t < glitchUntil) {
					for (let i = 0; i < 5; i++) {
						const sy = Math.random() * h;
						const sh = 6 + Math.random() * 26;
						const dx = (Math.random() - 0.5) * 40;
						g.drawImage(canvas, 0, sy * dpr, w * dpr, sh * dpr, dx, sy, w, sh);
						g.globalCompositeOperation = P.comp;
						g.fillStyle = `rgba(${Math.random() < 0.5 ? P.ca1 : P.ca2}, 0.16)`;
						g.fillRect(dx, sy, w, sh);
						g.globalCompositeOperation = 'source-over';
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
