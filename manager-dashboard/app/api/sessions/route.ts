import { NextResponse } from "next/server";
import { sessionStore } from "@/lib/session-store";

export async function GET() {
  return NextResponse.json(Array.from(sessionStore.values()));
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
