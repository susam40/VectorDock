import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { Collection } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { chunkStrategyTr } from "@/lib/tr";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{collection.name}</CardTitle>
          <Badge variant="outline">
            {chunkStrategyTr[collection.chunkingStrategy]}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          {collection.description ?? "—"}
        </p>
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1 space-y-1 text-sm">
        <p>{collection.documentCount} belge</p>
        <p className="font-mono text-xs">{collection.embeddingModel}</p>
        <p>
          parça boyutu {collection.chunkSize} / örtüşme {collection.overlap}
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {collection.hybridSearch ? <Badge>Hibrit</Badge> : null}
          {collection.reranker ? <Badge>Yeniden sıralama</Badge> : null}
        </div>
      </CardContent>
      <CardFooter className="border-t text-xs">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(collection.createdAt), {
              addSuffix: true,
              locale: tr,
            })}
          </span>
          <Link
            href={`/collections/${collection.id}`}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            Yapılandır
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
