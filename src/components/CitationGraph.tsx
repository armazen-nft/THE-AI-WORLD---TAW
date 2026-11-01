import React, { useState } from 'react';
import { Paper } from '../types/academic';
import { Network, ZoomIn, ZoomOut, RotateCcw, Share2 } from 'lucide-react';

interface CitationGraphProps {
  papers: Paper[];
  selectedPaperId?: string;
  onSelectPaper: (paper: Paper) => void;
}

export const CitationGraph: React.FC<CitationGraphProps> = ({
  papers,
  selectedPaperId,
  onSelectPaper,
}) => {
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Layout node positions in a dynamic 2D graph space
  const total = papers.length;
  const cx = 350;
  const cy = 250;
  const radius = 170;

  const nodePositions = papers.map((paper, idx) => {
    // If selected paper, place in center, otherwise distribute in circle
    const angle = (idx / total) * 2 * Math.PI;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return {
      paper,
      x: Math.round(x),
      y: Math.round(y),
    };
  });

  const activePaper = papers.find((p) => p.id === (hoveredNode || selectedPaperId));

  // Determine field color
  const getFieldColor = (field: string) => {
    if (field.includes('Inteligência')) return '#6366f1';
    if (field.includes('DeSci') || field.includes('Aberta')) return '#06b6d4';
    if (field.includes('Biotecnologia')) return '#10b981';
    if (field.includes('Quântica') || field.includes('Física')) return '#8b5cf6';
    if (field.includes('Energia')) return '#f59e0b';
    return '#38bdf8';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Graph Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">Grafo Semântico & Rede de Citações</h3>
          <span className="text-xs text-slate-400 hidden sm:inline">
            ({papers.length} nós indexados · conexões bidirecionais)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 1.8))}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Resetar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-88 overflow-hidden bg-slate-950 flex items-center justify-center">
        <svg
          viewBox="0 0 700 500"
          className="w-full h-full cursor-crosshair select-none transition-transform duration-200 ease-out"
          style={{ transform: `scale(${zoom})` }}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" />
            </marker>
          </defs>

          {/* Citation links between nodes */}
          {nodePositions.map((sourceNode) => {
            return sourceNode.paper.citations.map((citedId) => {
              const targetNode = nodePositions.find((n) => n.paper.id === citedId);
              if (!targetNode) return null;

              const isHighlighted =
                hoveredNode === sourceNode.paper.id ||
                hoveredNode === targetNode.paper.id ||
                selectedPaperId === sourceNode.paper.id ||
                selectedPaperId === targetNode.paper.id;

              return (
                <line
                  key={`${sourceNode.paper.id}-${targetNode.paper.id}`}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={isHighlighted ? '#818cf8' : '#334155'}
                  strokeWidth={isHighlighted ? 2.5 : 1.2}
                  strokeDasharray={isHighlighted ? 'none' : '4 3'}
                  markerEnd={isHighlighted ? 'url(#arrow-active)' : 'url(#arrow)'}
                  opacity={isHighlighted ? 0.95 : 0.45}
                  className="transition-all duration-300"
                />
              );
            });
          })}

          {/* Paper Nodes */}
          {nodePositions.map(({ paper, x, y }) => {
            const isSelected = selectedPaperId === paper.id;
            const isHovered = hoveredNode === paper.id;
            const color = getFieldColor(paper.field);
            const radiusSize = Math.min(24, Math.max(14, Math.round(paper.citationsCount / 14)));

            return (
              <g
                key={paper.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer group"
                onClick={() => onSelectPaper(paper)}
                onMouseEnter={() => setHoveredNode(paper.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Outer ripple when selected or hovered */}
                {(isSelected || isHovered) && (
                  <circle
                    r={radiusSize + 8}
                    fill={color}
                    opacity="0.25"
                    className="animate-pulse"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={radiusSize}
                  fill={color}
                  stroke={isSelected ? '#ffffff' : '#0f172a'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="transition-all duration-200 group-hover:scale-110"
                />

                {/* Node ID / Abbreviation */}
                <text
                  dy="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={radiusSize > 16 ? '10' : '8'}
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {paper.id.replace('dsp-', 'P')}
                </text>

                {/* Mini Label */}
                <text
                  y={radiusSize + 12}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  className="transition-colors group-hover:fill-slate-100 font-sans"
                >
                  {paper.authors[0].split(' ').pop()} ({paper.year})
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Active Paper Info overlay */}
        {activePaper && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-lg shadow-xl text-left pointer-events-none transition-all">
            <div className="text-xs font-semibold text-slate-100 line-clamp-1">
              {activePaper.title}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
              <span>{activePaper.authors[0]} et al.</span>
              <span>·</span>
              <span>{activePaper.year}</span>
              <span>·</span>
              <span className="text-indigo-400 font-medium">{activePaper.citationsCount} citações</span>
              <span>·</span>
              <span className="text-cyan-400">{activePaper.field}</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-950/80 text-[11px] text-slate-400 border-t border-slate-800/80">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> IA & Dados
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> DeSci / IPFS
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Biotecnologia
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Quântica
          </span>
        </div>
        <div className="text-slate-500 hidden md:inline">
          Dica: nós maiores representam maior contagem de citações
        </div>
      </div>
    </div>
  );
};
