import "dotenv/config";
import OpenAI from "openai";

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) {
  throw new Error("DEEPSEEK_API_KEY environment variable is required.");
}

const client = new OpenAI({
  apiKey,
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1"
});

export async function generateText(prompt: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 4000
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek returned empty output.");
  }

  return content;
}
