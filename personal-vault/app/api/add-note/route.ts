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
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const embeddingResponse = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: content,
    });

    // Extract vector cleanly
    const embedding: number[] = Array.isArray(embeddingResponse)
      ? (Array.isArray(embeddingResponse[0]) ? embeddingResponse[0] : embeddingResponse)
      : [embeddingResponse];

    const note = await prisma.note.create({
      data: {
        title,
        content,
        embedding: JSON.stringify(embedding),  
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("Embedding Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
