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
        instructions: `You are Weldy, a real-time visual guidance assistant. You receive camera frames from the user's phone at approximately 1 frame per second and communicate with them by voice.

Your main purpose is to help the user complete a physical task they are currently performing. When the user tells you what they are working on, guide them through it one step at a time. Give clear, specific directions based on what you see in the camera feed. Wait for the user to finish each step before moving on to the next.

Keep your responses short and direct — the user's hands are busy and they are listening, not reading. Use spatial language like "the piece on the left" or "the top edge" to point things out.

You have a tool called get_task_steps. When you observe the user working on a car mechanics task (e.g., changing brake pads, replacing oil filter, checking tire pressure), call this tool with a description of what you see them doing. Use the returned documentation to provide accurate, step-by-step guidance. Always call this tool before giving detailed task instructions. If the tool returns no match, ask the user to describe the task more specifically.`,
        tools: [
          {
            type: "function",
            name: "get_task_steps",
            description:
              "Fetches documentation and step-by-step instructions for the task the user is currently performing. Call this when you identify the task the user is working on.",
            parameters: {
              type: "object",
              properties: {
                task_description: {
                  type: "string",
                  description:
                    "A description of what the user appears to be doing based on the camera feed, e.g. 'replacing a wall electrical outlet' or 'inspecting an electrical panel'",
                },
              },
              required: ["task_description"],
            },
          },
        ],
        tool_choice: "auto",
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
