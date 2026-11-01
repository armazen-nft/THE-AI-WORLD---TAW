import React, { useState } from 'react';
import { Paper, PaperAnalysis } from '../types/academic';
import {
  X,
  Sparkles,
  BookOpen,
  Share2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  Send,
  Trash2,
  Layers,
  AlertCircle,
  Network
} from 'lucide-react';
import { toggleBookmark, getBookmarks, getNotes, addNote, deleteNote } from '../services/storage';

interface PaperDetailModalProps {
  paper: Paper | null;
  onClose: () => void;
  onSelectRelatedPaper: (paperId: string) => void;
}

export const PaperDetailModal: React.FC<PaperDetailModalProps> = ({
  paper,
  onClose,
  onSelectRelatedPaper,
}) => {
  if (!paper) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'desci' | 'bibtex' | 'notes'>('overview');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() =>
    getBookmarks().includes(paper.id)
  );
  const [aiAnalysis, setAiAnalysis] = useState<PaperAnalysis | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [copiedCid, setCopiedCid] = useState(false);

  // Notes state
  const [notes, setNotes] = useState(() => getNotes(paper.id));
  const [newNoteText, setNewNoteText] = useState('');

  const handleBookmarkClick = () => {
    const newState = toggleBookmark(paper.id);
    setIsBookmarked(newState);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const note = addNote(paper.id, newNoteText.trim());
    setNotes([note, ...notes]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    setNotes(notes.filter((n) => n.id !== id));
  };

  // Run Gemini analysis
  const runAiAnalysis = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: paper.title,
          abstract: paper.abstract,
          field: paper.field,
          promptType: 'critique_and_reproducibility',
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('AI synthesis request error:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const bibtexContent = `@article{${paper.id.replace('-', '_')}_${paper.year},
  title = {${paper.title}},
  author = {${paper.authors.join(' and ')}},
  journal = {${paper.journalOrConference}},
  year = {${paper.year}},
  doi = {${paper.doi}},
  ipfs = {${paper.ipfsCid}}
}`;

  const copyToClipboard = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70">
          <div className="space-y-1.5 pr-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-cyan-400 font-medium">{paper.field}</span>
              <span>·</span>
              <span>{paper.subfield}</span>
              <span>·</span>
              <span>{paper.year}</span>
              <span>·</span>
              <span className="text-emerald-400">
                {paper.openAccess ? 'Acesso Aberto (Open Access)' : 'Acesso Restrito'}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100 leading-snug">
              {paper.title}
            </h2>

            <p className="text-xs text-slate-400">
              {paper.authors.join(' · ')}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleBookmarkClick}
              className={`p-2 rounded-lg border transition cursor-pointer ${
                isBookmarked
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={isBookmarked ? 'Salvo na Biblioteca' : 'Salvar na Biblioteca'}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2 bg-slate-950/40 border-b border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => {
              setActiveTab('ai');
              if (!aiAnalysis) runAiAnalysis();
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-indigo-400 hover:text-indigo-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Síntese IA (Gemini)</span>
          </button>
          <button
            onClick={() => setActiveTab('desci')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'desci'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>IPFS & DeSci</span>
          </button>
          <button
            onClick={() => setActiveTab('bibtex')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bibtex'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>BibTeX</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Anotações ({notes.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-200 text-sm">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Publication Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500">Publicado em: </span>
                  <span className="text-slate-200 font-medium">{paper.journalOrConference}</span>
                </div>
                <div>
                  <span className="text-slate-500">DOI: </span>
                  <a
                    href={`https://doi.org/${paper.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    {paper.doi} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <span className="text-slate-500">Citações: </span>
                  <span className="text-indigo-400 font-semibold">{paper.citationsCount}</span>
                </div>
              </div>

              {/* Abstract */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Resumo (Abstract)
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-serif bg-slate-950/40 p-4 rounded-lg border border-slate-800/50">
                  {paper.abstract}
                </p>
              </div>

              {/* Keywords */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Palavras-chave e Tópicos Ontológicos
                </h4>
                <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                  {paper.keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Citation Network Links */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Conexões na Rede de Citação
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                    <span className="text-slate-400 block mb-1.5 font-medium">
                      Trabalhos Citados por Este Artigo ({paper.citations.length})
                    </span>
                    {paper.citations.length === 0 ? (
                      <span className="text-slate-500 italic">Trabalho seminal / referências base</span>
                    ) : (
                      <div className="space-y-1">
                        {paper.citations.map((id) => (
                          <button
                            key={id}
                            onClick={() => onSelectRelatedPaper(id)}
                            className="block text-indigo-400 hover:underline text-left cursor-pointer"
                          >
                            → Ver artigo [{id}]
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                    <span className="text-slate-400 block mb-1.5 font-medium">
                      Artigos Citando Esta Obra ({paper.citedBy.length})
                    </span>
                    {paper.citedBy.length === 0 ? (
                      <span className="text-slate-500 italic">Publicação recente sem citações secundárias</span>
                    ) : (
                      <div className="space-y-1">
                        {paper.citedBy.map((id) => (
                          <button
                            key={id}
                            onClick={() => onSelectRelatedPaper(id)}
                            className="block text-cyan-400 hover:underline text-left cursor-pointer"
                          >
                            ← Citado por [{id}]
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-indigo-950/30 border border-indigo-800/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-indigo-200">
                      Motor de Síntese Epistêmica Gemini
                    </h4>
                    <p className="text-[11px] text-indigo-300/80">
                      Análise crítica de metodologia, achados científicos e índice de reprodutibilidade
                    </p>
                  </div>
                </div>

                <button
                  onClick={runAiAnalysis}
                  disabled={isLoadingAi}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {isLoadingAi ? 'Analisando...' : 'Reavaliar'}
                </button>
              </div>

              {isLoadingAi ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
                  <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Processando artigo com modelo de raciocínio científico...</span>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4">
                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-xs text-slate-400 block mb-1">Potencial de Citação</span>
                      <div className="text-2xl font-bold text-indigo-400">
                        {aiAnalysis.citationImpactScore}/100
                      </div>
                    </div>
                    <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-xs text-slate-400 block mb-1">Índice de Reprodutibilidade Aberta</span>
                      <div className="text-2xl font-bold text-emerald-400">
                        {aiAnalysis.reproducibilityScore}/100
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Síntese Epistêmica
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/60">
                      {aiAnalysis.summary}
                    </p>
                  </div>

                  {/* Key findings */}
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Principais Achados & Contribuições
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {aiAnalysis.keyFindings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Methodology critique */}
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Crítica Metodológica & Rigor
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/60">
                      {aiAnalysis.methodologyCritique}
                    </p>
                  </div>

                  {/* Future directions */}
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Próximas Fronteiras de Pesquisa
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {aiAnalysis.futureWork.map((fw, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
                          <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] shrink-0 font-bold">
                            {idx + 1}
                          </span>
                          <span>{fw}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'desci' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-sm font-semibold text-cyan-200">
                    Prova de Publicação Descentralizada (IPFS / DeSci)
                  </h4>
                </div>
                <p className="text-xs text-cyan-300/80 leading-relaxed">
                  O artigo e seus artefatos computacionais estão ancorados em rede descentralizada
                  imutável via Content Identifier (CID) do IPFS com validação criptográfica Merkle DAG.
                </p>
              </div>

              {/* CID Box */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Identificador de Conteúdo (IPFS CIDv1)
                </label>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <code className="text-xs text-cyan-400 font-mono flex-1 break-all select-all">
                    {paper.ipfsCid}
                  </code>
                  <button
                    onClick={() => copyToClipboard(paper.ipfsCid, setCopiedCid)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    title="Copiar CID"
                  >
                    {copiedCid ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Gateway URLs */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Gateways Públicos de Acesso Aberto
                </label>
                <div className="space-y-1.5 text-xs">
                  <a
                    href={`https://ipfs.io/ipfs/${paper.ipfsCid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 text-slate-300 hover:text-cyan-400 transition"
                  >
                    <span>Gateway Oficial IPFS (ipfs.io)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                  <a
                    href={`https://dweb.link/ipfs/${paper.ipfsCid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 text-slate-300 hover:text-cyan-400 transition"
                  >
                    <span>Gateway Distribuído DWeb.link</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Artifacts check */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Dados & Código Aberto</span>
                  <span className="text-emerald-400 font-medium">
                    {paper.dataAvailable ? 'Disponível via IPFS' : 'Sob Solicitação'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Nós de Pinning Ativos</span>
                  <span className="text-cyan-400 font-medium">Cluster Acadêmico 4/4</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bibtex' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Formato de citação acadêmica padrão para LaTeX / Zotero / Mendeley
                </span>
                <button
                  onClick={() => copyToClipboard(bibtexContent, setCopiedBibtex)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition cursor-pointer"
                >
                  {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBibtex ? 'Copiado!' : 'Copiar BibTeX'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto select-all leading-relaxed">
                {bibtexContent}
              </pre>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Adicionar Anotação ou Comentário de Pesquisa
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Ex: Metodologia promissora para o benchmark do laboratório..."
                    className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Salvar</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2 pt-2">
                {notes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-6">
                    Nenhuma anotação pessoal gravada para este artigo.
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <p className="text-slate-200">{note.content}</p>
                        <span className="text-[10px] text-slate-500">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-slate-500 hover:text-red-400 p-1 transition cursor-pointer"
                        title="Excluir anotação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
