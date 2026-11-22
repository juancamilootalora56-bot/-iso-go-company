"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { cumplimientoFase, type FaseCronograma } from "@/lib/planesCalidad";

// Modelo 3D esquemático ("BIM 4D" simplificado): cada fase del Cronograma
// del Proyecto se representa como un nivel apilado, que se va "construyendo"
// (escala en altura + cambia de color) según su % de avance. No es un plano
// arquitectónico real — es una lectura visual del mismo cronograma que el
// cliente ya carga, sin pedirle ningún dato nuevo.

const ALTURA_NIVEL = 1.3;
const GAP = 0.18;
const ANCHO = 3.2;
const COLOR_AMBAR = new THREE.Color("#F59E0B");
const COLOR_TEAL = new THREE.Color("#14B8A6");

function colorPorPorcentaje(pct: number): THREE.Color {
  return COLOR_AMBAR.clone().lerp(COLOR_TEAL, Math.max(0, Math.min(100, pct)) / 100);
}

function crearEtiqueta(texto: string, pct: number): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(26,26,26,0.92)";
  ctx.roundRect(0, 0, 512, 128, 24);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 40px system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(texto, 24, 48);
  const color = colorPorPorcentaje(pct);
  ctx.fillStyle = `#${color.getHexString()}`;
  ctx.font = "bold 34px system-ui, sans-serif";
  ctx.fillText(`${Math.round(pct)}%`, 24, 94);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3.4, 0.85, 1);
  return sprite;
}

export default function Modelo3DObraTab({ fases }: { fases: FaseCronograma[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || fases.length === 0) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0D0D0D");

    const alturaTotal = fases.length * (ALTURA_NIVEL + GAP);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(7, alturaTotal * 0.75, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, alturaTotal / 2, 0);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.1;
    controls.minDistance = 4;
    controls.maxDistance = 30;
    controls.update();

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const luzDireccional = new THREE.DirectionalLight(0xffffff, 0.9);
    luzDireccional.position.set(6, 12, 8);
    scene.add(luzDireccional);

    // Piso de referencia
    const piso = new THREE.Mesh(
      new THREE.CircleGeometry(6, 48),
      new THREE.MeshStandardMaterial({ color: "#1A1A1A", roughness: 1 })
    );
    piso.rotation.x = -Math.PI / 2;
    piso.position.y = -0.02;
    scene.add(piso);
    const grilla = new THREE.GridHelper(12, 24, 0x2a2a2a, 0x222222);
    scene.add(grilla);

    fases.forEach((fase, i) => {
      const pct = cumplimientoFase(fase) ?? 0;
      const y0 = i * (ALTURA_NIVEL + GAP);
      const color = colorPorPorcentaje(pct);

      // Volumen objetivo (lo que falta construir): wireframe fantasma
      const contorno = new THREE.Mesh(
        new THREE.BoxGeometry(ANCHO, ALTURA_NIVEL, ANCHO),
        new THREE.MeshBasicMaterial({ color: "#ffffff", wireframe: true, transparent: true, opacity: 0.12 })
      );
      contorno.position.set(0, y0 + ALTURA_NIVEL / 2, 0);
      scene.add(contorno);

      // Volumen construido: escalado en altura según % de avance, apoyado
      // en la base del nivel (no en su centro).
      if (pct > 0) {
        const alturaConstruida = Math.max(0.03, (ALTURA_NIVEL * pct) / 100);
        const bloque = new THREE.Mesh(
          new THREE.BoxGeometry(ANCHO * 0.94, alturaConstruida, ANCHO * 0.94),
          new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.1 })
        );
        bloque.position.set(0, y0 + alturaConstruida / 2, 0);
        scene.add(bloque);

        const bordes = new THREE.LineSegments(
          new THREE.EdgesGeometry(bloque.geometry),
          new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.25 })
        );
        bordes.position.copy(bloque.position);
        scene.add(bordes);
      }

      const etiqueta = crearEtiqueta(fase.nombre || `Fase ${i + 1}`, pct);
      etiqueta.position.set(ANCHO * 0.9 + 1.3, y0 + ALTURA_NIVEL / 2, 0);
      scene.add(etiqueta);
    });

    let frame = 0;
    function animar() {
      frame = requestAnimationFrame(animar);
      controls.update();
      renderer.render(scene, camera);
    }
    animar();

    function onResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          const mat = obj.material;
          (Array.isArray(mat) ? mat : [mat]).forEach((m) => m.dispose());
        }
        if (obj instanceof THREE.Sprite) {
          obj.material.map?.dispose();
          obj.material.dispose();
        }
      });
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [fases]);

  if (fases.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">
        Cargá fases y actividades en &quot;Cronograma del Proyecto&quot; para ver el modelo 3D.
      </div>
    );
  }

  const pctGeneral = Math.round(
    fases.reduce((acc, f) => acc + (cumplimientoFase(f) ?? 0), 0) / fases.length
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-gray-500">
          Vista esquemática del avance de obra, generada a partir del Cronograma del Proyecto. Arrastrá para rotar.
        </p>
        <span className="text-xs font-bold text-[#14B8A6] bg-[#14B8A6]/10 px-2.5 py-1 rounded-full flex-shrink-0">
          Avance general: {pctGeneral}%
        </span>
      </div>
      <div
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden border border-gray-100"
        style={{ height: 480 }}
      />
      <div className="grid sm:grid-cols-2 gap-2">
        {fases.map((fase, i) => {
          const pct = cumplimientoFase(fase) ?? 0;
          return (
            <div key={fase.id} className="flex items-center gap-2.5 bg-white rounded-lg border border-gray-100 px-3 py-2">
              <span className="text-[11px] font-bold text-gray-300 w-5 flex-shrink-0">{i + 1}</span>
              <span className="text-xs font-semibold text-[#1A1A1A] flex-1 min-w-0 truncate">{fase.nombre}</span>
              <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: `#${colorPorPorcentaje(pct).getHexString()}` }}
                />
              </div>
              <span className="text-[11px] font-bold text-gray-500 w-9 text-right flex-shrink-0">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
