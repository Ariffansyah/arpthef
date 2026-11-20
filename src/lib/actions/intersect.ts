import { emerge } from '$lib/symbiote';

let blocks = 0;

/** Adds .visible once the node scrolls into view. Nodes that start below the fold also get
 *  .reveal, which app.css hides until then; on-screen ones never blink out during hydration. */
export function intersect(node: HTMLElement): { destroy(): void } {
	if (node.getBoundingClientRect().top > window.innerHeight) node.classList.add('reveal');

	// app.css starts panel-in on each child in turn, and on list items added later, so opening
	// them here keeps that timing. Blocks take turns between a portal and the symbiote.
	const from = blocks++ % 2 ? 'symbiote' : 'portal';
	const onStart = (e: AnimationEvent) => {
		const el = e.target as HTMLElement;
		// A nested .reveal block opens its own children.
		if (e.animationName === 'panel-in' && el.parentElement?.closest('.reveal') === node)
			emerge(el, from);
	};
	node.addEventListener('animationstart', onStart);

	// A ratio threshold never fires on a block taller than the viewport, which would leave it hidden.
	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting) return;
			node.classList.add('visible');
			observer.disconnect();
		},
		{ rootMargin: '0px 0px -10% 0px' }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
			node.removeEventListener('animationstart', onStart);
		}
	};
}
