import fs from "fs/promises";
import path from "path";
import { Directories, ChecklistData } from "../types/index.js";
import { parseChecklistItems } from "../utils/json.js";
import { findChecklistFile } from "../utils/prompt.js";

export async function loadChecklist(dirs: Directories): Promise<ChecklistData> {
  const filePath = await findChecklistFile(dirs.checklists);
  const content = await fs.readFile(filePath, "utf-8");
  const items = parseChecklistItems(content);
  if (items.length === 0) {
    throw new Error("Чеклист не содержит обнаруживаемых пунктов.");
  }
  await fs.writeFile(path.join(dirs.results, "checklist_source.txt"), content, "utf-8");
  console.log(`[Шаг 1] ✅ Загрузка чеклистов завершена | Файл: ${path.basename(filePath)}`);
  return { filePath, content, items };
}
