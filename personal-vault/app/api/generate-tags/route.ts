import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();
    
    if (!title && !content) {
      return NextResponse.json({ error: "Title or content required" }, { status: 400 });
    }

    const text = `${title} ${content || ""}`.toLowerCase();
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'a', 'an'];
    
    const words = text.match(/\b[a-z]{3,12}\b/g) || [];
    const tags = [...new Set(words)]
      .filter(word => !commonWords.includes(word))
      .slice(0, 5);
    
    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Tag generation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}