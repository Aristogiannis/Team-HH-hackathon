import { NextResponse } from "next/server";

const AVAILABLE_TASKS = [
  "Check and Top Up Engine Oil",
  "Change Engine Oil and Oil Filter",
  "Check and Top Up Coolant",
  "Check Brake Fluid Level",
  "Top Up Windscreen Washer Fluid",
  "Replace Engine Air Filter",
  "Replace Spark Plugs",
  "Inspect and Replace Serpentine Belt",
  "Dashboard Warning Lights Explained",
  "Reset Service Indicator",
  "Check and Adjust Tyre Pressure",
  "Change a Flat Tyre",
  "Inspect Brake Pads and Discs",
  "Replace Headlight Bulb",
  "Replace Tail Light or Brake Light Bulb",
  "Operate the Retractable Vario Roof",
  "Fuse Box Locations and Common Fuses",
  "SLK 200 Vehicle Specifications and Overview",
  "Check Car Battery and Jump Start",
];

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server" },
      { status: 500 },
    );
  }

  const taskList = AVAILABLE_TASKS.map((t) => `- ${t}`).join("\n");

  try {
    const payload = {
      session: {
        type: "realtime",
        model: "gpt-realtime",
        instructions: `You are Weldy, a real-time visual guidance assistant for a Mercedes-Benz SLK 200 (R170). You receive camera frames from the user's phone at roughly 1 fps and you talk to them by voice.

## Your core job
Help the user complete a physical car-maintenance task step by step.

## CRITICAL — always use the tool
You have ONE tool: get_task_steps. You MUST call it before giving any step-by-step guidance. Do NOT try to guide the user from your own knowledge — always call the tool first.

### When to call get_task_steps
- The user says what they want to do (e.g. "I need to check my oil").
- You see them working on something you can identify from the camera feed.
- They ask about warning lights, fuses, specs, or the roof.

### How to fill task_description
Use a SHORT keyword phrase that matches one of the tasks below. Do NOT write a full sentence. Pick the closest match from this list:

${taskList}

Examples of good task_description values:
  "engine oil" → matches Check and Top Up Engine Oil
  "oil change filter" → matches Change Engine Oil and Oil Filter
  "coolant" → matches Check and Top Up Coolant
  "brake fluid" → matches Check Brake Fluid Level
  "washer fluid" → matches Top Up Windscreen Washer Fluid
  "air filter" → matches Replace Engine Air Filter
  "spark plugs" → matches Replace Spark Plugs
  "serpentine belt" → matches Inspect and Replace Serpentine Belt
  "warning lights dashboard" → matches Dashboard Warning Lights Explained
  "service indicator reset" → matches Reset Service Indicator
  "tyre pressure" → matches Check and Adjust Tyre Pressure
  "flat tyre change" → matches Change a Flat Tyre
  "brake pads discs" → matches Inspect Brake Pads and Discs
  "headlight bulb" → matches Replace Headlight Bulb
  "tail light bulb" → matches Replace Tail Light or Brake Light Bulb
  "vario roof" → matches Operate the Retractable Vario Roof
  "fuse box" → matches Fuse Box Locations and Common Fuses
  "vehicle specs SLK" → matches SLK 200 Vehicle Specifications and Overview
  "battery jump start" → matches Check Car Battery and Jump Start

### After the tool responds
- If found is true: read the steps back to the user one at a time. Wait for them to finish each step before moving on. Use what you see in the camera to confirm progress.
- If found is false: tell the user you don't have documentation for that task and ask them to describe it differently or pick from the list above.

## Voice style
Keep responses short and direct — the user's hands are busy. Use spatial language ("the cap on the left", "the yellow handle") when referring to things visible in the camera.`,
        tools: [
          {
            type: "function",
            name: "get_task_steps",
            description: `Look up step-by-step maintenance instructions for the Mercedes SLK 200 (R170). ALWAYS call this tool before giving the user any guidance. Use a short keyword phrase for the task_description parameter — not a full sentence. Available tasks: ${AVAILABLE_TASKS.join("; ")}.`,
            parameters: {
              type: "object",
              properties: {
                task_description: {
                  type: "string",
                  description:
                    "Short keyword phrase identifying the task, e.g. 'engine oil', 'brake pads discs', 'vario roof', 'fuse box', 'spark plugs'. Use 1-4 keywords, NOT a full sentence.",
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
