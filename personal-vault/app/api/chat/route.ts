import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HfInference } from "@huggingface/inference";

const token = process.env.HUGGINGFACE_TOKEN;
if (!token) {
  throw new Error("HUGGINGFACE_TOKEN is required");
}

const hf = new HfInference(token);

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Generate embedding for user question
    const questionEmbedding = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: message,
    });

    const questionVector: number[] = Array.isArray(questionEmbedding)
      ? (Array.isArray(questionEmbedding[0]) ? questionEmbedding[0] : questionEmbedding)
      : [questionEmbedding];

    // Get all vault items
    const items = await prisma.vaultItem.findMany();

    // Find most relevant notes
    const relevantNotes = items
      .map(item => {
        const embedding = JSON.parse(item.embedding);
        const similarity = cosineSimilarity(questionVector, embedding);
        return { ...item, similarity };
      })
      .filter(item => item.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    if (relevantNotes.length === 0) {
      return NextResponse.json({
        response: "I don't have any relevant information in your vault about that topic. Try adding some notes first!"
      });
    }

    // Create simple response based on most relevant note
    const topNote = relevantNotes[0];
    const response = `Based on your notes about "${topNote.title}": ${topNote.content.substring(0, 200)}${topNote.content.length > 200 ? '...' : ''}`;

    return NextResponse.json({
      response,
      sources: relevantNotes.map(note => ({
        title: note.title,
        similarity: Math.round(note.similarity * 100)
      }))
    });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}