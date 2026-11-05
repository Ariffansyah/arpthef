# \_archive

Legacy code kept for reference — not imported anywhere.

- `jellyfish.ts` — physics for bell + tentacles (thrust/drag/current/Verlet), used by previous 3D canvas. Archived 2026-08-21 for Spider-Verse cobweb theme.
- `Background3D.legacy.svelte` — old canvas: 100+ nodes + stars + planets + jellyfish projection with 3D rotation + pulses. Archived 2026-08-21.
- `Background3D.nebulaweb.svelte` — nebula wash + glowing web strands + pulses; no rifts, chromatic aberration or glitch. Archived 2026-08-21 for the multiverse version.
- `Background3D.halftone.svelte` — comic-halftone cobweb version: 3D clustered node network + corner cobwebs + halftone dots + portals. Archived 2026-08-21 for the nebula-web version.
- `ScrollNav.svelte` — scroll-to-switch-pages: hold the wheel or swipe at the top/bottom edge for 3 s to go to the previous/next page, with a progress bar and cancel button. Archived 2026-11-05.

Restore either: `cp _archive/<file> ../components/Background3D.svelte` (jellyfish.legacy also needs `cp _archive/jellyfish.ts ../jellyfish.ts`). Restore ScrollNav by rendering `<ScrollNav links={navLinks} blocked={isOpen} />` in `src/routes/+layout.svelte`.

New background: `../components/Background3D.svelte` (Spider-Verse multiverse — per-dimension palette, Across-the-Spider-Verse portals (faceted crystal shell around a flowing orange ring tunnel), each tagged with its Earth number, Spider Society members (Miles, Gwen, Miguel, Peter B., Hobie, Pavitr) swinging portal to portal with THWIP!s and plate smears, the Spot's boiling ink holes, scalloped comic webs in misregistered plates, block glitches, all animated on twos. Halftone plate and comic-panel sidebar live in `src/routes/+layout.svelte`).
