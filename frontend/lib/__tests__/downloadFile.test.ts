import { describe, expect, it } from "vitest";

import { toFilenameStem } from "@/lib/export/downloadFile";

describe("toFilenameStem", () => {
  it("transliterates Cyrillic project names to Latin characters", () => {
    expect(toFilenameStem("Мой тестовый проект")).toBe("Moy testovyy proekt");
  });

  it("leaves ASCII names unchanged aside from unsafe characters", () => {
    expect(toFilenameStem("Warehouse Load Plan")).toBe("Warehouse Load Plan");
  });

  it("strips filesystem-unsafe characters", () => {
    const result = toFilenameStem('Project: A/B "final"?');
    expect(result).not.toMatch(/[\\/:*?"<>|]/);
    expect(result).toContain("Project");
    expect(result).toContain("final");
  });

  it("falls back to a default name when nothing is left", () => {
    expect(toFilenameStem("   ")).toBe("project");
    expect(toFilenameStem("???")).toBe("project");
  });

  it("preserves case when transliterating", () => {
    expect(toFilenameStem("Паллета")).toBe("Palleta");
  });
});
