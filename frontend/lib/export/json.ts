import { downloadText } from "@/lib/export/downloadFile";
import type { Project } from "@/types";

export function exportProjectJson(project: Project, filename = "project.json"): void {
  downloadText(JSON.stringify(project, null, 2), filename, "application/json");
}

export function parseProjectJson(text: string): Project {
  const data = JSON.parse(text);
  if (!data || typeof data !== "object") throw new Error("Некорректный файл проекта.");
  if (!Array.isArray(data.cargoTypes)) throw new Error("В файле отсутствуют данные о грузе.");
  return data as Project;
}
