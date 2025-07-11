export interface IntersectOptions {
	threshold?: number;
	once?: boolean;
}

export function intersect(node: HTMLElement, options: IntersectOptions = {}): { destroy(): void } {
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				node.classList.add('visible');
				if (options.once) {
					observer.disconnect();
				}
			} else if (!options.once) {
				node.classList.remove('visible');
			}
		},
		{
			threshold: options.threshold ?? 0.1
		}
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
