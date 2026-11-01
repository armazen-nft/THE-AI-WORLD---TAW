import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Search,
  RotateCcw,
  Bot,
  User,
  ExternalLink,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  groundingSources?: { title: string; uri: string }[];
}

export const GeminiChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text: 'Olá! Sou o assistente científico e auditor metodológico do DataSphere Academic. Posso auditar hipóteses, revisar artigos, consultar a literatura recente com Google Search Grounding ou auxiliar na modelagem de bioinformática e DeSci. Como posso colaborar com sua investigação hoje?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rolePreset, setRolePreset] = useState<'reviewer' | 'desci' | 'biotech'>('reviewer');
  const [modelChoice, setModelChoice] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');

    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, newMsg];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({ role: m.role, text: m.text })),
          rolePreset,
          useSearchGrounding,
          model: modelChoice,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Sem resposta do assistente.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: data.groundingSources || [],
      };
      setMessages([...updatedHistory, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        text: 'Desculpe, ocorreu uma instabilidade de conexão com o motor de inferência. O acervo local continua disponível para consulta.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...updatedHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'init-1',
        role: 'assistant',
        text: 'Conversa reiniciada. Qual novo tópico acadêmico deseja investigar?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <span>Chatbot Acadêmico Multi-Turno & Auditor Científico</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {modelChoice}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Assistente de pesquisa com papéis especializados, persistência de contexto e Google Search Grounding.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer border border-slate-700"
              title="Limpar histórico da conversa"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Conversa</span>
            </button>
          </div>
        </div>

        {/* Configuration Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          {/* Role selector */}
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Papel Especializado:</label>
            <select
              value={rolePreset}
              onChange={(e) => setRolePreset(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="reviewer">Revisor Científico Sênior (Nature / Science)</option>
              <option value="desci">Especialista em Ciência Descentralizada (DeSci & IPFS)</option>
              <option value="biotech">Bioinformata & Biologia Estrutural (AlphaFold/PDB)</option>
            </select>
          </div>

          {/* Model selector */}
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Modelo Gemini:</label>
            <select
              value={modelChoice}
              onChange={(e) => setModelChoice(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer font-mono"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Equilibrado & Rápido)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Rápido)</option>
              <option value="gemini-4-argon">gemini-4-argon (Raciocínio Complexo)</option>
            </select>
          </div>

          {/* Search grounding toggle */}
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg w-full hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={useSearchGrounding}
                onChange={(e) => setUseSearchGrounding(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
              />
              <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-xs">Google Search Grounding (Web Atualizada)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[520px]">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-cyan-400 border border-slate-700'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-xl p-4 text-xs leading-relaxed space-y-2 ${
                    isUser
                      ? 'bg-indigo-600/90 text-white'
                      : 'bg-slate-950/80 text-slate-200 border border-slate-800/80'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Grounding Sources (Search Results) */}
                  {msg.groundingSources && msg.groundingSources.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-1">
                        <Search className="w-3 h-3 text-cyan-400" />
                        <span>Fontes Verificadas (Google Search Grounding):</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {msg.groundingSources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline bg-slate-900 px-2 py-0.5 rounded border border-slate-800 max-w-xs truncate"
                          >
                            <span className="truncate">{source.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`text-[10px] ${isUser ? 'text-indigo-200' : 'text-slate-500'} text-right`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-slate-400 mr-auto max-w-md bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-slate-400 ml-1">
                  Consultando literatura científica...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Pergunte ao ${
              rolePreset === 'reviewer'
                ? 'Revisor Científico'
                : rolePreset === 'desci'
                ? 'Especialista em DeSci'
                : 'Bioinformata'
            }...`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-md shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
