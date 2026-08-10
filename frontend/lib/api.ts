import type { CalculationRequest, CalculationResponse } from "@/types";

// Defaults to a relative path so the browser always calls this app's own
// origin -- Next.js's rewrites (see next.config.mjs) forward it to the
// backend server-side. Only set NEXT_PUBLIC_API_URL if the API is reachable
// directly from the browser at a different origin than this app.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function calculateLoading(
  request: CalculationRequest,
  signal?: AbortSignal
): Promise<CalculationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    let message = `Ошибка сервера (${response.status})`;
    try {
      const data = await response.json();
      if (typeof data?.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data?.detail)) {
        message = data.detail.map((d: { msg?: string }) => d.msg).join("; ");
      }
    } catch {
      // ignore JSON parse failure, keep default message
    }
    throw new ApiError(message, response.status);
  }

  return response.json();
}
