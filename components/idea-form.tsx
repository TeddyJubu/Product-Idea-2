"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface IdeaFormData {
  title: string;
  description: string;
  impact: number;
  confidence: number;
  effort: number;
}

interface IdeaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onSuccess?: () => void;
}

export function IdeaForm({ open, onOpenChange, workspaceId, onSuccess }: IdeaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<IdeaFormData>();

  async function onSubmit(values: IdeaFormData) {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/ideas`, {
        method: "POST",
        body: JSON.stringify({ ...values, workspaceId }),
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create idea");
      }

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setError(null);
        reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Idea</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Input
              placeholder="Title"
              {...register("title", {
                required: "Title is required",
                maxLength: { value: 200, message: "Title must be less than 200 characters" }
              })}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Describe your idea..."
              {...register("description", {
                required: "Description is required",
                maxLength: { value: 5000, message: "Description must be less than 5000 characters" }
              })}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Input
                type="number"
                min={1}
                max={10}
                placeholder="Impact (1-10)"
                {...register("impact", {
                  required: "Impact is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Impact must be at least 1" },
                  max: { value: 10, message: "Impact must be at most 10" }
                })}
                disabled={isSubmitting}
              />
              {errors.impact && (
                <p className="text-xs text-destructive">{errors.impact.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                type="number"
                min={1}
                max={10}
                placeholder="Confidence (1-10)"
                {...register("confidence", {
                  required: "Confidence is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Confidence must be at least 1" },
                  max: { value: 10, message: "Confidence must be at most 10" }
                })}
                disabled={isSubmitting}
              />
              {errors.confidence && (
                <p className="text-xs text-destructive">{errors.confidence.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                type="number"
                min={1}
                max={10}
                placeholder="Effort (1-10)"
                {...register("effort", {
                  required: "Effort is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Effort must be at least 1" },
                  max: { value: 10, message: "Effort must be at most 10" }
                })}
                disabled={isSubmitting}
              />
              {errors.effort && (
                <p className="text-xs text-destructive">{errors.effort.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                "Create Idea"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
