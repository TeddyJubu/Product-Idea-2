"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Building2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Workspace {
  id: string;
  name: string;
  role: string;
}

interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  onWorkspaceSelect: (workspace: Workspace) => void;
  onWorkspaceCreated: () => void;
}

export function WorkspaceSelector({ 
  workspaces, 
  selectedWorkspace, 
  onWorkspaceSelect,
  onWorkspaceCreated 
}: WorkspaceSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newWorkspaceName.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create workspace");
      }

      const workspace = await response.json();
      setNewWorkspaceName("");
      setCreateDialogOpen(false);
      onWorkspaceCreated();
      onWorkspaceSelect(workspace);
      
      toast({
        title: "Success",
        description: "Workspace created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create workspace",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (workspaces.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Welcome to Idea ICE!</CardTitle>
          <CardDescription>
            Create your first workspace to start managing ideas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="workspace-name" className="text-sm font-medium">
                Workspace name
              </label>
              <Input
                id="workspace-name"
                placeholder="My Company"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                disabled={isCreating}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isCreating || !newWorkspaceName.trim()}>
              {isCreating ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workspace
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Select Workspace</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="new-workspace-name" className="text-sm font-medium">
                  Workspace name
                </label>
                <Input
                  id="new-workspace-name"
                  placeholder="Enter workspace name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  disabled={isCreating}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || !newWorkspaceName.trim()}>
                  {isCreating ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {workspaces.map((workspace) => (
          <Card
            key={workspace.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedWorkspace?.id === workspace.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onWorkspaceSelect(workspace)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{workspace.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {workspace.role}
                    </p>
                  </div>
                </div>
                <Badge variant={workspace.role === "OWNER" ? "default" : "secondary"}>
                  {workspace.role.toLowerCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
