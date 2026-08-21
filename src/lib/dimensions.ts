import type { Theme } from './theme';

/**
 * The two dimensions the site renders in. `Background3D` (canvas) and
 * `Character3D` (WebGL) both read these, so the sidebar lighting stays in
 * register with the printing plates and wash behind it.
 */
export const DIMENSIONS = {
	light: {
		ink: 0xc80036, // web strands
		plateA: 0x00a9c0, // cyan plate
		plateB: 0xe4007f, // magenta plate
		key: 0xfff5e1, // warm cream key light
		sky: 0xfff5e1,
		ground: 0xc4afff // the light wash violet
	},
	dark: {
		ink: 0xebe2ff,
		plateA: 0x00e5ff,
		plateB: 0xff2d96,
		key: 0xfff5e1,
		sky: 0x8a6cff,
		ground: 0x140a2e
	}
} as const satisfies Record<Theme, Record<string, number>>;

/** `0xff2d96` → `'255,45,150'`, for canvas `rgba()` strings. */
export const rgb = (hex: number) => `${(hex >> 16) & 255},${(hex >> 8) & 255},${hex & 255}`;
