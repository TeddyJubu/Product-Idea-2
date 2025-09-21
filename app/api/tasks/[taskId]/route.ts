import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ZodError, z } from "zod";
import { updateValidationTaskSchema } from "@/lib/validators";

const taskIdParamSchema = z.object({ taskId: z.string().min(1) });

async function ensureTaskExists(taskId: string) {
  const task = await prisma.validationTask.findUnique({
    where: { id: taskId },
    select: { id: true },
  });
  if (!task) return { ok: false as const, status: 404 as const, error: "Task not found" as const };
  return { ok: true as const };
}

export async function PATCH(req: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const { taskId } = taskIdParamSchema.parse(params);
    const body = await req.json();
    const data = updateValidationTaskSchema.parse(body);

    const exists = await ensureTaskExists(taskId);
    if (!exists.ok) return NextResponse.json({ error: exists.error }, { status: exists.status });

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
    const { taskId } = taskIdParamSchema.parse(params);
    const exists = await ensureTaskExists(taskId);
    if (!exists.ok) return NextResponse.json({ error: exists.error }, { status: exists.status });

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

