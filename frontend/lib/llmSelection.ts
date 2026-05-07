"use client";

const LAST_SELECTED_LLM_MODEL_KEY = "vectordock:lastSelectedLlmModel";

export function saveSelectedLlmModel(model: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_SELECTED_LLM_MODEL_KEY, model);
}

export function loadSelectedLlmModel(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_SELECTED_LLM_MODEL_KEY);
}
