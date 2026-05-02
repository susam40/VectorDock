"use client";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Badge } from "@/components/ui/badge";

export function Header({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="border-border bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex flex-col gap-1 border-b px-6 py-4 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <Badge variant="secondary" className="font-mono text-xs">
            </Badge>
          </div>
          {description ? (
            <p className="text-muted-foreground mt-1 max-w-3xl text-sm">
              {description}
            </p>
          ) : null}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
