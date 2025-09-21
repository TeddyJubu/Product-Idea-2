"use client";
import { useState, useCallback, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IdeaForm } from "@/components/idea-form";
import { IdeaTable } from "@/components/idea-table";
import { ErrorBoundary } from "@/components/error-boundary";
import { WorkspaceSelector } from "@/components/workspace-selector";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, User } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  role: string;
}

export default function Page() {
  const { data: session, status } = useSession();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const { toast } = useToast();

  // Load workspaces when user is authenticated
  useEffect(() => {
    if (session?.user && status === "authenticated") {
      loadWorkspaces();
    }
  }, [session, status]);

  const loadWorkspaces = async () => {
    setIsLoadingWorkspaces(true);
    try {
      const response = await fetch("/api/workspaces");
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
        // Auto-select first workspace if none selected
        if (data.length > 0 && !selectedWorkspace) {
          setSelectedWorkspace(data[0]);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load workspaces",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load workspaces",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  const handleWorkspaceSelect = useCallback((workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setRefreshKey(prev => prev + 1); // Refresh ideas when workspace changes
  }, []);

  const handleWorkspaceCreated = useCallback(() => {
    loadWorkspaces();
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
  if (status === "loading") {
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
                onWorkspaceSelect={handleWorkspaceSelect}
                onWorkspaceCreated={handleWorkspaceCreated}
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
      <main className="mx-auto max-w-6xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ideas</h1>
            <p className="text-muted-foreground">
              {selectedWorkspace.name} • Capture, prioritize, and validate your ideas with ICE scoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedWorkspace(null)}
            >
              Switch Workspace
            </Button>
            <Button onClick={() => setOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Idea
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

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
    </ErrorBoundary>
  );
}
