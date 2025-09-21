"use client";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Idea {
  id: string;
  title: string;
  description: string;
  impact: number;
  confidence: number;
  effort: number;
  iceScore: number;
  status: "PENDING" | "VALIDATING" | "VALIDATED" | "ARCHIVED";
  tags: { tag: { name: string } }[];
  _count: {
    tasks: number;
    evidences: number;
    comments: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface IdeaTableProps {
  workspaceId: string;
  onIdeaClick?: (idea: Idea) => void;
}

export function IdeaTable({ workspaceId, onIdeaClick }: IdeaTableProps) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/ideas?ws=${workspaceId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch ideas");
      }

      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchIdeas();
    }
  }, [workspaceId]);

  const getStatusColor = (status: Idea["status"]) => {
    switch (status) {
      case "PENDING": return "secondary";
      case "VALIDATING": return "default";
      case "VALIDATED": return "default";
      case "ARCHIVED": return "secondary";
      default: return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Spinner size="sm" />
          <span className="text-sm text-muted-foreground">Loading ideas...</span>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button onClick={fetchIdeas} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No ideas yet. Create your first idea to get started!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left border-b">
          <tr>
            <th className="pb-2 font-medium">Title</th>
            <th className="pb-2 font-medium">Impact</th>
            <th className="pb-2 font-medium">Conf.</th>
            <th className="pb-2 font-medium">Effort</th>
            <th className="pb-2 font-medium">ICE</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium">Progress</th>
          </tr>
        </thead>
        <tbody>
          {ideas.map((idea) => (
            <tr
              key={idea.id}
              className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onIdeaClick?.(idea)}
            >
              <td className="py-3">
                <div>
                  <div className="font-medium">{idea.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {idea.description}
                  </div>
                </div>
              </td>
              <td className="py-3">{idea.impact}</td>
              <td className="py-3">{idea.confidence}</td>
              <td className="py-3">{idea.effort}</td>
              <td className="py-3 font-medium">{idea.iceScore.toFixed(2)}</td>
              <td className="py-3">
                <Badge variant={getStatusColor(idea.status)}>
                  {idea.status}
                </Badge>
              </td>
              <td className="py-3 text-xs text-muted-foreground">
                {idea._count.tasks}T • {idea._count.evidences}E • {idea._count.comments}C
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
