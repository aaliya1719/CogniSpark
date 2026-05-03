import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function askGeminiViaAPI(
  prompt: string,
  systemInstruction?: string
) {
  // Use gemini-flash-latest which works with the API key
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: systemInstruction,
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  if (!text || text.trim().length === 0) {
    throw new Error("Gemini API returned no text response");
  }

  return text;
}
