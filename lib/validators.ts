import { z } from "zod";

// Idea validation schemas
export const createIdeaSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required").max(5000, "Description must be less than 5000 characters"),
  impact: z.number().int().min(1, "Impact must be between 1-10").max(10, "Impact must be between 1-10"),
  confidence: z.number().int().min(1, "Confidence must be between 1-10").max(10, "Confidence must be between 1-10"),
  effort: z.number().int().min(1, "Effort must be between 1-10").max(10, "Effort must be between 1-10"),
  tags: z.array(z.string().min(1).max(50)).optional().default([]),
});

export const updateIdeaSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").optional(),
  description: z.string().min(1, "Description is required").max(5000, "Description must be less than 5000 characters").optional(),
  impact: z.number().int().min(1, "Impact must be between 1-10").max(10, "Impact must be between 1-10").optional(),
  confidence: z.number().int().min(1, "Confidence must be between 1-10").max(10, "Confidence must be between 1-10").optional(),
  effort: z.number().int().min(1, "Effort must be between 1-10").max(10, "Effort must be between 1-10").optional(),
  status: z.enum(["PENDING", "VALIDATING", "VALIDATED", "ARCHIVED"]).optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
});

export const ideaQuerySchema = z.object({
  ws: z.string().min(1, "Workspace ID is required"),
  q: z.string().optional(),
  tag: z.string().optional(),
  status: z.enum(["PENDING", "VALIDATING", "VALIDATED", "ARCHIVED"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// Validation Task schemas
export const createValidationTaskSchema = z.object({
  ideaId: z.string().min(1, "Idea ID is required"),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  kind: z.enum(["INTERVIEW", "SMOKE_TEST", "MARKET_RESEARCH", "PROTOTYPE", "OTHER"]),
  notes: z.string().max(2000, "Notes must be less than 2000 characters").optional(),
  weight: z.number().int().min(1).max(10).optional().default(1),
});

export const updateValidationTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").optional(),
  kind: z.enum(["INTERVIEW", "SMOKE_TEST", "MARKET_RESEARCH", "PROTOTYPE", "OTHER"]).optional(),
  status: z.enum(["TODO", "DOING", "DONE", "SKIPPED"]).optional(),
  notes: z.string().max(2000, "Notes must be less than 2000 characters").optional(),
  weight: z.number().int().min(1).max(10).optional(),
});

// Evidence schemas
export const createEvidenceSchema = z.object({
  ideaId: z.string().min(1, "Idea ID is required"),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  summary: z.string().max(5000, "Summary must be less than 5000 characters").optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const updateEvidenceSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").optional(),
  summary: z.string().max(5000, "Summary must be less than 5000 characters").optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// Comment schemas
export const createCommentSchema = z.object({
  ideaId: z.string().min(1, "Idea ID is required"),
  body: z.string().min(1, "Comment body is required").max(2000, "Comment must be less than 2000 characters"),
});

export const updateCommentSchema = z.object({
  body: z.string().min(1, "Comment body is required").max(2000, "Comment must be less than 2000 characters"),
});

// Workspace schemas
export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100, "Name must be less than 100 characters"),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100, "Name must be less than 100 characters").optional(),
});

// User schemas
export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").optional(),
  email: z.string().email("Must be a valid email").optional(),
});

// Membership schemas
export const createMembershipSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  email: z.string().email("Must be a valid email"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).optional().default("MEMBER"),
});

export const updateMembershipSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

// Generic schemas
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const workspaceParamSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
});

// Type exports
export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;
export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>;
export type IdeaQueryInput = z.infer<typeof ideaQuerySchema>;
export type CreateValidationTaskInput = z.infer<typeof createValidationTaskSchema>;
export type UpdateValidationTaskInput = z.infer<typeof updateValidationTaskSchema>;
export type CreateEvidenceInput = z.infer<typeof createEvidenceSchema>;
export type UpdateEvidenceInput = z.infer<typeof updateEvidenceSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateMembershipInput = z.infer<typeof createMembershipSchema>;
export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>;
