import React, { useState, useEffect } from 'react';
import { Paper } from './types/academic';
import { INITIAL_PAPERS } from './data/mockPapers';
import { getBookmarks, cachePapersForOffline, getCachedPapers } from './services/storage';
import { paperVectorStore, projectQueryTo384Vector } from './services/vectorSearch';
import { Navbar, NavTab } from './components/Navbar';
import { ResearchExplorer } from './components/ResearchExplorer';
import { CitationGraph } from './components/CitationGraph';
import { AILab } from './components/AILab';
import { DatabaseWorkbench } from './components/DatabaseWorkbench';
import { MultiplatformHub } from './components/MultiplatformHub';
import { DistributionDeploy } from './components/DistributionDeploy';
import { RepoDiagnostics } from './components/RepoDiagnostics';
import { PaperDetailModal } from './components/PaperDetailModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AddPaperModal } from './components/AddPaperModal';
import { GeminiChatbot } from './components/GeminiChatbot';
import { Bioscience3DViewer } from './components/Bioscience3DViewer';
import { ProofOfEnergyIngestor } from './components/ProofOfEnergyIngestor';
import {
  Sparkles,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  Plus,
  Zap
} from 'lucide-react';

export default function App() {
  const [papers, setPapers] = useState<Paper[]>(() => {
    const cached = getCachedPapers();
    return cached && cached.length > 0 ? cached : INITIAL_PAPERS;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('explorer');
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [savedPaperIds, setSavedPaperIds] = useState<string[]>(() => getBookmarks());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    // Cache papers into local storage / IndexedDB for complete offline PWA reliability
    cachePapersForOffline(papers);
  }, [papers]);

  const refreshBookmarks = () => {
    setSavedPaperIds(getBookmarks());
  };

  const handleSelectRelatedPaper = (paperId: string) => {
    const target = papers.find((p) => p.id === paperId);
    if (target) {
      setSelectedPaper(target);
    }
  };

  const handleAddPaper = async (newPaper: Paper) => {
    // Ensure 384d vector embedding is cached for neural semantic search
    if (!paperVectorStore.has(newPaper.id)) {
      paperVectorStore.set(
        newPaper.id,
        projectQueryTo384Vector(`${newPaper.title} ${newPaper.abstract} ${newPaper.keywords.join(' ')}`)
      );
    }

    const updated = [newPaper, ...papers];
    setPapers(updated);
    cachePapersForOffline(updated);
    setSelectedPaper(newPaper);

    try {
      await fetch('/api/papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPaper),
      });
    } catch (e) {
      console.warn('Could not sync new paper to server RSS store:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        savedCount={savedPaperIds.length}
        onOpenAddPaper={() => setIsAddModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Architectural Transformation Hero Banner (Quiet, elegant announcement) */}
        {activeTab === 'explorer' && (
          <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Repositório datasphereacademic-application · Camada Visual & PWA Ativa</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                  Plataforma Acadêmica Distribuível com Busca Semântica & DeSci
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Estruturado nas 5 etapas: Diagnóstico da base, PWA instalável sem app store, empacotador para Desktop (Tauri) e Mobile (Capacitor), banco analítico DuckDB/Vetorial e distribuição descentralizada via IPFS.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-medium transition cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Artigo</span>
                </button>
                <button
                  onClick={() => setActiveTab('proofofenergy')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition cursor-pointer"
                  title="Pipeline inverso: Ingerir proofofenergy.blogspot.com do mais antigo ao mais recente"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Proof of Energy (Ingest)</span>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Chatbot IA</span>
                </button>
                <button
                  onClick={() => setActiveTab('diagnostics')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                >
                  <span>Ver Diagnóstico</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'explorer' && (
          <ResearchExplorer
            papers={papers}
            onSelectPaper={(p) => setSelectedPaper(p)}
            savedPaperIds={savedPaperIds}
            onUpdateBookmarks={refreshBookmarks}
            onOpenAddPaper={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'proofofenergy' && (
          <ProofOfEnergyIngestor
            onPaperPublished={handleAddPaper}
            onSelectPaper={(p) => setSelectedPaper(p)}
            allPapers={papers}
          />
        )}

        {activeTab === 'chat' && (
          <GeminiChatbot />
        )}

        {activeTab === 'bioscience' && (
          <Bioscience3DViewer />
        )}

        {activeTab === 'graph' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <div>
                <strong className="text-slate-200">Rede de Citações Semânticas: </strong>
                Navegue pelas conexões entre trabalhos seminais, artigos citantes e clusters ontológicos.
              </div>
              <span className="text-cyan-400 hidden sm:inline">Clique em qualquer nó para inspecionar</span>
            </div>

            <CitationGraph
              papers={papers}
              selectedPaperId={selectedPaper?.id}
              onSelectPaper={(p) => setSelectedPaper(p)}
            />
          </div>
        )}

        {activeTab === 'ai' && (
          <AILab
            papers={papers}
            onSelectPaper={(p) => setSelectedPaper(p)}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseWorkbench
            papers={papers}
            onSelectPaper={(p) => setSelectedPaper(p)}
          />
        )}

        {activeTab === 'multiplatform' && (
          <MultiplatformHub />
        )}

        {activeTab === 'deploy' && (
          <DistributionDeploy />
        )}

        {activeTab === 'diagnostics' && (
          <RepoDiagnostics />
        )}
      </main>

      {/* Paper Detail Modal */}
      <PaperDetailModal
        paper={selectedPaper}
        onClose={() => setSelectedPaper(null)}
        onSelectRelatedPaper={handleSelectRelatedPaper}
      />

      {/* Add Paper / Dataset Modal */}
      <AddPaperModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPaper={handleAddPaper}
      />

      {/* Offline Status Toast Indicator */}
      <OfflineIndicator />

      {/* Scholarly Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">DataSphere Academic</span>
            <span>·</span>
            <span>Ciência Aberta & DeSci</span>
            <span>·</span>
            <span>Repositório: armazen-nft/datasphereacademic-application</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('diagnostics')}
              className="hover:text-indigo-400 transition cursor-pointer"
            >
              Auditoria de Stack
            </button>
            <button
              onClick={() => setActiveTab('multiplatform')}
              className="hover:text-indigo-400 transition cursor-pointer"
            >
              Tauri & Capacitor
            </button>
            <a
              href="https://ipfs.io"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition inline-flex items-center gap-1"
            >
              IPFS Gateway <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
