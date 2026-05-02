import type { Document } from "@/lib/types";

let uploaded: Document[] = [];

export function pushUploadedDocument(doc: Document) {
  uploaded = [doc, ...uploaded];
}

export function getUploadedDocuments(): Document[] {
  return uploaded;
}

export function removeUploadedDocument(id: string) {
  uploaded = uploaded.filter((d) => d.id !== id);
}
