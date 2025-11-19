import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HfInference } from "@huggingface/inference";

const token = process.env.HUGGINGFACE_TOKEN;
if (!token) {
  throw new Error("HUGGINGFACE_TOKEN is required");
}
const hf = new HfInference(token);

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    // Enhance query with synonyms and variations
    const enhancedQuery = enhanceQuery(query);

    const queryEmbedding = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: enhancedQuery,
    });

    const embedding: number[] = Array.isArray(queryEmbedding)
      ? (Array.isArray(queryEmbedding[0]) ? queryEmbedding[0] : queryEmbedding)
      : [queryEmbedding];

    const [notes, vaultItems] = await Promise.all([
      prisma.note.findMany(),
      prisma.vaultItem.findMany()
    ]);
    
    const noteResults = notes.map(note => {
      const noteEmbedding = JSON.parse(note.embedding);
      const semanticSimilarity = cosineSimilarity(embedding, noteEmbedding);
      const textSimilarity = calculateTextSimilarity(query.toLowerCase(), note.content.toLowerCase());
      const titleBoost = note.title.toLowerCase().includes(query.toLowerCase()) ? 0.2 : 0;
      const finalScore = (semanticSimilarity * 0.7) + (textSimilarity * 0.2) + titleBoost;
      return { ...note, similarity: finalScore, type: 'note' };
    });

    const vaultResults = vaultItems.map(item => {
      const itemEmbedding = JSON.parse(item.embedding);
      const semanticSimilarity = cosineSimilarity(embedding, itemEmbedding);
      const textSimilarity = calculateTextSimilarity(query.toLowerCase(), (item.content || '').toLowerCase());
      const titleBoost = item.title.toLowerCase().includes(query.toLowerCase()) ? 0.2 : 0;
      const tagBoost = JSON.parse(item.tags).some(tag => tag.toLowerCase().includes(query.toLowerCase())) ? 0.15 : 0;
      const finalScore = (semanticSimilarity * 0.65) + (textSimilarity * 0.2) + titleBoost + tagBoost;
      return { ...item, tags: JSON.parse(item.tags), similarity: finalScore, type: 'vault' };
    });

    const allResults = [...noteResults, ...vaultResults]
      .filter(result => result.similarity > 0.1)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    return NextResponse.json({ results: allResults });
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

function enhanceQuery(query: string): string {
  const synonyms = {
    'ai': 'artificial intelligence machine learning',
    'ml': 'machine learning artificial intelligence',
    'tech': 'technology technical',
    'dev': 'development developer programming',
    'code': 'programming development software'
  };
  
  let enhanced = query;
  Object.entries(synonyms).forEach(([key, value]) => {
    if (query.toLowerCase().includes(key)) {
      enhanced += ' ' + value;
    }
  });
  
  return enhanced;
}

function calculateTextSimilarity(query: string, text: string): number {
  const queryWords = query.split(' ').filter(w => w.length > 2);
  const textWords = text.split(' ');
  
  let matches = 0;
  queryWords.forEach(word => {
    if (textWords.some(textWord => textWord.includes(word) || word.includes(textWord))) {
      matches++;
    }
  });
  
  return queryWords.length > 0 ? matches / queryWords.length : 0;
}