"use client";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IdeaForm } from "@/components/idea-form";
import { IdeaTable } from "@/components/idea-table";
import { ErrorBoundary } from "@/components/error-boundary";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export default function Page() {
  const [ws] = useState<string>("demo-workspace");
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const handleIdeaCreated = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Success",
      description: "Idea created successfully!",
    });
  }, [toast]);

  const handleIdeaClick = useCallback((idea: any) => {
    // TODO: Navigate to idea detail page
    console.log("Clicked idea:", idea);
    toast({
      title: "Coming soon",
      description: "Idea detail page will be available soon!",
    });
  }, [toast]);

  return (
    <ErrorBoundary>
      <main className="mx-auto max-w-6xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ideas</h1>
            <p className="text-muted-foreground">
              Capture, prioritize, and validate your ideas with ICE scoring
            </p>
          </div>
          <Button onClick={() => setOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Idea
          </Button>
        </div>

        <Card className="p-6">
          <IdeaTable
            key={refreshKey}
            workspaceId={ws}
            onIdeaClick={handleIdeaClick}
          />
        </Card>

        <IdeaForm
          open={open}
          onOpenChange={setOpen}
          workspaceId={ws}
          onSuccess={handleIdeaCreated}
        />
      </main>
    </ErrorBoundary>
  );
}
