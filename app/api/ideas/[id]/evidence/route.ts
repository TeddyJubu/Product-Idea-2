import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ZodError } from "zod";
import { createEvidenceSchema, idParamSchema } from "@/lib/validators";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = idParamSchema.parse(params);

    const idea = await prisma.idea.findUnique({ where: { id, deletedAt: null }, select: { workspaceId: true } });
    if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

    const userId = (session.user as any).id as string;
    const membership = await prisma.membership.findFirst({ where: { userId, workspaceId: idea.workspaceId } });
    if (!membership) return NextResponse.json({ error: "Access denied to workspace" }, { status: 403 });

    const evidences = await prisma.evidence.findMany({ where: { ideaId: id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ evidences });
  } catch (error) {
    console.error("GET /ideas/[id]/evidence error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = idParamSchema.parse(params);
    const body = await req.json();
    const data = createEvidenceSchema.parse({ ...body, ideaId: id });

    const idea = await prisma.idea.findUnique({ where: { id, deletedAt: null }, select: { workspaceId: true } });
    if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

    const userId = (session.user as any).id as string;
    const membership = await prisma.membership.findFirst({ where: { userId, workspaceId: idea.workspaceId } });
    if (!membership) return NextResponse.json({ error: "Access denied to workspace" }, { status: 403 });

    const evidence = await prisma.evidence.create({ data: {
      ideaId: id,
      title: data.title,
      url: data.url ?? undefined,
      content: data.content ?? undefined,
      kind: data.kind ?? "NOTE",
    }});
    return NextResponse.json({ evidence }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input data", details: error.errors }, { status: 400 });
    }
    console.error("POST /ideas/[id]/evidence error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

