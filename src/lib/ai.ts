import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

/**
 * Truncates text to approximately 200 words or 1000 characters
 * without cutting words mid-way.
 */
export function truncateFallback(text: string): string {
  const maxLength = 1000;
  if (text.length <= maxLength) return text;

  let truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  
  if (lastSpace > 0) {
    truncated = truncated.substring(0, lastSpace);
  }

  return truncated.trim() + "...";
}

/**
 * Generates an AI summary using Google Gemini 1.5 Flash.
 * If the API fails, it return a truncated fallback.
 */
export async function generateAISummary(content: string): Promise<string> {
  // 1. Limit input text to reduce token usage
  const limitedInput = content.substring(0, 1500);

  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("Missing GOOGLE_AI_API_KEY");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Summarize the following blog post content in approximately 150-200 words. 
      Focus on the key points and keep a professional yet engaging tone.
      Return ONLY the summary text.
      
      Content:
      ${limitedInput}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Empty response from AI");
    }

    return text.trim();
  } catch (error) {
    console.error("AI Summary generation failed:", error);
    // 3. Fallback logic: Ensure summary is ALWAYS available
    return truncateFallback(content);
  }
}
