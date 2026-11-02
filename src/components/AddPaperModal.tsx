import React, { useState } from 'react';
import { Paper } from '../types/academic';
import { projectQueryToVector, projectQueryTo384Vector, paperVectorStore } from '../services/vectorSearch';
import { X, Plus, Sparkles, ShieldCheck, Check, Upload } from 'lucide-react';

interface AddPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPaper: (paper: Paper) => void;
}

export const AddPaperModal: React.FC<AddPaperModalProps> = ({
  isOpen,
  onClose,
  onAddPaper,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [field, setField] = useState('Inteligência Artificial');
  const [subfield, setSubfield] = useState('Modelos Fundamentais');
  const [year, setYear] = useState(2026);
  const [journal, setJournal] = useState('DataSphere Open Archive');
  const [doi, setDoi] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [openAccess, setOpenAccess] = useState(true);
  const [dataAvailable, setDataAvailable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !abstract.trim()) return;

    setIsSubmitting(true);

    const generatedId = `dsp-user-${Date.now().toString(36)}`;
    const parsedAuthors = authors.trim()
      ? authors.split(',').map((a) => a.trim()).filter(Boolean)
      : ['Pesquisador Independente'];
    const parsedKeywords = keywords.trim()
      ? keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : [field, subfield];
    const finalDoi = doi.trim() || `10.5555/dsp.${Date.now()}`;

    // Project query text into 5D semantic vector
    const embedding = projectQueryToVector(`${title} ${abstract} ${field} ${keywords}`);

    // Generate IPFS CID
    const pseudoHash = Math.abs(
      (title + abstract).split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
    ).toString(16).padStart(8, '0');
    const ipfsCid = `bafybeic${pseudoHash}userart${Date.now().toString(36)}7q`;

    const newPaper: Paper = {
      id: generatedId,
      title: title.trim(),
      authors: parsedAuthors,
      abstract: abstract.trim(),
      field,
      subfield,
      year: Number(year) || 2026,
      journalOrConference: journal.trim() || 'DataSphere Academic Archive',
      doi: finalDoi,
      citationsCount: 0,
      openAccess,
      dataAvailable,
      ipfsCid,
      keywords: parsedKeywords,
      embeddingVector: embedding,
      citations: [],
      citedBy: [],
      reproducibilityScore: 95,
    };

    // Register 384d vector in paperVectorStore for instant neural semantic discovery
    const dense384 = projectQueryTo384Vector(`${title} ${abstract} ${field} ${keywords}`);
    paperVectorStore.set(generatedId, dense384);

    onAddPaper(newPaper);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Agregar Novo Artigo / Dataset Científico
              </h2>
              <p className="text-xs text-slate-400">
                Indexação instantânea no motor vetorial local e ancoragem com CID no IPFS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold uppercase tracking-wider block mb-1">
              Título da Publicação / Artigo *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Arquitetura Neural Híbrida para Descoberta de Fármacos em Tempo Real"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold uppercase tracking-wider block mb-1">
                Autores (separados por vírgula)
              </label>
              <input
                type="text"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="Ex: Dra. Mariana Costa, Carlos S. Lima"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold uppercase tracking-wider block mb-1">
                Área de Conhecimento
              </label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Inteligência Artificial">Inteligência Artificial</option>
                <option value="Ciência Aberta & DeSci">Ciência Aberta & DeSci</option>
                <option value="Biotecnologia & Genômica">Biotecnologia & Genômica</option>
                <option value="Física & Computação Quântica">Física & Computação Quântica</option>
                <option value="Energia & Sustentabilidade">Energia & Sustentabilidade</option>
                <option value="Neurociência & BCI">Neurociência & BCI</option>
                <option value="Ciência da Computação">Ciência da Computação</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-semibold uppercase tracking-wider block mb-1">
                Subcampo
              </label>
              <input
                type="text"
                value={subfield}
                onChange={(e) => setSubfield(e.target.value)}
                placeholder="Ex: Bioinformática"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold uppercase tracking-wider block mb-1">
                Ano
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1990}
                max={2030}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold uppercase tracking-wider block mb-1">
                DOI (opcional)
              </label>
              <input
                type="text"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="10.1016/j.dsp..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold uppercase tracking-wider block mb-1">
              Periódico, Conferência ou Repositório
            </label>
            <input
              type="text"
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="Ex: Nature Machine Intelligence / arXiv Preprint"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold uppercase tracking-wider block mb-1">
              Resumo Científico (Abstract) *
            </label>
            <textarea
              required
              rows={4}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Descreva a motivação, metodologia, resultados experimentais e conclusões da pesquisa..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 leading-relaxed font-serif"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold uppercase tracking-wider block mb-1">
              Palavras-chave (separadas por vírgula)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Ex: DeSci, Redes Neurais, Drug Discovery, Proteínas"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={openAccess}
                onChange={(e) => setOpenAccess(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
              <span>Acesso Aberto (Open Access)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={dataAvailable}
                onChange={(e) => setDataAvailable(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
              <span>Código e Dados Públicos via IPFS</span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium transition cursor-pointer shadow-md disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Indexando...' : 'Agregar ao Acervo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
