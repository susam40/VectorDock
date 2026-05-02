"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col md:flex-row">
      <MobileNav />
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        <AssistantPanel />
      </div>
    </div>
  );
}