import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server" },
      { status: 500 },
    );
  }

  let text: string;
  try {
    const body = await req.json();
    text = body.text;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body. Expected { text: string }" },
      { status: 400 },
    );
  }

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing or empty 'text' field" },
      { status: 400 },
    );
  }

  try {
    const openai = new OpenAI({ apiKey });

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.trim(),
    });

    const embedding = response.data[0]?.embedding;
    if (!embedding) {
      return NextResponse.json(
        { error: "No embedding returned from OpenAI" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      embedding,
      dimensions: embedding.length,
      tokens_used: response.usage?.total_tokens ?? null,
    });
  } catch (error: unknown) {
    console.error("[embed] OpenAI embedding error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate embedding",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
