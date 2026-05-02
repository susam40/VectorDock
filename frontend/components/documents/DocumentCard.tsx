import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { Document } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { FileText, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { docStatusTr, embStatusTr } from "@/lib/tr";

function statusVariant(
  s: Document["status"],
): "default" | "secondary" | "destructive" | "outline" {
  if (s === "ready") return "default";
  if (s === "failed") return "destructive";
  return "secondary";
}

export function DocumentCard({
  doc,
  onDelete,
  onReindex,
}: {
  doc: Document;
  onDelete?: (id: string) => void;
  onReindex?: (id: string) => void;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="space-y-1 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="text-muted-foreground size-4 shrink-0" />
            <span className="truncate font-medium">{doc.name}</span>
          </div>
          <Badge variant="outline" className="shrink-0 uppercase">
            {doc.type}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={statusVariant(doc.status)}>
            {docStatusTr[doc.status]}
          </Badge>
          <Badge variant="outline">{embStatusTr[doc.embeddingStatus]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1 text-sm">
        <p>
          {doc.chunkCount} parça · {(doc.sizeBytes / 1024).toFixed(0)} KB
        </p>
        <p className="mt-1">
          {formatDistanceToNow(new Date(doc.uploadedAt), {
            addSuffix: true,
            locale: tr,
          })}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
        <Link
          href={`/documents/${doc.id}`}
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
        >
          Görüntüle
        </Link>
        {onReindex ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReindex(doc.id)}
          >
            <RefreshCw className="mr-1 size-3.5" />
            Yeniden indeksle
          </Button>
        ) : null}
        {onDelete ? (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            onClick={() => onDelete(doc.id)}
          >
            <Trash2 className="mr-1 size-3.5" />
            Sil
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
