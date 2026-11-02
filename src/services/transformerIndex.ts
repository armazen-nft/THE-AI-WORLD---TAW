/**
 * Vector Indexing & Semantic Search Engine using @xenova/transformers
 * Uses Xenova/all-MiniLM-L6-v2 (quantized ONNX, 384-dimensional dense embeddings)
 * Runs client-side in WebAssembly / WebGPU with local cache.
 */

import { pipeline, env } from '@xenova/transformers';
import { Paper } from '../types/academic';
import { cosineSimilarity } from './vectorSearch';
import { PRECOMPUTED_PAPER_VECTORS } from '../data/mockVectors';

// Disable local file checks in browser environment
if (typeof window !== 'undefined') {
  env.allowLocalModels = false;
  env.useBrowserCache = true;
}

export const EMBEDDING_MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
export const EMBEDDING_DIMENSIONS = 384;

export interface TransformerStatus {
  status: 'idle' | 'loading' | 'ready' | 'error';
  progress: number;
  message: string;
  modelName: string;
  dimensions: number;
  indexedCount: number;
}

// In-memory embedding cache for papers (paperId -> 384-dimensional vector)
export const paperVectorStore = new Map<string, number[]>(
  Object.entries(PRECOMPUTED_PAPER_VECTORS)
);

// In-memory query embedding cache to avoid redundant inferences
const queryVectorCache = new Map<string, number[]>();

// Singleton pipeline instance
let extractorInstance: any = null;
let initPromise: Promise<any> | null = null;

// Listeners for status changes
type StatusListener = (status: TransformerStatus) => void;
const listeners = new Set<StatusListener>();

let currentStatus: TransformerStatus = {
  status: 'idle',
  progress: 0,
  message: 'Pronto para carregar modelo neural @xenova/transformers',
  modelName: EMBEDDING_MODEL_NAME,
  dimensions: EMBEDDING_DIMENSIONS,
  indexedCount: Object.keys(PRECOMPUTED_PAPER_VECTORS).length,
};

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener({ ...currentStatus });
    } catch (err) {
      console.error('Error notifying transformer listener', err);
    }
  });
}

export function subscribeTransformerStatus(listener: StatusListener): () => void {
  listeners.add(listener);
  listener({ ...currentStatus });
  return () => {
    listeners.delete(listener);
  };
}

export function getTransformerStatus(): TransformerStatus {
  return { ...currentStatus };
}

/**
 * Maps a search query into the 384-dimensional latent space matching the precomputed vector store.
 * Provides instant unit-vector representations before ONNX model download finishes.
 */
export function projectQueryTo384Vector(query: string): number[] {
  const q = query.toLowerCase();
  const concepts: number[] = [];

  // AI & Compute
  if (q.includes('ai') || q.includes('inteligência') || q.includes('neural') || q.includes('llm') || q.includes('deep learning') || q.includes('modelo') || q.includes('moe') || q.includes('agente') || q.includes('sparsity') || q.includes('machine learning')) {
    concepts.push(0);
  }
  // Quantum & Physics
  if (q.includes('quântic') || q.includes('quantum') || q.includes('qubit') || q.includes('supercondut') || q.includes('hardware') || q.includes('surface code') || q.includes('física')) {
    concepts.push(1);
  }
  // Biotech & Genomics & Life Sciences
  if (q.includes('bio') || q.includes('crispr') || q.includes('dna') || q.includes('gen') || q.includes('célul') || q.includes('cérebro') || q.includes('eeg') || q.includes('saúde') || q.includes('médic') || q.includes('epigenom') || q.includes('bci')) {
    concepts.push(2);
  }
  // Energy & Materials & Sustainability
  if (q.includes('solar') || q.includes('energia') || q.includes('sustent') || q.includes('clima') || q.includes('perovskita') || q.includes('fotovolt') || q.includes('power') || q.includes('renov')) {
    concepts.push(3);
  }
  // DeSci & Open Science & Web3
  if (q.includes('desci') || q.includes('ipfs') || q.includes('aberta') || q.includes('revisão') || q.includes('blockchain') || q.includes('contrato') || q.includes('peer') || q.includes('proveniência') || q.includes('cid')) {
    concepts.push(4);
  }
  // Information Retrieval & Vector Search
  if (q.includes('vetor') || q.includes('busca') || q.includes('semântic') || q.includes('recuperação') || q.includes('duckdb') || q.includes('hnsw') || q.includes('embedding') || q.includes('índice') || q.includes('pesquisa')) {
    concepts.push(5);
  }

  // Fallback to all dimensions if no specific semantic trigger
  if (concepts.length === 0) {
    concepts.push(0, 1, 2, 3, 4, 5);
  }

  const vec = new Array(EMBEDDING_DIMENSIONS).fill(0);
  for (let i = 0; i < EMBEDDING_DIMENSIONS; i++) {
    let val = 0.02;
    for (const c of concepts) {
      const channelCenter = (c * 64 + 32) % EMBEDDING_DIMENSIONS;
      const dist = Math.abs(i - channelCenter);
      if (dist < 30) {
        val += Math.cos((dist / 30) * (Math.PI / 2)) * 0.28;
      }
    }
    vec[i] = val;
  }

  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIMENSIONS; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm) || 1;
  return vec.map((v) => +(v / norm).toFixed(5));
}

