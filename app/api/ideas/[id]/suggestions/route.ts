import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { idParamSchema } from "@/lib/validators";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = idParamSchema.parse(params);

  const idea = await prisma.idea.findUnique({ where: { id, deletedAt: null }, select: { workspaceId: true, confidence: true } });
  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  const userId = (session.user as any).id as string;
  const membership = await prisma.membership.findFirst({ where: { userId, workspaceId: idea.workspaceId } });
  if (!membership) return NextResponse.json({ error: "Access denied to workspace" }, { status: 403 });

  const [tasksDone, evidenceCount] = await Promise.all([
    prisma.validationTask.count({ where: { ideaId: id, status: "DONE" } }),
    prisma.evidence.count({ where: { ideaId: id } }),
  ]);

  // Simple heuristic: +1 confidence per 2 DONE tasks, +1 if >=3 evidence, capped 10
  let suggested = idea.confidence + Math.floor(tasksDone / 2) + (evidenceCount >= 3 ? 1 : 0);
  suggested = Math.max(1, Math.min(10, suggested));

  return NextResponse.json({ suggestedConfidence: suggested, tasksDone, evidenceCount });
}

