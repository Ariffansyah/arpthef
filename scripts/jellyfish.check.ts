// node --experimental-strip-types scripts/jellyfish.check.ts
import assert from 'node:assert/strict';
import { bellC, hull, makeJelly, updateJelly } from '../src/lib/jellyfish.ts';

const R = 600;
for (let n = 0; n < 20; n++) run();

function run() {
const j = makeJelly(R);
const start = { x: j.x, y: j.y, z: j.z };
let maxDist = 0;
let path = 0;
let px = j.x, py = j.y, pz = j.z;
let ymin = j.y, ymax = j.y;

for (let f = 0; f < 3600; f++) {
	updateJelly(j, 1 / 60, R);
	assert.ok(Number.isFinite(j.x + j.y + j.z + j.vx + j.vy + j.vz), 'position/velocity went NaN');
	maxDist = Math.max(maxDist, Math.hypot(j.x, j.y, j.z));
	ymin = Math.min(ymin, j.y); ymax = Math.max(ymax, j.y);
	path += Math.hypot(j.x - px, j.y - py, j.z - pz);
	px = j.x; py = j.y; pz = j.z;
	for (const st of j.strands) {
		for (let i = 1; i < st.pts.length; i++) {
			const a = st.pts[i - 1];
			const b = st.pts[i];
			const len = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
			assert.ok(Math.abs(len - st.seg) < 1e-6, `segment stretched: ${len} vs ${st.seg}`);
		}
	}
}

assert.ok(path > j.size * 3, `barely swam: ${path}`);
assert.ok(maxDist < R * 1.6, `escaped the swarm: ${maxDist}`);
assert.ok(j.dy < -0.8, `bell not upright: dy=${j.dy}`);

assert.equal(bellC(0), 0);
assert.ok(bellC(Math.PI / 2) > 0.99);
assert.equal(bellC(-Math.PI / 2), 0);

assert.equal(hull([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0.5, y: 0.5 }]).length, 4);

console.log(`ok — 60s swim: size ${j.size.toFixed(0)}u, path ${path.toFixed(0)}u (${(path / 60 / j.size).toFixed(2)} body-lengths/s), drift ${Math.hypot(j.x - start.x, j.y - start.y, j.z - start.z).toFixed(0)}u, y ${ymin.toFixed(0)}..${ymax.toFixed(0)}, max radius ${maxDist.toFixed(0)}/${R}`);
}
