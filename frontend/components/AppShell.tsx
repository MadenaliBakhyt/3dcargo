"use client";

import { BottomPanel } from "@/components/layout/BottomPanel";
import { Header } from "@/components/layout/Header";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { ViewerTabs } from "@/components/viewer/ViewerTabs";

export function AppShell() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex min-h-0 flex-1">
        <LeftSidebar />
        <main className="min-w-0 flex-1">
          <ViewerTabs />
        </main>
        <RightSidebar />
      </div>
      <BottomPanel />
    </div>
  );
}
