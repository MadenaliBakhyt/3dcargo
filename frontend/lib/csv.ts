export interface CsvCargoRow {
  name: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  quantity: number;
}

export interface CsvParseResult {
  rows: CsvCargoRow[];
  errors: string[];
}

const EXPECTED_COLUMNS = ["name", "length", "width", "height", "weight", "quantity"];

export function parseCargoCsv(text: string): CsvParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { rows: [], errors: ["Файл пуст."] };
  }

  let dataLines = lines;
  const header = lines[0]!.split(",").map((h) => h.trim().toLowerCase());
  if (EXPECTED_COLUMNS.every((c, i) => header[i] === c)) {
    dataLines = lines.slice(1);
  }

  const rows: CsvCargoRow[] = [];
  const errors: string[] = [];

  dataLines.forEach((line, idx) => {
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length < 6) {
      errors.push(`Строка ${idx + 1}: ожидается 6 колонок (name,length,width,height,weight,quantity).`);
      return;
    }
    const [name, length, width, height, weight, quantity] = parts;
    const nums = [length, width, height, weight, quantity].map(Number);
    if (!name) {
      errors.push(`Строка ${idx + 1}: отсутствует название.`);
      return;
    }
    if (nums.some((n) => Number.isNaN(n))) {
      errors.push(`Строка ${idx + 1}: некорректное числовое значение.`);
      return;
    }
    const [l, w, h, wt, q] = nums as [number, number, number, number, number];
    if (l <= 0 || w <= 0 || h <= 0) {
      errors.push(`Строка ${idx + 1}: размеры должны быть больше 0.`);
      return;
    }
    if (q < 1) {
      errors.push(`Строка ${idx + 1}: количество должно быть больше 0.`);
      return;
    }
    rows.push({ name: name!, length: l, width: w, height: h, weight: wt, quantity: Math.round(q) });
  });

  return { rows, errors };
}
