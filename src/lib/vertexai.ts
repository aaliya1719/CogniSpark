import { VertexAI } from '@google-cloud/vertexai';

const project = process.env.GOOGLE_CLOUD_PROJECT || 'golden-shine-495107-e5';
const location = 'us-central1';

const vertexAI = new VertexAI({ project, location });

export const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    maxOutputTokens: 2048,
    temperature: 0.7,
    topP: 0.8,
  },
});

export async function askGemini(prompt: string, systemInstruction?: string) {
  const model = systemInstruction 
    ? vertexAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction 
      })
    : generativeModel;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.candidates
    ?.map((candidate) => candidate.content.parts.map((part) => ("text" in part ? part.text : "")).join(""))
    .find((candidateText) => candidateText.trim().length > 0);

  if (!text) {
    throw new Error("Vertex AI returned no text response");
  }

  return text;
}
