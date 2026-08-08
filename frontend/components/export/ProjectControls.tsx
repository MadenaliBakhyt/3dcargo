"use client";

import { useState } from "react";
import { FolderOpen, Plus, Save, Trash2, Upload } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { parseProjectJson } from "@/lib/export/json";
import { deleteSavedProject, getSavedProjects, saveProject } from "@/lib/savedProjects";
import { useCargoStore } from "@/stores/useCargoStore";
import type { Project } from "@/types";

export function ProjectControls() {
  const projectName = useCargoStore((s) => s.projectName);
  const transport = useCargoStore((s) => s.transport);
  const cargoTypes = useCargoStore((s) => s.cargoTypes);
  const settings = useCargoStore((s) => s.settings);
  const result = useCargoStore((s) => s.result);
  const resetProject = useCargoStore((s) => s.resetProject);
  const loadProject = useCargoStore((s) => s.loadProject);

  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = () => {
    saveProject({
      version: 1,
      name: projectName,
      createdAt: new Date().toISOString(),
      transport,
      cargoTypes,
      settings,
      result,
    });
    setMessage("Проект сохранён в браузере.");
    setTimeout(() => setMessage(null), 2500);
  };

  const openLoadDialog = () => {
    setSavedProjects(getSavedProjects());
    setLoadDialogOpen(true);
  };

  const handleLoadSaved = (project: Project) => {
    loadProject(project);
    setLoadDialogOpen(false);
  };

  const handleDeleteSaved = (name: string) => {
    deleteSavedProject(name);
    setSavedProjects(getSavedProjects());
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const project = parseProjectJson(text);
      loadProject(project);
      setLoadDialogOpen(false);
    } catch {
      setMessage("Не удалось прочитать файл проекта.");
      setTimeout(() => setMessage(null), 2500);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus /> Новый расчёт
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Начать новый расчёт?</AlertDialogTitle>
            <AlertDialogDescription>
              Транспорт, грузы и результат текущего расчёта будут очищены. Несохранённые изменения будут потеряны.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={resetProject}>Очистить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button variant="outline" size="sm" onClick={handleSave} disabled={!transport}>
        <Save /> Сохранить
      </Button>

      <Dialog open={loadDialogOpen} onOpenChange={(o) => (o ? openLoadDialog() : setLoadDialogOpen(false))}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen /> Загрузить
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Загрузить проект</DialogTitle>
          </DialogHeader>

          {savedProjects.length > 0 ? (
            <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
              {savedProjects.map((p) => (
                <div key={p.name} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                  <button className="text-left hover:underline" onClick={() => handleLoadSaved(p)}>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString("ru-RU")}</div>
                  </button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteSaved(p.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Сохранённых проектов пока нет.</p>
          )}

          <div className="border-t border-border pt-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-primary hover:underline">
              <Upload className="h-4 w-4" />
              Импортировать проект из JSON
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleImportFile(file);
                }}
              />
            </label>
          </div>
        </DialogContent>
      </Dialog>

      {message && <span className="text-xs text-muted-foreground">{message}</span>}
    </div>
  );
}
