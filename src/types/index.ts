export interface Directories {
  checklists: string;
  prompts: string;
  results: string;
  autotests: string;
}

export interface ChecklistData {
  filePath: string;
  content: string;
  items: string[];
}
