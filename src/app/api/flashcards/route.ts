import { NextRequest, NextResponse } from "next/server";
import { askGemini } from "@/lib/vertexai";
import { PDFParse } from "pdf-parse";

type Flashcard = {
  question: string;
  answer: string;
};

const SYSTEM_INSTRUCTION = `
You are a Flashcard Generator. 
Extract key concepts from the provided text and return EXACTLY 5 flashcards.
Format the output as a STRICT JSON array of objects with "question" and "answer" keys.
Example: [{"question": "...", "answer": "..."}]
Do not include any other text or markdown formatting.
`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfParser = new PDFParse({ data: buffer });
    const data = await pdfParser.getText();
    const text = data.text;

    await pdfParser.destroy();

    if (!text || text.length < 50) {
      return NextResponse.json({ error: "Could not extract enough text from PDF" }, { status: 400 });
    }

    const aiResponse = await askGemini(
      `Generate 5 flashcards from this text: ${text.substring(0, 10000)}`, 
      SYSTEM_INSTRUCTION
    );

    const flashcards = parseFlashcards(aiResponse);

    if (!flashcards) {
      throw new Error("AI response was not valid flashcard JSON");
    }

    return NextResponse.json({ flashcards });
  } catch (error: unknown) {
    console.error("Flashcard Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 500 });
  }
}

function parseFlashcards(responseText: string): Flashcard[] | null {
  const cleaned = responseText.replace(/```json|```/g, "").trim();
  const candidates = [cleaned];

  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    candidates.push(cleaned.slice(firstBracket, lastBracket + 1));
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        const flashcards = parsed
          .map((item) => normalizeFlashcard(item))
          .filter((item): item is Flashcard => item !== null);

        if (flashcards.length > 0) {
          return flashcards;
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

function normalizeFlashcard(item: unknown): Flashcard | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const candidate = item as Record<string, unknown>;
  const question = typeof candidate.question === "string" ? candidate.question.trim() : "";
  const answer = typeof candidate.answer === "string" ? candidate.answer.trim() : "";

  if (!question || !answer) {
    return null;
  }

  return { question, answer };
}
