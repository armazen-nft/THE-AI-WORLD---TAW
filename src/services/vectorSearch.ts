import { Paper } from '../types/academic';
import {
  getTransformerStatus,
  subscribeTransformerStatus,
  initTransformerModel,
  generateEmbedding,
  indexPapersWithTransformers,
  searchSemanticTransformers,
  getPaperVector,
  projectQueryTo384Vector,
  paperVectorStore,
  EMBEDDING_MODEL_NAME,
  EMBEDDING_DIMENSIONS,
  type TransformerStatus,
  type SemanticSearchResult,
} from './transformerIndex';

export {
  getTransformerStatus,
  subscribeTransformerStatus,
  initTransformerModel,
  generateEmbedding,
  indexPapersWithTransformers,
  searchSemanticTransformers,
  getPaperVector,
  projectQueryTo384Vector,
  paperVectorStore,
  EMBEDDING_MODEL_NAME,
  EMBEDDING_DIMENSIONS,
  type TransformerStatus,
  type SemanticSearchResult,
};

// Compute cosine similarity between two numeric vectors of any dimension (e.g. 5D or 384D)
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Map textual search query into a 5D semantic latent space representation for instant synchronous fallback
// [0: AI/Compute, 1: Quantum/Hardware, 2: Biotech/LifeSciences, 3: Sustainability/Energy, 4: DeSci/Protocols]
export function projectQueryToVector(query: string): number[] {
  const q = query.toLowerCase();

  let aiScore = 0.1;
  let quantScore = 0.1;
  let bioScore = 0.1;
  let sustainScore = 0.1;
  let desciScore = 0.1;

  if (
    q.includes('ai') ||
    q.includes('inteligência') ||
    q.includes('llm') ||
    q.includes('deep learning') ||
    q.includes('moe') ||
    q.includes('modelo') ||
    q.includes('agente') ||
    q.includes('neural') ||
    q.includes('machine learning')
  ) {
    aiScore += 0.85;
  }
  if (
    q.includes('quântic') ||
    q.includes('quantum') ||
    q.includes('qubit') ||
    q.includes('hardware') ||
    q.includes('supercondut')
  ) {
    quantScore += 0.85;
  }
  if (
    q.includes('bio') ||
    q.includes('crispr') ||
    q.includes('dna') ||
    q.includes('gen') ||
    q.includes('célul') ||
    q.includes('cérebro') ||
    q.includes('eeg') ||
    q.includes('saúde') ||
    q.includes('médic')
  ) {
    bioScore += 0.85;
  }
  if (
    q.includes('solar') ||
    q.includes('energia') ||
    q.includes('sustent') ||
    q.includes('clima') ||
    q.includes('perovskita') ||
    q.includes('fotovolt') ||
    q.includes('power')
  ) {
    sustainScore += 0.85;
  }
  if (
    q.includes('desci') ||
    q.includes('ipfs') ||
    q.includes('aberta') ||
    q.includes('revisão') ||
    q.includes('blockchain') ||
    q.includes('contrato') ||
    q.includes('cid') ||
    q.includes('descentraliz')
  ) {
    desciScore += 0.85;
  }

  // Normalize
  const norm = Math.sqrt(aiScore ** 2 + quantScore ** 2 + bioScore ** 2 + sustainScore ** 2 + desciScore ** 2) || 1;
  return [
    +(aiScore / norm).toFixed(3),
    +(quantScore / norm).toFixed(3),
    +(bioScore / norm).toFixed(3),
    +(sustainScore / norm).toFixed(3),
    +(desciScore / norm).toFixed(3),
  ];
}

export interface SearchResult {
  paper: Paper;
  score: number;
  semanticMatch: number;
  lexicalMatch: number;
  isTransformerPowered?: boolean;
}

/**
 * Fast synchronous search combining cosine similarity and lexical terms.
 * If 384d @xenova/transformers vector is available in memory for query, it is used.
 */
export function searchPapers(
  papers: Paper[],
  query: string,
  mode: 'hybrid' | 'semantic' | 'lexical' = 'hybrid',
  selectedField: string = 'all'
): SearchResult[] {
  if (!query.trim() && selectedField === 'all') {
    return papers.map((p) => ({ paper: p, score: 1, semanticMatch: 100, lexicalMatch: 100 }));
  }

  const queryVector = projectQueryToVector(query);
  const qTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

  let filtered = papers;
  if (selectedField !== 'all') {
    filtered = filtered.filter((p) => p.field.toLowerCase() === selectedField.toLowerCase());
  }

  const results: SearchResult[] = filtered.map((paper) => {
    // 1. Semantic Cosine Similarity
    const semanticSim = Math.max(0, cosineSimilarity(queryVector, paper.embeddingVector));

    // 2. Lexical Matching
    const fullText = `${paper.title} ${paper.abstract} ${paper.authors.join(' ')} ${paper.keywords.join(' ')} ${paper.doi} ${paper.journalOrConference}`.toLowerCase();
    let termMatches = 0;
    qTerms.forEach((term) => {
      if (fullText.includes(term)) termMatches++;
    });
    const lexicalScore = qTerms.length > 0 ? termMatches / qTerms.length : 0.5;

    // Combine based on mode
    let combinedScore = 0;
    if (mode === 'semantic') {
      combinedScore = semanticSim;
    } else if (mode === 'lexical') {
      combinedScore = lexicalScore;
    } else {
      // Hybrid retrieval
      combinedScore = semanticSim * 0.65 + lexicalScore * 0.35;
    }

    return {
      paper,
      score: combinedScore,
      semanticMatch: Math.round(semanticSim * 100),
      lexicalMatch: Math.round(lexicalScore * 100),
      isTransformerPowered: false,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}
