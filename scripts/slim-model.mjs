/**
 * Slim a character .glb for the sidebar (see src/lib/components/Character3D.svelte).
 *
 * Game-rip models ship every clip in the character's move set and full-size PNG
 * textures. We only ever play one resting clip at ~250px on screen, so the rest
 * is download weight and GPU memory for nothing.
 *
 * Usage — the tooling is not a project dependency, so pull it in ad hoc:
 *
 *   npx --yes -p @gltf-transform/core -p @gltf-transform/extensions \
 *              -p @gltf-transform/functions -p sharp \
 *              node scripts/slim-model.mjs in.glb out.glb
 *
 * Always write to a NEW path and keep the original — this is lossy.
 */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRMaterialsPBRSpecularGlossiness } from '@gltf-transform/extensions';
import { prune, dedup, resample, textureCompress, metalRough } from '@gltf-transform/functions';
import sharp from 'sharp';

const args = process.argv.slice(2);
const clipAt = args.indexOf('--clip');
const wanted = clipAt === -1 ? null : args[clipAt + 1];
const [src, dst] = clipAt === -1 ? args : args.filter((_, i) => i !== clipAt && i !== clipAt + 1);

if (!src || !dst) {
	console.error('usage: node scripts/slim-model.mjs <in.glb> <out.glb> [--clip <substring>]');
	process.exit(1);
}
if (src === dst) {
	console.error('refusing to overwrite the source in place — pick a different output path');
	process.exit(1);
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
const root = doc.getRoot();

// Keep one clip — whatever Character3D is configured to play for this model.
const anims = root.listAnimations();
const pick = wanted
	? anims.find((a) => a.getName().toLowerCase().includes(wanted.toLowerCase()))
	: (anims.find((a) => /idle/i.test(a.getName())) ??
		anims.find((a) => /wait|stand|breath/i.test(a.getName())) ??
		anims[0]);

if (wanted && !pick) {
	console.error(`no clip matching "${wanted}". Available:`);
	for (const a of anims) console.error('  ' + a.getName());
	process.exit(1);
}

for (const a of anims) {
	if (a === pick) continue;
	// Disposing the Animation alone leaves its channels and samplers behind, and
	// those keep every keyframe accessor alive through prune().
	for (const ch of a.listChannels()) ch.dispose();
	for (const s of a.listSamplers()) s.dispose();
	a.dispose();
}
console.log(`${src}: ${anims.length} clips -> kept "${pick?.getName() ?? 'none'}"`);

/*
 * three removed KHR_materials_pbrSpecularGlossiness (it is gone from
 * GLTFLoader as of r150+), so anything still using it loads untextured.
 * Convert to metallic-roughness before writing.
 *
 * Some exporters also leave the albedo in the specular-glossiness slot with a
 * black diffuseFactor and no diffuse texture — that converts to a plain black
 * material. When we see that shape, treat the specGloss map as the albedo.
 */
for (const mat of root.listMaterials()) {
	const sg = mat.getExtension(KHRMaterialsPBRSpecularGlossiness.EXTENSION_NAME);
	if (!sg) continue;
	const diffuse = sg.getDiffuseTexture();
	const specGloss = sg.getSpecularGlossinessTexture();
	const factor = sg.getDiffuseFactor();
	const isBlack = factor.slice(0, 3).every((c) => c < 0.02);
	if (!diffuse && specGloss && isBlack) {
		console.log(`  ${mat.getName()}: specGloss map -> baseColor (diffuse was black)`);
		sg.setDiffuseTexture(specGloss);
		sg.setDiffuseFactor([1, 1, 1, factor[3]]);
	}
}

await doc.transform(
	metalRough(), // specular-glossiness -> metallic-roughness
	resample(), // drop redundant keyframes
	textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [512, 512] }),
	dedup(),
	prune()
);

await io.write(dst, doc);
console.log(`wrote ${dst}`);
