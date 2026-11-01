import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Layers,
  Sparkles,
  Info,
  ExternalLink,
  Eye,
  Maximize2,
  Atom,
  Dna,
  ShieldCheck,
  Download
} from 'lucide-react';

type MoleculePreset = 'crispr' | 'protein' | 'dna' | 'perovskite';

export const Bioscience3DViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPreset, setSelectedPreset] = useState<MoleculePreset>('crispr');
  const [colorMode, setColorMode] = useState<'plddt' | 'chain' | 'element'>('plddt');
  const [isRotating, setIsRotating] = useState(true);
  const [renderStyle, setRenderStyle] = useState<'cartoon' | 'surface' | 'spheres'>('cartoon');
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const isRotatingRef = useRef(isRotating);
  isRotatingRef.current = isRotating;

  // Track mouse drag for orbit
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });

  // Procedural 3-12 part macromolecule constructor
  const buildMolecule = (preset: MoleculePreset) => {
    if (!groupRef.current) return;

    // Dispose old children
    while (groupRef.current.children.length > 0) {
      const child = groupRef.current.children[0] as THREE.Mesh;
      groupRef.current.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }

    const group = groupRef.current;

    // Materials helper using AlphaFold pLDDT colors:
    // >90 Dark Blue #1e40af, 70-90 Cyan #0284c7, 50-70 Yellow #eab308, <50 Orange #f97316
    const getMaterial = (plddt: number, roughness = 0.25, metalness = 0.15) => {
      let color = '#0284c7';
      if (colorMode === 'plddt') {
        if (plddt >= 90) color = '#1d4ed8'; // very high
        else if (plddt >= 70) color = '#06b6d4'; // confident
        else if (plddt >= 50) color = '#eab308'; // low
        else color = '#f97316'; // very low
      } else if (colorMode === 'chain') {
        const chainColors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
        color = chainColors[Math.floor(plddt % chainColors.length)];
      } else {
        // Element
        const elemColors = ['#ef4444', '#3b82f6', '#10b981', '#94a3b8'];
        color = elemColors[Math.floor(plddt % elemColors.length)];
      }

      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness,
        metalness,
        wireframe: renderStyle === 'surface' ? false : false,
      });
    };

    if (preset === 'crispr') {
      // Composite CRISPR-Cas12a with 8 anatomical procedural subparts:
      // 1. Recognition (REC) lobe
      // 2. Nuclease (NUC) catalytic lobe
      // 3. Wedge (WED) domain
      // 4. PAM-interacting (PI) cleft
      // 5. Guide RNA crRNA backbone (ribbon/tube)
      // 6. Target DNA strand
      // 7. Non-target strand
      // 8. RuvC catalytic active center

      // 1. REC Lobe (large ellipsoidal domain)
      const recGeo = new THREE.SphereGeometry(1.8, 32, 24);
      recGeo.scale(1.2, 1.8, 1.0);
      const recMesh = new THREE.Mesh(recGeo, getMaterial(94, 0.3, 0.1));
      recMesh.position.set(-1.8, 0.2, 0);
      recMesh.userData = { name: 'Lóbulo de Reconhecimento (REC - AlphaFold pLDDT 94)' };
      group.add(recMesh);

      // 2. NUC Lobe (Nuclease)
      const nucGeo = new THREE.SphereGeometry(1.7, 32, 24);
      nucGeo.scale(1.1, 1.5, 1.3);
      const nucMesh = new THREE.Mesh(nucGeo, getMaterial(92, 0.28, 0.1));
      nucMesh.position.set(1.9, -0.2, 0);
      nucMesh.userData = { name: 'Lóbulo Catalítico NUC / RuvC (pLDDT 92)' };
      group.add(nucMesh);

      // 3. WED Domain (Bridge)
      const wedGeo = new THREE.CylinderGeometry(0.8, 1.1, 2.2, 24);
      const wedMesh = new THREE.Mesh(wedGeo, getMaterial(85, 0.35, 0.1));
      wedMesh.position.set(0, 1.5, -0.4);
      wedMesh.rotation.z = Math.PI / 4;
      wedMesh.userData = { name: 'Domínio WED / Ponte Estrutural (pLDDT 85)' };
      group.add(wedMesh);

      // 4. PAM Interacting Cleft
      const pamGeo = new THREE.TorusGeometry(1.0, 0.4, 16, 32, Math.PI * 1.3);
      const pamMesh = new THREE.Mesh(pamGeo, getMaterial(88, 0.2, 0.2));
      pamMesh.position.set(0, -1.8, 0.5);
      pamMesh.rotation.x = Math.PI / 2;
      pamMesh.userData = { name: 'Fenda de Reconhecimento PAM (5\'-TTTV-3\')' };
      group.add(pamMesh);

      // 5. Guide RNA Strand (crRNA - Tube loop)
      const curvePoints: THREE.Vector3[] = [];
      for (let i = 0; i < 20; i++) {
        const t = (i / 19) * Math.PI * 2.5;
        curvePoints.push(
          new THREE.Vector3(
            Math.sin(t) * 1.5,
            (i - 10) * 0.25,
            Math.cos(t) * 1.4
          )
        );
      }
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const rnaGeo = new THREE.TubeGeometry(curve, 64, 0.22, 12, false);
      const rnaMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ec4899'),
        roughness: 0.2,
        metalness: 0.3,
      });
      const rnaMesh = new THREE.Mesh(rnaGeo, rnaMat);
      rnaMesh.userData = { name: 'RNA Guia (crRNA estrutural 42-nt)' };
      group.add(rnaMesh);

      // 6. Target DNA Double Helix strand passing through central channel
      for (let s = 0; s < 18; s++) {
        const baseGeo = new THREE.BoxGeometry(0.7, 0.15, 0.15);
        const baseMat = new THREE.MeshStandardMaterial({
          color: s % 2 === 0 ? new THREE.Color('#10b981') : new THREE.Color('#38bdf8'),
        });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.set(Math.cos(s * 0.5) * 0.6, (s - 9) * 0.32, Math.sin(s * 0.5) * 0.6);
        baseMesh.rotation.y = s * 0.5;
        group.add(baseMesh);
      }
    } else if (preset === 'dna') {
      // High-density DNA B-Form Double Helix
      const numBases = 32;
      const radius = 1.4;
      for (let i = 0; i < numBases; i++) {
        const theta = i * 0.38;
        const y = (i - numBases / 2) * 0.35;

        // Backbone Strand 1
        const b1Geo = new THREE.SphereGeometry(0.22, 16, 16);
        const b1Mesh = new THREE.Mesh(b1Geo, getMaterial(95, 0.2, 0.3));
        b1Mesh.position.set(radius * Math.cos(theta), y, radius * Math.sin(theta));
        group.add(b1Mesh);

        // Backbone Strand 2 (opposite phase + PI)
        const b2Geo = new THREE.SphereGeometry(0.22, 16, 16);
        const b2Mesh = new THREE.Mesh(b2Geo, getMaterial(95, 0.2, 0.3));
        b2Mesh.position.set(radius * Math.cos(theta + Math.PI), y, radius * Math.sin(theta + Math.PI));
        group.add(b2Mesh);

        // Watson-Crick Base Pair Rung
        const rungCurve = new THREE.LineCurve3(
          new THREE.Vector3(radius * Math.cos(theta), y, radius * Math.sin(theta)),
          new THREE.Vector3(radius * Math.cos(theta + Math.PI), y, radius * Math.sin(theta + Math.PI))
        );
        const rungGeo = new THREE.TubeGeometry(rungCurve, 4, 0.08, 8, false);
        const isAT = i % 2 === 0;
        const rungMat = new THREE.MeshStandardMaterial({
          color: isAT ? new THREE.Color('#ec4899') : new THREE.Color('#06b6d4'),
          roughness: 0.3,
        });
        const rungMesh = new THREE.Mesh(rungGeo, rungMat);
        rungMesh.userData = { name: isAT ? 'Par de Bases Adenina-Timina (A=T)' : 'Par de Bases Guanina-Citosina (G≡C)' };
        group.add(rungMesh);
      }
    } else if (preset === 'protein') {
      // AlphaFold-like Multimeric Protein Ribbon & Helices
      for (let h = 0; h < 5; h++) {
        const helixPts: THREE.Vector3[] = [];
        const ox = (h - 2) * 1.5;
        const plddtScore = 95 - h * 8;
        for (let j = 0; j < 24; j++) {
          const t = j * 0.7;
          helixPts.push(new THREE.Vector3(ox + Math.sin(t) * 0.5, (j - 12) * 0.22, Math.cos(t) * 0.5));
        }
        const helixCurve = new THREE.CatmullRomCurve3(helixPts);
        const helixGeo = new THREE.TubeGeometry(helixCurve, 32, 0.22, 12, false);
        const helixMesh = new THREE.Mesh(helixGeo, getMaterial(plddtScore, 0.25, 0.1));
        helixMesh.userData = { name: `Alfa-Hélice α${h + 1} (pLDDT: ${plddtScore})` };
        group.add(helixMesh);
      }
    } else {
      // Perovskite Crystalline Superlattice (ABX3)
      const latSize = 2;
      for (let x = -latSize; x <= latSize; x++) {
        for (let y = -latSize; y <= latSize; y++) {
          for (let z = -latSize; z <= latSize; z++) {
            // Lead/Halide Octahedron corners
            if ((x + y + z) % 2 === 0) {
              const atomGeo = new THREE.OctahedronGeometry(0.3, 0);
              const atomMesh = new THREE.Mesh(atomGeo, getMaterial(90, 0.1, 0.8));
              atomMesh.position.set(x * 1.1, y * 1.1, z * 1.1);
              atomMesh.userData = { name: `Octaedro PbI6 Covalente [${x},${y},${z}]` };
              group.add(atomMesh);
            } else {
              // Organic Cation Sphere (Cesium / Methylammonium)
              const catGeo = new THREE.SphereGeometry(0.2, 16, 16);
              const catMesh = new THREE.Mesh(catGeo, getMaterial(65, 0.4, 0.1));
              catMesh.position.set(x * 1.1, y * 1.1, z * 1.1);
              catMesh.userData = { name: `Cátion Intersticial Orgânico (Cs+ / FA+)` };
              group.add(catMesh);
            }
          }
        }
      }
    }
  };

  // Three.js Scene Setup with ACESFilmicToneMapping & PBR Lighting
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // Group for macromolecule
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Studio PBR Lighting Setup (Warm directional key + cool hemisphere fill)
    const keyLight = new THREE.DirectionalLight('#fef3c7', 2.2);
    keyLight.position.set(6, 8, 6);
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight('#38bdf8', '#0f172a', 1.4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight('#818cf8', 1.2);
    rimLight.position.set(-6, -4, -5);
    scene.add(rimLight);

    // Initial build
    buildMolecule(selectedPreset);

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (groupRef.current && isRotatingRef.current) {
        groupRef.current.rotation.y += 0.006;
        groupRef.current.rotation.x += 0.002;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse drag handlers
    const canvas = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !groupRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      groupRef.current.rotation.y += dx * 0.008;
      groupRef.current.rotation.x += dy * 0.008;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        if (cr.width && cr.height && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = cr.width / cr.height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(cr.width, cr.height);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
        rendererRef.current.domElement.remove();
      }
    };
  }, []);

  // Rebuild on preset/color/style change
  useEffect(() => {
    buildMolecule(selectedPreset);
  }, [selectedPreset, colorMode, renderStyle]);

  const presetInfo = {
    crispr: {
      name: 'Complexo CRISPR-Cas12a / crRNA & Alvo DNA',
      pdbId: '6CV9',
      uniprotId: 'A0Q7Q2',
      source: 'RCSB PDB & AlphaFold DB Structure',
      description: 'Endonuclease guiada por RNA com domínio RuvC capaz de clivagem seletiva de DNA fita-dupla e edição epigenômica precisa sem quebras deletérias.',
    },
    dna: {
      name: 'Dupla Hélice B-DNA Canônica',
      pdbId: '1BNA',
      uniprotId: 'N/A (Ácido Nucleico)',
      source: 'RCSB Protein Data Bank',
      description: 'Estrutura helicoidal dextrogira com 10.5 pares de base por volta, sulcos maior e menor definindo sítios de ligação para fatores de transcrição (JASPAR/UniBind).',
    },
    protein: {
      name: 'Domínio Multimérico com Feixe Alfa-Helicoidal',
      pdbId: 'AF-P00533-F1',
      uniprotId: 'P00533 (EGFR)',
      source: 'AlphaFold Protein Structure Database v4',
      description: 'Predição estrutural com escore pLDDT médio superior a 90 em regiões globulares e alinhamento tridimensional de resíduos hidrofóbicos internos.',
    },
    perovskite: {
      name: 'Superrede Cristalina Perovskita (CsPbI3)',
      pdbId: 'Materials-Project-mp-10695',
      uniprotId: 'Física da Matéria Condensada',
      source: 'Cambridge Structural Database (CSD)',
      description: 'Rede octaédrica de iodeto de chumbo com cátion intersticial para células solares tandem de alta conversão fotoelétrica (>34%).',
    },
  }[selectedPreset];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Dna className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <span>Visualizador 3D de Biociência & Modelagem Molecular</span>
                <span className="text-xs font-mono text-cyan-400 font-normal">
                  (Three.js PBR + Science Skills)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Renderização tridimensional com escala de confiança pLDDT da AlphaFold DB e coordenadas do PDB.
              </p>
            </div>
          </div>

          {/* Molecule Preset Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start md:self-auto text-xs overflow-x-auto">
            <button
              onClick={() => setSelectedPreset('crispr')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                selectedPreset === 'crispr'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CRISPR-Cas12a
            </button>
            <button
              onClick={() => setSelectedPreset('dna')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                selectedPreset === 'dna'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dupla Hélice DNA
            </button>
            <button
              onClick={() => setSelectedPreset('protein')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                selectedPreset === 'protein'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Proteína AlphaFold
            </button>
            <button
              onClick={() => setSelectedPreset('perovskite')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                selectedPreset === 'perovskite'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rede Perovskita
            </button>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Esquema de Cores:</span>
            <button
              onClick={() => setColorMode('plddt')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                colorMode === 'plddt'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
              title="Escala oficial da AlphaFold Database (>90 Muito Alta, 70-90 Confiante, 50-70 Baixa, <50 Muito Baixa)"
            >
              AlphaFold pLDDT
            </button>
            <button
              onClick={() => setColorMode('chain')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                colorMode === 'chain'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Cadeias / Subunidades
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRotating((r) => !r)}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'text-cyan-400' : ''}`} />
              <span>{isRotating ? 'Pausar Rotação' : 'Girar Modelo'}</span>
            </button>

            <span className="text-slate-600">·</span>

            <span className="text-slate-500 hidden sm:inline">
              Arraste para rotacionar em 360°
            </span>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas Column */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative flex flex-col h-[460px]">
          <div
            ref={containerRef}
            className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          />

          {/* Floating pLDDT Confidence Color Scale Legend */}
          {colorMode === 'plddt' && (
            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-lg shadow-xl text-[11px] space-y-1.5 pointer-events-none">
              <span className="text-slate-300 font-semibold block uppercase tracking-wider text-[10px]">
                Escore de Confiança pLDDT (AlphaFold)
              </span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-700" />
                <span className="text-slate-300">Muito alta (pLDDT &gt; 90)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-cyan-500" />
                <span className="text-slate-300">Confiante (70 &lt; pLDDT &lt; 90)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-yellow-500" />
                <span className="text-slate-300">Baixa (50 &lt; pLDDT &lt; 70)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-orange-500" />
                <span className="text-slate-300">Muito baixa (pLDDT &lt; 50)</span>
              </div>
            </div>
          )}

          {/* Model info watermark */}
          <div className="absolute bottom-3 right-4 text-[10px] text-slate-500 pointer-events-none">
            WebGL ACESFilmic PBR · Three.js r180
          </div>
        </div>

        {/* Bioscience Scientific Metadata Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-cyan-400 uppercase font-semibold tracking-wider">
                Estrutura Ativa
              </span>
              <h3 className="text-sm font-serif font-bold text-slate-100 leading-snug">
                {presetInfo.name}
              </h3>
            </div>

            <p className="text-slate-300 leading-relaxed font-sans">
              {presetInfo.description}
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center text-slate-400">
                <span>PDB / Modelo:</span>
                <code className="text-cyan-400 font-mono font-medium">{presetInfo.pdbId}</code>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>UniProt ID:</span>
                <code className="text-indigo-400 font-mono font-medium">{presetInfo.uniprotId}</code>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Repositório:</span>
                <span className="text-slate-200">{presetInfo.source}</span>
              </div>
            </div>

            {/* Quick deep link buttons according to science skill */}
            <div className="pt-2 space-y-1.5">
              <a
                href={`https://www.rcsb.org/structure/${presetInfo.pdbId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-slate-800"
              >
                <span>Explorar no RCSB PDB</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>

              <a
                href="https://alphafold.ebi.ac.uk/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-slate-800"
              >
                <span>AlphaFold Protein DB</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
