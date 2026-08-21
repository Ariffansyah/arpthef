<script lang="ts">
	/**
	 * Sidebar spider-person. Gwen crosses over in the light dimension, Miles in
	 * the dark one; toggling the theme punches the old one out and the new one
	 * in. Models live at `static/models/gwen.glb` / `static/models/miles.glb`;
	 * if one is missing the slot quietly stays empty.
	 */
	import type * as T from 'three';
	import type { GLTFLoader as GLTFLoaderT } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { base } from '$app/paths';
	import { theme, type Theme } from '$lib/theme';
	import { DIMENSIONS } from '$lib/dimensions';
	import { onMount } from 'svelte';

	/**
	 * The shipped .glb files are slimmed to a single clip (scripts/slim-model.mjs),
	 * so `clip` mostly documents intent — but it still picks correctly if a
	 * full-fat model is dropped in. Nothing here animates: the clip is only a
	 * source of poses, and one frame of it is held.
	 */
	type ModelConfig = {
		file: string;
		/** Clip to pose from — held on one frame, never played. */
		clip: string;
		/** Where in the clip the held pose is taken from, 0–1 of its duration. */
		poseAt: number;
		/** Share of the model's height kept in frame. 1 = full body, ~0.5 = bust. */
		bust: number;
		/** Where the head sits vertically, 0 = top of frame, 1 = bottom. */
		headAt: number;
		/** Fine nudge, in framed heights: + moves the model up, − moves it down. */
		lift: number;
	};

	const MODELS: Record<Theme, ModelConfig> = {
		light: { file: 'gwen', clip: 'idle', poseAt: 0, bust: 0.22, headAt: 0.52, lift: 0 },
		dark: { file: 'miles', clip: 'idle', poseAt: 0, bust: 0.22, headAt: 0.52, lift: 0 }
	};

	const FIT_HEIGHT = 2.2;

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

	/**
	 * Each model is loaded once and kept — flipping the theme only toggles
	 * `visible`. Re-loading on every flip re-decoded megabytes of PNG into fresh
	 * GPU textures each time, and the old ones were never released.
	 */
	type Loaded = { root: T.Object3D; mixer: T.AnimationMixer | null };
	const loaded = new Map<Theme, Loaded>();
	let current: Loaded | null = null;

	let swapT = 0; // 0 → 1 pop-in after a dimension change
	let loadToken = 0;

	let mouseX = 0;
	let mouseY = 0;
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

			// Hold a single frame of the clip — the model is a portrait, not a loop.
			// Posing first matters: the crop below measures the posed silhouette.
			let mixer: T.AnimationMixer | null = null;
			const clip = pickClip(gltf.animations, cfg.clip);
			if (clip) {
				mixer = new THREE.AnimationMixer(root);
				mixer.clipAction(clip).play();
				mixer.setTime(clip.duration * cfg.poseAt);
				mixer.timeScale = 0;
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
			root.traverse((n) => {
				if ((n as T.Bone).isBone && /head/i.test(n.name)) {
					n.getWorldPosition(head);
					headY = Math.max(headY, head.y);
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

			entry = { root, mixer };
			loaded.set(t, entry);
			pivot.add(root);
		}

		if (token !== loadToken || !renderer) return;

		for (const [k, v] of loaded) v.root.visible = k === t;
		current = entry;

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
		key.position.set(2, 3, 4);
		scene.add(key);

		rimA = new THREE.DirectionalLight(0xffffff, 3);
		rimA.position.set(-3, 1.5, -2);
		scene.add(rimA);

		rimB = new THREE.DirectionalLight(0xffffff, 3);
		rimB.position.set(3, -0.5, -2.5);
		scene.add(rimB);

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
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
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

		renderer?.domElement.remove();
		renderer?.dispose();
		// dispose() frees the objects but leaves the GL context alive; without
		// this every HMR reload strands another one until the browser tab dies.
		renderer?.forceContextLoss();
		renderer = null;
	}

	let last = 0;

	function frame(now: number) {
		raf = requestAnimationFrame(frame);
		const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
		last = now;

		if (document.hidden || !renderer) return;

		if (current) {
			swapT = Math.min(1, swapT + dt * 2.2);
			// Overshoot on the way in, so the crossover reads as a pop.
			const pop = swapT >= 1 ? 1 : 1 - Math.pow(1 - swapT, 3);
			const overshoot = Math.sin(swapT * Math.PI) * 0.12;
			pivot.scale.setScalar(pop + overshoot);
			pivot.rotation.y = (1 - pop) * Math.PI * 1.5 + mouseX * 0.55 + Math.sin(now * 0.0004) * 0.12;
			pivot.rotation.x = mouseY * -0.18;
			pivot.position.y = Math.sin(now * 0.0011) * 0.06;
		}

		render();
	}

	function onMouse(e: MouseEvent) {
		mouseX = e.clientX / window.innerWidth - 0.5;
		mouseY = e.clientY / window.innerHeight - 0.5;
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
			stop();
		};
	});

	$effect(() => {
		const t = $theme;
		if (ready) swap(t);
	});
</script>

<div bind:this={host} class="pointer-events-none h-full w-full" aria-hidden="true"></div>
