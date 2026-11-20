import { tick } from 'svelte';
import { browser } from '$app/environment';
import type { OnNavigate } from '@sveltejs/kit';
import { theme } from '$lib/theme';
import { PORTAL } from '$lib/dimensions';

/**
 * Page changes as a symbiote: the next page oozes out of a point with tendrils racing ahead,
 * and the old one turns over inside it. Venom-black over a light page, Anti-Venom white over a
 * dark one, so the goo's leading edge always contrasts with the page it eats. Built on View
 * Transitions: the new page is clipped to the goo, and an SVG in the new page inks its rim.
 */

/** Twos, like Background3D. */
const FRAME = 83;
const FRAMES = 9;
/** Visible ink inside the goo's edge; the stroke is twice this and the clip hides the outer half. */
const RIM = 14;
const NS = 'http://www.w3.org/2000/svg';

type Pt = [number, number];
/** One frame: the clip, and for the goo an inset ring for the glint. */
type Shot = { goo: string; glint?: string };

let running = false;
let tap = { at: -Infinity, pt: [0, 0] as Pt };

const centre = (el: Element): Pt => {
	const b = el.getBoundingClientRect();
	return [b.left + b.width / 2, b.top + b.height / 2];
};

if (browser)
	addEventListener(
		'click',
		(e) => {
			// detail 0 is a keyboard click, which has no pointer: start from what was activated.
			tap = { at: performance.now(), pt: e.detail ? [e.clientX, e.clientY] : centre(e.target as Element) };
		},
		{ capture: true, passive: true }
	);

/** Where the reader just clicked, or the middle of the screen when nothing was (back button, Escape). */
const lastTap = (): Pt =>
	performance.now() - tap.at < 1000 ? tap.pt : [innerWidth / 2, innerHeight / 2];

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

function frames(cx: number, cy: number, w = innerWidth, h = innerHeight, n = FRAMES, rim = RIM) {
	const reach = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));
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

	return Array.from({ length: n }, (_, i) => {
		const p = i / (n - 1);
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

		return { goo: curve(ring()) + strands.join('') + splatter.join(''), glint: curve(ring(rim * 0.55)) };
	});
}

/** A Background3D rift opening at (cx, cy) in a w×h box: a lopsided nonagon, turning as it widens. */
function rift(cx: number, cy: number, w: number, h: number, rim: number, n = 6): Shot[] {
	const spin = Math.random() * Math.PI * 2;
	const facets = Array.from({ length: 9 }, () => [
		(Math.random() - 0.5) * 0.3,
		0.92 + Math.random() * 0.16
	]);
	// Those facets never cut in past 0.8 of the radius, so the last frame clears the corners, rim and all.
	const end = (Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + rim) / 0.8;
	return Array.from({ length: n }, (_, i) => {
		const p = i / (n - 1);
		const R = 12 + (end - 12) * p ** 1.5;
		const pts = facets.map(([da, k], j) => {
			const a = spin + p * 0.6 + ((j + da) / 9) * Math.PI * 2;
			return xy([cx + Math.cos(a) * R * k, cy + Math.sin(a) * R * k]);
		});
		return { goo: `M${pts.join('L')}Z` };
	});
}

/**
 * Rim strokes from widest to narrowest. Each shows only its inner half, since the svg is clipped to
 * the same shape it strokes; the plates sit under them so they only fringe the inner edge,
 * misregistered like the rest of the page.
 */
function rim(layers: [number, string][], glint?: string): SVGSVGElement {
	const svg = document.createElementNS(NS, 'svg');
	svg.classList.add('symbiote');
	svg.setAttribute('aria-hidden', 'true');
	const [widest] = layers[0];
	svg.innerHTML =
		`<path stroke-width="${widest}" style="stroke: var(--plate-a)" transform="translate(-3 0)" />
		<path stroke-width="${widest}" style="stroke: var(--plate-b)" transform="translate(3 0)" />` +
		layers.map(([w, c]) => `<path stroke-width="${w}" stroke="${c}" />`).join('') +
		(glint
			? `<path class="glint" stroke-width="2.5" stroke="${glint}" stroke-dasharray="60 140 18 90" stroke-linecap="round" />`
			: '');
	return svg;
}

const gooRim = (venom: boolean, s = 1) =>
	rim([[RIM * 2 * s, venom ? '#05060c' : '#fff5e1']], venom ? '#fff5e1' : '#0c1844');

/** Inward from the edge: dark lip, lavender shell, dark again, then the orange tunnel ring with its gold rim. */
const riftRim = (s: number) => {
	const c = (k: keyof typeof PORTAL) => `rgb(${PORTAL[k]})`;
	return rim([
		[38 * s, c('rim')],
		[34 * s, c('ring')],
		[24 * s, c('deep')],
		[20 * s, c('shell')],
		[5 * s, c('deep')]
	]);
};

const draw = (svg: SVGSVGElement, { goo, glint = goo }: Shot) => {
	for (const p of svg.querySelectorAll('path'))
		p.setAttribute('d', p.classList.contains('glint') ? glint : goo);
};

