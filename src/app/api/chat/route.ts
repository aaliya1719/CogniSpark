import { NextRequest, NextResponse } from "next/server";
import { askGeminiViaAPI } from "@/lib/genai";

const SYSTEM_INSTRUCTION = `You are a helpful study assistant for engineering and CS students.

Keep responses SHORT and CLEAR (max 150 words).
Explain concepts simply using everyday analogies.
For code, explain the issue directly without long preambles.
Be encouraging but concise.
Always be direct and skip unnecessary formatting.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.message !== "string" || !body.message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const message = body.message.trim();
    const response = await askGeminiViaAPI(message, SYSTEM_INSTRUCTION);
    
    return NextResponse.json({ response });
  } catch (error: unknown) {
    console.error("AI Chat Error:", error);
    // Return more detailed error when available so the client can show actionable info
    const detail = (error && typeof error === "object" && "message" in error)
      ? (error as any).message
      : String(error);
    return NextResponse.json({ error: "Failed to reach AI Buddy", detail }, { status: 502 });
  }
}
