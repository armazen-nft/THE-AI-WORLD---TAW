import React, { useState, useMemo } from 'react';
import { Paper } from '../types/academic';
import { searchPapers } from '../services/vectorSearch';
import { toggleBookmark, getBookmarks } from '../services/storage';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Compass,
  ArrowUpDown,
  BookOpen,
  Plus
} from 'lucide-react';

interface ResearchExplorerProps {
  papers: Paper[];
  onSelectPaper: (paper: Paper) => void;
  savedPaperIds: string[];
  onUpdateBookmarks: () => void;
  onOpenAddPaper: () => void;
}

export const ResearchExplorer: React.FC<ResearchExplorerProps> = ({
  papers,
  onSelectPaper,
  savedPaperIds,
  onUpdateBookmarks,
  onOpenAddPaper,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'hybrid' | 'semantic' | 'lexical'>('hybrid');
  const [selectedField, setSelectedField] = useState('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'citations' | 'year' | 'reproducibility'>('relevance');
  const [onlyOpenAccess, setOnlyOpenAccess] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);

  // Field categories
  const fields = [
    { id: 'all', label: 'Todas as Áreas' },
    { id: 'Inteligência Artificial', label: 'Inteligência Artificial' },
    { id: 'Ciência Aberta & DeSci', label: 'Ciência Aberta & DeSci' },
    { id: 'Biotecnologia & Genômica', label: 'Biotecnologia & Genômica' },
    { id: 'Física & Computação Quântica', label: 'Computação Quântica' },
    { id: 'Energia & Sustentabilidade', label: 'Energia & Sustentabilidade' },
    { id: 'Neurociência & BCI', label: 'Neurociência & BCI' },
  ];

  // Perform vector/hybrid search
  const searchResults = useMemo(() => {
    let sourcePapers = papers;
    if (onlySaved) {
      sourcePapers = sourcePapers.filter((p) => savedPaperIds.includes(p.id));
    }
    if (onlyOpenAccess) {
      sourcePapers = sourcePapers.filter((p) => p.openAccess);
    }

    const results = searchPapers(sourcePapers, searchQuery, searchMode, selectedField);

    // Sorting
    if (sortBy === 'citations') {
      return [...results].sort((a, b) => b.paper.citationsCount - a.paper.citationsCount);
    } else if (sortBy === 'year') {
      return [...results].sort((a, b) => b.paper.year - a.paper.year);
    } else if (sortBy === 'reproducibility') {
      return [...results].sort((a, b) => b.paper.reproducibilityScore - a.paper.reproducibilityScore);
    }
    return results;
  }, [papers, searchQuery, searchMode, selectedField, sortBy, onlyOpenAccess, onlySaved, savedPaperIds]);

  const handleBookmark = (e: React.MouseEvent, paperId: string) => {
    e.stopPropagation();
    toggleBookmark(paperId);
    onUpdateBookmarks();
  };

  return (
    <div className="space-y-6">
      {/* Search Header and Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              <span>Motor de Busca Acadêmica & Descoberta Vetorial</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Indexação de publicações científicas com embeddings semânticos, grafos de citação e prova IPFS.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Search Mode Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setSearchMode('hybrid')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  searchMode === 'hybrid'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Combina similaridade vetorial (60%) e termos exatos (40%)"
              >
                Híbrida
              </button>
              <button
                onClick={() => setSearchMode('semantic')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition flex items-center gap-1 cursor-pointer ${
                  searchMode === 'semantic'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Busca por similaridade de cosseno nos vetores de embedding"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Semântica</span>
              </button>
              <button
                onClick={() => setSearchMode('lexical')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  searchMode === 'lexical'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Casamento exato de termos em título, resumo e autores"
              >
                Léxica
              </button>
            </div>

            <button
              onClick={onOpenAddPaper}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs transition cursor-pointer shadow-sm"
              title="Agregar novo artigo ou dataset"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar</span>
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por conceito científico, hipótese, autor, DOI ou termos (ex: 'CRISPR Cas12a', 'MoE sparsity', 'IPFS peer review')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Interactive Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80 text-xs">
          {/* Field selection tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {fields.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedField(f.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedField === f.id
                    ? 'bg-slate-800 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Quick toggle check buttons */}
          <div className="flex items-center gap-3 text-slate-400 shrink-0">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={onlyOpenAccess}
                onChange={(e) => setOnlyOpenAccess(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
              <span>Apenas Open Access</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={onlySaved}
                onChange={(e) => setOnlySaved(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
              <span>Salvos ({savedPaperIds.length})</span>
            </label>

            {/* Sort Select */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Ordenar artigos"
                className="bg-transparent text-slate-300 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="relevance" className="bg-slate-900">Relevância</option>
                <option value="citations" className="bg-slate-900">Mais Citados</option>
                <option value="year" className="bg-slate-900">Mais Recentes</option>
                <option value="reproducibility" className="bg-slate-900">Reprodutibilidade</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count and Semantic Stats */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          <span>Exibindo </span>
          <strong className="text-slate-200">{searchResults.length}</strong>
          <span> artigos científicos indexados</span>
          {searchQuery && (
            <span className="text-indigo-400 font-medium"> · Modo: {searchMode}</span>
          )}
        </div>
        <div className="text-slate-500 hidden sm:inline">
          Formatos suportados: BibTeX · Dublin Core · Schema.org · IPFS CID
        </div>
      </div>

      {/* Papers List */}
      <div className="space-y-3.5">
        {searchResults.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-200">Nenhum artigo encontrado para o filtro atual.</p>
            <p className="text-xs text-slate-500 mt-1">Tente ajustar a consulta textual ou selecionar "Todas as Áreas".</p>
          </div>
        ) : (
          searchResults.map(({ paper, score, semanticMatch }) => {
            const isBookmarked = savedPaperIds.includes(paper.id);

            return (
              <div
                key={paper.id}
                onClick={() => onSelectPaper(paper)}
                className="group relative bg-slate-900 hover:bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 sm:p-5 transition-all duration-200 shadow-md cursor-pointer flex flex-col gap-3"
              >
                {/* Header row with zero-pill metadata discipline: unboxed text with subtle typographic separators */}
                <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-indigo-400">{paper.field}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>{paper.year}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-300 font-medium">{paper.journalOrConference}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className={paper.openAccess ? 'text-emerald-400' : 'text-slate-500'}>
                      {paper.openAccess ? 'Acesso Aberto' : 'Acesso Restrito'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {searchQuery && (
                      <span className="text-[11px] text-cyan-400 font-mono">
                        {semanticMatch}% match
                      </span>
                    )}
                    <button
                      onClick={(e) => handleBookmark(e, paper.id)}
                      className={`p-1.5 rounded-lg border transition ${
                        isBookmarked
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                      title={isBookmarked ? 'Salvo' : 'Salvar'}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-serif font-bold text-slate-100 group-hover:text-indigo-200 transition-colors leading-snug">
                  {paper.title}
                </h3>

                {/* Abstract snippet */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                  {paper.abstract}
                </p>

                {/* Footer Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>
                      Autores: <strong className="text-slate-300 font-normal">{paper.authors[0]} et al.</strong>
                    </span>
                    <span className="hidden sm:inline" aria-hidden="true">·</span>
                    <span className="hidden sm:inline">
                      Citações: <strong className="text-indigo-400">{paper.citationsCount}</strong>
                    </span>
                    <span className="hidden md:inline" aria-hidden="true">·</span>
                    <span className="hidden md:inline">
                      Reprodutibilidade: <strong className="text-emerald-400">{paper.reproducibilityScore}%</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500 hidden lg:inline">
                      CID: {paper.ipfsCid.slice(0, 14)}...
                    </span>
                    <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform font-medium">
                      Examinar artigo →
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
