import path from "path";
import fs from "fs/promises";
import { Directories } from "../types/index.js";
import { generateText } from "../openai.js";
import { formatJson } from "../utils/json.js";
import { loadPrompt, fillPrompt } from "../utils/prompt.js";

interface GeneratedFile {
  filename: string;
  content: string;
}

function parseFiles(response: string): GeneratedFile[] {
  const cleaned = response.replace(/^```(?:typescript|ts|javascript)?\s*\n?/gm, "").replace(/```\s*$/gm, "").trim();
  const parts = cleaned.split(/===\s*FILE:\s*/).filter(Boolean);
  const files: GeneratedFile[] = [];
  for (const part of parts) {
    const match = part.match(/^([\w.-]+)\s*===([\s\S]*)/);
    if (match) {
      files.push({
        filename: match[1].trim(),
        content: match[2].trim()
      });
    }
  }
  return files;
}

const PLAYWRIGHT_CONFIG = `import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  testMatch: '*.spec.ts',
  timeout: 30000,
  use: {
    baseURL: 'https://worldchess.com',
    headless: true,
    screenshot: 'only-on-failure',
  },
});
`;

const PACKAGE_JSON = JSON.stringify({
  name: "autotests",
  version: "1.0.0",
  type: "module",
  scripts: {
    test: "playwright test"
  }
}, null, 2);

export async function generateAutotests(dirs: Directories, testCases: unknown, locators: string): Promise<string[]> {
  const srcDir = path.join(dirs.autotests, "src");
  const pagesDir = path.join(dirs.autotests, "pages");
  await fs.mkdir(srcDir, { recursive: true });
  await fs.mkdir(pagesDir, { recursive: true });

  const promptTemplate = await loadPrompt(dirs.prompts, "02-autotest.md");
  const prompt = fillPrompt(promptTemplate, { test_cases: formatJson(testCases), locators });

  const response = await generateText(prompt);
  await fs.writeFile(path.join(dirs.results, "autotest_raw_response.txt"), response, "utf-8");
  const files = parseFiles(response);
  console.log(`[Шаг 3] Найдено файлов в ответе LLM: ${files.length} (${files.map(f => f.filename).join(", ")})`);

  const specContents: string[] = [];

  for (const file of files) {
    // Route files to correct directories:
    // - .spec.ts files → autotests/src/ (one spec file per page)
    // - Page objects (Page.ts, MainPage.ts, etc.) → autotests/pages/
    let targetDir: string;
    if (file.filename.endsWith(".spec.ts")) {
      targetDir = srcDir;
    } else if (file.filename.endsWith("Page.ts") || file.filename.endsWith("Pages.ts")) {
      targetDir = pagesDir;
    } else {
      targetDir = dirs.autotests;
    }

    await fs.writeFile(path.join(targetDir, file.filename), file.content, "utf-8");
    console.log(`[Шаг 3] ✅ Сохранён файл: ${path.relative(dirs.autotests, path.join(targetDir, file.filename))}`);
    if (file.filename.endsWith(".spec.ts")) {
      specContents.push(file.content);
    }
  }

  if (specContents.length === 0) {
    throw new Error(
      `LLM не сгенерировала spec-файл. Получены файлы: ${files.map(f => f.filename).join(", ") || "ни одного"}. ` +
      `Проверьте промпт и сырой ответ в results/autotest_raw_response.txt`
    );
  }

  // Ensure supporting files exist
  await fs.writeFile(path.join(dirs.autotests, "playwright.config.ts"), PLAYWRIGHT_CONFIG, "utf-8");
  await fs.writeFile(path.join(dirs.autotests, "package.json"), PACKAGE_JSON, "utf-8");

  return specContents;
}
