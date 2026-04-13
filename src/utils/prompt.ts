import fs from "fs/promises";
import path from "path";

export async function loadPrompt(promptsDir: string, filename: string): Promise<string> {
  return fs.readFile(path.join(promptsDir, filename), "utf-8");
}

export function fillPrompt(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

export async function findChecklistFile(checklistsDir: string): Promise<string> {
  const files = await fs.readdir(checklistsDir);
  const supported = files.filter((file) => /\.(md|txt|yml|yaml|json)$/i.test(file));
  if (supported.length === 0) {
    throw new Error("В папке check-lists не найден файл чеклиста.");
  }
  return path.join(checklistsDir, supported[0]);
}
