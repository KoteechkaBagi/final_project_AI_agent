import path from "path";
import fs from "fs/promises";
import { Directories } from "../types/index.js";
import { generateText } from "../openai.js";
import { loadPrompt, fillPrompt } from "../utils/prompt.js";

export async function codeReview(dirs: Directories, testCode: string): Promise<void> {
  const promptTemplate = await loadPrompt(dirs.prompts, "03-code-review.md");
  const prompt = fillPrompt(promptTemplate, { code: testCode });

  const response = await generateText(prompt);
  await fs.writeFile(path.join(dirs.results, "code_review.txt"), response, "utf-8");
  console.log("[Шаг 5] ✅ Код-ревью завершено | Файл: code_review.txt");
}
