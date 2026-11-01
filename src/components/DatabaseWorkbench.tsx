import React, { useState } from 'react';
import { Paper } from '../types/academic';
import {
  Database,
  Terminal,
  Play,
  RotateCcw,
  Download,
  Share2,
  Table,
  Cpu,
  Layers,
  Sparkles,
  Check
} from 'lucide-react';
import { cosineSimilarity } from '../services/vectorSearch';

interface DatabaseWorkbenchProps {
  papers: Paper[];
  onSelectPaper: (paper: Paper) => void;
}

export const DatabaseWorkbench: React.FC<DatabaseWorkbenchProps> = ({
  papers,
  onSelectPaper,
}) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'vector' | 'schema'>('sql');

  // SQL Workbench state
  const defaultQuery = `SELECT 
  id, 
  title, 
  field, 
  year, 
  citationsCount, 
  reproducibilityScore 
FROM papers 
WHERE reproducibilityScore >= 90 
ORDER BY citationsCount DESC;`;

  const [sqlQuery, setSqlQuery] = useState(defaultQuery);
  const [queryResults, setQueryResults] = useState<any[]>(() => {
    return papers
      .filter((p) => p.reproducibilityScore >= 90)
      .sort((a, b) => b.citationsCount - a.citationsCount)
      .map((p) => ({
        id: p.id,
        title: p.title,
        field: p.field,
        year: p.year,
        citationsCount: p.citationsCount,
        reproducibilityScore: `${p.reproducibilityScore}%`,
      }));
  });
  const [queryExecutionTime, setQueryExecutionTime] = useState<number>(0.84);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Execute client-side SQL simulation
  const handleExecuteSql = () => {
    const t0 = performance.now();
    setErrorMessage(null);

    try {
      const q = sqlQuery.trim().toLowerCase();

      if (!q.startsWith('select')) {
        setErrorMessage('Apenas consultas analíticas de leitura (SELECT) são permitidas no console DuckDB.');
        return;
      }

      let res = [...papers];

      // Filter by WHERE clauses
      if (q.includes('where')) {
        if (q.includes('openaccess = true') || q.includes('openaccess')) {
          res = res.filter((p) => p.openAccess);
        }
        if (q.includes('reproducibilityscore >= 90')) {
          res = res.filter((p) => p.reproducibilityScore >= 90);
        }
        if (q.includes('reproducibilityscore > 92')) {
          res = res.filter((p) => p.reproducibilityScore > 92);
        }
        if (q.includes('year > 2024') || q.includes('year >= 2025')) {
          res = res.filter((p) => p.year >= 2025);
        }
        if (q.includes('ai') || q.includes('inteligência')) {
          res = res.filter((p) => p.field.toLowerCase().includes('inteligência'));
        }
      }

      // Group by field check
      if (q.includes('group by field')) {
        const groupMap: Record<string, { count: number; totalCitations: number }> = {};
        papers.forEach((p) => {
          if (!groupMap[p.field]) {
            groupMap[p.field] = { count: 0, totalCitations: 0 };
          }
          groupMap[p.field].count++;
          groupMap[p.field].totalCitations += p.citationsCount;
        });

        const grouped = Object.entries(groupMap).map(([field, data]) => ({
          field,
          paper_count: data.count,
          avg_citations: Math.round(data.totalCitations / data.count),
          total_citations: data.totalCitations,
        }));

        setQueryResults(grouped);
        setQueryExecutionTime(+(performance.now() - t0).toFixed(2));
        return;
      }

      // Order by
      if (q.includes('order by citationscount desc')) {
        res.sort((a, b) => b.citationsCount - a.citationsCount);
      } else if (q.includes('order by year desc')) {
        res.sort((a, b) => b.year - a.year);
      }

      // Format output table
      const formatted = res.map((p) => ({
        id: p.id,
        title: p.title,
        field: p.field,
        year: p.year,
        citationsCount: p.citationsCount,
        reproducibilityScore: `${p.reproducibilityScore}%`,
      }));

      setQueryResults(formatted);
      setQueryExecutionTime(+(performance.now() - t0).toFixed(2));
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao processar consulta SQL.');
    }
  };

  // Vector store 2D projection scatter points (PCA simulation from 5D vectors)
  // X = vec[0]*0.8 - vec[1]*0.6 + vec[4]*0.4
  // Y = vec[2]*0.9 + vec[3]*0.7 - vec[0]*0.3
  const vectorPoints = papers.map((paper) => {
    const v = paper.embeddingVector;
    const rawX = v[0] * 180 - v[1] * 120 + v[4] * 90;
    const rawY = v[2] * 170 + v[3] * 110 - v[0] * 70;
    return {
      paper,
      x: Math.round(rawX + 220),
      y: Math.round(rawY + 120),
    };
  });

  return (
    <div className="space-y-6">
      {/* Workbench Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                Banco de Dados & Motor Vetorial (DuckDB / SQLite / Parquet)
              </h2>
              <p className="text-xs text-slate-400">
                Camada analítica local em memória (OLAP) e armazenamento vetorial com similaridade de cosseno.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start sm:self-auto text-xs">
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sql'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console SQL DuckDB</span>
            </button>
            <button
              onClick={() => setActiveTab('vector')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'vector'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Espaço Vetorial 2D</span>
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'schema'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Esquema & Nuvem</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'sql' && (
        <div className="space-y-4">
          {/* Query Editor Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-mono">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>duckdb://datasphere_academic_local.db</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">
                  Tempo: {queryExecutionTime}ms
                </span>
                <button
                  onClick={handleExecuteSql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-xs transition cursor-pointer shadow-xs"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Executar SQL</span>
                </button>
              </div>
            </div>

            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={5}
              className="w-full bg-slate-950 p-4 text-xs font-mono text-emerald-300 focus:outline-hidden leading-relaxed resize-y selection:bg-indigo-600/50"
              spellCheck={false}
            />

            {/* Preset Query Chips */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-slate-950/70 border-t border-slate-800/80 text-xs text-slate-400">
              <span className="text-[11px] text-slate-500 font-medium">Exemplos:</span>
              <button
                onClick={() => {
                  setSqlQuery(defaultQuery);
                  setTimeout(handleExecuteSql, 50);
                }}
                className="hover:text-indigo-300 underline cursor-pointer"
              >
                Top Reprodutibilidade
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  setSqlQuery(`SELECT field, COUNT(*) AS total, AVG(citationsCount) AS media_citacoes FROM papers GROUP BY field;`);
                  setTimeout(handleExecuteSql, 50);
                }}
                className="hover:text-indigo-300 underline cursor-pointer"
              >
                Agrupamento por Área (GROUP BY)
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  setSqlQuery(`SELECT id, title, doi, citationsCount FROM papers WHERE openAccess = true ORDER BY citationsCount DESC;`);
                  setTimeout(handleExecuteSql, 50);
                }}
                className="hover:text-indigo-300 underline cursor-pointer"
              >
                Apenas Open Access Mais Citados
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Results Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-slate-100">
                  Resultados da Consulta ({queryResults.length} linhas retornadas)
                </h3>
              </div>

              <button
                onClick={() => {
                  const jsonStr = JSON.stringify(queryResults, null, 2);
                  const blob = new Blob([jsonStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'datasphere_export.json';
                  a.click();
                }}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar JSON</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              {queryResults.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Nenhum registro retornado.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      {Object.keys(queryResults[0] || {}).map((col) => (
                        <th key={col} className="px-4 py-2.5 font-medium">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {queryResults.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        {Object.entries(row).map(([key, val]: [string, any]) => (
                          <td
                            key={key}
                            className={`px-4 py-2.5 ${
                              key === 'title'
                                ? 'font-serif font-medium text-slate-100 max-w-sm truncate'
                                : key === 'id'
                                ? 'font-mono text-cyan-400'
                                : key === 'citationsCount'
                                ? 'font-semibold text-indigo-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vector' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Projeção Dimensional do Banco Vetorial (Latent Space 2D)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualização topológica dos artigos indexados no espaço de similaridade semântica.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>Dimensão: <strong className="text-cyan-400 font-mono">5D / 768D Quantized</strong></span>
                <span>·</span>
                <span>Métrica: <strong className="text-indigo-400">Cosine Distance</strong></span>
              </div>
            </div>

            {/* Scatter Map */}
            <div className="relative w-full h-80 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 500 350" className="w-full h-full select-none">
                {/* Background Grid */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="500" height="350" fill="url(#grid)" />

                {/* Vector Points */}
                {vectorPoints.map(({ paper, x, y }) => (
                  <g
                    key={paper.id}
                    transform={`translate(${x % 440 + 30}, ${y % 290 + 30})`}
                    className="cursor-pointer group"
                    onClick={() => onSelectPaper(paper)}
                  >
                    <circle
                      r="9"
                      fill="#6366f1"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="group-hover:scale-125 transition-transform"
                    />
                    <text
                      y="-12"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      className="group-hover:fill-slate-100 font-sans"
                    >
                      {paper.id} · {paper.field.slice(0, 15)}
                    </text>
                  </g>
                ))}
              </svg>

              <div className="absolute bottom-3 left-3 text-[11px] text-slate-500 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
                Projeção t-SNE / PCA sobre o espaço vetorial de busca semântica
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              Esquema Relacional & Migração para Nuvem (PostgreSQL / Supabase / SQLite)
            </h3>
            <span className="text-xs text-slate-400">DDL SQL Standard</span>
          </div>

          <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto select-all leading-relaxed">
{`-- DataSphere Academic DDL Schema
CREATE TABLE IF NOT EXISTS papers (
  id VARCHAR(64) PRIMARY KEY,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  field VARCHAR(128) NOT NULL,
  year INT NOT NULL,
  doi VARCHAR(128) UNIQUE,
  citations_count INT DEFAULT 0,
  open_access BOOLEAN DEFAULT TRUE,
  ipfs_cid VARCHAR(128) NOT NULL,
  embedding_vector VECTOR(5), -- pgvector extension supported
  reproducibility_score INT DEFAULT 85,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS citations (
  id SERIAL PRIMARY KEY,
  source_paper_id VARCHAR(64) REFERENCES papers(id),
  target_paper_id VARCHAR(64) REFERENCES papers(id),
  citation_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_papers_field ON papers(field);
CREATE INDEX idx_papers_year ON papers(year);
CREATE INDEX idx_papers_reproducibility ON papers(reproducibility_score);`}
          </pre>
        </div>
      )}
    </div>
  );
};
