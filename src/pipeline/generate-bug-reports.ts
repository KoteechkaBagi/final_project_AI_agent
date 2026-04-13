import path from "path";
import fs from "fs/promises";
import { Directories } from "../types/index.js";
import { generateText } from "../openai.js";
import { parseJson, formatJson } from "../utils/json.js";
import { loadPrompt, fillPrompt } from "../utils/prompt.js";

export async function generateBugReports(dirs: Directories, testOutput: string): Promise<void> {
  const promptTemplate = await loadPrompt(dirs.prompts, "04_bug_reports.md");
  const prompt = fillPrompt(promptTemplate, { test_output: testOutput });

  const response = await generateText(prompt);
  const bugReports = parseJson<unknown>(response);
  await fs.writeFile(path.join(dirs.results, "bug_reports.json"), formatJson(bugReports), "utf-8");
  console.log("[Шаг 6] ✅ Генерация баг-репортов завершена | Файл: bug_reports.json");
}
