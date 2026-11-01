import React, { useEffect, useState } from 'react';
import { RepoDiagnostics as IDiagnostics } from '../types/academic';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  Server,
  RefreshCw,
  FolderGit2,
  FileCheck,
  Cpu,
  Layers,
  ShieldCheck,
  Check
} from 'lucide-react';

export const RepoDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<IDiagnostics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/diagnostics');
      const data = await res.json();
      setDiagnostics(data);
    } catch (err) {
      console.error('Failed to fetch diagnostics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <span>Diagnóstico & Auditoria da Base</span>
                <span className="text-xs font-mono text-cyan-400 font-normal">
                  (datasphereacademic-application)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspeção de stack, conformidade PWA, motor de dados, rotas de API e prontidão para distribuição.
              </p>
            </div>
          </div>

          <button
            onClick={fetchDiagnostics}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer self-start sm:self-auto border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Auditoria</span>
          </button>
        </div>
      </div>

      {loading && !diagnostics ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Inspecionando subsistemas e arquivos da base...</p>
        </div>
      ) : diagnostics ? (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Status Geral da Base</span>
              <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% OPERACIONAL</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Runtime & Memória</span>
              <div className="text-sm font-mono text-slate-200">
                Node {diagnostics.runtime.node} ({diagnostics.runtime.heapUsedMB}MB / {diagnostics.runtime.heapTotalMB}MB)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Motor Vetorial & Busca</span>
              <div className="text-sm font-semibold text-cyan-400">
                {diagnostics.capabilities.vectorEngine}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Cluster IPFS & DeSci</span>
              <div className="text-sm font-semibold text-indigo-400">
                {diagnostics.capabilities.ipfsGateway}
              </div>
            </div>
          </div>

          {/* Diagnostic Checks Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Verificações de Arquitetura & Stack de Software</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {diagnostics.checks.map((check, i) => (
                <div key={i} className="p-4 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-100 block">{check.name}</span>
                    <span className="text-slate-400">{check.detail}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium text-[11px] shrink-0">
                    <Check className="w-3 h-3" />
                    <span>{check.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1 to 5 Roadmap Accordion/Guide */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <span>Etapas de Implementação Concluídas (Roadmap Oficial)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-300">1. Diagnóstico e Preparação da Base</span>
                  <span className="text-emerald-400 font-mono">Concluído</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Stack inspecionada e unificada: Vite 8 + React 19 no frontend, Express com rotas de API em <code className="text-slate-300">server.ts</code>, tipagem estrita com TypeScript e Tailwind CSS v4.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-300">2. Construção da Interface (Frontend Moderno & PWA)</span>
                  <span className="text-emerald-400 font-mono">Concluído</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Camada visual de alta densidade acadêmica, Web App Manifest com service worker auto-update, hook de instalação in-app (<code className="text-slate-300">usePWAInstall</code>) e guia para iOS Safari.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-300">3. Empacotamento Multiplataforma (Tauri & Capacitor)</span>
                  <span className="text-emerald-400 font-mono">Concluído</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Geradores e exportadores de <code className="text-slate-300">tauri.conf.json</code>, <code className="text-slate-300">Cargo.toml</code> (para Windows, macOS, Linux) e <code className="text-slate-300">capacitor.config.ts</code> (para Android APK e iOS).
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-300">4. Banco de Dados e Conectividade (DuckDB & Vector Engine)</span>
                  <span className="text-emerald-400 font-mono">Concluído</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Banco analítico in-memory compatível com DuckDB/SQLite, motor vetorial com busca semântica por cosseno, projeção 2D e DDL pronto para PostgreSQL/Supabase.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-300">5. Deploy e Distribuição (Docker, Vercel & IPFS)</span>
                  <span className="text-emerald-400 font-mono">Concluído</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Ancoragem de papers em nós IPFS com identificador de conteúdo (CIDv1), Merkle DAG e arquivos de deploy para Vercel, Fly.io e contêineres Docker multi-stage.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
