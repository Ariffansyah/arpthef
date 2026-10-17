<script lang="ts">
	/**
	 * Sidebar spider-person. Gwen crosses over in the light dimension, Miles in
	 * the dark one; toggling the theme punches the old one out and the new one
	 * in. Models live at `static/models/gwen.glb` / `static/models/miles.glb`;
	 * if one is missing the slot quietly stays empty.
	 *
	 * The game-rip PBR materials are reprinted as comic art on load: two-tone
	 * light, halftone dots where it falls into shadow, an ink line round the
	 * silhouette, and the page's cyan/magenta plates off-register behind it.
	 *
	 * They are alive on twos like the rest of the page: the idle clip loops, the
	 * head and neck turn to follow the cursor, and poking the frame (`poke()`)
	 * plays a trick — Gwen drops upside down off a web, Miles camouflages away
	 * into his own halftone dots.
	 */
	import type * as T from 'three';
	import type { GLTFLoader as GLTFLoaderT } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { base } from '$app/paths';
	import { theme, type Theme } from '$lib/theme';
	import { DIMENSIONS } from '$lib/dimensions';
	import { onMount } from 'svelte';

	/** Seconds in, held, and out. Stepped on twos; reduced motion snaps in and out. */
	type Trick = { rise: number; hold: number; fall: number };
	const TRICKS = {
		hang: { rise: 0.33, hold: 1.5, fall: 0.42 },
		camo: { rise: 0.33, hold: 1, fall: 0.25 }
	} satisfies Record<string, Trick>;

	/**
	 * The shipped .glb files are slimmed to a single clip (scripts/slim-model.mjs),
	 * so `clip` mostly documents intent — but it still picks correctly if a
	 * full-fat model is dropped in. Gwen's other game clips were tried and left
	 * out: their root motion carries her head out of a bust crop.
	 */
	type ModelConfig = {
		file: string;
		/** Clip to loop. */
		clip: string;
		/** Where in the clip it starts, 0–1 of its duration; the crop is measured on this pose. */
		poseAt: number;
		/** Share of the model's height kept in frame. 1 = full body, ~0.5 = bust. */
		bust: number;
		/** Where the head sits vertically, 0 = top of frame, 1 = bottom. */
		headAt: number;
		/** Fine nudge, in framed heights: + moves the model up, − moves it down. */
		lift: number;
		/** What a poke does. */
		trick: keyof typeof TRICKS;
	};

	const MODELS: Record<Theme, ModelConfig> = {
		light: {
			file: 'gwen',
			clip: 'idle',
			poseAt: 0,
			bust: 0.22,
			headAt: 0.52,
			lift: 0,
			trick: 'hang'
		},
		dark: {
			file: 'miles',
			clip: 'idle',
			poseAt: 0,
			bust: 0.22,
			headAt: 0.52,
			lift: 0,
			trick: 'camo'
		}
	};

	const TWOS = 1000 / 12;

	const FIT_HEIGHT = 2.2;

	/** Ink line width and halftone cell size, in CSS px. */
	const INK_PX = 2.5;
	const DOT_PX = 4;
	/** Same ink as Background3D's INK. */
	const INK = 0x0e0a1a;

	// Plain arrays/numbers so they can exist before three is imported.
	const uRes = { value: [1, 1] };
	const uDot = { value: DOT_PX };
	const uCamo = { value: 0 };

	/**
	 * Prepended to both fragment shaders. `dotDist` is the distance to the
	 * nearest halftone dot centre, in cells, on a 45° screen. Camouflage keeps
	 * only the dots and shrinks them: 0 = whole, 1 = gone.
	 */
	const DOTS = /* glsl */ `
		uniform float uDot;
		uniform float uCamo;
		float dotDist() {
			vec2 cell = mat2(0.7071, 0.7071, -0.7071, 0.7071) * gl_FragCoord.xy / uDot;
			return length(fract(cell) - 0.5);
		}
		void main() {
			if (dotDist() > (1.0 - uCamo) * 0.75) discard;
	`;

	/** Shadow in the dots, colour where lit; tested against the material's own albedo. */
	const HALFTONE = /* glsl */ `
		float lit = dot(outgoingLight, vec3(0.299, 0.587, 0.114)) /
			max(dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)), 1e-3);
		float d = dotDist();
		float r = clamp(0.9 - lit, 0.0, 0.6) * 0.75;
		outgoingLight *= 1.0 - 0.5 * (1.0 - smoothstep(r - fwidth(d), r, d));
	`;

	/**
	 * Back faces pushed out a fixed number of screen pixels along the normal,
	 * and nudged back in depth so double-sided shells (Gwen's hood) don't
	 * z-fight with their own ink.
	 */
	const INK_PUSH = /* glsl */ `
		#ifdef USE_SKINNING
			vec2 inkDir = transformedNormal.xy;
		#else
			vec2 inkDir = (normalMatrix * normal).xy;
		#endif
		gl_Position.xy += normalize(inkDir + 1e-6) * ${(INK_PX * 2).toFixed(1)} / uRes * gl_Position.w;
		gl_Position.z += 0.0004 * gl_Position.w;
	`;

	let host: HTMLDivElement;
	let ready = $state(false);

	// three is ~600 kB; keep it out of the main bundle and off phones entirely.
	let THREE: typeof import('three');
	let GLTFLoader: typeof GLTFLoaderT;

	let renderer: T.WebGLRenderer | null = null;
	let scene: T.Scene;
	let camera: T.PerspectiveCamera;
	let pivot: T.Group;
	let key: T.DirectionalLight;
	let rimA: T.DirectionalLight;
	let rimB: T.DirectionalLight;
	let hemi: T.HemisphereLight;
	let steps: T.DataTexture;
	let ink: T.MeshBasicMaterial;

	/**
	 * Each model is loaded once and kept — flipping the theme only toggles
	 * `visible`. Re-loading on every flip re-decoded megabytes of PNG into fresh
	 * GPU textures each time, and the old ones were never released.
	 */
	type Loaded = {
		root: T.Object3D;
		mixer: T.AnimationMixer | null;
		/** Neck then head, each taking its share of the look; `pose` is the clip's own rotation. */
		turners: { bone: T.Object3D; share: number; pose: T.Quaternion }[];
		trick: Trick;
		sfx: string;
	};
	const loaded = new Map<Theme, Loaded>();
	let current: Loaded | null = null;

	let swapT = 0; // 0 → 1 pop-in after a dimension change
	let loadToken = 0;

	/** Where the cursor is from the head (`aim`) and where the head has got to (`look`), radians. */
	let aimYaw = 0;
	let aimPitch = 0;
	let lookYaw = 0;
	let lookPitch = 0;

	let pokeAt = -Infinity;
	let sfx = $state('');
	let sfxTimer: ReturnType<typeof setTimeout> | undefined;

	let raf = 0;
	let prefersReduced = false;

	function disposeTree(obj: T.Object3D) {
		obj.traverse((n) => {
			const m = n as T.Mesh;
			m.geometry?.dispose();
			const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
			for (const mat of mats) {
				// Materials hold their textures as plain properties (map, normalMap, …)
				// and `mat.dispose()` does not touch them.
				for (const v of Object.values(mat)) {
					if ((v as T.Texture | null)?.isTexture) (v as T.Texture).dispose();
				}
				mat.dispose();
			}
		});
	}

	/** The configured clip if the model has it, else fall back to something restful. */
	function pickClip(clips: T.AnimationClip[], want: string) {
		const by = (re: RegExp) => clips.find((c) => re.test(c.name));
		return (
			clips.find((c) => c.name.toLowerCase().includes(want.toLowerCase())) ??
			by(/idle/i) ??
			by(/wait|stand|breath/i) ??
			clips[0] ??
			null
		);
	}

	function halftone(shader: T.WebGLProgramParametersWithUniforms) {
		Object.assign(shader.uniforms, { uDot, uCamo });
		shader.fragmentShader = shader.fragmentShader
			.replace('void main() {', DOTS)
			.replace('#include <opaque_fragment>', HALFTONE + '#include <opaque_fragment>');
	}

	function inkLine(shader: T.WebGLProgramParametersWithUniforms) {
		Object.assign(shader.uniforms, { uRes, uDot, uCamo });
		shader.vertexShader = shader.vertexShader
			.replace('void main() {', 'uniform vec2 uRes;\nvoid main() {')
			.replace('#include <project_vertex>', '#include <project_vertex>' + INK_PUSH);
		shader.fragmentShader = shader.fragmentShader.replace('void main() {', DOTS);
	}

	/** Turn a bone in world (camera) space about its own joint: local' = P⁻¹·D·P·local. */
	function turn(bone: T.Object3D, yaw: number, pitch: number) {
		const p = bone.parent!.getWorldQuaternion(new THREE.Quaternion());
		const d = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
		bone.quaternion.premultiply(p.clone().invert().multiply(d).multiply(p));
	}

	/** 0 → 1 → 0 across a trick, `u` seconds after the poke. */
	function envelope(u: number, k: Trick) {
		const end = k.rise + k.hold + k.fall;
		if (u < 0 || u >= end) return 0;
		if (prefersReduced) return 1;
		const q = Math.floor((u * 1000) / TWOS) * (TWOS / 1000);
		return Math.min(1, q / k.rise, (end - q) / k.fall);
	}

	export function poke() {
		const now = performance.now();
		if (!current || !renderer || envelope((now - pokeAt) / 1000, current.trick) > 0) return;
		pokeAt = now;
		if (current.sfx) {
			sfx = current.sfx;
			clearTimeout(sfxTimer);
			sfxTimer = setTimeout(() => (sfx = ''), 750);
		}
		// Reduced motion has no running loop; run one just for the trick.
		if (prefersReduced) raf = requestAnimationFrame(frame);
	}

	function comicify(root: T.Object3D) {
		const meshes: T.Mesh[] = [];
		root.traverse((n) => void ((n as T.Mesh).isMesh && meshes.push(n as T.Mesh)));

		for (const mesh of meshes) {
			const old = mesh.material as T.MeshStandardMaterial;
			const mat = new THREE.MeshToonMaterial({
				name: old.name,
				map: old.map,
				color: old.color,
				emissive: old.emissive,
				emissiveMap: old.emissiveMap,
				emissiveIntensity: old.emissiveIntensity,
				transparent: old.transparent,
				opacity: old.opacity,
				alphaTest: old.alphaTest,
				depthWrite: old.depthWrite,
				side: old.side,
				// Vertex colours are dropped on purpose: the rips use them as bake
				// masks, and Miles' are black on the head.
				gradientMap: steps
			});
			mat.onBeforeCompile = halftone;
			mesh.material = mat;
			old.dispose();

			// Alpha cards (hair strands, web) would outline their quads, and the
			// hidden alternate heads would draw as ink ghosts.
			if (mat.transparent || mat.alphaTest > 0) continue;
			const skinned = mesh as T.SkinnedMesh;
			let line: T.Mesh;
			if (skinned.isSkinnedMesh) {
				const s = new THREE.SkinnedMesh(mesh.geometry, ink);
				s.bind(skinned.skeleton, skinned.bindMatrix);
				line = s;
			} else {
				line = new THREE.Mesh(mesh.geometry, ink);
			}
			line.frustumCulled = mesh.frustumCulled;
			mesh.add(line);
		}
	}

	async function swap(t: Theme) {
		const token = ++loadToken;
		let entry = loaded.get(t);

		if (!entry) {
			let gltf;
			try {
				gltf = await new GLTFLoader().loadAsync(`${base}/models/${MODELS[t].file}.glb`);
			} catch {
				// No model shipped for this dimension — leave the slot empty.
				return;
			}
			if (token !== loadToken || !renderer) {
				disposeTree(gltf.scene);
				return;
			}

			const root = gltf.scene;
			const cfg = MODELS[t];

			// Posing first matters: the crop below measures the posed silhouette.
			let mixer: T.AnimationMixer | null = null;
			const clip = pickClip(gltf.animations, cfg.clip);
			if (clip) {
				mixer = new THREE.AnimationMixer(root);
				mixer.clipAction(clip).play();
				mixer.setTime(clip.duration * cfg.poseAt);
			}
			// Measure from a clean transform so the numbers below are in root-local
			// units, then apply scale and offset once.
			root.position.set(0, 0, 0);
			root.scale.setScalar(1);
			root.updateMatrixWorld(true);

			const box = new THREE.Box3().setFromObject(root);
			const size = new THREE.Vector3();
			const center = new THREE.Vector3();
			box.getSize(size);
			box.getCenter(center);

			// Anchor on the head bone where the rig has one: in a posed figure the
			// top of the bounding box is often a raised hand, which would crop the
			// portrait to the wrong place. `headroom` leaves space above the skull.
			const head = new THREE.Vector3();
			let headY = -Infinity;
			let headBone = null as T.Object3D | null;
			root.traverse((n) => {
				if ((n as T.Bone).isBone && /head/i.test(n.name)) {
					n.getWorldPosition(head);
					headY = Math.max(headY, head.y);
					// The look turns the head on its neck; end bones like "HeadNub" don't skin anything.
					if (/neck/i.test(n.parent?.name ?? '')) headBone = n;
				}
			});
			const hasHead = headY > -Infinity;
			const anchorY = hasHead ? headY : box.max.y;
			const headroom = hasHead ? cfg.headAt : 0.02;

			// Show the top `bust` slice of the model, hung from the frame's top edge.
			const shown = Math.max(size.y * cfg.bust, 1e-6);
			const scale = size.y > 0 ? FIT_HEIGHT / shown : 1;
			root.scale.setScalar(scale);
			root.position.set(
				-center.x * scale,
				FIT_HEIGHT * (0.5 - headroom) - anchorY * scale + FIT_HEIGHT * cfg.lift,
				-center.z * scale
			);

			comicify(root);
			const turners = headBone
				? [
						{ bone: headBone.parent!, share: 0.4, pose: headBone.parent!.quaternion.clone() },
						{ bone: headBone, share: 0.6, pose: headBone.quaternion.clone() }
					]
				: [];
			entry = {
				root,
				mixer,
				turners,
				trick: TRICKS[cfg.trick],
				sfx: cfg.trick === 'hang' ? 'THWIP!' : ''
			};
			loaded.set(t, entry);
			pivot.add(root);
		}

		if (token !== loadToken || !renderer) return;

		for (const [k, v] of loaded) v.root.visible = k === t;
		current = entry;
		pokeAt = -Infinity;
		uCamo.value = 0;
		pivot.rotation.z = 0;
		sfx = '';

		const D = DIMENSIONS[t];
		key.color.setHex(D.key);
		rimA.color.setHex(D.plateA);
		rimB.color.setHex(D.plateB);
		hemi.color.setHex(D.sky);
		hemi.groundColor.setHex(D.ground);

		swapT = 0;
		if (prefersReduced) {
			swapT = 1;
			render();
		}
	}

	function resize() {
		if (!renderer) return;
		const w = host.clientWidth;
		const h = host.clientHeight;
		if (!w || !h) return;
		renderer.setSize(w, h, false);
		uRes.value = [w, h];
		uDot.value = DOT_PX * renderer.getPixelRatio();
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		if (prefersReduced) render();
	}

	function render() {
		renderer?.render(scene, camera);
	}

	let starting = false;

	async function start() {
		if (renderer || starting) return;
		starting = true;
		try {
			if (!THREE) {
				THREE = await import('three');
				({ GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js'));
			}
		} finally {
			starting = false;
		}
		// Bail if we were torn down (or already started) while the chunk loaded.
		if (!host || renderer) return;

		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
		camera.position.set(0, 0, 4.4);

		pivot = new THREE.Group();
		scene.add(pivot);

		// Colours are set per dimension in swap(); positions never change.
		hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.1);
		scene.add(hemi);

		key = new THREE.DirectionalLight(0xffffff, 2.2);
		// Raking from the side so the terminator cuts across the face.
		key.position.set(4, 2.5, 2);
		scene.add(key);

		// Behind and to the side: stepped, each lays a flat plate-coloured band on its edge.
		rimA = new THREE.DirectionalLight(0xffffff, 3);
		rimA.position.set(-3, 1, -3);
		scene.add(rimA);

		rimB = new THREE.DirectionalLight(0xffffff, 3);
		rimB.position.set(3, -0.5, -3);
		scene.add(rimB);

		// Two tones, hard terminator. Toon gradients must be sampled nearest.
		steps = new THREE.DataTexture(new Uint8Array([40, 255]), 2, 1, THREE.RedFormat);
		steps.minFilter = steps.magFilter = THREE.NearestFilter;
		steps.needsUpdate = true;

		ink = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
		ink.onBeforeCompile = inkLine;

		try {
			renderer = new THREE.WebGLRenderer({
				alpha: true,
				antialias: true,
				powerPreference: 'low-power'
			});
		} catch {
			renderer = null;
			return;
		}
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		// No tone mapping: ACES greys the flat inks.
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.setClearAlpha(0);
		host.appendChild(renderer.domElement);
		renderer.domElement.style.width = '100%';
		renderer.domElement.style.height = '100%';

		resize();
		ready = true;

		if (!prefersReduced) raf = requestAnimationFrame(frame);
	}

	function stop() {
		ready = false;
		cancelAnimationFrame(raf);
		loadToken++;

		for (const { root, mixer } of loaded.values()) {
			mixer?.stopAllAction();
			mixer?.uncacheRoot(root);
			pivot?.remove(root);
			disposeTree(root);
		}
		loaded.clear();
		current = null;
		steps?.dispose();
		ink?.dispose();

		renderer?.domElement.remove();
		renderer?.dispose();
		// dispose() frees the objects but leaves the GL context alive; without
		// this every HMR reload strands another one until the browser tab dies.
		renderer?.forceContextLoss();
		renderer = null;
	}

	let lastTick = -1;

	function frame(now: number) {
		const u = (now - pokeAt) / 1000;
		const tricking = !!current && u < current.trick.rise + current.trick.hold + current.trick.fall;
		if (!prefersReduced || tricking) raf = requestAnimationFrame(frame);

		if (document.hidden || !renderer) return;

		// Everything moves on twos (83 ms), like the rest of the page.
		const tick = Math.floor(now / TWOS);
		if (current && !prefersReduced && tick !== lastTick) {
			const dt = lastTick < 0 ? 0 : Math.min(0.25, ((tick - lastTick) * TWOS) / 1000);
			lastTick = tick;

			swapT = Math.min(1, swapT + dt * 2.2);
			// Overshoot on the way in, so the crossover reads as a pop.
			const pop = 1 - Math.pow(1 - swapT, 3);
			pivot.scale.setScalar(pop + Math.sin(swapT * Math.PI) * 0.12);

			lookYaw += (aimYaw - lookYaw) * 0.35;
			lookPitch += (aimPitch - lookPitch) * 0.35;
			pivot.rotation.y = (1 - pop) * Math.PI * 1.5 + lookYaw * 0.4 + Math.sin(now * 0.0004) * 0.12;
			pivot.rotation.x = lookPitch * 0.3;
			pivot.position.y = Math.sin(now * 0.0011) * 0.06;

			// The clip rewrites head and neck each update; put its pose back first
			// so a clip without those tracks can't accumulate the look.
			for (const t of current.turners) t.bone.quaternion.copy(t.pose);
			current.mixer?.update(dt);
			for (const t of current.turners) {
				t.pose.copy(t.bone.quaternion);
				turn(t.bone, lookYaw * t.share, lookPitch * t.share);
			}
		}

		// Applied every frame so the last frame of a trick always lands back at rest.
		if (current) {
			const e = envelope(u, current.trick);
			if (current.trick === TRICKS.hang) {
				// Flip to hang upside down off a web, swinging a little on the line.
				const swing = prefersReduced ? 0 : Math.sin(tick * 0.35) * 0.1;
				pivot.rotation.z =
					(1 - Math.pow(1 - e, 3) + Math.sin(e * Math.PI) * 0.15 + swing * e) * Math.PI;
			} else {
				uCamo.value = e;
			}
		}

		render();
	}

	function onMouse(e: MouseEvent) {
		// Aim from the head (upper middle of the frame); tanh keeps a far cursor
		// from wrenching the neck round.
		const r = host.getBoundingClientRect();
		aimYaw = 0.7 * Math.tanh((e.clientX - r.left - r.width / 2) / 600);
		aimPitch = 0.4 * Math.tanh((e.clientY - r.top - r.height * 0.45) / 400);
	}

	onMount(() => {
		prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// The sidebar is hidden below `md`; don't spin up WebGL or fetch a model there.
		const mq = window.matchMedia('(min-width: 768px)');
		const sync = () => void (mq.matches ? start() : stop());
		sync();
		mq.addEventListener('change', sync);

		const ro = new ResizeObserver(resize);
		ro.observe(host);
		window.addEventListener('mousemove', onMouse);

		return () => {
			mq.removeEventListener('change', sync);
			ro.disconnect();
			window.removeEventListener('mousemove', onMouse);
			clearTimeout(sfxTimer);
			stop();
		};
	});

	$effect(() => {
		const t = $theme;
		if (ready) swap(t);
	});
</script>

<div class="pointer-events-none relative h-full w-full" aria-hidden="true">
	<div bind:this={host} class="off-register h-full w-full"></div>
	{#if sfx}
		<span class="sfx font-display judul-komik">{sfx}</span>
	{/if}
</div>

<style>
	/* Plates peek out left and right of the silhouette; glitch frames push them wider. */
	.off-register {
		filter: drop-shadow(calc(-1.5px - var(--ca-box)) 0 0 var(--plate-a))
			drop-shadow(calc(1.5px + var(--ca-box)) 0 0 var(--plate-b));
	}

	.sfx {
		position: absolute;
		top: 7%;
		left: 7%;
		font-size: 2.5rem;
		line-height: 1;
		rotate: -14deg;
		animation: sfx-pop 250ms steps(1) both;
	}
	@keyframes sfx-pop {
		0% {
			scale: 0.4;
		}
		33% {
			scale: 1.3;
		}
		66% {
			scale: 0.95;
		}
		100% {
			scale: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.sfx {
			animation: none;
		}
	}
</style>
