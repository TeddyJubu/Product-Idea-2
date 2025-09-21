"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

export interface Workspace {
  id: string;
  name: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt?: string;
  updatedAt?: string;
}

interface WorkspaceContextType {
  // State
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  isLoading: boolean;
  isLoadingWorkspaces: boolean;
  
  // Actions
  selectWorkspace: (workspace: Workspace) => void;
  clearWorkspace: () => void;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace | null>;
  
  // Utilities
  hasWorkspaceAccess: (workspaceId: string) => boolean;
  getUserRole: (workspaceId: string) => string | null;
  isWorkspaceOwner: (workspaceId?: string) => boolean;
  isWorkspaceAdmin: (workspaceId?: string) => boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const WORKSPACE_STORAGE_KEY = "idea-ice-selected-workspace";

interface WorkspaceProviderProps {
  children: React.ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load workspaces from API
  const loadWorkspaces = useCallback(async () => {
    if (!session?.user) return;
    
    setIsLoadingWorkspaces(true);
    try {
      const response = await fetch("/api/workspaces");
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
        
        // Try to restore previously selected workspace
        const savedWorkspaceId = localStorage.getItem(WORKSPACE_STORAGE_KEY);
        if (savedWorkspaceId) {
          const savedWorkspace = data.find((w: Workspace) => w.id === savedWorkspaceId);
          if (savedWorkspace) {
            setSelectedWorkspace(savedWorkspace);
          } else {
            // Saved workspace no longer exists, clear it
            localStorage.removeItem(WORKSPACE_STORAGE_KEY);
          }
        }
        
        // Auto-select first workspace if none selected and no saved preference
        if (!savedWorkspaceId && data.length > 0 && !selectedWorkspace) {
          setSelectedWorkspace(data[0]);
          localStorage.setItem(WORKSPACE_STORAGE_KEY, data[0].id);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load workspaces",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading workspaces:", error);
      toast({
        title: "Error",
        description: "Failed to load workspaces",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWorkspaces(false);
      setIsLoading(false);
    }
  }, [session, toast, selectedWorkspace]);

  // Load workspaces when user is authenticated
  useEffect(() => {
    if (session?.user && status === "authenticated") {
      loadWorkspaces();
    } else if (status === "unauthenticated") {
      // Clear workspace data when user logs out
      setWorkspaces([]);
      setSelectedWorkspace(null);
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      setIsLoading(false);
    }
  }, [session, status, loadWorkspaces]);

  // Select workspace and persist to localStorage
  const selectWorkspace = useCallback((workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    localStorage.setItem(WORKSPACE_STORAGE_KEY, workspace.id);
  }, []);

  // Clear selected workspace
  const clearWorkspace = useCallback(() => {
    setSelectedWorkspace(null);
    localStorage.removeItem(WORKSPACE_STORAGE_KEY);
  }, []);

  // Refresh workspaces
  const refreshWorkspaces = useCallback(async () => {
    await loadWorkspaces();
  }, [loadWorkspaces]);

  // Create new workspace
  const createWorkspace = useCallback(async (name: string): Promise<Workspace | null> => {
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create workspace");
      }

      const workspace = await response.json();
      
      // Refresh workspaces to get updated list
      await loadWorkspaces();
      
      // Auto-select the new workspace
      selectWorkspace(workspace);
      
      toast({
        title: "Success",
        description: "Workspace created successfully!",
      });
      
      return workspace;
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create workspace",
        variant: "destructive",
      });
      return null;
    }
  }, [loadWorkspaces, selectWorkspace, toast]);

  // Utility functions
  const hasWorkspaceAccess = useCallback((workspaceId: string): boolean => {
    return workspaces.some(w => w.id === workspaceId);
  }, [workspaces]);

  const getUserRole = useCallback((workspaceId: string): string | null => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    return workspace?.role || null;
  }, [workspaces]);

  const isWorkspaceOwner = useCallback((workspaceId?: string): boolean => {
    const targetId = workspaceId || selectedWorkspace?.id;
    if (!targetId) return false;
    return getUserRole(targetId) === "OWNER";
  }, [selectedWorkspace, getUserRole]);

  const isWorkspaceAdmin = useCallback((workspaceId?: string): boolean => {
    const targetId = workspaceId || selectedWorkspace?.id;
    if (!targetId) return false;
    const role = getUserRole(targetId);
    return role === "OWNER" || role === "ADMIN";
  }, [selectedWorkspace, getUserRole]);

  const value: WorkspaceContextType = {
    // State
    workspaces,
    selectedWorkspace,
    isLoading,
    isLoadingWorkspaces,
    
    // Actions
    selectWorkspace,
    clearWorkspace,
    refreshWorkspaces,
    createWorkspace,
    
    // Utilities
    hasWorkspaceAccess,
    getUserRole,
    isWorkspaceOwner,
    isWorkspaceAdmin,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// Custom hook to use workspace context
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}

// Custom hook for workspace-specific operations
export function useWorkspaceActions() {
  const { 
    createWorkspace, 
    refreshWorkspaces, 
    selectWorkspace, 
    clearWorkspace 
  } = useWorkspace();
  
  return {
    createWorkspace,
    refreshWorkspaces,
    selectWorkspace,
    clearWorkspace,
  };
}

// Custom hook for workspace permissions
export function useWorkspacePermissions(workspaceId?: string) {
  const { 
    hasWorkspaceAccess, 
    getUserRole, 
    isWorkspaceOwner, 
    isWorkspaceAdmin,
    selectedWorkspace 
  } = useWorkspace();
  
  const targetId = workspaceId || selectedWorkspace?.id;
  
  return {
    hasAccess: targetId ? hasWorkspaceAccess(targetId) : false,
    role: targetId ? getUserRole(targetId) : null,
    isOwner: isWorkspaceOwner(targetId),
    isAdmin: isWorkspaceAdmin(targetId),
    canManageWorkspace: isWorkspaceAdmin(targetId),
    canInviteMembers: isWorkspaceAdmin(targetId),
    canDeleteIdeas: isWorkspaceAdmin(targetId),
  };
}
