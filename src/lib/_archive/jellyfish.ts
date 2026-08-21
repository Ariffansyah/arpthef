export type P3 = { x: number; y: number; z: number };

export type Strand = {
	pts: P3[];
	prev: P3[];
	angle: number;
	rim: number; // 1 = rim tentacle, <1 = inner oral arm
	seg: number;
	width: number;
	alpha: number;
};

export type Jelly = {
	x: number; y: number; z: number;
	vx: number; vy: number; vz: number;
	dx: number; dy: number; dz: number;
	pulse: number; pulseSpeed: number;
	size: number; wander: number; seed: number;
	strands: Strand[];
};

export const JELLY = {
	thrust: 78,
	dragRelaxed: 1.6, // 1/s
	dragContracted: 0.5, // 1/s
	sink: 4, // u/s^2
	righting: 2.4,
	tentacleDrag: 0.08,
	tentacleGravity: 90, // u/s^2
	turn: 0.8,
	current: 16, // u/s
};

/** 0 = relaxed bell, 1 = fully contracted. */
export function bellC(pulse: number) {
	const s = Math.sin(pulse);
	return s > 0 ? s * s : 0;
}

/** Orthonormal frame around a unit heading. */
export function basis(dx: number, dy: number, dz: number) {
	let ax = 0, ay = 0, az = 1;
	if (Math.abs(dz) > 0.9) { ax = 0; ay = 1; az = 0; }
	let ux = dy * az - dz * ay;
	let uy = dz * ax - dx * az;
	let uz = dx * ay - dy * ax;
	const ul = Math.hypot(ux, uy, uz) || 1;
	ux /= ul; uy /= ul; uz /= ul;
	return {
		ux, uy, uz,
		vx: dy * uz - dz * uy,
		vy: dz * ux - dx * uz,
		vz: dx * uy - dy * ux,
	};
}

export function makeJelly(R: number): Jelly {
	const theta = Math.random() * Math.PI * 2;
	const phi = Math.acos(2 * Math.random() - 1);
	const r = R * 0.85 * Math.cbrt(Math.random());
	const dTheta = Math.random() * Math.PI * 2;
	const dPhi = Math.acos(2 * Math.random() - 1);
	const j: Jelly = {
		x: r * Math.sin(phi) * Math.cos(theta),
		y: r * Math.sin(phi) * Math.sin(theta),
		z: r * Math.cos(phi),
		vx: 0, vy: 0, vz: 0,
		dx: Math.sin(dPhi) * Math.cos(dTheta),
		dy: Math.sin(dPhi) * Math.sin(dTheta),
		dz: Math.cos(dPhi),
		pulse: Math.random() * Math.PI * 2,
		pulseSpeed: 1.0 + Math.random() * 0.7,
		size: 34 + Math.random() * 34,
		wander: Math.random() * 100,
		seed: Math.random() * Math.PI * 2,
		strands: [],
	};

	const mk = (angle: number, rim: number, count: number, seg: number, width: number, alpha: number) => {
		const pts: P3[] = [];
		const prev: P3[] = [];
		for (let k = 0; k < count; k++) {
			// hang straight back along -heading so the first frame is already settled
			const p = { x: j.x - j.dx * seg * k, y: j.y - j.dy * seg * k, z: j.z - j.dz * seg * k };
			pts.push(p);
			prev.push({ ...p });
		}
		j.strands.push({ pts, prev, angle, rim, seg, width, alpha });
	};
	for (let k = 0; k < 6; k++) mk((k / 6) * Math.PI * 2, 1, 8, j.size * 0.5, 1.6, 0.55);
	for (let k = 0; k < 4; k++) mk(((k + 0.5) / 4) * Math.PI * 2, 0.35, 5, j.size * 0.42, 3.2, 0.8);
	return j;
}

