"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { useCargoStore } from "@/stores/useCargoStore";

export function ProjectNameInput() {
  const projectName = useCargoStore((s) => s.projectName);
  const setProjectName = useCargoStore((s) => s.setProjectName);
  const [draft, setDraft] = useState(projectName);

  // Keep the draft in sync when the name changes from elsewhere (loading a
  // project, resetting, running the demo) rather than from typing here.
  useEffect(() => setDraft(projectName), [projectName]);

  return (
    <Input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => setProjectName(draft.trim() || "Новый расчёт")}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      aria-label="Название проекта"
      className="h-8 w-48 border-transparent bg-transparent px-2 text-sm font-medium shadow-none hover:border-input focus-visible:border-input"
    />
  );
}
