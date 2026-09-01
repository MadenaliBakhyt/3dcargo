"use client";

import { FileJson, FileSpreadsheet, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { exportPlacementsCsv } from "@/lib/export/csv";
import { toFilenameStem } from "@/lib/export/downloadFile";
import { exportProjectJson } from "@/lib/export/json";
import { exportProjectPdf } from "@/lib/export/pdf";
import { useCargoStore } from "@/stores/useCargoStore";

export function ExportMenu() {
  const projectName = useCargoStore((s) => s.projectName);
  const transport = useCargoStore((s) => s.transport);
  const cargoTypes = useCargoStore((s) => s.cargoTypes);
  const settings = useCargoStore((s) => s.settings);
  const result = useCargoStore((s) => s.result);

  const disabled = !transport;

  const handleExportPdf = () => {
    if (!transport) return;
    exportProjectPdf({ projectName, transport, cargoTypes, result });
  };

  const handleExportCsv = () => {
    if (!result) return;
    exportPlacementsCsv(result);
  };

  const handleExportJson = () => {
    exportProjectJson(
      {
        version: 1,
        name: projectName,
        createdAt: new Date().toISOString(),
        transport,
        cargoTypes,
        settings,
        result,
      },
      `${toFilenameStem(projectName)}.json`
    );
  };

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="sm" disabled={disabled} onClick={handleExportPdf}>
        <FileText /> PDF
      </Button>
      <Button variant="outline" size="sm" disabled={!result} onClick={handleExportCsv}>
        <FileSpreadsheet /> CSV
      </Button>
      <Button variant="outline" size="sm" disabled={disabled} onClick={handleExportJson}>
        <FileJson /> Сохранить как файл
      </Button>
    </div>
  );
}
