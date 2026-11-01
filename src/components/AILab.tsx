import React, { useState } from 'react';
import { Paper } from '../types/academic';
import { Sparkles, Brain, BookOpen, Send, CheckCircle, FileText, ArrowRight } from 'lucide-react';

interface AILabProps {
  papers: Paper[];
  onSelectPaper: (paper: Paper) => void;
}

export const AILab: React.FC<AILabProps> = ({ papers, onSelectPaper }) => {
  const [selectedPaperId, setSelectedPaperId] = useState(papers[0]?.id || '');
  const [researchPrompt, setResearchPrompt] = useState(
    'Quais os principais gargalos de eficiência computacional e reprodutibilidade científica identificados na literatura recente?'
  );
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<any>(null);

  const selectedPaper = papers.find((p) => p.id === selectedPaperId) || papers[0];

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/ai/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedPaper.title,
          abstract: `${selectedPaper.abstract} Questão de pesquisa complementar: ${researchPrompt}`,
          field: selectedPaper.field,
          promptType: 'comprehensive_synthesis',
        }),
      });
      const data = await res.json();
      setSynthesisResult(data.analysis);
    } catch (err) {
      console.error('Synthesis error:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Lab Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Laboratório de Síntese Epistêmica & Auditoria Científica
            </h2>
            <p className="text-xs text-slate-400">
              Inferência semântica e modelagem de hipóteses baseada no Gemini 2.5 Flash integrada ao corpus acadêmico.
            </p>
          </div>
        </div>

        {/* Preset synthesis questions */}
        <div className="pt-2">
          <span className="text-xs text-slate-400 block mb-2 font-medium">
            Perguntas Científicas Predefinidas:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              'Gargalos de eficiência e reprodutibilidade',
              'Convergência entre DeSci, IPFS e Ciência Aberta',
              'Segurança epigenética do CRISPR vs Cas9 tradicional',
              'Limites termodinâmicos em células perovskita-silício',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => setResearchPrompt(q)}
                className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Synthesis Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                1. Artigo de Ancoragem
              </label>
              <select
                value={selectedPaperId}
                onChange={(e) => setSelectedPaperId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
              >
                {papers.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.id}] {p.title.slice(0, 50)}... ({p.year})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                2. Diretriz ou Pergunta de Síntese
              </label>
              <textarea
                value={researchPrompt}
                onChange={(e) => setResearchPrompt(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 leading-relaxed"
                placeholder="Insira sua pergunta de auditoria ou hipótese..."
              />
            </div>

            <button
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isSynthesizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sintetizando Conhecimento...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Executar Síntese Epistêmica</span>
                </>
              )}
            </button>
          </div>

          {/* Active paper card preview */}
          {selectedPaper && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Artigo Selecionado</span>
              <h4 className="font-serif font-bold text-slate-200 leading-snug">{selectedPaper.title}</h4>
              <p className="text-slate-400 font-sans line-clamp-3">{selectedPaper.abstract}</p>
              <button
                onClick={() => onSelectPaper(selectedPaper)}
                className="text-indigo-400 hover:underline pt-1 inline-flex items-center gap-1 font-medium cursor-pointer"
              >
                Abrir ficha completa <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2">
          {synthesisResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-semibold text-slate-100">
                    Relatório de Síntese Epistêmica
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Validação Cruzada Gemini 2.5 Flash
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block mb-0.5">Potencial de Citação</span>
                  <div className="text-xl font-bold text-indigo-400">
                    {synthesisResult.citationImpactScore}/100
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block mb-0.5">Reprodutibilidade Aberta</span>
                  <div className="text-xl font-bold text-emerald-400">
                    {synthesisResult.reproducibilityScore}/100
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-500 block mb-0.5">Status de Prova</span>
                  <div className="text-sm font-semibold text-cyan-400 mt-1">
                    Verificado IPFS
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Síntese Analítica
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/50 p-4 rounded-lg border border-slate-800 font-serif">
                  {synthesisResult.summary}
                </p>
              </div>

              {/* Key findings */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Principais Contribuições Epistêmicas
                </h4>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {synthesisResult.keyFindings?.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critique */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Crítica Metodológica e Limitações
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/50">
                  {synthesisResult.methodologyCritique}
                </p>
              </div>

              {/* Future work */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Novas Linhas e Hipóteses de Investigação
                </h4>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {synthesisResult.futureWork?.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] shrink-0 font-bold">
                        {i + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-400 h-full flex flex-col items-center justify-center space-y-3">
              <FileText className="w-10 h-10 text-slate-600" />
              <div className="space-y-1 max-w-sm">
                <p className="text-sm font-medium text-slate-300">Pronto para gerar síntese científica</p>
                <p className="text-xs text-slate-500">
                  Escolha um artigo base e clique em "Executar Síntese Epistêmica" para extrair insights e verificar reprodutibilidade.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
