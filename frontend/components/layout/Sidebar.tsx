"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Files,
  FlaskConical,
  FolderKanban,
  ScrollText,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/lib/store/store";
import { nav } from "@/lib/tr";

const items = [
  { href: "/dashboard", label: nav.dashboard, icon: LayoutDashboard },
  { href: "/documents", label: nav.documents, icon: Files },
  { href: "/playground", label: nav.playground, icon: FlaskConical },
  { href: "/collections", label: nav.collections, icon: FolderKanban },
  { href: "/logs", label: nav.logs, icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "border-border bg-sidebar text-sidebar-foreground hidden h-full flex-col border-r transition-[width] md:flex",
        collapsed ? "md:w-[4.25rem]" : "md:w-56",
      )}
    >
      <div className="flex h-14 items-center justify-between gap-2 border-b px-3">
        {!collapsed && (
          <Link href="/dashboard" className="font-semibold tracking-tight">
            VectorDock
          </Link>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => toggle()}
          aria-label="Kenar çubuğunu aç/kapat"
        >
          {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "hover:bg-sidebar-accent flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium",
                active && "bg-sidebar-accent text-sidebar-accent-foreground",
                collapsed && "justify-center px-0",
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="size-4 shrink-0 opacity-80" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>
      {!collapsed && (
        <div className="text-muted-foreground border-t p-3 text-xs leading-snug">
          Yönetim konsolu · RAG izlenebilirliği
        </div>
      )}
    </aside>
  );
}
