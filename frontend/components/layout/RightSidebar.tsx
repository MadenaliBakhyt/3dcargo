import { CalculateButton } from "@/components/calculator/CalculateButton";
import { PreCalculationSummary } from "@/components/calculator/PreCalculationSummary";
import { ResultsPanel } from "@/components/results/ResultsPanel";

export function RightSidebar() {
  return (
    <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-card p-4">
      <PreCalculationSummary />
      <CalculateButton />
      <div className="border-t border-border pt-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Результат</h2>
        <ResultsPanel />
      </div>
    </aside>
  );
}
