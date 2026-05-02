export const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

export async function delay(ms = 200) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  if (!USE_MOCK) {
    return fetch(`${API_BASE}${path}`, init);
  }
  throw new Error("apiFetch called in mock mode without handler");
}

export async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}
