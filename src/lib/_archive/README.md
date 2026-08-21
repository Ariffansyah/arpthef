# _archive

Legacy background kept for reference — not imported anywhere.

- `jellyfish.ts` — physics for bell + tentacles (thrust/drag/current/Verlet), used by previous 3D canvas. Archived 2026-08-21 for Spider-Verse cobweb theme.
- `Background3D.legacy.svelte` — old canvas: 100+ nodes + stars + planets + jellyfish projection with 3D rotation + pulses. Archived 2026-08-21.
- `Background3D.nebulaweb.svelte` — nebula wash + glowing web strands + pulses; no rifts, chromatic aberration or glitch. Archived 2026-08-21 for the multiverse version.
- `Background3D.halftone.svelte` — comic-halftone cobweb version: 3D clustered node network + corner cobwebs + halftone dots + portals. Archived 2026-08-21 for the nebula-web version.

Restore either: `cp _archive/<file> ../components/Background3D.svelte` (jellyfish.legacy also needs `cp _archive/jellyfish.ts ../jellyfish.ts`).

New background: `../components/Background3D.svelte` (Spider-Verse multiverse — per-dimension palette, torn dimension rifts with krackle sparks, chromatic-aberration web strands, and periodic glitch slicing. Halftone plate and comic-panel sidebar live in `src/routes/+layout.svelte`).
