import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface TestResult {
  testName: string;
  error?: string;
}

function extractShortName(fullName: string): string {
  // Extract "[CA-X] Name" from full test path, remove @test
  const match = fullName.match(/(\[CA-\d+\]\s+[^@]+?)\s*@?\s*$/);
  if (match) return match[1].trim();
  return fullName;
}

export function parseTestResults(output: string): { passed: TestResult[]; failed: TestResult[] } {
  const passed: TestResult[] = [];
  const failed: TestResult[] = [];
  const seen = new Set<string>();
  // Strip ANSI escape codes
  const clean = output.replace(/\x1B\[[0-9;]*[A-Za-z]/g, "");

  // Parse failed tests from summary: "  1) src\file.ts:16:5 › ... › [CA-4] Name @test"
  const failRegex = /^\s+\d+\)\s+(.+?@test)\s*$/gm;
  let match;
  while ((match = failRegex.exec(clean)) !== null) {
    const fullName = match[1].trim();
    const shortName = extractShortName(fullName);
    if (seen.has(shortName)) continue;
    seen.add(shortName);
    // Extract error message from the detailed section
    const startIndex = match.index + match[0].length;
    const remaining = clean.substring(startIndex);
    const errorMatch = remaining.match(/Error:\s*([\s\S]*?)(?=\n\s+Call log:|\n\s+\d+\)\s|\n\s+attachment|Error Context:|$)/i);
    let error = "Unknown error";
    if (errorMatch) {
      error = errorMatch[1].trim().split("\n")[0].trim();
      if (error.length > 150) error = error.substring(0, 150) + "...";
    }
    failed.push({ testName: shortName, error });
  }

  // Parse passed tests: "  ok 2 src\main.spec.ts:16:5 › ... › [CA-1] Name @test"
  const okRegex = /^\s+ok\s+\d+\s+.+?›\s+(.+?@test)\s*$/gm;
  let match2;
  while ((match2 = okRegex.exec(clean)) !== null) {
    const fullName = match2[1].trim();
    const shortName = extractShortName(fullName);
    if (seen.has(shortName)) continue;
    seen.add(shortName);
    passed.push({ testName: shortName });
  }

  return { passed, failed };
}

export async function runTests(autotestsDir: string): Promise<{ output: string; errors: string; passed: TestResult[]; failed: TestResult[] }> {
  let testOutput = "";
  let testErrors = "";
  try {
    const { stdout, stderr } = await execAsync("npx playwright test --reporter=list", {
      cwd: autotestsDir,
      env: { ...process.env, FORCE_COLOR: "0" }
    });
    testOutput = stdout;
    testErrors = stderr;
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    testOutput = (error as any).stdout || "";
    testErrors = (error as any).stderr || "";
  }

  const { passed, failed } = parseTestResults(testOutput);
  for (const p of passed) {
    console.log(`✅ ${p.testName}`);
  }
  for (const f of failed) {
    console.error(`  ❌ ${f.testName} => ${f.error}`);
  }
  if (failed.length === 0) {
    console.log("[Шаг 4] ✅ Автотесты пройдены успешно.");
  } else {
    console.warn(`[Шаг 4] ⚠️ Автотесты завершились с ошибками.`);
  }

  return { output: testOutput, errors: testErrors, passed, failed };
}
