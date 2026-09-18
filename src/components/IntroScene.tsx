"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ARCH_FRAME } from "@/lib/arch";

const SESSION_KEY = "mathwa-intro-seen";
const GROW_DURATION = 1100; // ms — l'arche grandit avec un léger rebond
const HOLD_DURATION = 1500; // ms — elle tourne doucement avant de s'effacer
const FADE_DURATION = 700; // ms — fondu de sortie vers le site

type Phase = "idle" | "playing" | "leaving" | "done";

/**
 * Intro plein écran jouée une seule fois par session : l'arche du logo,
 * extrudée depuis son tracé SVG réel, tourne doucement puis s'efface.
 *
 * Poids gardé volontairement bas :
 * - Three.js n'est importé qu'au moment où l'intro doit vraiment jouer
 *   (dynamic import), jamais dans le bundle initial.
 * - Un seul maillage, ~4300 triangles, pas d'ombres, pas de post-processing.
 * - Le halo est un simple sprite en dégradé, pas un bloom shader.
 * - devicePixelRatio plafonné à 2.
 * - Tout est détruit (géométrie, matériau, renderer) dès que l'intro se termine.
 */
export default function IntroScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  // Décision prise une seule fois : déjà vue cette session, ou préférence
  // système "moins d'animations" -> on saute l'intro sans jamais l'afficher.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // Stockage indisponible (navigation privée stricte, etc.) :
      // on ne bloque jamais l'affichage du site pour si peu.
      seen = true;
    }

    if (seen || reducedMotion) {
      setPhase("done");
      return;
    }

    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // rien à faire si l'écriture échoue, l'intro rejouera simplement plus souvent
    }
    setPhase("playing");
  }, []);

  const finish = useCallback(() => {
    setPhase((p) => (p === "playing" ? "leaving" : p));
  }, []);

  // Bascule finale une fois le fondu CSS terminé : démonte tout.
  useEffect(() => {
    if (phase !== "leaving") return;
    const t = setTimeout(() => setPhase("done"), FADE_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  // Échap permet de passer l'intro à tout moment.
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, finish]);

  // La scène Three.js vit tant qu'on est en "playing" ou "leaving" :
  // elle continue de tourner pendant le fondu, et n'est détruite qu'à la fin.
  useEffect(() => {
    if (phase === "idle" || phase === "done") return;
    if (phase !== "playing") return; // ne (re)crée la scène qu'à l'entrée dans "playing"

    const container = mountRef.current;
    if (!container) return;
    const mountEl = container; // liaison non-nullable, stable dans les fermetures ci-dessous

    let disposed = false;
    let raf = 0;
    let cleanup = () => {};
    const autoFinishTimer = setTimeout(finish, GROW_DURATION + HOLD_DURATION);

    (async () => {
      const THREE = await import("three");
      const { SVGLoader } = await import("three/examples/jsm/loaders/SVGLoader.js");
      if (disposed) return;

      const scene = new THREE.Scene(); // pas de fond : le dégradé CSS derrière le canvas fait office de décor
      const camera = new THREE.PerspectiveCamera(
        38,
        mountEl.clientWidth / mountEl.clientHeight,
        0.1,
        100,
      );
      camera.position.set(0, 0, 22);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
      mountEl.appendChild(renderer.domElement);

      // L'arche du logo, extrudée depuis le tracé SVG exact (même source que le reste du site).
      const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="${ARCH_FRAME}"/></svg>`;
      const shapes = new SVGLoader().parse(svgMarkup).paths.flatMap((p) => p.toShapes());

      const geometry = new THREE.ExtrudeGeometry(shapes, {
        depth: 60,
        bevelEnabled: true,
        bevelThickness: 6,
        bevelSize: 4,
        bevelSegments: 2,
        curveSegments: 6, // ~4300 triangles au total : volontairement léger
      });
      geometry.center();
      geometry.scale(0.01, -0.01, 0.01); // ramène à une échelle de scène raisonnable, et corrige l'axe Y (SVG descend, Three.js monte)
      geometry.computeVertexNormals();

      const material = new THREE.MeshPhysicalMaterial({
        color: 0xc9a362,
        metalness: 0.65,
        roughness: 0.32,
        clearcoat: 0.35,
        clearcoatRoughness: 0.25,
        side: THREE.DoubleSide, // le mirroring de l'axe Y inverse le sens des faces : on affiche les deux côtés
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.setScalar(0.001);
      scene.add(mesh);

      // Lumière chaude en clé, vert de la marque en contre-jour discret. Pas d'ombres : inutile ici, et coûteux.
      scene.add(new THREE.AmbientLight(0x3a2f22, 0.6));

      const key = new THREE.DirectionalLight(0xf4efe3, 2.2);
      key.position.set(4, 6, 8);
      scene.add(key);

      const rim = new THREE.DirectionalLight(0x1c5c48, 1.3);
      rim.position.set(-6, -2, -4);
      scene.add(rim);

      // Halo doré derrière l'arche : un sprite en dégradé, pas un vrai bloom (bien plus léger).
      const glowCanvas = document.createElement("canvas");
      glowCanvas.width = glowCanvas.height = 256;
      const ctx = glowCanvas.getContext("2d");
      let glowTexture: InstanceType<typeof THREE.CanvasTexture> | null = null;
      let glow: InstanceType<typeof THREE.Sprite> | null = null;
      if (ctx) {
        const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        grad.addColorStop(0, "rgba(201,163,98,0.55)");
        grad.addColorStop(1, "rgba(201,163,98,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
        glowTexture = new THREE.CanvasTexture(glowCanvas);
        glow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: glowTexture,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        );
        glow.scale.set(20, 20, 1);
        glow.position.z = -3;
        scene.add(glow);
      }

      const start = performance.now();

      function easeOutBack(t: number) {
        const c1 = 1.4;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      }
      function easeOutCubic(t: number) {
        return 1 - Math.pow(1 - t, 3);
      }

      function animate(now: number) {
        if (disposed) return;
        const elapsed = now - start;
        const growT = Math.min(1, elapsed / GROW_DURATION);

        mesh.scale.setScalar(Math.max(0.001, easeOutBack(growT)));
        mesh.rotation.y = elapsed * 0.00035 + (1 - easeOutCubic(growT)) * -1.1;
        mesh.position.y = Math.sin(elapsed * 0.0012) * 0.15;

        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      }
      raf = requestAnimationFrame(animate);

      function onResize() {
        camera.aspect = mountEl.clientWidth / mountEl.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
      }
      window.addEventListener("resize", onResize);

      cleanup = () => {
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(raf);
        geometry.dispose();
        material.dispose();
        glowTexture?.dispose();
        glow?.material.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mountEl) {
          mountEl.removeChild(renderer.domElement);
        }
      };
    })();

    return () => {
      disposed = true;
      clearTimeout(autoFinishTimer);
      cleanup();
    };
  }, [phase, finish]);

  if (phase === "idle" || phase === "done") return null;

  return (
    <div
      role="dialog"
      aria-label="Mathwa"
      onClick={finish}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#0d5a48] via-[#0a4a3c] to-[#052e25] transition-opacity ease-out ${
        phase === "leaving" ? "opacity-0 duration-700" : "opacity-100 duration-300"
      }`}
    >
      <div ref={mountRef} className="h-full w-full" aria-hidden="true" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
        className="absolute bottom-6 end-6 text-xs tracking-wide text-sand/50 underline underline-offset-4 transition-colors hover:text-sand/90"
      >
        Passer l&apos;intro
      </button>
    </div>
  );
}
