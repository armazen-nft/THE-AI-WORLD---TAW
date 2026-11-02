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
  Layers,
  Copy,
  Check,
  Code,
  Rss
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
  const [showBloggerGuide, setShowBloggerGuide] = useState(false);
  const [bloggerSnippetTab, setBloggerSnippetTab] = useState<'rss' | 'sidebar' | 'badge' | 'iframe'>('rss');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const appOrigin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://ais-pre-hpi54m2sjm6qbdunye2ryh-655768412449.us-east1.run.app';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

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
              onClick={() => setShowBloggerGuide(!showBloggerGuide)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition cursor-pointer border ${
                showBloggerGuide
                  ? 'bg-orange-600 text-white border-orange-500 shadow-md'
                  : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/30'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{showBloggerGuide ? 'Fechar Guia Blogger' : 'Como Agregar no Blogger'}</span>
            </button>

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

        {/* Interactive Blogger Aggregation Guide Panel */}
        {showBloggerGuide && (
          <div className="mt-4 p-5 rounded-xl bg-gradient-to-br from-slate-900 via-orange-950/20 to-slate-900 border border-orange-500/40 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-500/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Guia de Agregação no Blogger / Blogspot</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      proofofenergy.blogspot.com
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    4 maneiras práticas de conectar seus artigos da DataSphere de volta ao seu blog.
                  </p>
                </div>
              </div>

              {/* Selector Tabs */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  onClick={() => setBloggerSnippetTab('rss')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    bloggerSnippetTab === 'rss'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Rss className="w-3.5 h-3.5" />
                  <span>1. Gadget Feed RSS</span>
                </button>
                <button
                  onClick={() => setBloggerSnippetTab('sidebar')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    bloggerSnippetTab === 'sidebar'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>2. Widget Barra Lateral</span>
                </button>
                <button
                  onClick={() => setBloggerSnippetTab('badge')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    bloggerSnippetTab === 'badge'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>3. Selo nos Posts</span>
                </button>
                <button
                  onClick={() => setBloggerSnippetTab('iframe')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    bloggerSnippetTab === 'iframe'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>4. Página Completa</span>
                </button>
              </div>
            </div>

            {/* Tab 1: Feed RSS Gadget */}
            {bloggerSnippetTab === 'rss' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                      URL Oficial do Feed RSS para o Blogger
                    </span>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Compatível com Gadget "Feed" do Google Blogger
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-md border border-slate-800">
                    <code className="text-xs text-orange-300 font-mono flex-1 break-all select-all">
                      {`${appOrigin}/api/rss.xml`}
                    </code>
                    <button
                      onClick={() => handleCopy(`${appOrigin}/api/rss.xml`, 'rss-feed-url')}
                      className="px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      {copiedKey === 'rss-feed-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'rss-feed-url' ? 'Copiado!' : 'Copiar URL'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>Passo a Passo no Blogger (Método Mais Fácil - Sem Código):</span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1 leading-relaxed">
                    <li>Abra o painel do Blogger (<a href="https://www.blogger.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">blogger.com</a>) e entre no seu blog <em>proofofenergy.blogspot.com</em>.</li>
                    <li>No menu lateral esquerdo, clique em <strong>Layout</strong>.</li>
                    <li>Localize a seção <strong>Barra lateral</strong> (Sidebar) ou <strong>Rodapé</strong> e clique em <strong>"+ Adicionar um Gadget"</strong>.</li>
                    <li>Na janela que se abrir, role até encontrar o gadget nativo <strong>"Feed"</strong>.</li>
                    <li>Cole a URL acima (<code className="text-orange-300 font-mono">{`${appOrigin}/api/rss.xml`}</code>) no campo do feed e clique em <strong>Continuar</strong>.</li>
                    <li>Defina o título (ex: <em>Artigos Acadêmicos DataSphere</em>), marque a data e autor, e clique em <strong>Salvar</strong>!</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Tab 2: Sidebar Widget HTML */}
            {bloggerSnippetTab === 'sidebar' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    Cole este código no gadget <strong>HTML/JavaScript</strong> da barra lateral do Blogger:
                  </span>
                  <button
                    onClick={() => {
                      const snippet = `<!-- DataSphere Academic: Widget de Artigos Científicos para Blogger -->
<div id="datasphere-widget" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f1f5f9; border-radius: 12px; padding: 18px; border: 1px solid #1e293b; box-shadow: 0 4px 20px rgba(0,0,0,0.3); max-width: 100%; box-sizing: border-box;">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
    <span style="font-size: 13px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
      ⚡ DataSphere Academic
    </span>
    <span style="font-size: 11px; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(16, 185, 129, 0.3);">
      DeSci / IPFS
    </span>
  </div>
  <p style="font-size: 12px; color: #94a3b8; margin: 0 0 12px 0; line-height: 1.4;">
    Artigos com revisão por pares descentralizada e prova de integridade no IPFS.
  </p>
  <div id="datasphere-papers-list" style="display: flex; flex-direction: column; gap: 10px;">
    <div style="background: #1e293b; border-radius: 8px; padding: 12px; border: 1px solid #334155;">
      <a href="${appOrigin}" target="_blank" style="color: #f8fafc; font-size: 13px; font-weight: 600; text-decoration: none; display: block; line-height: 1.35; margin-bottom: 6px;">
        PulseneT: Architecture for Decentralized Energy Validation
      </a>
      <div style="font-size: 11px; color: #38bdf8; font-family: monospace;">DOI: 10.1000/182.2026.001</div>
    </div>
  </div>
  <div style="margin-top: 14px; text-align: center;">
    <a href="${appOrigin}" target="_blank" style="display: block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 9px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;">
      Explorar Biblioteca Acadêmica Completa →
    </a>
  </div>
</div>`;
                      handleCopy(snippet, 'widget-sidebar');
                    }}
                    className="px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedKey === 'widget-sidebar' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'widget-sidebar' ? 'Código Copiado!' : 'Copiar Código HTML'}</span>
                  </button>
                </div>

                <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-orange-200/90 overflow-x-auto max-h-56 select-all">
{`<!-- DataSphere Academic: Widget de Artigos Científicos para Blogger -->
<div id="datasphere-widget" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f1f5f9; border-radius: 12px; padding: 18px; border: 1px solid #1e293b; box-shadow: 0 4px 20px rgba(0,0,0,0.3); max-width: 100%; box-sizing: border-box;">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
    <span style="font-size: 13px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
      ⚡ DataSphere Academic
    </span>
    <span style="font-size: 11px; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(16, 185, 129, 0.3);">
      DeSci / IPFS
    </span>
  </div>
  <p style="font-size: 12px; color: #94a3b8; margin: 0 0 12px 0; line-height: 1.4;">
    Artigos com revisão por pares descentralizada e prova de integridade no IPFS.
  </p>
  <div id="datasphere-papers-list" style="display: flex; flex-direction: column; gap: 10px;">
    <div style="background: #1e293b; border-radius: 8px; padding: 12px; border: 1px solid #334155;">
      <a href="${appOrigin}" target="_blank" style="color: #f8fafc; font-size: 13px; font-weight: 600; text-decoration: none; display: block; line-height: 1.35; margin-bottom: 6px;">
        PulseneT: Architecture for Decentralized Energy Validation
      </a>
      <div style="font-size: 11px; color: #38bdf8; font-family: monospace;">DOI: 10.1000/182.2026.001</div>
    </div>
  </div>
  <div style="margin-top: 14px; text-align: center;">
    <a href="${appOrigin}" target="_blank" style="display: block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 9px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;">
      Explorar Biblioteca Acadêmica Completa →
    </a>
  </div>
</div>`}
                </pre>
                <p className="text-xs text-slate-400">
                  Como adicionar: Em <strong>Layout</strong> → <strong>Adicionar um Gadget</strong> → selecione <strong>HTML/JavaScript</strong> → Cole o código e salve.
                </p>
              </div>
            )}

            {/* Tab 3: Post Academic Badge */}
            {bloggerSnippetTab === 'badge' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    Selo Acadêmico para colar no final das suas postagens no Blogger (modo <strong>&lt;&gt; HTML</strong>):
                  </span>
                  <button
                    onClick={() => {
                      const snippet = `<!-- Selo DeSci & Certificação Acadêmica DataSphere -->
<div style="margin: 28px 0; padding: 16px 20px; background: #0f172a; border: 1px solid #1e293b; border-left: 4px solid #38bdf8; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #e2e8f0;">
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
    <strong style="color: #38bdf8; font-size: 13px;">✓ Certificado Acadêmico DataSphere</strong>
    <span style="font-size: 11px; color: #34d399; font-weight: 600;">Status: Verificado no IPFS</span>
  </div>
  <p style="font-size: 12px; color: #94a3b8; margin: 0 0 10px 0; line-height: 1.5;">
    Este conteúdo foi indexado na rede descentralizada DataSphere Academic com hash de integridade e metadados científicos imutáveis.
  </p>
  <div style="display: flex; gap: 10px; flex-wrap: wrap; font-size: 11px;">
    <a href="${appOrigin}" target="_blank" style="color: #38bdf8; text-decoration: underline; font-weight: 500;">
      Ver Grafo de Citações
    </a>
    <span style="color: #475569;">·</span>
    <a href="${appOrigin}/api/rss.xml" target="_blank" style="color: #fb923c; text-decoration: underline; font-weight: 500;">
      Assinar Feed RSS
    </a>
  </div>
</div>`;
                      handleCopy(snippet, 'post-badge');
                    }}
                    className="px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedKey === 'post-badge' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'post-badge' ? 'Código Copiado!' : 'Copiar Selo HTML'}</span>
                  </button>
                </div>

                <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-orange-200/90 overflow-x-auto max-h-56 select-all">
{`<!-- Selo DeSci & Certificação Acadêmica DataSphere -->
<div style="margin: 28px 0; padding: 16px 20px; background: #0f172a; border: 1px solid #1e293b; border-left: 4px solid #38bdf8; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #e2e8f0;">
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
    <strong style="color: #38bdf8; font-size: 13px;">✓ Certificado Acadêmico DataSphere</strong>
    <span style="font-size: 11px; color: #34d399; font-weight: 600;">Status: Verificado no IPFS</span>
  </div>
  <p style="font-size: 12px; color: #94a3b8; margin: 0 0 10px 0; line-height: 1.5;">
    Este conteúdo foi indexado na rede descentralizada DataSphere Academic com hash de integridade e metadados científicos imutáveis.
  </p>
  <div style="display: flex; gap: 10px; flex-wrap: wrap; font-size: 11px;">
    <a href="${appOrigin}" target="_blank" style="color: #38bdf8; text-decoration: underline; font-weight: 500;">
      Ver Grafo de Citações
    </a>
    <span style="color: #475569;">·</span>
    <a href="${appOrigin}/api/rss.xml" target="_blank" style="color: #fb923c; text-decoration: underline; font-weight: 500;">
      Assinar Feed RSS
    </a>
  </div>
</div>`}
                </pre>
              </div>
            )}

            {/* Tab 4: Full App Page */}
            {bloggerSnippetTab === 'iframe' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    Crie uma página inteira no Blogger (ex: <em>proofofenergy.blogspot.com/p/app.html</em>):
                  </span>
                  <button
                    onClick={() => {
                      const snippet = `<!-- DataSphere Academic: Página Completa Integrada no Blogger -->
<div style="position: relative; width: 100%; height: 90vh; min-height: 750px; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 10px 30px rgba(0,0,0,0.5); background: #020617; margin: 20px 0;">
  <iframe 
    src="${appOrigin}" 
    style="width: 100%; height: 100%; border: none; display: block;" 
    allow="clipboard-write; fullscreen; accelerometer; gyroscope" 
    loading="lazy" 
    title="DataSphere Academic Application">
  </iframe>
</div>`;
                      handleCopy(snippet, 'iframe-page');
                    }}
                    className="px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedKey === 'iframe-page' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'iframe-page' ? 'Código Copiado!' : 'Copiar Iframe'}</span>
                  </button>
                </div>

                <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-orange-200/90 overflow-x-auto max-h-56 select-all">
{`<!-- DataSphere Academic: Página Completa Integrada no Blogger -->
<div style="position: relative; width: 100%; height: 90vh; min-height: 750px; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 10px 30px rgba(0,0,0,0.5); background: #020617; margin: 20px 0;">
  <iframe 
    src="${appOrigin}" 
    style="width: 100%; height: 100%; border: none; display: block;" 
    allow="clipboard-write; fullscreen; accelerometer; gyroscope" 
    loading="lazy" 
    title="DataSphere Academic Application">
  </iframe>
</div>`}
                </pre>
                <p className="text-xs text-slate-400">
                  Como adicionar: No painel do Blogger, vá em <strong>Páginas</strong> → <strong>Nova página</strong> → Mude para <strong>Visualização em HTML (&lt;&gt;)</strong> → Cole e publique!
                </p>
              </div>
            )}
          </div>
        )}

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
