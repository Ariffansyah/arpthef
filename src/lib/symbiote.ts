import { tick } from 'svelte';
import { theme } from '$lib/theme';

/**
 * Theme flip as a symbiote: the other dimension oozes out of `from` with tendrils racing
 * ahead, and the page turns over inside it. Venom-black going dark, Anti-Venom white going
 * light, so the goo's leading edge always contrasts with the page it eats. Built on View
 * Transitions: the new page is clipped to the goo, and an SVG in the new page inks its rim.
 */

/** Twos, like Background3D. */
const FRAME = 83;
const FRAMES = 9;
/** Visible ink inside the goo's edge; the stroke is twice this and the clip hides the outer half. */
const RIM = 14;
const NS = 'http://www.w3.org/2000/svg';

type Pt = [number, number];

let running = false;

const xy = ([x, y]: Pt) => `${x.toFixed(1)} ${y.toFixed(1)}`;

/** Closed curve through the midpoints of `pts`, so every corner comes out round like goo. */
function curve(pts: Pt[]): string {
	const mid = (i: number): Pt => {
		const [a, b] = [pts[i % pts.length], pts[(i + 1) % pts.length]];
		return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
	};
	let d = `M${xy(mid(pts.length - 1))}`;
	for (let i = 0; i < pts.length; i++) d += `Q${xy(pts[i])} ${xy(mid(i))}`;
	return d + 'Z';
}

function frames(cx: number, cy: number) {
	const reach = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
	const rnd = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
	const phase = [rnd(0, 7), rnd(0, 7), rnd(0, 7)];
	// The wobble dips at most 15%, so the last frame still covers the farthest corner.
	const end = (reach / 0.85) * 1.02;
	const spin = rnd(0, Math.PI * 2);
	const tendrils = Array.from({ length: 9 }, (_, k) => ({
		angle: spin + (k / 9) * Math.PI * 2 + rnd(-0.25, 0.25),
		length: reach * rnd(0.22, 0.5),
		width: rnd(12, 26),
		bend: rnd(-0.3, 0.3),
		phase: rnd(0, 7)
	}));
	const drops = Array.from({ length: 7 }, () => ({ angle: rnd(0, 7), gap: rnd(0.08, 0.3), r: rnd(3, 9) }));

	return Array.from({ length: FRAMES }, (_, i) => {
		const p = i / (FRAMES - 1);
		const R = 26 + (end - 26) * p ** 1.7;
		const edge = (a: number, inset = 0) => {
			const k =
				1 +
				0.07 * Math.sin(3 * a + phase[0] + p * 2) +
				0.05 * Math.sin(5 * a + phase[1] - p * 3) +
				0.03 * Math.sin(11 * a + phase[2] + p * 5);
			return [cx + Math.cos(a) * (R * k - inset), cy + Math.sin(a) * (R * k - inset)] as Pt;
		};
		const ring = (inset = 0) =>
			Array.from({ length: 48 }, (_, j) => edge((j / 48) * Math.PI * 2, inset));

		// Every subpath winds clockwise on screen, so the nonzero fill unions them instead of punching holes.
		const strands = tendrils.map((t) => {
			const out: Pt[] = [];
			const back: Pt[] = [];
			const r0 = R * 0.6;
			const r1 = R + t.length * Math.min(1, 0.35 + p);
			for (let s = 0; s <= 1.001; s += 1 / 7) {
				const a = t.angle + t.bend * s * Math.sin(s * 2.6 + t.phase + p * 3);
				const r = r0 + (r1 - r0) * s;
				const half = (t.width * (1 - s) ** 0.7) / 2 + 0.5;
				const [x, y, nx, ny] = [cx + Math.cos(a) * r, cy + Math.sin(a) * r, -Math.sin(a), Math.cos(a)];
				out.push([x - nx * half, y - ny * half]);
				back.unshift([x + nx * half, y + ny * half]);
			}
			return curve([...out, ...back]);
		});
		const splatter = drops.map(({ angle, gap, r }) => {
			const [x, y] = [cx + Math.cos(angle) * R * (1 + gap), cy + Math.sin(angle) * R * (1 + gap)];
			return `M${xy([x - r, y])}a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 ${-2 * r} 0Z`;
		});

		return { goo: curve(ring()) + strands.join('') + splatter.join(''), glint: curve(ring(RIM * 0.55)) };
	});
}

function overlay(toDark: boolean): SVGSVGElement {
	const ink = toDark ? '#05060c' : '#fff5e1';
	const shine = toDark ? '#fff5e1' : '#0c1844';
	const svg = document.createElementNS(NS, 'svg');
	svg.classList.add('symbiote');
	svg.setAttribute('aria-hidden', 'true');
	// The plates sit under the ink so they only fringe its inner edge, misregistered like the rest of the page.
	svg.innerHTML = `
		<path stroke-width="${RIM * 2}" style="stroke: var(--plate-a)" transform="translate(-3 0)" />
		<path stroke-width="${RIM * 2}" style="stroke: var(--plate-b)" transform="translate(3 0)" />
		<path stroke-width="${RIM * 2}" stroke="${ink}" />
		<path class="glint" stroke-width="2.5" stroke="${shine}" stroke-dasharray="60 140 18 90" stroke-linecap="round" />`;
	return svg;
}

export async function symbioteToggle(from: HTMLElement) {
	if (running) return;
	if (!document.startViewTransition) return theme.toggle();

	const root = document.documentElement;
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const toDark = !root.classList.contains('dark');
	const box = from.getBoundingClientRect();
	const shots = reduce ? [] : frames(box.left + box.width / 2, box.top + box.height / 2);
	const svg = overlay(toDark);
	const paths = [...svg.querySelectorAll('path')];
	const draw = (i: number) => {
		for (const p of paths) p.setAttribute('d', p.classList.contains('glint') ? shots[i].glint : shots[i].goo);
	};

	running = true;
	root.dataset.symbiote = '';
	const vt = document.startViewTransition(async () => {
		theme.toggle();
		if (!reduce) {
			draw(0);
			document.body.append(svg);
		}
		await tick();
	});

	let done = false;
	vt.finished.finally(() => {
		done = true;
		running = false;
		svg.remove();
		delete root.dataset.symbiote;
	});

	try {
		await vt.ready;
	} catch {
		return;
	}

	const pseudoElement = '::view-transition-new(root)';
	// Reduced motion keeps the confirmation as a short crossfade instead of the spread.
	if (reduce) {
		root.animate({ opacity: [0, 1] }, { duration: 200, easing: 'ease-out', pseudoElement });
		return;
	}
	const anim = root.animate(
		[
			...shots.map(({ goo }, i) => ({ clipPath: `path('${goo}')`, offset: i / FRAMES, easing: 'step-end' })),
			{ clipPath: `path('${shots[FRAMES - 1].goo}')`, offset: 1 }
		],
		{ duration: FRAMES * FRAME, pseudoElement }
	);
	// The new page is a live snapshot, so redrawing the rim here shows up inside the clip on the same frame.
	let shown = 0;
	const step = () => {
		if (done) return;
		const i = Math.min(FRAMES - 1, Math.floor(Number(anim.currentTime ?? 0) / FRAME));
		if (i !== shown) draw((shown = i));
		requestAnimationFrame(step);
	};
	requestAnimationFrame(step);
}
