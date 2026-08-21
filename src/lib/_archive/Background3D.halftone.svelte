<script lang="ts">
	import { onMount } from 'svelte';

	// ponytail: 3D multiverse network (clustered nodes + webs) + halftone + corner cobwebs. Full scene in one canvas.
	export let nodeCount = 78;
	export let linkDistance = 230;

	let canvas: HTMLCanvasElement;

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
		let surfaceRGB = '250, 250, 252';
		let isDark = false;

		function toRGB(v: string, fallback: string): string {
			const s = v.trim();
			const m = s.match(/^#?([0-9a-f]{6})$/i);
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
			surfaceRGB = toRGB(s.getPropertyValue('--surface'), surfaceRGB);
			isDark = document.documentElement.classList.contains('dark');
		}
		readColors();
		const observer = new MutationObserver(readColors);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });

		function resize() {
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = Math.max(1, Math.floor(w * dpr));
			canvas.height = Math.max(1, Math.floor(h * dpr));
			g.setTransform(dpr, 0, 0, dpr, 0, 0);
		}
		resize();
		window.addEventListener('resize', resize);

		// mouse -> 3D tilt + 2D parallax
		let targetTiltX = 0;
		let targetTiltY = 0;
		let tiltX = 0;
		let tiltY = 0;
		let targetTX = 0;
		let targetTY = 0;
		let tx = 0;
		let ty = 0;
		function onMouse(e: MouseEvent) {
			targetTiltY = (e.clientX / window.innerWidth - 0.5) * 0.8;
			targetTiltX = (e.clientY / window.innerHeight - 0.5) * 0.8;
			targetTX = (e.clientX / window.innerWidth - 0.5) * 18;
			targetTY = (e.clientY / window.innerHeight - 0.5) * 18;
		}
		window.addEventListener('mousemove', onMouse);

		// ---- 2D corner webs (spider-verse framing) ----
		type Web = {
			ax: number;
			ay: number;
			radius: number;
			spokes: number;
			rings: number;
			startAng: number;
			endAng: number;
			seed: number;
			broken: number[];
		};
		function makeWebs(): Web[] {
			const shortSide = Math.min(w, h);
			const bigR = Math.min(480, shortSide * 0.58);
			const medR = Math.min(340, shortSide * 0.42);
			const smlR = Math.min(240, shortSide * 0.3);
			return [
				{ ax: -14, ay: -14, radius: bigR, spokes: 11, rings: 6, startAng: 0, endAng: Math.PI * 0.5, seed: 1.1, broken: [2] },
				{ ax: w + 14, ay: -14, radius: medR, spokes: 9, rings: 5, startAng: Math.PI * 0.5, endAng: Math.PI, seed: 4.7, broken: [1] },
				{ ax: w + 10, ay: h + 10, radius: smlR, spokes: 8, rings: 4, startAng: Math.PI, endAng: Math.PI * 1.5, seed: 9.3, broken: [] }
			];
		}
		let webs: Web[] = makeWebs();
		function onResizeWebs() { webs = makeWebs(); }
		window.addEventListener('resize', onResizeWebs);

		function ringRadius(web: Web, idx: number) {
			const n = web.rings;
			const f = (idx + 1) / n;
			return web.radius * Math.pow(f, 0.85) * (0.72 + 0.28 * f);
		}
		function spokeAngle(web: Web, sIdx: number) {
			const span = web.endAng - web.startAng;
			const jig = Math.sin((sIdx * 1.7 + web.seed) * 2.3) * 0.02;
			return web.startAng + (sIdx / (web.spokes - 1)) * span + jig;
		}
		function spokePoint(web: Web, sIdx: number, r: number, time: number, px: number, py: number) {
			const ang = spokeAngle(web, sIdx);
			const swayAmp = (r / web.radius) * 3.0;
			const sway = prefersReduced ? 0 : Math.sin(time * 0.4 + sIdx * 0.9 + web.seed) * swayAmp;
			const ax = web.ax + px * (r / web.radius) * 0.3;
			const ay = web.ay + py * (r / web.radius) * 0.3;
			const perx = -Math.sin(ang);
			const pery = Math.cos(ang);
			return { x: ax + Math.cos(ang) * r + perx * sway, y: ay + Math.sin(ang) * r + pery * sway };
		}

		type WebPulse = { webIdx: number; spoke: number; ring: number; along: 'spoke' | 'ring'; t: number; speed: number };
		let webPulses: WebPulse[] = [];
		let webPulseTimer = 0;

		function drawHalftone(time: number) {
			const step = 18;
			const dotBase = isDark ? 0.09 : 0.065;
			for (let y = step * 0.5; y < h; y += step) {
				for (let x = step * 0.5; x < w; x += step) {
					const off = ((y / step) & 1) ? step * 0.5 : 0;
					const px = x + off;
					if (px >= w) continue;
					let dMin = Infinity;
					for (const wb of webs) {
						const d = Math.hypot(px - wb.ax, y - wb.ay);
						if (d < dMin) dMin = d;
					}
					const burst = Math.max(0, 1 - dMin / 520);
					const breath = prefersReduced ? 0 : Math.sin(time * 0.0006 + px * 0.008) * 0.2;
					let r = 1.05 + burst * 1.55 + breath * (0.28 + burst * 0.55);
					const ef = Math.min(1, Math.max(0, Math.min(px, w - px, y, h - y) / 80));
					const alpha = dotBase * ef * (0.6 + burst * 0.7);
					if (alpha < 0.005) continue;
					g.fillStyle = `rgba(${inkRGB}, ${alpha})`;
					g.beginPath();
					g.arc(px, y, r, 0, Math.PI * 2);
					g.fill();
				}
			}
			const bStep = 22;
			for (let y = bStep * 0.5; y < h; y += bStep) {
				for (let x = bStep * 0.5; x < w; x += bStep) {
					let dMin = Infinity;
					for (const wb of webs) {
						const d = Math.hypot(x - wb.ax, y - wb.ay);
						if (d < dMin) dMin = d;
					}
					if (dMin > 420) continue;
					const burst = Math.max(0, 1 - dMin / 420);
					if (burst < 0.18) continue;
					const r = 0.9 + burst * 1.15;
					const a = burst * (isDark ? 0.105 : 0.075);
					g.fillStyle = `rgba(${brandRGB}, ${a})`;
					g.beginPath();
					g.arc(x + 0.7, y + 0.5, r, 0, Math.PI * 2);
					g.fill();
				}
			}
		}

		function drawCornerWebs(time: number, parallaxX: number, parallaxY: number) {
			for (let wi = 0; wi < webs.length; wi++) {
				const web = webs[wi];
				const isLarge = wi === 0;
				const opacity = (isLarge ? 1 : 0.68) * 0.9; // keep framing subtle behind network
				const strokeW = isLarge ? 1 : 0.85;
				const chromOff = isDark ? 0.85 : 0.65;
				const ringPts: { x: number; y: number }[][] = [];
				for (let rIdx = 0; rIdx < web.rings; rIdx++) {
					const r = ringRadius(web, rIdx);
					const pts: { x: number; y: number }[] = [];
					for (let s = 0; s < web.spokes; s++) pts.push(spokePoint(web, s, r, time, parallaxX, parallaxY));
					ringPts.push(pts);
				}
				for (let s = 0; s < web.spokes; s++) {
					const isBroken = web.broken.includes(s);
					const fullR = ringRadius(web, web.rings - 1);
					const endR = isBroken ? fullR * 0.62 : fullR;
					const start = { x: web.ax + parallaxX * 0.08, y: web.ay + parallaxY * 0.08 };
					const swayAmp = prefersReduced ? 0 : Math.sin(time * 0.35 + s * 1.1 + web.seed) * 2.0;
					const mid = spokePoint(web, s, endR * 0.5, time, parallaxX, parallaxY);
					const sag = (endR / web.radius) * 6.5;
					const ctrlX = mid.x;
					const ctrlY = mid.y + sag + swayAmp * 0.3;
					const end = spokePoint(web, s, endR, time, parallaxX, parallaxY);
					const end2 = { x: end.x, y: end.y + sag * 0.12 };
					g.strokeStyle = `rgba(${brandRGB}, ${0.055 * opacity})`;
					g.lineWidth = strokeW + 0.5;
					g.beginPath();
					g.moveTo(start.x + chromOff, start.y);
					g.quadraticCurveTo(ctrlX + chromOff, ctrlY, end2.x + chromOff, end2.y);
					g.stroke();
					g.strokeStyle = `rgba(${inkRGB}, ${isDark ? 0.13 : 0.11 * opacity})`;
					g.lineWidth = strokeW;
					g.lineCap = 'round';
					g.beginPath();
					g.moveTo(start.x, start.y);
					g.quadraticCurveTo(ctrlX, ctrlY, end2.x, end2.y);
					g.stroke();
				}
				for (let rIdx = 0; rIdx < web.rings; rIdx++) {
					const pts = ringPts[rIdx];
					const r = ringRadius(web, rIdx);
					const sagBase = (r / web.radius) * 6.2;
					for (let s = 0; s < pts.length - 1; s++) {
						const isGap = web.broken.includes(s) && rIdx >= web.rings - 2 && rIdx % 2 === 0;
						if (isGap) {
							const a = pts[s], b = pts[s + 1];
							const mx = (a.x + b.x) * 0.5, my = (a.y + b.y) * 0.5 + sagBase * 0.5;
							const g1x = a.x * 0.65 + mx * 0.35, g1y = a.y * 0.65 + my * 0.35;
							const g2x = b.x * 0.65 + mx * 0.35, g2y = b.y * 0.65 + my * 0.35;
							for (const seg of [[a, { x: g1x, y: g1y }], [{ x: g2x, y: g2y }, b]] as const) {
								const [p0, p1] = seg;
								const ctrlX = (p0.x + p1.x) * 0.5, ctrlY = (p0.y + p1.y) * 0.5 + sagBase * 0.18;
								g.strokeStyle = `rgba(${brandRGB}, ${0.045 * opacity})`;
								g.lineWidth = strokeW + 0.45;
								g.beginPath();
								g.moveTo(p0.x + chromOff, p0.y);
								g.quadraticCurveTo(ctrlX + chromOff, ctrlY, p1.x + chromOff, p1.y);
								g.stroke();
								g.strokeStyle = `rgba(${inkRGB}, ${isDark ? 0.12 : 0.10 * opacity})`;
								g.lineWidth = strokeW * 0.88;
								g.beginPath();
								g.moveTo(p0.x, p0.y);
								g.quadraticCurveTo(ctrlX, ctrlY, p1.x, p1.y);
								g.stroke();
							}
							continue;
						}
						const a = pts[s], b = pts[s + 1];
						const mx = (a.x + b.x) * 0.5, my = (a.y + b.y) * 0.5 + sagBase * (0.6 + 0.2 * Math.sin(s * 0.8 + rIdx));
						g.strokeStyle = `rgba(${brandRGB}, ${0.045 * opacity})`;
						g.lineWidth = strokeW + 0.45;
						g.beginPath();
						g.moveTo(a.x + chromOff, a.y);
						g.quadraticCurveTo(mx + chromOff, my, b.x + chromOff, b.y);
						g.stroke();
						g.strokeStyle = `rgba(${inkRGB}, ${isDark ? 0.125 : 0.105 * opacity})`;
						g.lineWidth = strokeW * 0.88;
						g.beginPath();
						g.moveTo(a.x, a.y);
						g.quadraticCurveTo(mx, my, b.x, b.y);
						g.stroke();
					}
				}
				for (let rIdx = 0; rIdx < web.rings; rIdx++) {
					const pts = ringPts[rIdx];
					for (let s = 0; s < pts.length; s++) {
						const hash = (s * 7 + rIdx * 13 + wi * 29) % 11;
						if (hash > 4) continue;
						const p = pts[s];
						if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) continue;
						const tw = prefersReduced ? 0.5 : 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(time * (0.7 + hash * 0.08) + s * 0.7 + rIdx * 1.1));
						const alpha = (isDark ? 0.48 : 0.40) * tw * opacity * (rIdx / web.rings * 0.6 + 0.4);
						if (alpha < 0.02) continue;
						const sz = (rIdx === 0 ? 0.7 : 1.05) * (isLarge ? 1 : 0.85);
						const glow = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 4.2);
						glow.addColorStop(0, `rgba(${accentRGB}, ${alpha * 0.26})`);
						glow.addColorStop(1, `rgba(${accentRGB}, 0)`);
						g.fillStyle = glow;
						g.beginPath();
						g.arc(p.x, p.y, sz * 4.2, 0, Math.PI * 2);
						g.fill();
						g.fillStyle = `rgba(${accentRGB}, ${alpha})`;
						g.beginPath();
						g.arc(p.x, p.y, sz, 0, Math.PI * 2);
						g.fill();
					}
				}
			}
		}

		// ---- 3D multiverse network (old sphere remixed as clusters) ----
		type Node = {
			x: number; y: number; z: number;
			vx: number; vy: number; vz: number;
			phase: number; twinklePhase: number; twinkleSpeed: number; sizeMod: number;
			cluster: number;
		};
		const R = 600;
		const nodes: Node[] = [];

		// spider-verse multiverse: 3-4 clustered universes tethered by web
		const clusterCenters = [
			{ x: R * 0.58, y: -R * 0.18, z: R * 0.22 },
			{ x: -R * 0.48, y: R * 0.42, z: -R * 0.32 },
			{ x: -R * 0.18, y: -R * 0.52, z: -R * 0.38 },
			{ x: R * 0.12, y: R * 0.38, z: R * 0.58 }
		];
		const activeClusters = w < 640 ? 3 : 4;
		const clusterSpread = R * 0.42;

		for (let i = 0; i < nodeCount; i++) {
			// 12% bridge nodes at center (inter-dimensional web)
			let cx = 0, cy = 0, cz = 0;
			let cl = -1;
			if (Math.random() < 0.12) {
				cx = 0; cy = 0; cz = 0;
			} else {
				cl = Math.floor(Math.random() * activeClusters);
				const c = clusterCenters[cl];
				cx = c.x; cy = c.y; cz = c.z;
			}
			const u = Math.random();
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);
			const r = clusterSpread * Math.cbrt(u) * (0.65 + Math.random() * 0.55);
			nodes.push({
				x: cx + r * Math.sin(phi) * Math.cos(theta),
				y: cy + r * Math.sin(phi) * Math.sin(theta),
				z: cz + r * Math.cos(phi),
				vx: (Math.random() - 0.5) * 0.06,
				vy: (Math.random() - 0.5) * 0.06,
				vz: (Math.random() - 0.5) * 0.06,
				phase: Math.random() * Math.PI * 2,
				twinklePhase: Math.random() * Math.PI * 2,
				twinkleSpeed: 0.01 + Math.random() * 0.022,
				sizeMod: 0.62 + Math.random() * 0.78,
				cluster: cl
			});
		}

		const starCount = 95;
		const stars: { x: number; y: number; z: number; size: number; twinkle: number; twinkleSpeed: number }[] = [];
		for (let i = 0; i < starCount; i++) {
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);
			const r = R * 2.6 + Math.random() * R * 1.8;
			stars.push({
				x: r * Math.sin(phi) * Math.cos(theta),
				y: r * Math.sin(phi) * Math.sin(theta),
				z: r * Math.cos(phi),
				size: 0.32 + Math.random() * 0.75,
				twinkle: Math.random() * Math.PI * 2,
				twinkleSpeed: 0.005 + Math.random() * 0.018
			});
		}

		// portals replace planets — multiverse gateways with halftone + web ring
		const portals = [
			{ x: R * 2.55, y: -R * 0.85, z: -R * 1.18, r: 88, ring: 0.42, hue: 'brand' as const },
			{ x: -R * 2.15, y: R * 1.32, z: -R * 1.72, r: 58, ring: 0, hue: 'accent' as const },
			{ x: R * 0.78, y: R * 2.32, z: -R * 2.45, r: 42, ring: 0.32, hue: 'accent' as const }
		];

		const FOV = 1000;
		let angle = 0;
		let raf = 0;
		let last = performance.now();

		const projected = nodes.map(() => ({ x: 0, y: 0, scale: 0, depth: 0 }));
		const starProjected = stars.map(() => ({ x: 0, y: 0, scale: 0, depth: 0 }));
		const portalProjected = portals.map(() => ({ x: 0, y: 0, scale: 0, depth: 0 }));

		let netPulses: { from: number; progress: number; speed: number }[] = [];
		let netPulseTimer = 0;

		function frame() {
			const now = performance.now();
			const dt = Math.min(0.033, Math.max(0.008, (now - last) / 1000));
			last = now;

			angle += prefersReduced ? 0 : 0.00135;
			tiltX += (targetTiltX - tiltX) * 0.04;
			tiltY += (targetTiltY - tiltY) * 0.04;
			tx += (targetTX - tx) * 0.04;
			ty += (targetTY - ty) * 0.04;

			const ay = angle + tiltY;
			const ax = tiltX + Math.sin(angle * 0.5) * 0.14;
			const cosY = Math.cos(ay);
			const sinY = Math.sin(ay);
			const cosX = Math.cos(ax);
			const sinX = Math.sin(ax);
			const cx = w / 2;
			const cy = h / 2;
			const t = now * 0.001;

			// update nodes with gentle multiverse drift (cluster gravity + autonomous drift)
			for (let i = 0; i < nodes.length; i++) {
				const n = nodes[i];
				if (!prefersReduced) {
					const drift = Math.sin(t * 0.28 + n.phase) * 0.32;
					const driftY = Math.cos(t * 0.22 + n.phase * 1.3) * 0.32;
					const driftZ = Math.sin(t * 0.18 + n.phase * 0.7) * 0.32;
					n.x += n.vx + drift * 0.015;
					n.y += n.vy + driftY * 0.015;
					n.z += n.vz + driftZ * 0.015;
					// soft return toward its cluster center (keeps universes distinct)
					let tx0 = 0, ty0 = 0, tz0 = 0;
					if (n.cluster >= 0) {
						const c = clusterCenters[n.cluster];
						tx0 = c.x; ty0 = c.y; tz0 = c.z;
					}
					const dx = tx0 - n.x, dy = ty0 - n.y, dz = tz0 - n.z;
					const distC = Math.hypot(dx, dy, dz);
					if (distC > clusterSpread * 0.95) {
						const k = 0.004 * dt * 60;
						n.vx += (dx / distC) * k;
						n.vy += (dy / distC) * k;
						n.vz += (dz / distC) * k;
					}
					// velocity damping so clusters don't explode
					n.vx *= 0.998; n.vy *= 0.998; n.vz *= 0.998;
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
			for (let i = 0; i < portals.length; i++) {
				const p = portals[i];
				const x1 = p.x * cosY - p.z * sinY;
				const z1 = p.x * sinY + p.z * cosY;
				const y1 = p.y * cosX - z1 * sinX;
				const z2 = p.y * sinX + z1 * cosX;
				const scale = FOV / (FOV + z2);
				const pp = portalProjected[i];
				pp.x = cx + x1 * scale;
				pp.y = cy + y1 * scale;
				pp.scale = scale;
				pp.depth = z2;
			}

			g.clearRect(0, 0, w, h);
			if (isDark) {
				const vig = g.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.28, w * 0.5, h * 0.5, Math.max(w, h) * 0.92);
				vig.addColorStop(0, `rgba(${surfaceRGB}, 0)`);
				vig.addColorStop(1, `rgba(0,0,0, 0.20)`);
				g.fillStyle = vig;
				g.fillRect(0, 0, w, h);
			}

			drawHalftone(now);
			drawCornerWebs(t, tx, ty);

			// web pulses (on 2D cobwebs)
			if (!prefersReduced) {
				webPulseTimer += dt;
				if (webPulseTimer > 0.78) {
					webPulseTimer = 0;
					if (Math.random() < 0.48 && webs.length) {
						const wi = Math.floor(Math.random() * webs.length);
						const wb = webs[wi];
						if (Math.random() < 0.6) webPulses.push({ webIdx: wi, spoke: Math.floor(Math.random() * wb.spokes), ring: Math.floor(Math.random() * wb.rings), along: 'spoke', t: 0, speed: 0.5 + Math.random() * 0.65 });
						else webPulses.push({ webIdx: wi, spoke: Math.floor(Math.random() * (wb.spokes - 1)), ring: Math.floor(Math.random() * wb.rings), along: 'ring', t: 0, speed: 0.42 + Math.random() * 0.55 });
						if (webPulses.length > 5) webPulses.shift();
					}
				}
			}

			// ---- portals (multiverse gateways) — Spider-Verse burst + halftone + web ring ----
			const portalOrder = portalProjected.map((_, i) => i).sort((a, b) => portalProjected[b].depth - portalProjected[a].depth);
			for (const i of portalOrder) {
				const p = portals[i];
				const pp = portalProjected[i];
				if (pp.scale < 0.04) continue;
				const pr = p.r * pp.scale;
				const alpha = Math.min(1, pp.scale * pp.scale) * 1.05;
				const rgb = p.hue === 'accent' ? accentRGB : brandRGB;
				// outer halftone burst (Ben-Day) behind portal
				for (let k = 0; k < 3; k++) {
					const rr = pr * (1.9 + k * 0.55);
					const a = alpha * (0.055 - k * 0.014);
					if (a <= 0) continue;
					g.fillStyle = `rgba(${rgb}, ${a})`;
					g.beginPath();
					g.arc(pp.x + (k ? 0.8 : 0), pp.y, rr, 0, Math.PI * 2);
					g.fill();
				}
				// chromatic offset shadow (print misregister)
				g.fillStyle = `rgba(${brandRGB}, ${alpha * 0.08})`;
				g.beginPath();
				g.arc(pp.x + 1.1, pp.y + 0.6, pr, 0, Math.PI * 2);
				g.fill();
				// web ring (spider silk ellipse) — double stroke for silk
				if (p.ring > 0) {
					g.strokeStyle = `rgba(${brandRGB}, ${alpha * 0.09})`;
					g.lineWidth = Math.max(1, pr * 0.18);
					g.beginPath();
					g.ellipse(pp.x + 0.9, pp.y, pr * 1.92, pr * 0.56, angle * 0.9 + i, 0, Math.PI * 2);
					g.stroke();
					g.strokeStyle = `rgba(${inkRGB}, ${alpha * 0.38})`;
					g.lineWidth = Math.max(1, pr * 0.10);
					g.beginPath();
					g.ellipse(pp.x, pp.y, pr * 1.92, pr * 0.56, angle * 0.9 + i, 0, Math.PI * 2);
					g.stroke();
				}
				// thick comic ink outline outer
				g.strokeStyle = `rgba(${inkRGB}, ${alpha * 0.95})`;
				g.lineWidth = Math.max(1.4, pr * 0.10);
				g.beginPath();
				g.arc(pp.x, pp.y, pr, 0, Math.PI * 2);
				g.stroke();
				// inner halftone fill — radial gradient with ink stipple fake via two fills
				const body = g.createRadialGradient(pp.x - pr * 0.32, pp.y - pr * 0.32, pr * 0.12, pp.x, pp.y, pr);
				body.addColorStop(0, `rgba(${accentRGB}, ${alpha * 0.92})`);
				body.addColorStop(0.45, `rgba(${rgb}, ${alpha * 0.68})`);
				body.addColorStop(1, `rgba(${rgb}, ${alpha * 0.28})`);
				g.fillStyle = body;
				g.beginPath();
				g.arc(pp.x, pp.y, pr, 0, Math.PI * 2);
				g.fill();
				// halftone dots inside portal (tiny ink dots for spider-verse print)
				const dotCount = 14;
				for (let d = 0; d < dotCount; d++) {
					const ang2 = (d / dotCount) * Math.PI * 2 + i;
					const rr2 = pr * (0.18 + (d % 3) * 0.22);
					const dx2 = Math.cos(ang2) * rr2 * 0.55;
					const dy2 = Math.sin(ang2) * rr2 * 0.38;
					const r2 = pr * 0.045 + (d % 2) * pr * 0.02;
					const a2 = alpha * (0.18 + 0.12 * Math.sin(d));
					g.fillStyle = `rgba(${inkRGB}, ${a2})`;
					g.beginPath();
					g.arc(pp.x + dx2, pp.y + dy2, r2, 0, Math.PI * 2);
					g.fill();
					g.fillStyle = `rgba(${surfaceRGB}, ${a2 * 0.65})`;
					g.beginPath();
					g.arc(pp.x + dx2 + 0.5, pp.y + dy2 + 0.3, r2 * 0.42, 0, Math.PI * 2);
					g.fill();
				}
			}

			// distant stars — halftone sparkles
			const starOrder = starProjected.map((_, i) => i).sort((a, b) => starProjected[b].depth - starProjected[a].depth);
			for (const i of starOrder) {
				const s = stars[i];
				const p = starProjected[i];
				if (p.scale < 0.035) continue;
				s.twinkle += s.twinkleSpeed;
				const twinkle = 0.32 + 0.68 * (0.5 + 0.5 * Math.sin(s.twinkle));
				const alpha = Math.min(1, p.scale * 0.9) * twinkle * 0.55;
				if (alpha < 0.01) continue;
				// cross sparkle for spider-verse
				const sz = s.size * p.scale;
				g.fillStyle = `rgba(${inkRGB}, ${alpha * 0.9})`;
				g.beginPath();
				g.arc(p.x, p.y, sz, 0, Math.PI * 2);
				g.fill();
				if (sz > 0.9) {
					g.strokeStyle = `rgba(${inkRGB}, ${alpha * 0.35})`;
					g.lineWidth = 0.5;
					g.beginPath();
					g.moveTo(p.x - sz * 1.8, p.y);
					g.lineTo(p.x + sz * 1.8, p.y);
					g.moveTo(p.x, p.y - sz * 1.8);
					g.lineTo(p.x, p.y + sz * 1.8);
					g.stroke();
				}
			}

			// spider-silk links (cobweb) — clustered universes feel like web
			if (!prefersReduced) {
				netPulseTimer += 0.005;
				if (netPulseTimer > 1) {
					netPulseTimer = 0;
					if (Math.random() < 0.38) netPulses.push({ from: Math.floor(Math.random() * nodes.length), progress: 0, speed: 0.0065 + Math.random() * 0.006 });
					if (netPulses.length > 5) netPulses.shift();
				}
			}

			// links: draw intra-cluster silk slightly stronger, bridge links fainter but longer
			g.lineCap = 'round';
			for (let i = 0; i < nodes.length; i++) {
				for (let j = i + 1; j < nodes.length; j++) {
					const a = nodes[i], b = nodes[j];
					const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
					const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
					// allow longer bridges between clusters (multiverse web)
					const sameCluster = a.cluster === b.cluster && a.cluster !== -1;
					const maxD = sameCluster ? linkDistance : linkDistance * 1.35;
					if (dist > maxD) continue;
					const pa = projected[i], pb = projected[j];
					const closeness = 1 - dist / maxD;
					const depthFade = (pa.scale + pb.scale) / 2;
					const bridgeFade = sameCluster ? 1 : 0.62;
					const alpha = closeness * depthFade * (isDark ? 0.34 : 0.30) * bridgeFade;
					if (alpha < 0.012) continue;
					// chromatic offset (brand) — spider-verse print
					g.strokeStyle = `rgba(${brandRGB}, ${alpha * 0.42})`;
					g.lineWidth = 0.9 + closeness * 0.6;
					g.beginPath();
					g.moveTo(pa.x + 0.65, pa.y + 0.35);
					g.lineTo(pb.x + 0.65, pb.y + 0.35);
					g.stroke();
					// silk main (ink)
					g.strokeStyle = `rgba(${inkRGB}, ${alpha})`;
					g.lineWidth = 0.55 + closeness * 0.55;
					g.beginPath();
					g.moveTo(pa.x, pa.y);
					g.lineTo(pb.x, pb.y);
					g.stroke();
				}
			}

			// web pulses (2D)
			if (!prefersReduced) {
				for (let pi = webPulses.length - 1; pi >= 0; pi--) {
					const p = webPulses[pi];
					p.t += p.speed * dt;
					if (p.t >= 1) { webPulses.splice(pi, 1); continue; }
					const web = webs[p.webIdx];
					if (!web) continue;
					let x = 0, y = 0;
					if (p.along === 'spoke') {
						const r0 = p.ring === 0 ? 0 : ringRadius(web, p.ring - 1);
						const r1 = ringRadius(web, p.ring);
						const r = r0 + (r1 - r0) * p.t;
						const pt = spokePoint(web, p.spoke, r, t, tx, ty);
						x = pt.x; y = pt.y;
					} else {
						const r = ringRadius(web, p.ring);
						const a = spokePoint(web, p.spoke, r, t, tx, ty), b = spokePoint(web, p.spoke + 1, r, t, tx, ty);
						const sagBase = (r / web.radius) * 6.2;
						const mx = (a.x + b.x) * 0.5, my = (a.y + b.y) * 0.5 + sagBase * 0.6;
						const tt = p.t;
						x = (1 - tt) * (1 - tt) * a.x + 2 * (1 - tt) * tt * mx + tt * tt * b.x;
						y = (1 - tt) * (1 - tt) * a.y + 2 * (1 - tt) * tt * my + tt * tt * b.y;
					}
					const prog = Math.sin(p.t * Math.PI);
					const alpha = prog * 0.78;
					const r = 1.35 + prog * 1.9;
					const gl = g.createRadialGradient(x, y, 0, x, y, r * 3.8);
					gl.addColorStop(0, `rgba(${accentRGB}, ${alpha * 0.5})`);
					gl.addColorStop(0.35, `rgba(${brandRGB}, ${alpha * 0.22})`);
					gl.addColorStop(1, `rgba(${brandRGB}, 0)`);
					g.fillStyle = gl;
					g.beginPath();
					g.arc(x, y, r * 3.8, 0, Math.PI * 2);
					g.fill();
					g.fillStyle = `rgba(${accentRGB}, ${alpha})`;
					g.beginPath();
					g.arc(x, y, r, 0, Math.PI * 2);
					g.fill();
				}
			}

			// network pulses along links (spider dash across multiverse)
			if (!prefersReduced) {
				for (let pi = netPulses.length - 1; pi >= 0; pi--) {
					const pulse = netPulses[pi];
					pulse.progress += pulse.speed;
					if (pulse.progress >= 1) { netPulses.splice(pi, 1); continue; }
					const fromNode = nodes[pulse.from];
					for (let j = 0; j < nodes.length; j++) {
						if (j === pulse.from) continue;
						const toNode = nodes[j];
						const dx = fromNode.x - toNode.x, dy = fromNode.y - toNode.y, dz = fromNode.z - toNode.z;
						const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
						const sameCluster = fromNode.cluster === toNode.cluster && fromNode.cluster !== -1;
						const maxD = sameCluster ? linkDistance : linkDistance * 1.35;
						if (dist > maxD || dist < 8) continue;
						const pa = projected[pulse.from], pb = projected[j];
						if (pa.scale < 0.08 || pb.scale < 0.08) continue;
						const mx = pa.x + (pb.x - pa.x) * pulse.progress;
						const my = pa.y + (pb.y - pa.y) * pulse.progress;
						const pulseAlpha = Math.sin(pulse.progress * Math.PI) * 0.88;
						const r = 1.7 + pulseAlpha * 2.4;
						// motion streak — short tail opposite direction
						const tailX = mx - (pb.x - pa.x) * 0.08 * pulseAlpha;
						const tailY = my - (pb.y - pa.y) * 0.08 * pulseAlpha;
						g.strokeStyle = `rgba(${brandRGB}, ${pulseAlpha * 0.28})`;
						g.lineWidth = r * 0.9;
						g.beginPath();
						g.moveTo(tailX, tailY);
						g.lineTo(mx, my);
						g.stroke();
						const glow = g.createRadialGradient(mx, my, 0, mx, my, r * 3.6);
						glow.addColorStop(0, `rgba(${accentRGB}, ${pulseAlpha * 0.58})`);
						glow.addColorStop(1, `rgba(${accentRGB}, 0)`);
						g.fillStyle = glow;
						g.beginPath();
						g.arc(mx, my, r * 3.6, 0, Math.PI * 2);
						g.fill();
						g.fillStyle = `rgba(${accentRGB}, ${pulseAlpha})`;
						g.beginPath();
						g.arc(mx, my, r, 0, Math.PI * 2);
						g.fill();
						g.fillStyle = `rgba(${brandRGB}, ${pulseAlpha * 0.9})`;
						g.beginPath();
						g.arc(mx + 0.7, my, r * 0.55, 0, Math.PI * 2);
						g.fill();
					}
				}
			}

			// nodes — Spider-Verse comic dots with ink outline + halftone + chromatic offset
			const order = projected.map((_, i) => i).sort((a, b) => projected[b].depth - projected[a].depth);
			for (const i of order) {
				const n = nodes[i];
				const p = projected[i];
				if (p.scale < 0.038) continue;
				n.twinklePhase += n.twinkleSpeed;
				const twinkle = 0.58 + 0.42 * (0.5 + 0.5 * Math.sin(n.twinklePhase));
				const baseR = 2.15 * p.scale * n.sizeMod;
				const radius = Math.max(0.65, baseR) * twinkle;
				const alpha = Math.min(1, p.scale * p.scale * 1.15) * (0.72 + 0.28 * twinkle);
				const isBridge = n.cluster === -1;
				const boost = isBridge ? 1.08 : 1;
				// chromatic shadow (offset brand)
				{
					const cr = radius * 1.02;
					g.fillStyle = `rgba(${brandRGB}, ${alpha * 0.20 * boost})`;
					g.beginPath();
					g.arc(p.x + 0.85, p.y + 0.45, cr, 0, Math.PI * 2);
					g.fill();
				}
				// outer glow (softer, comic bloom)
				{
					const glowR = radius * (3.0 + twinkle * 1.2);
					const glow = g.createRadialGradient(p.x, p.y, radius * 0.6, p.x, p.y, glowR);
					glow.addColorStop(0, `rgba(${brandRGB}, ${alpha * 0.28 * boost})`);
					glow.addColorStop(0.42, `rgba(${brandRGB}, ${alpha * 0.12 * boost})`);
					glow.addColorStop(1, `rgba(${brandRGB}, 0)`);
					g.fillStyle = glow;
					g.beginPath();
					g.arc(p.x, p.y, glowR, 0, Math.PI * 2);
					g.fill();
				}
				// ink outline — thick comic border
				g.strokeStyle = `rgba(${inkRGB}, ${alpha * 0.95})`;
				g.lineWidth = Math.max(0.7, radius * 0.52);
				g.beginPath();
				g.arc(p.x, p.y, radius, 0, Math.PI * 2);
				g.stroke();
				// brand fill
				g.fillStyle = `rgba(${brandRGB}, ${alpha})`;
				g.beginPath();
				g.arc(p.x, p.y, radius * 0.92, 0, Math.PI * 2);
				g.fill();
				// halftone stipple inside (ink dots for print feel) — only on larger nodes
				if (radius > 1.2) {
					const dots = isBridge ? 3 : 2;
					for (let d = 0; d < dots; d++) {
						const ang = (d / dots) * Math.PI * 2 + i * 0.6;
						const rr = radius * 0.38;
						const dx = Math.cos(ang) * rr * 0.5;
						const dy = Math.sin(ang) * rr * 0.5;
						g.fillStyle = `rgba(${inkRGB}, ${alpha * 0.38})`;
						g.beginPath();
						g.arc(p.x + dx, p.y + dy, radius * 0.18, 0, Math.PI * 2);
						g.fill();
					}
					// surface highlight dot cluster
					g.fillStyle = `rgba(${surfaceRGB}, ${alpha * 0.42})`;
					g.beginPath();
					g.arc(p.x - radius * 0.28, p.y - radius * 0.28, radius * 0.14, 0, Math.PI * 2);
					g.fill();
				}
				// specular core (ink's reflection — comic shine)
				g.fillStyle = `rgba(${surfaceRGB}, ${alpha * 0.85})`;
				g.beginPath();
				g.arc(p.x - radius * 0.18, p.y - radius * 0.18, radius * 0.28, 0, Math.PI * 2);
				g.fill();
			}

			// tiny spider dangler from main web (kept subtle, behind nodes but visible)
			if (w > 380) {
				const web = webs[0];
				if (web) {
					const hangR = ringRadius(web, 2);
					const hangPt = spokePoint(web, Math.floor(web.spokes * 0.36), hangR, t, tx, ty);
					const threadTop = { x: web.ax + tx * 0.08, y: web.ay + ty * 0.08 };
					const swayX = prefersReduced ? 0 : Math.sin(t * 0.9) * 5.5;
					const spX = hangPt.x + swayX;
					const spY = hangPt.y + (prefersReduced ? 0 : Math.sin(t * 1.06) * 1.1);
					g.strokeStyle = `rgba(${inkRGB}, ${isDark ? 0.20 : 0.15})`;
					g.lineWidth = 0.65;
					g.beginPath();
					g.moveTo(threadTop.x, threadTop.y);
					g.quadraticCurveTo((threadTop.x + spX) * 0.5 + swayX * 0.2, (threadTop.y + spY) * 0.5 + 7, spX, spY - 7);
					g.stroke();
					const bob = prefersReduced ? 0 : Math.sin(t * 1.25) * 0.55;
					const sx = spX, sy = spY + bob;
					g.fillStyle = `rgba(${inkRGB}, ${isDark ? 0.09 : 0.055})`;
					g.beginPath();
					g.ellipse(sx, sy + 8.5, 6.2, 1.9, 0, 0, Math.PI * 2);
					g.fill();
					g.strokeStyle = `rgba(${inkRGB}, ${isDark ? 0.80 : 0.74})`;
					g.lineWidth = 0.85;
					g.lineCap = 'round';
					for (const side of [-1, 1]) {
						for (let li = 0; li < 4; li++) {
							const spread = (li - 1.5) * 0.42;
							const legLen = 4.6 + Math.abs(spread) * 1.8;
							const lx = sx + side * (2.0 + li * 0.14);
							const ly = sy - 1 + li * 0.48;
							g.beginPath();
							g.moveTo(lx, ly);
							g.quadraticCurveTo(lx + side * (legLen * 0.52) + spread * 1.8, ly - 1.8 + spread, lx + side * legLen, ly + spread);
							g.stroke();
						}
					}
					g.fillStyle = `rgba(${inkRGB}, 0.96)`;
					g.beginPath();
					g.ellipse(sx, sy + 2.0, 2.9, 3.9, 0, 0, Math.PI * 2);
					g.fill();
					g.fillStyle = `rgba(${brandRGB}, 0.96)`;
					g.beginPath();
					g.moveTo(sx, sy + 0.9);
					g.lineTo(sx - 1.0, sy + 3.0);
					g.lineTo(sx + 1.0, sy + 3.0);
					g.closePath();
					g.fill();
					g.beginPath();
					g.moveTo(sx, sy + 4.9);
					g.lineTo(sx - 1.0, sy + 3.0);
					g.lineTo(sx + 1.0, sy + 3.0);
					g.closePath();
					g.fill();
					g.fillStyle = `rgba(${inkRGB}, 0.98)`;
					g.beginPath();
					g.ellipse(sx, sy - 1.9, 2.1, 1.85, 0, 0, Math.PI * 2);
					g.fill();
					g.fillStyle = `rgba(${accentRGB}, 0.96)`;
					for (const ex of [-0.85, 0.85]) {
						g.beginPath();
						g.ellipse(sx + ex, sy - 2.2, 0.68, 0.82, ex * 0.35, 0, Math.PI * 2);
						g.fill();
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
			window.removeEventListener('resize', onResizeWebs);
			window.removeEventListener('mousemove', onMouse);
		};
	});
</script>

<canvas bind:this={canvas} class="h-full w-full"></canvas>
