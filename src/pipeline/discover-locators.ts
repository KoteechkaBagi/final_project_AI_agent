import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { Directories } from "../types/index.js";
import { generateText } from "../openai.js";
import { formatJson } from "../utils/json.js";

const execAsync = promisify(exec);

interface PageToDiscover {
  name: string;
  url: string;
  description: string;
  clickFirst?: boolean;
}

// Map page names to URLs — extend this as new pages are added
const PAGE_URL_MAP: Record<string, string> = {
  "MainPage": "https://worldchess.com",
  "main": "https://worldchess.com",
  "TournamentsPage": "https://worldchess.com/tournaments",
  "tournaments": "https://worldchess.com/tournaments",
  "LobbyPage": "https://worldchess.com/lobby",
  "lobby": "https://worldchess.com/lobby",
  "PuzzlesPage": "https://worldchess.com/puzzles",
  "puzzles": "https://worldchess.com/puzzles",
  "NewsPage": "https://worldchess.com/news",
  "news": "https://worldchess.com/news",
  "PlayersPage": "https://worldchess.com/players",
  "players": "https://worldchess.com/players",
  "ShopPage": "https://worldchess.com/shop",
  "shop": "https://worldchess.com/shop",
  "GamePage": "https://worldchess.com/game/1fca7de9-7c1f-473a-9ae9-9a402b69c256",
  "game": "https://worldchess.com/game/1fca7de9-7c1f-473a-9ae9-9a402b69c256",
};

function extractPagesFromTestCases(testCases: unknown): string[] {
  // Test cases can be an array or a JSON string or an object with items
  const items: unknown[] = Array.isArray(testCases)
    ? testCases
    : typeof testCases === "string"
      ? (() => { try { return JSON.parse(testCases); } catch { return []; } })()
      : [];

  const pageNames = new Set<string>();
  for (const item of items) {
    if (typeof item === "object" && item !== null) {
      const obj = item as Record<string, unknown>;
      // First check for explicit page/section/category fields
      for (const key of ["page", "section", "category"]) {
        const val = obj[key];
        if (typeof val === "string" && val.trim()) {
          pageNames.add(val.trim());
        }
      }
      // If no explicit fields, extract page names from title and step actions
      const textParts: string[] = [];
      if (typeof obj.title === "string") textParts.push(obj.title.toLowerCase());
      if (typeof obj.preconditions === "string") textParts.push(obj.preconditions.toLowerCase());
      if (Array.isArray(obj.steps)) {
        for (const step of obj.steps) {
          if (typeof step === "object" && step !== null) {
            const s = step as Record<string, unknown>;
            if (typeof s.action === "string") textParts.push(s.action.toLowerCase());
          }
        }
      }
      const fullText = textParts.join(" ");
      // Match keywords to known pages
      if (fullText.includes("tournament") && (fullText.includes("card") || fullText.includes("join") || fullText.includes("detail"))) {
        pageNames.add("TournamentDetailPage");
      }
      if (fullText.includes("tournament")) {
        pageNames.add("TournamentsPage");
      }
      if (fullText.includes("main page") || fullText.includes("home page") || fullText.includes("worldchess.com")) {
        pageNames.add("MainPage");
      }
      if (fullText.includes("game") || fullText.includes("game/") || fullText.includes("партии") || fullText.includes("парти")) {
        pageNames.add("GamePage");
      }
    }
  }
  return pageNames.size > 0 ? Array.from(pageNames) : ["MainPage", "TournamentsPage"];
}

function buildPagesList(pageNames: string[]): PageToDiscover[] {
  const pages: PageToDiscover[] = [];
  const seen = new Set<string>();

  for (const name of pageNames) {
    // Normalize: "Tournaments" -> "TournamentsPage"
    const className = name.endsWith("Page") ? name : name + "Page";
    if (seen.has(className)) continue;
    seen.add(className);

    const url = PAGE_URL_MAP[name] || PAGE_URL_MAP[className] || `https://worldchess.com/${name.toLowerCase()}`;
    const description = `Page: ${name} - look for key interactive elements, buttons, navigation links`;

    // TournamentDetailPage requires clicking a tournament card first to navigate there
    // GamePage navigates directly to a game URL, no click needed
    const clickFirst = className === "TournamentDetailPage";

    pages.push({ name: className, url, description, clickFirst });
  }

  return pages;
}

