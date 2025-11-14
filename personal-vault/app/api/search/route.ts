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

    const queryEmbedding = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: query,
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
      const similarity = cosineSimilarity(embedding, noteEmbedding);
      return { ...note, similarity, type: 'note' };
    });

    const vaultResults = vaultItems.map(item => {
      const itemEmbedding = JSON.parse(item.embedding);
      const similarity = cosineSimilarity(embedding, itemEmbedding);
      return { ...item, tags: JSON.parse(item.tags), similarity, type: 'vault' };
    });

    const allResults = [...noteResults, ...vaultResults]
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