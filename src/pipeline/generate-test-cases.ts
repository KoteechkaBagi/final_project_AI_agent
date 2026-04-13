import path from "path";
import fs from "fs/promises";
import { Directories } from "../types/index.js";
import { generateText } from "../openai.js";
import { parseJson, formatJson } from "../utils/json.js";
import { loadPrompt, fillPrompt } from "../utils/prompt.js";

export async function generateTestCases(dirs: Directories, checklistText: string): Promise<unknown> {
  const promptTemplate = await loadPrompt(dirs.prompts, "01-test-cases.md");
  const prompt = fillPrompt(promptTemplate, { checklist: checklistText });

  const response = await generateText(prompt);
  await fs.writeFile(path.join(dirs.results, "prompt1_response.txt"), response, "utf-8");

  const testCases = parseJson<unknown>(response);
  await fs.writeFile(path.join(dirs.results, "test_cases.json"), formatJson(testCases), "utf-8");

  const count = Array.isArray(testCases) ? testCases.length : 1;
  console.log(`[Шаг 2] ✅ Генерация тест-кейсов завершена | Сгенерировано элементов: ${count}`);
  return testCases;
}
