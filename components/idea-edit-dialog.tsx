"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

interface Idea {
  id: string;
  title: string;
  description: string;
  impact: number;
  confidence: number;
  effort: number;
  iceScore: number;
  status: "PENDING" | "VALIDATING" | "VALIDATED" | "ARCHIVED";
}

interface IdeaEditDialogProps {
  idea: Idea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function IdeaEditDialog({ idea, open, onOpenChange, onSuccess }: IdeaEditDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState([5]);
  const [confidence, setConfidence] = useState([5]);
  const [effort, setEffort] = useState([5]);
  const [status, setStatus] = useState<Idea["status"]>("PENDING");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Calculate ICE score
  const iceScore = impact[0] && confidence[0] && effort[0]
    ? (impact[0] * confidence[0]) / effort[0]
    : 0;

  // Reset form when idea changes
  useEffect(() => {
    if (idea) {
      setTitle(idea.title);
      setDescription(idea.description);
      setImpact([idea.impact]);
      setConfidence([idea.confidence]);
      setEffort([idea.effort]);
      setStatus(idea.status);
    } else {
      setTitle("");
      setDescription("");
      setImpact([5]);
      setConfidence([5]);
      setEffort([5]);
      setStatus("PENDING");
    }
  }, [idea]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          impact: impact[0],
          confidence: confidence[0],
          effort: effort[0],
          status,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update idea");
      }

      toast({
        title: "Success",
        description: "Idea updated successfully!",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update idea",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Idea</DialogTitle>
          <DialogDescription>
            Update your idea details and ICE scoring.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter idea title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your idea in detail"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label>Impact ({impact[0]})</Label>
              <Slider
                value={impact}
                onValueChange={setImpact}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                How much positive impact will this have?
              </p>
            </div>

            <div className="space-y-3">
              <Label>Confidence ({confidence[0]})</Label>
              <Slider
                value={confidence}
                onValueChange={setConfidence}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                How confident are you this will work?
              </p>
            </div>

            <div className="space-y-3">
              <Label>Effort ({effort[0]})</Label>
              <Slider
                value={effort}
                onValueChange={setEffort}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                How much effort will this require?
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value: Idea["status"]) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="VALIDATING">Validating</SelectItem>
                <SelectItem value="VALIDATED">Validated</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">ICE Score</span>
              <span className="text-2xl font-bold text-primary">
                {iceScore.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Calculated as (Impact × Confidence) ÷ Effort
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !description.trim()}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                "Update Idea"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
