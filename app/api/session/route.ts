import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server" },
      { status: 500 },
    );
  }

  try {
    const payload = {
      session: {
        type: "realtime",
        model: "gpt-realtime",
        instructions:
          "You are a helpful realtime voice and vision assistant. The user is streaming their camera feed to you at ~1 frame per second. When the user asks about what you see, describe what is visible in the most recent image(s). Be concise and conversational.",
        audio: {
          output: {
            voice: "marin",
          },
        },
      },
    };

    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("[session] OpenAI error:", r.status, text);
      return NextResponse.json(
        { error: "Failed to mint client secret", detail: text },
        { status: 500 },
      );
    }

    const data = await r.json();
    const value = data.value ?? data.client_secret?.value;
    const expires_at = data.expires_at ?? data.client_secret?.expires_at;

    return NextResponse.json({ value, expires_at });
  } catch (error: unknown) {
    console.error("[session] Token generation error:", error);
    return NextResponse.json(
      { error: "Token generation error", detail: String(error) },
      { status: 500 },
    );
  }
}
