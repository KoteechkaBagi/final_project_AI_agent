import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Directories } from "./types/index.js";
import { loadChecklist } from "./pipeline/load-checklist.js";
import { generateTestCases } from "./pipeline/generate-test-cases.js";
import { discoverLocators } from "./pipeline/discover-locators.js";
import { generateAutotests } from "./pipeline/generate-autotests.js";
import { runTests } from "./pipeline/run-tests.js";
import { codeReview } from "./pipeline/code-review.js";
import { generateBugReports } from "./pipeline/generate-bug-reports.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const directories: Directories = {
  checklists: path.join(rootDir, "check-lists"),
  prompts: path.join(rootDir, "prompts"),
  results: path.join(rootDir, "results"),
  autotests: path.join(rootDir, "autotests")
};

async function ensureDirectories() {
  await Promise.all(
    Object.values(directories).map((dir) => fs.mkdir(dir, { recursive: true }))
  );
}

async function main() {
  try {
    await ensureDirectories();

    const { content } = await loadChecklist(directories);
    const testCases = await generateTestCases(directories, content);
    const locators = await discoverLocators(directories, testCases);
    const testCode = await generateAutotests(directories, testCases, locators);

    console.log("Шаг 4: Запуск автотестов...");
    const { output: testOutput, errors: testErrors } = await runTests(directories.autotests);

    await codeReview(directories, testCode.join("\n\n"));
    await generateBugReports(directories, testOutput + "\n" + testErrors);

    console.log("\n🎉 Пайплайн агента завершён успешно.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Ошибка] Общий запуск агента завершился с ошибкой: ${message}`);
    process.exit(1);
  }
}

main();
