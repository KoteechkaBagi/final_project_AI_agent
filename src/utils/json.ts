import { jsonrepair } from "jsonrepair";

export function extractJson(text: string): string {
  let cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "");

  const startIdx = cleaned.indexOf("[");
  if (startIdx === -1) {
    const braceIdx = cleaned.indexOf("{");
    if (braceIdx === -1) {
      throw new Error("Не удалось извлечь JSON из ответа модели.");
    }
    return extractBalanced(cleaned, braceIdx, "{", "}");
  }
  return extractBalanced(cleaned, startIdx, "[", "]");
}

function extractBalanced(text: string, start: number, open: string, close: string): string {
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === open) depth++;
    if (ch === close) {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }
  return text.slice(start);
}

export function tryParseJson(text: string): unknown {
  const cleaned = extractJson(text);
  const repaired = jsonrepair(cleaned);
  return JSON.parse(repaired);
}

export function parseJson<T>(text: string): T {
  return tryParseJson(text) as T;
}

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function parseChecklistItems(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^(#|\*\*|\-\s*-)/.test(line));
}
