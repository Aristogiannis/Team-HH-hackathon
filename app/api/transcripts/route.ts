import { NextResponse } from "next/server";

const DASHBOARD_API = "http://localhost:3001/api/transcripts";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(DASHBOARD_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[proxy] Failed to forward transcript:", err);
    return NextResponse.json({ error: "proxy failed" }, { status: 502 });
  }
}
