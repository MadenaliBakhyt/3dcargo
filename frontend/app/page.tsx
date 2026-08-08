"use client";

import dynamic from "next/dynamic";

const AppShell = dynamic(() => import("@/components/AppShell").then((m) => m.AppShell), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">Загрузка...</div>
  ),
});

export default function HomePage() {
  return <AppShell />;
}
