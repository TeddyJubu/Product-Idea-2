"use client";
import { useState, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IdeaForm } from "@/components/idea-form";
import { IdeaTable } from "@/components/idea-table";
import { ErrorBoundary } from "@/components/error-boundary";
import { WorkspaceSelector } from "@/components/workspace-selector";
import { AppHeader } from "@/components/app-header";
import { Spinner } from "@/components/ui/spinner";
import { useWorkspace } from "@/contexts/workspace-context";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut } from "lucide-react";

export default function Page() {
  const { data: session, status } = useSession();
  const {
    selectedWorkspace,
    workspaces,
    isLoading: isLoadingWorkspace,
    isLoadingWorkspaces
  } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  // Refresh ideas when workspace changes
  const handleWorkspaceChange = useCallback(() => {
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
    // TODO: Navigate to idea detail page
    console.log("Clicked idea:", idea);
    toast({
      title: "Coming soon",
      description: "Idea detail page will be available soon!",
    });
  }, [toast]);

  // Loading state
  if (status === "loading" || isLoadingWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome to Idea ICE</h1>
              <p className="text-muted-foreground mt-2">
                Sign in to start capturing and validating your ideas
              </p>
            </div>
            <Button onClick={() => signIn()} className="w-full">
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // No workspace selected
  if (!selectedWorkspace) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="mx-auto max-w-2xl px-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
              <p className="text-muted-foreground mt-2">
                Select a workspace to start managing your ideas
              </p>
            </div>

            {isLoadingWorkspaces ? (
              <div className="text-center">
                <Spinner size="lg" />
                <p className="text-muted-foreground mt-4">Loading workspaces...</p>
              </div>
            ) : (
              <WorkspaceSelector
                workspaces={workspaces}
                selectedWorkspace={selectedWorkspace}
                onWorkspaceSelect={handleWorkspaceChange}
                onWorkspaceCreated={handleWorkspaceChange}
              />
            )}

            <div className="mt-8 text-center">
              <Button variant="outline" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
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
            />
          </Card>

          <IdeaForm
            open={open}
            onOpenChange={setOpen}
            workspaceId={selectedWorkspace.id}
            onSuccess={handleIdeaCreated}
          />
        </main>
      </div>
    </ErrorBoundary>
  );
}
