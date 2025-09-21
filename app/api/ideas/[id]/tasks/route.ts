import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ZodError } from "zod";
import { createValidationTaskSchema, idParamSchema } from "@/lib/validators";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {

    const { id } = idParamSchema.parse(params);

    const idea = await prisma.idea.findUnique({ where: { id, deletedAt: null }, select: { workspaceId: true } });
    if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });


    const tasks = await prisma.validationTask.findMany({ where: { ideaId: id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("GET /ideas/[id]/tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {

    const { id } = idParamSchema.parse(params);
    const body = await req.json();
    const data = createValidationTaskSchema.parse({ ...body, ideaId: id });

    const idea = await prisma.idea.findUnique({ where: { id, deletedAt: null }, select: { workspaceId: true } });
    if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });


    const task = await prisma.validationTask.create({ data: { ideaId: id, title: data.title, kind: data.kind, notes: data.notes ?? undefined, weight: data.weight ?? 1 } });
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input data", details: error.errors }, { status: 400 });
    }
    console.error("POST /ideas/[id]/tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

