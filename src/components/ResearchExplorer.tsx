import React, { useState, useEffect, useMemo } from 'react';
import { Paper } from '../types/academic';
import {
  searchPapers,
  searchSemanticTransformers,
  initTransformerModel,
  indexPapersWithTransformers,
  subscribeTransformerStatus,
  getTransformerStatus,
  projectQueryTo384Vector,
  paperVectorStore,
  EMBEDDING_MODEL_NAME,
  EMBEDDING_DIMENSIONS,
  type TransformerStatus,
  type SemanticSearchResult,
} from '../services/vectorSearch';
import { toggleBookmark } from '../services/storage';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Compass,
  ArrowUpDown,
  BookOpen,
  Plus,
  Cpu,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Binary,
  Layers,
  Zap,
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
  const [searchMode, setSearchMode] = useState<'hybrid' | 'semantic' | 'lexical'>('semantic');
  const [selectedField, setSelectedField] = useState('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'citations' | 'year' | 'reproducibility'>('relevance');
  const [onlyOpenAccess, setOnlyOpenAccess] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);

  // Transformer status and results
  const [transformerStatus, setTransformerStatus] = useState<TransformerStatus>(getTransformerStatus());
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult[] | null>(null);
  const [isSearchingAsync, setIsSearchingAsync] = useState(false);
  const [showVectorInspector, setShowVectorInspector] = useState(false);

  // Subscribe to transformer status updates
  useEffect(() => {
    const unsubscribe = subscribeTransformerStatus((status) => {
      setTransformerStatus(status);
    });
    return () => unsubscribe();
  }, []);

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

  // Curated queries demonstrating semantic similarity over keyword matching
  const semanticDemoQueries = [
    {
      label: 'Células solares de alta eficiência',
      query: 'geração de eletricidade limpa por fotovoltaicos tandem',
      expected: 'Perovskita & Silício',
    },
    {
      label: 'Edição gênica sem ruptura de DNA',
      query: 'silenciamento epigenético de precisão sem quebras de fita dupla',
      expected: 'CRISPR-Cas12a',
    },
    {
      label: 'Computação quântica tolerante a ruído',
      query: 'correção de erros físicos em processadores supercondutores',
      expected: 'Surface Code 256-Qubit',
    },
    {
      label: 'Repositório científico descentralizado',
      query: 'protocolo de revisão aberta auditável com hashes e ipfs',
      expected: 'DeSci & IPFS',
    },
    {
      label: 'Decodificação neural do pensamento',
      query: 'reconstrução de fala silenciosa a partir de sinais de eletroencefalograma',
      expected: 'High-Density EEG & BCI',
    },
  ];

  // Filter source papers
  const filteredPapers = useMemo(() => {
    let source = papers;
    if (onlySaved) {
      source = source.filter((p) => savedPaperIds.includes(p.id));
    }
    if (onlyOpenAccess) {
      source = source.filter((p) => p.openAccess);
    }
    if (selectedField !== 'all') {
      source = source.filter((p) => p.field.toLowerCase() === selectedField.toLowerCase());
    }
    return source;
  }, [papers, onlySaved, onlyOpenAccess, selectedField, savedPaperIds]);

  // Synchronous fallback search (instant response while typing)
  const syncFallbackResults = useMemo(() => {
    return searchPapers(filteredPapers, searchQuery, searchMode, 'all');
  }, [filteredPapers, searchQuery, searchMode]);

  // Asynchronous Semantic Search with @xenova/transformers
  useEffect(() => {
    let isCancelled = false;
    setIsSearchingAsync(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchSemanticTransformers(filteredPapers, searchQuery, searchMode, 'all');
        if (!isCancelled) {
          setSemanticResults(results);
          setIsSearchingAsync(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setIsSearchingAsync(false);
        }
      }
    }, 180);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [filteredPapers, searchQuery, searchMode, transformerStatus.status]);

  // Final sorted results
  const displayedResults = useMemo(() => {
    const rawResults = semanticResults || syncFallbackResults;

    let sorted = [...rawResults];
    if (sortBy === 'citations') {
      sorted.sort((a, b) => b.paper.citationsCount - a.paper.citationsCount);
    } else if (sortBy === 'year') {
      sorted.sort((a, b) => b.paper.year - a.paper.year);
    } else if (sortBy === 'reproducibility') {
      sorted.sort((a, b) => b.paper.reproducibilityScore - a.paper.reproducibilityScore);
    } else {
      // Relevance
      sorted.sort((a, b) => b.score - a.score);
    }
    return sorted;
  }, [semanticResults, syncFallbackResults, sortBy]);

  // Initialize @xenova/transformers ONNX model
  const handleLoadModel = async () => {
    try {
      await initTransformerModel();
      // Auto-index papers upon load
      await handleIndexAllPapers();
    } catch (err) {
      console.error('Failed to load transformer model:', err);
    }
  };

  // Re-index all papers using @xenova/transformers
  const handleIndexAllPapers = async () => {
    setIsIndexing(true);
    setIndexingProgress(0);
    try {
      await indexPapersWithTransformers(papers, (current, total) => {
        setIndexingProgress(Math.round((current / total) * 100));
      });
      // Refresh search results
      const refreshed = await searchSemanticTransformers(filteredPapers, searchQuery, searchMode, 'all');
      setSemanticResults(refreshed);
    } catch (err) {
      console.error('Indexing failed:', err);
    } finally {
      setIsIndexing(false);
    }
  };

  const handleBookmark = (e: React.MouseEvent, paperId: string) => {
    e.stopPropagation();
    toggleBookmark(paperId);
    onUpdateBookmarks();
  };

  // Vector preview for inspector
  const activeQueryVector = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return projectQueryTo384Vector(searchQuery);
  }, [searchQuery]);

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
              Indexação de publicações científicas com embeddings semânticos densos (@xenova/transformers), grafos de citação e prova IPFS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Search Mode Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setSearchMode('semantic')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  searchMode === 'semantic'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Busca por proximidade de significado no espaço vetorial 384d (Xenova)"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Semântica (IA)</span>
              </button>
              <button
                onClick={() => setSearchMode('hybrid')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  searchMode === 'hybrid'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Combina similaridade vetorial (70%) e termos exatos (30%)"
              >
                Híbrida
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
              onClick={() => setShowVectorInspector(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-xs transition cursor-pointer"
              title="Inspecionar representação vetorial e similaridade de cosseno"
            >
              <Binary className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Espaço Vetorial</span>
            </button>

            <button
              onClick={onOpenAddPaper}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs transition cursor-pointer shadow-sm"
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
            placeholder="Pesquise por conceito ou significado (ex: 'células solares sem degradação', 'edição gênica segura', 'supercondutividade tolerante a falhas')..."
            className="w-full pl-10 pr-24 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 transition shadow-inner font-sans"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {isSearchingAsync && (
              <span className="text-[10px] text-cyan-400 font-mono animate-pulse mr-1">
                indexando...
              </span>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded bg-slate-800/60"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Neural Vector Engine Controller Banner */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-200 font-mono text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold">@xenova/transformers</span>
              <span className="text-slate-500">·</span>
              <span className="text-indigo-400">{EMBEDDING_MODEL_NAME}</span>
              <span className="text-slate-600">({EMBEDDING_DIMENSIONS}d)</span>
            </div>

            {/* Status indicator */}
            {transformerStatus.status === 'ready' && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Motor Neural Ativo ({paperVectorStore.size} artigos indexados)
              </span>
            )}

            {transformerStatus.status === 'loading' && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                <span>{transformerStatus.message}</span>
              </span>
            )}

            {transformerStatus.status === 'idle' && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                Espaço vetorial calibrado ({paperVectorStore.size} artigos indexados)
              </span>
            )}

            {transformerStatus.status === 'error' && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                Contingência vetorial 384d ativa
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {transformerStatus.status !== 'ready' && transformerStatus.status !== 'loading' && (
              <button
                onClick={handleLoadModel}
                className="px-2.5 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-200 font-medium text-[11px] transition cursor-pointer flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-indigo-400" />
                <span>Carregar Modelo ONNX WebAssembly</span>
              </button>
            )}

            <button
              onClick={handleIndexAllPapers}
              disabled={isIndexing}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium text-[11px] transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
              title="Gera embeddings densos de 384 dimensões para todo o corpus"
            >
              <RefreshCw className={`w-3 h-3 ${isIndexing ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
              <span>{isIndexing ? `Indexando ${indexingProgress}%` : 'Reindexar Corpus'}</span>
            </button>
          </div>
        </div>

        {/* Semantic Meaning Demo Queries */}
        <div className="pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Testar busca por significado conceitual (termos distintos do título):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {semanticDemoQueries.map((demo, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(demo.query);
                  setSearchMode('semantic');
                }}
                className="text-left px-2.5 py-1 rounded-md bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-slate-300 text-[11px] transition cursor-pointer group"
              >
                <span className="text-slate-200 font-medium">{demo.label}</span>
                <span className="text-slate-500 text-[10px] ml-1.5 hidden sm:inline">→ {demo.expected}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
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
                <option value="relevance" className="bg-slate-900">Relevância Semântica</option>
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
          <strong className="text-slate-200">{displayedResults.length}</strong>
          <span> artigos indexados</span>
          {searchQuery && (
            <span className="text-cyan-400 font-mono ml-2">
              · Modo: {searchMode} ({transformerStatus.status === 'ready' ? 'Xenova ONNX 384d' : 'Espaço Vetorial 384d'})
            </span>
          )}
        </div>
        <div className="text-slate-500 hidden sm:inline">
          Similaridade de Cosseno: <code className="text-slate-400">dot(q, p) / (|q| · |p|)</code>
        </div>
      </div>

      {/* Papers List */}
      <div className="space-y-3.5">
        {displayedResults.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-200">Nenhum artigo encontrado para o filtro atual.</p>
            <p className="text-xs text-slate-500 mt-1">Tente ajustar a consulta textual ou selecionar "Todas as Áreas".</p>
          </div>
        ) : (
          displayedResults.map((result) => {
            const { paper, score, semanticMatch, lexicalMatch } = result;
            const isBookmarked = savedPaperIds.includes(paper.id);
            const semanticInsight = (result as any).semanticInsight;

            return (
              <div
                key={paper.id}
                onClick={() => onSelectPaper(paper)}
                className="group relative bg-slate-900 hover:bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 sm:p-5 transition-all duration-200 shadow-md cursor-pointer flex flex-col gap-3"
              >
                {/* Header row with zero-pill typography metadata */}
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
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>{semanticMatch}% similaridade</span>
                        </span>
                        {searchMode === 'hybrid' && (
                          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                            (lexical: {lexicalMatch}%)
                          </span>
                        )}
                      </div>
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

                {/* Semantic Insight Callout when meaning matched despite low keyword overlap */}
                {searchQuery && semanticInsight && (
                  <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-md px-2.5 py-1.5 text-[11px] text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{semanticInsight}</span>
                  </div>
                )}

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

      {/* Vector Space Inspector Modal */}
      {showVectorInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800">
                  <Binary className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    Inspetor de Espaço Vetorial & Embeddings (@xenova/transformers)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Similaridade de cosseno em espaço latente denso de {EMBEDDING_DIMENSIONS} dimensões.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVectorInspector(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Model Architecture Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <span className="text-[11px] text-slate-500">Pipeline Neural</span>
                <p className="text-xs font-mono font-medium text-slate-200 mt-1">feature-extraction</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Xenova/all-MiniLM-L6-v2</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <span className="text-[11px] text-slate-500">Dimensões Vetoriais</span>
                <p className="text-xs font-mono font-medium text-indigo-300 mt-1">{EMBEDDING_DIMENSIONS} coordenadas</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Normalização L2 unitária</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <span className="text-[11px] text-slate-500">Corpus Indexado</span>
                <p className="text-xs font-mono font-medium text-emerald-300 mt-1">{paperVectorStore.size} publicações</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Indexação WebAssembly</p>
              </div>
            </div>

            {/* Active Query Vector Visualization */}
            <div className="space-y-2 bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Vetor da Consulta Atual:</span>
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {searchQuery ? `"${searchQuery.slice(0, 35)}..."` : '(vazio - digite uma busca)'}
                </span>
              </div>

              {activeQueryVector.length > 0 ? (
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] text-slate-400">
                    Amostra das 32 primeiras dimensões do vetor normalizado:
                  </div>
                  <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 font-mono text-[10px]">
                    {activeQueryVector.slice(0, 32).map((val, idx) => {
                      const intensity = Math.min(1, Math.abs(val) * 8);
                      const isPositive = val >= 0;
                      return (
                        <div
                          key={idx}
                          title={`d[${idx}]: ${val.toFixed(4)}`}
                          style={{
                            backgroundColor: isPositive
                              ? `rgba(6, 182, 212, ${Math.max(0.15, intensity)})`
                              : `rgba(239, 68, 68, ${Math.max(0.15, intensity)})`,
                          }}
                          className="h-7 rounded flex items-center justify-center text-slate-200 text-[9px] font-semibold border border-slate-800"
                        >
                          {val.toFixed(2)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3 text-center">
                  Digite uma consulta científica na barra de pesquisa para inspecionar seu vetor gerado em tempo real.
                </p>
              )}
            </div>

            {/* Mathematical Equation & Meaning explanation */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
              <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Por que a busca semântica supera a busca puramente léxica?</span>
              </h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                A busca léxica depende estritamente da correspondência exata de palavras-chave. Se o autor publicou sobre <em className="text-slate-300">"perovskite solar cells"</em> e o pesquisador buscar por <em className="text-slate-300">"energia fotovoltaica limpa"</em>, a busca tradicional falharia com 0 resultados.
              </p>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Com a indexação vetorial usando <strong className="text-indigo-300">@xenova/transformers</strong>, os textos são mapeados em um espaço semântico contínuo de 384 dimensões onde conceitos correlatos habitam a mesma vizinhança geométrica, atingindo alta similaridade de cosseno independentemente da escolha vocabular.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowVectorInspector(false)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition cursor-pointer"
              >
                Concluir Inspeção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
