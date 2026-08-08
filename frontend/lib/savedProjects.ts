import type { Project } from "@/types";

const STORAGE_KEY = "cargo-loading-planner-saved-projects";

export function getSavedProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProject(project: Project): void {
  const existing = getSavedProjects().filter((p) => p.name !== project.name);
  const updated = [project, ...existing].slice(0, 50);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteSavedProject(name: string): void {
  const updated = getSavedProjects().filter((p) => p.name !== name);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
