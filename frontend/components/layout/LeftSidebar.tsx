import { CargoPanel } from "@/components/cargo/CargoPanel";
import { TransportSelector } from "@/components/transport/TransportSelector";

export function LeftSidebar() {
  return (
    <aside className="flex w-80 shrink-0 flex-col gap-5 overflow-y-auto border-r border-border bg-card p-4">
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Транспорт</h2>
        <TransportSelector />
      </section>
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Груз</h2>
        <CargoPanel />
      </section>
    </aside>
  );
}
