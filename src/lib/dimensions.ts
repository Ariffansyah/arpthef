import type { Theme } from './theme';

/** Shared by Background3D and Character3D so the portrait lighting matches the plates. */
export const DIMENSIONS = {
	light: {
		ink: 0x0c1844,
		plateA: 0x00a9c0,
		plateB: 0xe4007f,
		key: 0xfff5e1,
		sky: 0xfff5e1,
		ground: 0xc4afff
	},
	dark: {
		ink: 0xfff5e1,
		plateA: 0x00e5ff,
		plateB: 0xff2d96,
		key: 0xfff5e1,
		sky: 0x8a6cff,
		ground: 0x140a2e
	}
} as const satisfies Record<Theme, Record<string, number>>;

/** `0xff2d96` → `'255,45,150'`, for canvas `rgba()` strings. */
export const rgb = (hex: number) => `${(hex >> 16) & 255},${(hex >> 8) & 255},${hex & 255}`;