const clips = (shots: Shot[]) => [
	...shots.map(({ goo }, i) => ({
		clipPath: `path('${goo}')`,
		offset: i / shots.length,
		easing: 'step-end'
	})),
	{ clipPath: `path('${shots[shots.length - 1].goo}')`, offset: 1 }
];

/** Redraws the rim whenever `anim` steps to its next frame, until the svg is taken down. */
function follow(anim: Animation, svg: SVGSVGElement, shots: Shot[]) {
	let shown = 0;
	const step = () => {
		if (!svg.isConnected) return;
		const i = Math.min(shots.length - 1, Math.floor(Number(anim.currentTime ?? 0) / FRAME));
		if (i !== shown) draw(svg, shots[(shown = i)]);
		requestAnimationFrame(step);
	};
	requestAnimationFrame(step);
}

async function spread([cx, cy]: Pt, update: () => unknown) {
	const root = document.documentElement;
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const shots = reduce ? [] : frames(cx, cy);
	const svg = gooRim(!root.classList.contains('dark'));

	running = true;
	const vt = document.startViewTransition(async () => {
		await update();
		if (!reduce) {
			draw(svg, shots[0]);
			document.body.append(svg);
		}
		await tick();
	});

	const end = () => {
		running = false;
		svg.remove();
	};
	// Rejects when an aborted navigation rejects the update; the cleanup is the same.
	vt.finished.then(end, end);

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
	const anim = root.animate(clips(shots), { duration: FRAMES * FRAME, pseudoElement });
	// The new page is a live snapshot, so redrawing the rim shows up inside the clip on the same frame.
	follow(anim, svg, shots);
}

/** The theme flips inside goo that oozes out of the toggle. */
export function symbioteToggle(from: HTMLElement) {
	if (running) return;
	if (!document.startViewTransition) return theme.toggle();
	spread(centre(from), () => theme.toggle());
}

/** For onNavigate: the next page oozes out of wherever the reader just clicked. */
export function symbioteNavigate(navigation: OnNavigate) {
	if (running || !document.startViewTransition) return;
	return new Promise<void>((resolve) =>
		spread(lastTap(), async () => {
			resolve();
			await navigation.complete;
		})
	);
}

/**
 * Svelte transition: the element oozes out of `from`'s centre (default: the last click) and is
 * sucked back in on the way out. Just the goo's shape, without the page-wide rim.
 */
export function ooze(node: Element, { from }: { from?: Element | null } = {}) {
	const box = node.getBoundingClientRect();
	const [x, y] = from ? centre(from) : lastTap();
	const shots = frames(x - box.left, y - box.top, box.width, box.height, 6).map((s) => s.goo);
	return {
		duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : shots.length * FRAME,
		css: (t: number) => `clip-path: path('${shots[Math.min(shots.length - 1, Math.floor(t * shots.length))]}')`
	};
}

/**
 * Opens `el` out of a Background3D portal, or under goo crawling in from one side, on twos. The
 * rim is inked by a copy of the clip laid over the element in page coordinates, so it scrolls along.
 */
export function emerge(el: HTMLElement, from: 'portal' | 'symbiote') {
	const [w, h] = [el.offsetWidth, el.offsetHeight];
	if (!w || !h) return;
	// A full-width rim would bury chips and one-line headings.
	const s = Math.min(1, Math.min(w, h) / 120);
	const b = el.getBoundingClientRect();
	// Open on what is drawn, not the middle of a full-width block holding one short heading.
	const range = document.createRange();
	range.selectNodeContents(el);
	const c = range.getBoundingClientRect();
	const [l, t, cw, ch] = c.width ? [c.left - b.left, c.top - b.top, c.width, c.height] : [0, 0, w, h];
	const shots =
		from === 'portal'
			? rift(l + cw / 2, t + ch / 2, w, h, 19 * s)
			: frames(Math.random() < 0.5 ? l : l + cw, t + Math.random() * ch, w, h, 6, RIM * s);
	const svg =
		from === 'portal' ? riftRim(s) : gooRim(!document.documentElement.classList.contains('dark'), s);
	// Tilts turn about the centre, so the untilted box around it plus the same tilt lines the rim up.
	const [cx, cy] = [b.left + b.width / 2, b.top + b.height / 2];
	const { rotate, scale } = getComputedStyle(el);
	Object.assign(svg.style, {
		position: 'absolute',
		zIndex: '20',
		left: `${cx + scrollX - w / 2}px`,
		top: `${cy + scrollY - h / 2}px`,
		width: `${w}px`,
		height: `${h}px`,
		rotate,
		scale
	});
	draw(svg, shots[0]);
	document.body.append(svg);

	const timing = { duration: shots.length * FRAME };
	const anim = el.animate(clips(shots), timing);
	svg.animate(clips(shots), timing);
	follow(anim, svg, shots);
	const end = () => svg.remove();
	anim.finished.then(end, end);
}
