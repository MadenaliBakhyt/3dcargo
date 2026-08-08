"use client";

import { useState } from "react";

import { CustomTransportDialog } from "@/components/transport/CustomTransportDialog";
import { TransportInfoPanel } from "@/components/transport/TransportInfoPanel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TRANSPORT_PRESETS } from "@/lib/transportPresets";
import { useCargoStore } from "@/stores/useCargoStore";
import type { Transport } from "@/types";

export function TransportSelector() {
  const transport = useCargoStore((s) => s.transport);
  const setTransport = useCargoStore((s) => s.setTransport);
  const [customTransports, setCustomTransports] = useState<Transport[]>([]);

  const options = [...TRANSPORT_PRESETS, ...customTransports];

  const handleSelect = (id: string) => {
    const found = options.find((t) => t.id === id);
    if (found) setTransport(found);
  };

  const handleCreate = (t: Transport) => {
    setCustomTransports((prev) => [...prev, t]);
    setTransport(t);
  };

  return (
    <div className="flex flex-col gap-3">
      <Select value={transport?.id ?? undefined} onValueChange={handleSelect}>
        <SelectTrigger aria-label="Транспорт">
          <SelectValue placeholder="Выберите транспорт..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <CustomTransportDialog onCreate={handleCreate} />

      {transport ? (
        <TransportInfoPanel transport={transport} />
      ) : (
        <p className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
          Выберите транспорт для начала.
        </p>
      )}
    </div>
  );
}
