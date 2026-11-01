import React, { useState, useEffect } from 'react';
import { Paper } from '../types/academic';
import {
  Globe,
  ArrowRight,
  Clock,
  Calendar,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  BookOpen,
  RefreshCw,
  Layers
} from 'lucide-react';

interface QueueItem {
  index: number;
  paperId: string;
  title: string;
  author: string;
  publishedDate: string;
  isPublished: boolean;
  scheduledDay: string;
  scheduledDateStr: string;
  link: string;
}

interface IngestStatus {
  source: string;
  sorting: string;
  totalFound: number;
  publishedCount: number;
  pendingCount: number;
  nextScheduledPost: QueueItem | null;
  queue: QueueItem[];
}

interface ProofOfEnergyIngestorProps {
  onPaperPublished: (paper: Paper) => void;
  onSelectPaper: (paper: Paper) => void;
  allPapers: Paper[];
}

export const ProofOfEnergyIngestor: React.FC<ProofOfEnergyIngestorProps> = ({
  onPaperPublished,
  onSelectPaper,
  allPapers,
}) => {
  const [status, setStatus] = useState<IngestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [autoDailyInterval, setAutoDailyInterval] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/ingest/proofofenergy/queue');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch ingest queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [allPapers]);

  // Handle auto-daily simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoDailyInterval) {
      timer = setInterval(() => {
        handlePublishNext(true);
      }, 25000); // Trigger next post every 25 seconds in demo simulation mode
    }
    return () => clearInterval(timer);
  }, [autoDailyInterval]);

  const handlePublishNext = async (isAuto = false) => {
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/ingest/proofofenergy/publish-next', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.paper) {
        onPaperPublished(data.paper);
        setFeedbackMsg(data.message);
        await fetchQueue();
      } else {
        setFeedbackMsg(data.message || 'Todas as publicações já estão ativas.');
        if (isAuto) setAutoDailyInterval(false);
      }
    } catch (err) {
      console.error('Error publishing next post:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/ingest/proofofenergy/sync-all', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.newPapers && data.newPapers.length > 0) {
        data.newPapers.forEach((p: Paper) => onPaperPublished(p));
      }
      setFeedbackMsg(data.message);
      await fetchQueue();
    } catch (err) {
      console.error('Error syncing all:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/ingest/proofofenergy/reset', {
        method: 'POST',
      });
      const data = await res.json();
      setFeedbackMsg(data.message);
      await fetchQueue();
    } catch (err) {
      console.error('Error resetting queue:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-orange-600/20 text-orange-400 border border-orange-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-100">
                  Pipeline Inverso: Blogger → DataSphere Academic
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                  proofofenergy.blogspot.com
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ingestão diária cronológica <strong className="text-slate-200">do mais antigo para os mais recentes</strong>, com vetorização e ancoragem em IPFS.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto text-xs">
            <button
              onClick={() => handlePublishNext(false)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium transition cursor-pointer shadow-md disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Publicar Próximo Artigo Diário</span>
            </button>

            <button
              onClick={handleSyncAll}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
              <span>Sincronizar Todos (10 Artigos)</span>
            </button>

            <button
              onClick={handleReset}
              disabled={actionLoading}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-red-400 transition cursor-pointer border border-slate-700"
              title="Resetar Fila"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/70 text-xs text-indigo-200 flex items-center justify-between animate-in fade-in">
            <span>{feedbackMsg}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Stats Row */}
        {status && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
              <span className="text-slate-500 block text-[11px]">Ordem Cronológica</span>
              <span className="font-semibold text-cyan-400">Do Mais Antigo → Recente</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
              <span className="text-slate-500 block text-[11px]">Total no Blog</span>
              <span className="font-semibold text-slate-200">{status.totalFound} Publicações</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
              <span className="text-slate-500 block text-[11px]">Publicados na DataSphere</span>
              <span className="font-semibold text-emerald-400">{status.publishedCount} Artigos</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
              <span className="text-slate-500 block text-[11px]">Pendentes na Fila</span>
              <span className="font-semibold text-orange-400">{status.pendingCount} Artigos</span>
            </div>
          </div>
        )}
      </div>

      {/* Next Scheduled Daily Post Spotlight */}
      {status?.nextScheduledPost && (
        <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-800/60 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Próximo Artigo da Fila Diária (Publicação #{status.nextScheduledPost.index})</span>
            </div>
            <span className="text-slate-400">
              Data Original do Post: {new Date(status.nextScheduledPost.publishedDate).toLocaleDateString('pt-BR')}
            </span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-serif font-bold text-white">
              {status.nextScheduledPost.title}
            </h3>
            <p className="text-xs text-slate-300">
              Autor: <strong className="text-cyan-400 font-medium">{status.nextScheduledPost.author}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping inline-block" />
              <span>Aguardando disparo diário</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={status.nextScheduledPost.link}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-slate-200 transition inline-flex items-center gap-1 font-medium"
              >
                <span>Ver post original no Blogger</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <button
                onClick={() => handlePublishNext(false)}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer"
              >
                Publicar este agora na DataSphere →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chronological Posts Timeline (Oldest to Newest) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-0">
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Cronograma de Publicações Ordenado (Do Mais Antigo ao Mais Recente)
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={autoDailyInterval}
                onChange={(e) => setAutoDailyInterval(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
              <span>Simular Disparo Diário Automático (Intervalo 25s)</span>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Consultando feed oficial de proofofenergy.blogspot.com...</p>
          </div>
        ) : status && status.queue ? (
          <div className="divide-y divide-slate-800/70">
            {status.queue.map((item) => {
              const matchingPaper = allPapers.find((p) => p.id === item.paperId);

              return (
                <div
                  key={item.paperId}
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-colors ${
                    item.isPublished
                      ? 'bg-slate-950/40 hover:bg-slate-900/40'
                      : 'bg-slate-900/60 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-mono text-cyan-400 font-bold">
                        #{item.index} ({item.scheduledDay})
                      </span>
                      <span>·</span>
                      <span>Publicado no Blogspot: {new Date(item.publishedDate).toLocaleDateString('pt-BR')}</span>
                      <span>·</span>
                      <span className="text-slate-300">{item.author}</span>
                    </div>

                    <h4 className="text-sm sm:text-base font-serif font-bold text-slate-100 leading-snug">
                      {item.title}
                    </h4>

                    {matchingPaper && (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                        <span className="text-indigo-400">DOI: {matchingPaper.doi}</span>
                        <span>·</span>
                        <span className="font-mono text-cyan-400">CID: {matchingPaper.ipfsCid.slice(0, 18)}...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.isPublished ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ativo na DataSphere</span>
                        </span>
                        {matchingPaper && (
                          <button
                            onClick={() => onSelectPaper(matchingPaper)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                          >
                            Inspecionar Artigo
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>Aguardando Publicação</span>
                        </span>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                          title="Abrir no Blogger"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};
