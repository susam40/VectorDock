export const PLAYGROUND_PROMPTS_STORAGE_KEY = "vectordock-playground-prompts";

export const DEFAULT_SYSTEM_PROMPT =
  "Kullanıcının sorusunu yalnızca verilen bağlam parçalarına dayanarak yanıtla. " +
  "Bağlamda yoksa bunu açıkça söyle; uydurma.";

export const DEFAULT_USER_PROMPT_WITH_CONTEXT =
  "Bağlam:\n{context}\n\nSoru: {question}";

export const DEFAULT_USER_PROMPT_NO_CONTEXT =
  "Veritabanında bu soruyla ilgili anlamsal olarak yakın belge parçası bulunamadı.\n\n" +
  "Soru: {question}\n\nGenel bilginle kısa yanıt ver ve kaynak bulunmadığını belirt.";

export type PlaygroundPromptState = {
  systemPrompt: string;
  userPromptWithContext: string;
  userPromptNoContext: string;
};

export const DEFAULT_PLAYGROUND_PROMPTS: PlaygroundPromptState = {
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  userPromptWithContext: DEFAULT_USER_PROMPT_WITH_CONTEXT,
  userPromptNoContext: DEFAULT_USER_PROMPT_NO_CONTEXT,
};

export function loadPlaygroundPrompts(): PlaygroundPromptState {
  if (typeof window === "undefined") return { ...DEFAULT_PLAYGROUND_PROMPTS };
  try {
    const raw = localStorage.getItem(PLAYGROUND_PROMPTS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PLAYGROUND_PROMPTS };
    const o = JSON.parse(raw) as Record<string, unknown>;
    return {
      systemPrompt:
        typeof o.systemPrompt === "string"
          ? o.systemPrompt
          : DEFAULT_SYSTEM_PROMPT,
      userPromptWithContext:
        typeof o.userPromptWithContext === "string"
          ? o.userPromptWithContext
          : DEFAULT_USER_PROMPT_WITH_CONTEXT,
      userPromptNoContext:
        typeof o.userPromptNoContext === "string"
          ? o.userPromptNoContext
          : DEFAULT_USER_PROMPT_NO_CONTEXT,
    };
  } catch {
    return { ...DEFAULT_PLAYGROUND_PROMPTS };
  }
}

export function savePlaygroundPrompts(p: PlaygroundPromptState): void {
  try {
    localStorage.setItem(PLAYGROUND_PROMPTS_STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore quota */
  }
}