export async function discoverLocators(dirs: Directories, testCases: unknown): Promise<string> {
  console.log("[Шаг 3a] Сбор реальных локаторов с сайта...");

  const pageNames = extractPagesFromTestCases(testCases);
  const pages = buildPagesList(pageNames);
  console.log(`[Шаг 3a] Страницы для сбора локаторов: ${pages.map(p => p.name).join(", ")}`);

  const results: Record<string, string> = {};

  // Create a temporary script directory
  const tmpDir = path.join(dirs.autotests, ".tmp-discover");
  await fs.mkdir(tmpDir, { recursive: true });

  for (const page of pages) {
    try {
      // Write a temporary script for this page
      const scriptPath = path.join(tmpDir, `discover-${page.name.toLowerCase()}.cjs`);
      const clickAction = page.clickFirst ? `
  // Click the first interactive element found (a, button, or [data-component])
  const firstEl = await p.locator('a[href], button, [data-component]').first();
  if (await firstEl.count() > 0) {
    await firstEl.click().catch(() => {});
  }
  await p.waitForTimeout(3000);
` : '';
      const scriptContent = `
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto('${page.url}', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await p.waitForTimeout(2000);${clickAction}
  const html = await p.evaluate(() => {
    const allEls = document.querySelectorAll('*[data-component]');
    const result = [];
    allEls.forEach(el => {
      const comp = el.getAttribute('data-component');
      const id = el.getAttribute('data-id');
      const tag = el.tagName.toLowerCase();
      const text = (el.textContent || '').trim().substring(0, 50);
      const classes = el.className ? (typeof el.className === 'string' ? el.className : '') : '';
      result.push({ tag, 'data-component': comp, 'data-id': id, text, classes: classes.substring(0, 100) });
    });
    return JSON.stringify(result.slice(0, 100));
  });
  console.log(html);
  await browser.close();
})();
`;
      await fs.writeFile(scriptPath, scriptContent, "utf-8");

      const { stdout } = await execAsync(`node "${scriptPath}"`, {
        cwd: dirs.autotests,
        timeout: 30000
      });

      const html = stdout.trim();

      // Ask LLM to extract good selectors from real components
      const prompt = `You are given a list of UI components from a webpage with their data-component attributes, tags, text content, and CSS classes.
Generate Playwright selectors for key interactive elements.

Page: ${page.name}
URL: ${page.url}
Description: ${page.description}

Rules:
1. PRIORITY: Use [data-component='ComponentName'] selectors - this is the most reliable attribute
2. Combine with [data-id='...'] when available: [data-component='MenuItem'][data-id='tournaments']
3. For buttons with text: [data-component='Button']:has-text('exact text')
4. For links: a[href='/path'] or [data-component='Link']:has-text('text')
5. For first element of a list: [data-component='Card'].first()
6. Avoid CSS classes (sc-*) - they are generated and unstable
7. Use :has-text() for text matching, not :contains()

Components found on page:
${html}

Return ONLY a JSON object mapping element names to Playwright selectors:
{
  "registerButton": "[data-component='Button']:has-text('Register for free')",
  "tournamentsMenuLink": "[data-component='MenuItem'][data-id='tournaments']",
  "tournamentCards": "[data-component='TournamentCard']"
}

No markdown, no explanation. Just valid JSON.`;

      const response = await generateText(prompt);
      const cleaned = response.replace(/^```(?:json)?\s*\n?/gm, "").replace(/```\s*$/gm, "").trim();
      results[page.name] = cleaned;
      console.log(`[Шаг 3a] ✅ Локаторы собраны для ${page.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[Шаг 3a] ⚠️ Не удалось собрать локаторы для ${page.name}: ${message}`);
      results[page.name] = "{}";
    }
  }

  // Clean up temp directory
  try {
    await fs.rm(tmpDir, { recursive: true, force: true });
  } catch {}

  return formatJson(results);
}
