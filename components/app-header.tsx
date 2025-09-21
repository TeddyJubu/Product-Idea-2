"use client";

import { Button } from "@/components/ui/button";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { useWorkspace } from "@/contexts/workspace-context";
import { Plus } from "lucide-react";

interface AppHeaderProps {
  title?: string;
  description?: string;
  onNewIdea?: () => void;
}

export function AppHeader({ 
  title = "Ideas", 
  description,
  onNewIdea 
}: AppHeaderProps) {
  const { selectedWorkspace } = useWorkspace();

  const defaultDescription = selectedWorkspace 
    ? `${selectedWorkspace.name} • Capture, prioritize, and validate your ideas with ICE scoring`
    : "Capture, prioritize, and validate your ideas with ICE scoring";

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground">
                {description || defaultDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <WorkspaceSwitcher />
            
            {onNewIdea && (
              <Button onClick={onNewIdea} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Idea
              </Button>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
