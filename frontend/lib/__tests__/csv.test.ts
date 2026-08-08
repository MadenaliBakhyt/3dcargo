import { describe, expect, it } from "vitest";

import { parseCargoCsv } from "@/lib/csv";

describe("parseCargoCsv", () => {
  it("parses rows with a header line", () => {
    const csv = "name,length,width,height,weight,quantity\nPallet A,120,80,160,450,15\nBox B,100,60,80,120,30";
    const { rows, errors } = parseCargoCsv(csv);
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: "Pallet A", length: 120, width: 80, height: 160, weight: 450, quantity: 15 });
    expect(rows[1]!.quantity).toBe(30);
  });

  it("parses rows without a header line", () => {
    const csv = "Pallet A,120,80,160,450,15";
    const { rows, errors } = parseCargoCsv(csv);
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
  });

  it("reports an error for rows with non-numeric values", () => {
    const csv = "name,length,width,height,weight,quantity\nBad,abc,80,160,450,15";
    const { rows, errors } = parseCargoCsv(csv);
    expect(rows).toHaveLength(0);
    expect(errors).toHaveLength(1);
  });

  it("reports an error for non-positive dimensions", () => {
    const csv = "name,length,width,height,weight,quantity\nBad,0,80,160,450,15";
    const { rows, errors } = parseCargoCsv(csv);
    expect(rows).toHaveLength(0);
    expect(errors[0]).toMatch(/размеры/i);
  });

  it("reports an error for quantity below 1", () => {
    const csv = "name,length,width,height,weight,quantity\nBad,120,80,160,450,0";
    const { rows, errors } = parseCargoCsv(csv);
    expect(rows).toHaveLength(0);
    expect(errors[0]).toMatch(/количество/i);
  });

  it("returns an error for an empty file", () => {
    const { rows, errors } = parseCargoCsv("");
    expect(rows).toEqual([]);
    expect(errors).toHaveLength(1);
  });
});
