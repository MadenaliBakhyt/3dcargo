import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatKg(value: number): string {
  return `${formatNumber(value, 0)} кг`;
}

export function formatCm(value: number): string {
  return `${formatNumber(value, 0)} см`;
}

export function formatM3(value: number): string {
  return `${formatNumber(value, 2)} м³`;
}

export function formatPercent(value: number): string {
  return `${formatNumber(value, 1)}%`;
}
