"use client";

import { Header } from "@/components/layout/Header";
import { AssistantPromptEditor } from "@/components/prompts/AssistantPromptEditor";
import { PlaygroundRagPromptEditor } from "@/components/prompts/PlaygroundRagPromptEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PromptsPage() {
  return (
    <>
      <Header
        title="İstemler"
        description="Yardım asistanı ve sorgu laboratuvarı (RAG) istemleri bu tarayıcıda saklanır; laboratuvar sorguları güncel şablonları kullanır."
      />
      <main className="flex-1 space-y-6 p-6">
        <Tabs defaultValue="assistant" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="assistant">Yardım asistanı</TabsTrigger>
            <TabsTrigger value="playground">Sorgu laboratuvarı</TabsTrigger>
          </TabsList>
          <TabsContent value="assistant" className="mt-0">
            <AssistantPromptEditor />
          </TabsContent>
          <TabsContent value="playground" className="mt-0">
            <PlaygroundRagPromptEditor />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
