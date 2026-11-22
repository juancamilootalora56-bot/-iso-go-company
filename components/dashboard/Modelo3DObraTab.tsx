"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { cumplimientoFase, type FaseCronograma } from "@/lib/planesCalidad";
import { ChevronDown, ChevronRight, User, Calendar } from "lucide-react";

// Modelo 3D esquemático ("BIM 4D" simplificado): cada fase del Cronograma
// del Proyecto se representa como un nivel apilado, que se va "construyendo"
// (escala en altura + cambia de color) según su % de avance. No es un plano
// arquitectónico real — es una lectura visual del mismo cronograma que el
// cliente ya carga, sin pedirle ningún dato nuevo. Se puede hacer clic en
// cualquier nivel (en el 3D o en la lista) para ver el detalle real de sus
// actividades (ej: si "Ascensor" ya está incluido y en qué % va).

const ALTURA_NIVEL = 1.3;
const GAP = 0.18;
const ANCHO = 3.2;
const COLOR_AMBAR = new THREE.Color("#F59E0B");
const COLOR_TEAL = new THREE.Color("#14B8A6");
const COLOR_SELECCION = "#F5A623";

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
  const contornosRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const bloquesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const [faseSeleccionada, setFaseSeleccionada] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || fases.length === 0) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0D0D0D");

    const alturaTotal = fases.length * (ALTURA_NIVEL + GAP);
    // Distancia de cámara proporcional a la altura de la torre, para que
    // edificios con muchos niveles (ej. 20+) entren completos en cuadro.
    const distanciaCamara = Math.max(9, alturaTotal * 0.85);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.set(distanciaCamara * 0.75, alturaTotal * 0.62, distanciaCamara);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.cursor = "grab";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, alturaTotal / 2, 0);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.1;
    controls.minDistance = 4;
    controls.maxDistance = Math.max(40, alturaTotal * 2);
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

    contornosRef.current = new Map();
    bloquesRef.current = new Map();
    const pickables: THREE.Mesh[] = [];

    fases.forEach((fase, i) => {
      const pct = cumplimientoFase(fase) ?? 0;
      const y0 = i * (ALTURA_NIVEL + GAP);
      const color = colorPorPorcentaje(pct);

      // Volumen objetivo (lo que falta construir): wireframe fantasma —
      // siempre presente, es lo que se hace clic para seleccionar la fase
      // aunque todavía no tenga nada construido.
      const contorno = new THREE.Mesh(
        new THREE.BoxGeometry(ANCHO, ALTURA_NIVEL, ANCHO),
        new THREE.MeshBasicMaterial({ color: "#ffffff", wireframe: true, transparent: true, opacity: 0.12 })
      );
      contorno.position.set(0, y0 + ALTURA_NIVEL / 2, 0);
      contorno.userData.faseId = fase.id;
      scene.add(contorno);
      contornosRef.current.set(fase.id, contorno);
      pickables.push(contorno);

      // Volumen construido: escalado en altura según % de avance, apoyado
      // en la base del nivel (no en su centro).
      if (pct > 0) {
        const alturaConstruida = Math.max(0.03, (ALTURA_NIVEL * pct) / 100);
        const bloque = new THREE.Mesh(
          new THREE.BoxGeometry(ANCHO * 0.94, alturaConstruida, ANCHO * 0.94),
          new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.1 })
        );
        bloque.position.set(0, y0 + alturaConstruida / 2, 0);
        bloque.userData.faseId = fase.id;
        scene.add(bloque);
        bloquesRef.current.set(fase.id, bloque);
        pickables.push(bloque);

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

    // Clic sobre un nivel (bloque construido o solo el contorno fantasma)
    // selecciona esa fase y despliega su detalle de actividades abajo.
    const raycaster = new THREE.Raycaster();
    const puntero = new THREE.Vector2();
    let bajadaX = 0;
    let bajadaY = 0;

    function onPointerDown(e: PointerEvent) {
      bajadaX = e.clientX;
      bajadaY = e.clientY;
    }

    function onPointerUp(e: PointerEvent) {
      // Si hubo arrastre (rotar la cámara), no cuenta como clic de selección.
      if (Math.hypot(e.clientX - bajadaX, e.clientY - bajadaY) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      puntero.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      puntero.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(puntero, camera);
      const hits = raycaster.intersectObjects(pickables, false);
      if (hits.length > 0) {
        const id = hits[0].object.userData.faseId as string;
        setFaseSeleccionada((prev) => (prev === id ? null : id));
      }
    }
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

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
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fases]);

  // Resaltar en el 3D la fase elegida (sin reconstruir toda la escena).
  useEffect(() => {
    contornosRef.current.forEach((contorno, id) => {
      const mat = contorno.material as THREE.MeshBasicMaterial;
      const activa = id === faseSeleccionada;
      mat.color.set(activa ? COLOR_SELECCION : "#ffffff");
      mat.opacity = activa ? 0.55 : 0.12;
    });
    bloquesRef.current.forEach((bloque, id) => {
      const mat = bloque.material as THREE.MeshStandardMaterial;
      const activa = id === faseSeleccionada;
      mat.emissive.set(activa ? COLOR_SELECCION : 0x000000);
      mat.emissiveIntensity = activa ? 0.45 : 0;
    });
  }, [faseSeleccionada]);

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
          Vista esquemática del avance de obra, generada a partir del Cronograma del Proyecto. Arrastrá para rotar,
          hacé clic en un nivel para ver sus actividades.
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
      <div className="space-y-2">
        {fases.map((fase, i) => {
          const pct = cumplimientoFase(fase) ?? 0;
          const seleccionada = fase.id === faseSeleccionada;
          return (
            <div
              key={fase.id}
              className={`bg-white rounded-lg border transition-colors ${
                seleccionada ? "border-[#F5A623]" : "border-gray-100"
              }`}
            >
              <button
                type="button"
                onClick={() => setFaseSeleccionada((prev) => (prev === fase.id ? null : fase.id))}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left"
              >
                {seleccionada ? (
                  <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                )}
                <span className="text-[11px] font-bold text-gray-300 w-5 flex-shrink-0">{i + 1}</span>
                <span className="text-xs font-semibold text-[#1A1A1A] flex-1 min-w-0 truncate">{fase.nombre}</span>
                <span className="text-[11px] text-gray-400 flex-shrink-0">
                  {fase.actividades.length} activ.
                </span>
                <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: `#${colorPorPorcentaje(pct).getHexString()}` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-gray-500 w-9 text-right flex-shrink-0">{pct}%</span>
              </button>

              {seleccionada && (
                <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-gray-50">
                  {fase.actividades.length === 0 ? (
                    <p className="text-xs text-gray-400 py-1.5">Todavía no cargaste actividades para esta fase.</p>
                  ) : (
                    fase.actividades.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between gap-3 bg-[#FAFAFA] rounded-lg px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#1A1A1A] truncate">
                            {a.actividad || "(sin nombre)"}
                          </p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-2.5 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <User size={11} /> {a.responsable || "Sin responsable"}
                            </span>
                            {a.fechaInicio && (
                              <span className="flex items-center gap-1">
                                <Calendar size={11} /> {a.fechaInicio} → {a.fechaEntrega || "?"}
                              </span>
                            )}
                          </p>
                        </div>
                        <span
                          className="text-xs font-bold flex-shrink-0"
                          style={{ color: `#${colorPorPorcentaje(a.porcentajeCompletado).getHexString()}` }}
                        >
                          {a.porcentajeCompletado}%
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