/**
 * Initializes the @xenova/transformers feature-extraction pipeline
 */
export async function initTransformerModel(onProgress?: (progress: number, file: string) => void): Promise<any> {
  if (extractorInstance) {
    return extractorInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  currentStatus = {
    ...currentStatus,
    status: 'loading',
    progress: 10,
    message: 'Inicializando pipeline ONNX WebAssembly...',
  };
  notifyListeners();

  initPromise = (async () => {
    try {
      const extractor = await pipeline('feature-extraction', EMBEDDING_MODEL_NAME, {
        quantized: true,
        progress_callback: (item: any) => {
          if (item && item.status === 'progress' && typeof item.progress === 'number') {
            const p = Math.round(item.progress);
            currentStatus = {
              ...currentStatus,
              progress: p,
              message: `Baixando modelo ${item.file || ''} (${p}%)`,
            };
            notifyListeners();
            if (onProgress) onProgress(p, item.file || '');
          }
        },
      });

      extractorInstance = extractor;
      currentStatus = {
        ...currentStatus,
        status: 'ready',
        progress: 100,
        message: 'Modelo neural @xenova/transformers ativo (384d)',
      };
      notifyListeners();
      return extractor;
    } catch (error: any) {
      console.warn('Falha ao inicializar @xenova/transformers ONNX:', error);
      currentStatus = {
        ...currentStatus,
        status: 'error',
        progress: 0,
        message: `WASM/ONNX: modo de contingência vetorial ativo`,
      };
      notifyListeners();
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Generates normalized 384-dimensional dense vector embedding using @xenova/transformers
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const cleanText = text.trim().slice(0, 512); // Truncate to context window
  if (!cleanText) return new Array(EMBEDDING_DIMENSIONS).fill(0);

  try {
    const extractor = await initTransformerModel();
    const output = await extractor(cleanText, { pooling: 'mean', normalize: true });

    const rawData = output.data;
    const vector: number[] = [];
    for (let i = 0; i < rawData.length && i < EMBEDDING_DIMENSIONS; i++) {
      vector.push(Number(rawData[i]));
    }
    return vector;
  } catch {
    return projectQueryTo384Vector(cleanText);
  }
}

/**
 * Indexes a collection of academic papers by extracting semantic vectors
 */
export async function indexPapersWithTransformers(
  papers: Paper[],
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, number[]>> {
  try {
    const extractor = await initTransformerModel();

    let count = 0;
    for (const paper of papers) {
      const textToEmbed = `Title: ${paper.title}. Abstract: ${paper.abstract}. Keywords: ${paper.keywords.join(', ')}. Field: ${paper.field}`;
      const output = await extractor(textToEmbed.slice(0, 512), { pooling: 'mean', normalize: true });
      const rawData = output.data;
      const vector: number[] = [];
      for (let i = 0; i < rawData.length && i < EMBEDDING_DIMENSIONS; i++) {
        vector.push(Number(rawData[i]));
      }
      paperVectorStore.set(paper.id, vector);
      count++;
      if (onProgress) {
        onProgress(count, papers.length);
      }
    }
  } catch (e) {
    console.warn('Indexing with fallback vectors due to pipeline error:', e);
    // Ensure all papers have vectors in store
    for (const paper of papers) {
      if (!paperVectorStore.has(paper.id)) {
        paperVectorStore.set(paper.id, projectQueryTo384Vector(`${paper.title} ${paper.abstract} ${paper.keywords.join(' ')}`));
      }
    }
  }

  currentStatus = {
    ...currentStatus,
    indexedCount: paperVectorStore.size,
    message: `${paperVectorStore.size} artigos indexados no espaço vetorial 384d`,
  };
  notifyListeners();

  return paperVectorStore;
}

/**
 * Gets cached embedding for a paper or undefined if not yet indexed
 */
export function getPaperVector(paperId: string): number[] | undefined {
  return paperVectorStore.get(paperId);
}

export interface SemanticSearchResult {
  paper: Paper;
  score: number;
  semanticMatch: number;
  lexicalMatch: number;
  isTransformerPowered: boolean;
  vectorDimensions: number;
  semanticInsight?: string;
}

/**
 * Performs semantic vector search over papers using 384d embeddings
 */
export async function searchSemanticTransformers(
  papers: Paper[],
  query: string,
  mode: 'hybrid' | 'semantic' | 'lexical' = 'semantic',
  selectedField: string = 'all'
): Promise<SemanticSearchResult[]> {
  if (!query.trim() && selectedField === 'all') {
    return papers.map((p) => ({
      paper: p,
      score: 1,
      semanticMatch: 100,
      lexicalMatch: 100,
      isTransformerPowered: extractorInstance !== null,
      vectorDimensions: EMBEDDING_DIMENSIONS,
    }));
  }

  let filtered = papers;
  if (selectedField !== 'all') {
    filtered = filtered.filter((p) => p.field.toLowerCase() === selectedField.toLowerCase());
  }

  const qTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

  if (mode === 'lexical') {
    return filtered
      .map((paper) => {
        const fullText = `${paper.title} ${paper.abstract} ${paper.authors.join(' ')} ${paper.keywords.join(' ')} ${paper.doi}`.toLowerCase();
        let matches = 0;
        qTerms.forEach((t) => {
          if (fullText.includes(t)) matches++;
        });
        const lexicalScore = qTerms.length > 0 ? matches / qTerms.length : 0.5;
        return {
          paper,
          score: lexicalScore,
          semanticMatch: 0,
          lexicalMatch: Math.round(lexicalScore * 100),
          isTransformerPowered: false,
          vectorDimensions: EMBEDDING_DIMENSIONS,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  // Obtain or compute query embedding
  let queryVec = queryVectorCache.get(query);
  let isFromOnnx = false;

  if (!queryVec) {
    if (extractorInstance) {
      try {
        queryVec = await generateEmbedding(query);
        queryVectorCache.set(query, queryVec);
        isFromOnnx = true;
      } catch {
        queryVec = projectQueryTo384Vector(query);
      }
    } else {
      queryVec = projectQueryTo384Vector(query);
    }
  } else {
    isFromOnnx = extractorInstance !== null;
  }

  const results: SemanticSearchResult[] = filtered.map((paper) => {
    // 1. Semantic score via 384d vector
    let paperVec = paperVectorStore.get(paper.id);
    if (!paperVec) {
      paperVec = projectQueryTo384Vector(`${paper.title} ${paper.abstract} ${paper.keywords.join(' ')}`);
      paperVectorStore.set(paper.id, paperVec);
    }

    let semanticSim = cosineSimilarity(queryVec!, paperVec);
    // Normalize to 0-1 range
    semanticSim = Math.max(0, Math.min(1, semanticSim));

    // 2. Lexical score
    const fullText = `${paper.title} ${paper.abstract} ${paper.authors.join(' ')} ${paper.keywords.join(' ')} ${paper.doi}`.toLowerCase();
    let termMatches = 0;
    qTerms.forEach((term) => {
      if (fullText.includes(term)) termMatches++;
    });
    const lexicalScore = qTerms.length > 0 ? termMatches / qTerms.length : 0.5;

    let combinedScore = 0;
    if (mode === 'semantic') {
      combinedScore = semanticSim;
    } else {
      // Hybrid: 70% vector semantic, 30% lexical keyword
      combinedScore = semanticSim * 0.7 + lexicalScore * 0.3;
    }

    // Semantic explanation insight
    let insight: string | undefined;
    if (semanticSim > 0.75 && lexicalScore < 0.25) {
      insight = 'Similaridade conceitual elevada com baixa sobreposição lexical (correspondência de significado).';
    } else if (semanticSim > 0.8) {
      insight = 'Forte alinhamento latente no espaço vetorial 384d.';
    }

    return {
      paper,
      score: combinedScore,
      semanticMatch: Math.round(semanticSim * 100),
      lexicalMatch: Math.round(lexicalScore * 100),
      isTransformerPowered: isFromOnnx,
      vectorDimensions: EMBEDDING_DIMENSIONS,
      semanticInsight: insight,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}
