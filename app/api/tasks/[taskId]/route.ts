import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ZodError, z } from "zod";
import { updateValidationTaskSchema } from "@/lib/validators";

const taskIdParamSchema = z.object({ taskId: z.string().min(1) });

async function ensureMembershipByTask(taskId: string, userId: string) {
  const task = await prisma.validationTask.findUnique({
    where: { id: taskId },
    select: { idea: { select: { workspaceId: true } } },
  });
  if (!task) return { ok: false as const, status: 404 as const, error: "Task not found" as const };
  const membership = await prisma.membership.findFirst({ where: { userId, workspaceId: task.idea.workspaceId } });
  if (!membership) return { ok: false as const, status: 403 as const, error: "Access denied to workspace" as const };
  return { ok: true as const };
}

export async function PATCH(req: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { taskId } = taskIdParamSchema.parse(params);
    const body = await req.json();
    const data = updateValidationTaskSchema.parse(body);

    const userId = (session.user as any).id as string;
    const membershipCheck = await ensureMembershipByTask(taskId, userId);
    if (!membershipCheck.ok) return NextResponse.json({ error: membershipCheck.error }, { status: membershipCheck.status });

    const task = await prisma.validationTask.update({ where: { id: taskId }, data });
    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input data", details: error.errors }, { status: 400 });
    }
    console.error("PATCH /tasks/[taskId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { taskId } = taskIdParamSchema.parse(params);
    const userId = (session.user as any).id as string;
    const membershipCheck = await ensureMembershipByTask(taskId, userId);
    if (!membershipCheck.ok) return NextResponse.json({ error: membershipCheck.error }, { status: membershipCheck.status });

    await prisma.validationTask.delete({ where: { id: taskId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid parameters", details: error.errors }, { status: 400 });
    }
    console.error("DELETE /tasks/[taskId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

