"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  Files,
  FlaskConical,
  FolderKanban,
  ScrollText,
  MessageCircle,
  NotebookPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { nav } from "@/lib/tr";
import { useUiStore } from "@/lib/store/store";

const items = [
  { href: "/dashboard", label: nav.dashboard, icon: LayoutDashboard },
  { href: "/documents", label: nav.documents, icon: Files },
  { href: "/playground", label: nav.playground, icon: FlaskConical },
  { href: "/collections", label: nav.collections, icon: FolderKanban },
  { href: "/logs", label: nav.logs, icon: ScrollText },
  { href: "/prompts", label: nav.prompts, icon: NotebookPen },
];

export function MobileNav() {
  const pathname = usePathname();
  const assistantOpen = useUiStore((s) => s.assistantOpen);
  const toggleAssistant = useUiStore((s) => s.toggleAssistant);

  return (
    <div className="border-border bg-background flex h-14 items-center justify-between border-b px-3 md:hidden">
      <div className="flex min-w-0 flex-1 items-center">
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="outline" size="icon-sm" aria-label="Menü">
              <Menu className="size-4" />
            </Button>
          }
        />
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle>VectorDock</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-1">
            {items.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== "/dashboard" && pathname.startsWith(href + "/"));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    active && "bg-muted",
                  )}
                >
                  <Icon className="size-4 opacity-80" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
      <span className="ml-3 truncate font-semibold">VectorDock</span>
      </div>
      <Button
        type="button"
        variant={assistantOpen ? "secondary" : "outline"}
        size="icon-sm"
        onClick={() => toggleAssistant()}
        aria-label="Yardım asistanı"
      >
        <MessageCircle className="size-4" />
      </Button>
    </div>
  );
}