export function updateJelly(j: Jelly, dt: number, R: number) {
	// 1 near the bottom of the volume, 0 at the ceiling
	const lift = Math.min(1, Math.max(0, (j.y / R + 0.9) / 1.8));

	const c0 = bellC(j.pulse);
	j.pulse += j.pulseSpeed * dt * (0.3 + 0.7 * lift);
	const c = bellC(j.pulse);
	const dc = (c - c0) / dt;

	j.wander += dt;
	let tx = j.dx + Math.sin(j.wander * 0.31 + j.seed) * JELLY.turn * dt;
	let ty = j.dy + Math.sin(j.wander * 0.23 + j.seed * 2) * JELLY.turn * dt;
	let tz = j.dz + Math.sin(j.wander * 0.19 + j.seed * 3) * JELLY.turn * dt;
	const right = JELLY.righting * dt;
	tx += (0 - j.dx) * right;
	ty += (-1 - j.dy) * right; // up is -y
	tz += (0 - j.dz) * right;
	const dist = Math.hypot(j.x, j.y, j.z);
	if (dist > R) {
		const pull = ((dist - R) / R) * 2 * dt;
		tx -= (j.x / dist) * pull;
		tz -= (j.z / dist) * pull;
	}
	const tl = Math.hypot(tx, ty, tz) || 1;
	j.dx = tx / tl; j.dy = ty / tl; j.dz = tz / tl;

	// thrust on the contraction stroke only, then coast
	const thrust = Math.max(0, dc) * JELLY.thrust * lift * dt;
	j.vx += j.dx * thrust;
	j.vy += j.dy * thrust + JELLY.sink * dt;
	j.vz += j.dz * thrust;

	const k = JELLY.dragContracted + (JELLY.dragRelaxed - JELLY.dragContracted) * (1 - c);
	const damp = Math.exp(-k * dt);
	j.vx *= damp; j.vy *= damp; j.vz *= damp;

	const cur = dist > R ? JELLY.current * 0.2 : JELLY.current;
	const curX = Math.sin(j.wander * 0.13 + j.seed) * cur - (dist > R ? (j.x / dist) * cur : 0);
	const curZ = Math.cos(j.wander * 0.11 + j.seed * 1.7) * cur - (dist > R ? (j.z / dist) * cur : 0);
	const adX = curX * dt;
	const adZ = curZ * dt;
	j.x += j.vx * dt + adX;
	j.y += j.vy * dt;
	j.z += j.vz * dt + adZ;

	const b = basis(j.dx, j.dy, j.dz);
	const rimR = j.size * (1 - 0.38 * c);
	const gy = JELLY.tentacleGravity * dt * dt;
	const keep = 1 - JELLY.tentacleDrag;
	for (const st of j.strands) {
		const ca = Math.cos(st.angle);
		const sa = Math.sin(st.angle);
		const ar = rimR * st.rim;
		const p0 = st.pts[0];
		p0.x = j.x + (b.ux * ca + b.vx * sa) * ar;
		p0.y = j.y + (b.uy * ca + b.vy * sa) * ar;
		p0.z = j.z + (b.uz * ca + b.vz * sa) * ar;
		st.prev[0].x = p0.x; st.prev[0].y = p0.y; st.prev[0].z = p0.z;

		for (let i = 1; i < st.pts.length; i++) {
			const p = st.pts[i];
			const q = st.prev[i];
			// the current carries the tentacles too, so it is not a headwind
			p.x += adX; p.z += adZ;
			q.x += adX; q.z += adZ;
			const nx = p.x + (p.x - q.x) * keep;
			const ny = p.y + (p.y - q.y) * keep + gy;
			const nz = p.z + (p.z - q.z) * keep;
			q.x = p.x; q.y = p.y; q.z = p.z;
			p.x = nx; p.y = ny; p.z = nz;

			const a = st.pts[i - 1];
			let ex = p.x - a.x, ey = p.y - a.y, ez = p.z - a.z;
			let el = Math.hypot(ex, ey, ez);
			if (el < 1e-6) { ex = -j.dx; ey = -j.dy; ez = -j.dz; el = 1; }
			const s = st.seg / el;
			p.x = a.x + ex * s;
			p.y = a.y + ey * s;
			p.z = a.z + ez * s;
		}
	}
}

/** Convex hull, monotone chain. */
export function hull(pts: { x: number; y: number }[]) {
	const p = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y);
	const cr = (o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) =>
		(a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
	const lo: { x: number; y: number }[] = [];
	const up: { x: number; y: number }[] = [];
	for (const q of p) {
		while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
		lo.push(q);
	}
	for (let i = p.length - 1; i >= 0; i--) {
		const q = p[i];
		while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
		up.push(q);
	}
	lo.pop(); up.pop();
	return lo.concat(up);
}
