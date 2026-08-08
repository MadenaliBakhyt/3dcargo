"use client";

import { Package } from "lucide-react";

import { DemoButton } from "@/components/DemoButton";
import { ExportMenu } from "@/components/export/ExportMenu";
import { ProjectControls } from "@/components/export/ProjectControls";

export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        <span className="font-semibold tracking-tight">Cargo Loading Planner</span>
      </div>
      <div className="flex items-center gap-2">
        <DemoButton />
        <div className="mx-1 h-5 w-px bg-border" />
        <ProjectControls />
        <div className="mx-1 h-5 w-px bg-border" />
        <ExportMenu />
      </div>
    </header>
  );
}
