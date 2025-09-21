"use client";
import { useEffect, useState, useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Eye,
  Calendar,
  MessageSquare,
  CheckSquare,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWorkspacePermissions } from "@/contexts/workspace-context";

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

type SortField = 'title' | 'impact' | 'confidence' | 'effort' | 'iceScore' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface IdeaTableProps {
  workspaceId: string;
  onIdeaClick?: (idea: Idea) => void;
  onIdeaEdit?: (idea: Idea) => void;
  onIdeaDelete?: (idea: Idea) => void;
  onIdeaDuplicate?: (idea: Idea) => void;
}

export function IdeaTable({
  workspaceId,
  onIdeaClick,
  onIdeaEdit,
  onIdeaDelete,
  onIdeaDuplicate
}: IdeaTableProps) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('iceScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Idea | null>(null);

  const { toast } = useToast();
  const { canDeleteIdeas } = useWorkspacePermissions();

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

  // Sorting logic
  const sortedIdeas = useMemo(() => {
    const sorted = [...ideas].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle special cases
      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'title') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [ideas, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'iceScore' ? 'desc' : 'asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ?
      <ArrowUp className="h-4 w-4" /> :
      <ArrowDown className="h-4 w-4" />;
  };

  // Action handlers
  const handleDelete = async (idea: Idea) => {
    if (!canDeleteIdeas) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to delete ideas",
        variant: "destructive",
      });
      return;
    }

    setDeletingId(idea.id);
    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete idea');
      }

      setIdeas(ideas.filter(i => i.id !== idea.id));
      onIdeaDelete?.(idea);
      toast({
        title: "Success",
        description: "Idea deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete idea",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (idea: Idea) => {
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${idea.title} (Copy)`,
          description: idea.description,
          impact: idea.impact,
          confidence: idea.confidence,
          effort: idea.effort,
          workspaceId: workspaceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate idea');
      }

      await fetchIdeas(); // Refresh the list
      toast({
        title: "Success",
        description: "Idea duplicated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate idea",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: Idea["status"]) => {
    switch (status) {
      case "PENDING": return "secondary";
      case "VALIDATING": return "default";
      case "VALIDATED": return "default";
      case "ARCHIVED": return "outline";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: Idea["status"]) => {
    switch (status) {
      case "PENDING": return <Calendar className="h-3 w-3" />;
      case "VALIDATING": return <Eye className="h-3 w-3" />;
      case "VALIDATED": return <CheckSquare className="h-3 w-3" />;
      case "ARCHIVED": return <FileText className="h-3 w-3" />;
      default: return <Calendar className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getIceScoreColor = (score: number) => {
    if (score >= 7) return "text-green-600 font-semibold";
    if (score >= 5) return "text-yellow-600 font-semibold";
    if (score >= 3) return "text-orange-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center gap-2 p-4 border-b">
          <Spinner size="sm" />
          <span className="text-sm text-muted-foreground">Loading ideas...</span>
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
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
      <div className="rounded-md border">
        <div className="text-center py-12 text-muted-foreground">
          <div className="flex flex-col items-center space-y-2">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium">No ideas yet</p>
            <p className="text-sm">Create your first idea to get started!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('title')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Title
                {getSortIcon('title')}
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                onClick={() => handleSort('impact')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Impact
                {getSortIcon('impact')}
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                onClick={() => handleSort('confidence')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Confidence
                {getSortIcon('confidence')}
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                onClick={() => handleSort('effort')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Effort
                {getSortIcon('effort')}
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                onClick={() => handleSort('iceScore')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                ICE Score
                {getSortIcon('iceScore')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('status')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Status
                {getSortIcon('status')}
              </Button>
            </TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('createdAt')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Created
                {getSortIcon('createdAt')}
              </Button>
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedIdeas.map((idea) => (
            <TableRow
              key={idea.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onIdeaClick?.(idea)}
            >
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium leading-none">{idea.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {idea.description}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
                    {idea.impact}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-700">
                    {idea.confidence}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-medium text-orange-700">
                    {idea.effort}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className={`text-lg font-bold ${getIceScoreColor(idea.iceScore)}`}>
                  {idea.iceScore.toFixed(1)}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusColor(idea.status)} className="flex items-center gap-1">
                  {getStatusIcon(idea.status)}
                  {idea.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckSquare className="h-3 w-3" />
                    {idea._count.tasks}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {idea._count.evidences}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {idea._count.comments}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(idea.createdAt)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onIdeaClick?.(idea);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {onIdeaEdit && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onIdeaEdit(idea);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(idea);
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {canDeleteIdeas && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setToDelete(idea);
                          setConfirmOpen(true);
                        }}
                        className="text-red-600"
                        disabled={deletingId === idea.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === idea.id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete idea?</DialogTitle>
            <DialogDescription>
              This will soft-delete the idea. You can restore it later from the database by clearing deletedAt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (toDelete) {
                  await handleDelete(toDelete);
                  setToDelete(null);
                  setConfirmOpen(false);
                }
              }}
              disabled={!!deletingId}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </Table>
    </div>
  );
}
