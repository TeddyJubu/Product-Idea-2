"use client";
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { IdeaForm } from "@/components/idea-form";
import { IdeaTable } from "@/components/idea-table";
import { IdeaEditDialog } from "@/components/idea-edit-dialog";
import { ErrorBoundary } from "@/components/error-boundary";
import { AppHeader } from "@/components/app-header";
import { Spinner } from "@/components/ui/spinner";
import { useWorkspace } from "@/contexts/workspace-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const {
    selectedWorkspace,
    workspaces,
    isLoading: isLoadingWorkspace,
    isLoadingWorkspaces
  } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  // Refresh ideas when workspace changes
  const handleWorkspaceChange = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Handle idea actions
  const handleIdeaEdit = useCallback((idea: any) => {
    setEditingIdea(idea);
    setEditDialogOpen(true);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleIdeaCreated = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Success",
      description: "Idea created successfully!",
    });
  }, [toast]);

  const handleIdeaClick = useCallback((idea: any) => {
    router.push(`/ideas/${idea.id}`);
  }, [router]);

  // Loading state
  if (isLoadingWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }


  // No workspace selected -> show brief preparation state (no gate)
  if (!selectedWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  // Main application with workspace selected
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <AppHeader onNewIdea={() => setOpen(true)} />

        <main className="mx-auto max-w-6xl p-6">
          <Card className="p-6">
            <IdeaTable
              key={refreshKey}
              workspaceId={selectedWorkspace.id}
              onIdeaClick={handleIdeaClick}
              onIdeaEdit={handleIdeaEdit}
              onIdeaDelete={() => setRefreshKey(prev => prev + 1)}
              onIdeaDuplicate={() => setRefreshKey(prev => prev + 1)}
            />
          </Card>

          <IdeaForm
            open={open}
            onOpenChange={setOpen}
            workspaceId={selectedWorkspace.id}
            onSuccess={handleIdeaCreated}
          />

          <IdeaEditDialog
            idea={editingIdea}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={handleEditSuccess}
          />
        </main>
      </div>
    </ErrorBoundary>
  );
}
