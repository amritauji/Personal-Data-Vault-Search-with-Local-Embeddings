import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Notes Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}