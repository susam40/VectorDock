import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiStore = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  assistantOpen: boolean;
  setAssistantOpen: (v: boolean) => void;
  toggleAssistant: () => void;
  assistantSystemPrompt: string;
  setAssistantSystemPrompt: (v: string) => void;
};

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () =>
        set({ sidebarCollapsed: !get().sidebarCollapsed }),
      assistantOpen: false,
      setAssistantOpen: (v) => set({ assistantOpen: v }),
      toggleAssistant: () =>
        set({ assistantOpen: !get().assistantOpen }),
      assistantSystemPrompt: "",
      setAssistantSystemPrompt: (v) => set({ assistantSystemPrompt: v }),
    }),
    { name: "vectordock-ui" },
  ),
);
