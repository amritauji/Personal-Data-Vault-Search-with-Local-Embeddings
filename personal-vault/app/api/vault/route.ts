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
    const { title, content, tags, type, category } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const textForEmbedding = `${title} ${content || ""} ${tags?.join(" ") || ""}`;
    
    const embeddingResponse = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: textForEmbedding,
    });

    const embedding: number[] = Array.isArray(embeddingResponse)
      ? (Array.isArray(embeddingResponse[0]) ? embeddingResponse[0] : embeddingResponse)
      : [embeddingResponse];

    const vaultItem = await prisma.vaultItem.create({
      data: {
        title,
        content: content || "",
        tags: JSON.stringify(tags || []),
        type: type || "document",
        category: category || "Recent files",
        embedding: JSON.stringify(embedding),
      },
    });

    return NextResponse.json({ success: true, item: vaultItem });
  } catch (error) {
    console.error("Vault Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const items = await prisma.vaultItem.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formattedItems = items.map(item => ({
      ...item,
      tags: JSON.parse(item.tags),
      lastAccessed: new Date(item.createdAt).toLocaleDateString()
    }));

    return NextResponse.json({ items: formattedItems });
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.vaultItem.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}