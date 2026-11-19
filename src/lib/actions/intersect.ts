/** Adds .visible once the node scrolls into view. Nodes that start below the fold also get
 *  .reveal, which app.css hides until then; on-screen ones never blink out during hydration. */
export function intersect(node: HTMLElement): { destroy(): void } {
	if (node.getBoundingClientRect().top > window.innerHeight) node.classList.add('reveal');

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
		}
	};
}
