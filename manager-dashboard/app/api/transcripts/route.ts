import { NextResponse } from "next/server";
import OpenAI from "openai";
import { conversations, sessionStore } from "@/lib/session-store";
import type { TranscriptMessage } from "@/lib/session-store";
import type { WeldySession } from "@/lib/types";

const openai = new OpenAI();

async function structureProgress(
  conversation: TranscriptMessage[],
  engineerId: string,
  engineerName: string,
): Promise<WeldySession | null> {
  const recent = conversation.slice(-20);
  const transcript = recent.map((m) => `${m.role}: ${m.text}`).join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You extract structured progress data from a car maintenance AI assistant conversation.

Given the conversation, determine:
- task_id: a slug identifier for the task (e.g. "replace-spark-plugs", "check-engine-oil"). Infer from context.
- task_title: human-readable task name (e.g. "Replace Spark Plugs")
- task_category: one of "engine", "brakes", "tyres", "dashboard", "exterior", "electrical", "slk-specific"
- current_step: which step number the engineer is currently on (1-based integer)
- total_steps: total steps in this task (integer, infer from the assistant's instructions)
- status: "active", "paused", or "completed"
- observation: brief description of what the engineer is doing right now
- current_step_text: the description of the current step as given by the assistant (e.g. "Remove the old spark plug by turning counter-clockwise")
- next_step_text: the description of the next step if known, or null if on the last step or unknown

If the conversation hasn't started a specific maintenance task yet, return { "no_task": true }.
Return valid JSON only.`,
        },
        { role: "user", content: transcript },
      ],
    });

    const raw = response.choices[0].message.content || "{}";
    const parsed = JSON.parse(raw);
    if (parsed.no_task) return null;

    const existing = sessionStore.get(engineerId);

    return {
      id: `live-${engineerId}`,
      engineerId,
      engineerName,
      taskId: parsed.task_id || "unknown",
      taskTitle: parsed.task_title || "Unknown Task",
      taskCategory: parsed.task_category || "engine",
      startTime:
        existing?.startTime ||
        conversation[0]?.timestamp ||
        new Date().toISOString(),
      endTime:
        parsed.status === "completed" ? new Date().toISOString() : null,
      status: parsed.status || "active",
      currentStep: parsed.current_step || 1,
      totalSteps: parsed.total_steps || 1,
      lastActivity: parsed.observation || "",
      currentStepText: parsed.current_step_text || undefined,
      nextStepText: parsed.next_step_text || undefined,
    };
  } catch (err) {
    console.error("[structureProgress] LLM call failed:", err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const msg = await req.json();
    const { engineerId, engineerName, role, text, timestamp } = msg;

    if (!engineerId || !text) {
      return NextResponse.json(
        { error: "engineerId and text are required" },
        { status: 400 },
      );
    }

    const convLog = conversations.get(engineerId) || [];
    convLog.push({ engineerId, engineerName, role, text, timestamp });
    conversations.set(engineerId, convLog);

    // Only call the structuring LLM on assistant messages (they contain step info)
    if (role === "assistant") {
      const structured = await structureProgress(
        convLog,
        engineerId,
        engineerName,
      );
      if (structured) {
        sessionStore.set(engineerId, structured);
        console.log(
          `[transcripts] Updated session for ${engineerName}: step ${structured.currentStep}/${structured.totalSteps} (${structured.status})`,
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[transcripts] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
