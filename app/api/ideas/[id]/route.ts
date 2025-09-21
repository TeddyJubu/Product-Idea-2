import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ice } from "@/lib/utils";
import { updateIdeaSchema, idParamSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function GET(req: NextRequest, { params }: { params: { id: string }}) {
  try {

    const validatedParams = idParamSchema.parse(params);

    const idea = await prisma.idea.findUnique({
      where: {
        id: validatedParams.id,
        deletedAt: null
      },
      include: {
        tags: { include: { tag: true } },
        tasks: { orderBy: { createdAt: "desc" } },
        evidences: { orderBy: { createdAt: "desc" } },
        comments: {
          include: { author: { select: { name: true, email: true } } },
          orderBy: { createdAt: "desc" }
        },
        createdBy: { select: { name: true, email: true } }
      }
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }


    return NextResponse.json({ idea });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: "Invalid parameters",
        details: error.errors
      }, { status: 400 });
    }

    console.error("Error fetching idea:", error);
    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string }}) {
  try {

    const validatedParams = idParamSchema.parse(params);

    // Fetch idea to verify workspace and access
    const existing = await prisma.idea.findUnique({
      where: { id: validatedParams.id, deletedAt: null },
      select: { workspaceId: true, impact: true, confidence: true, effort: true, status: true }
    });

    if (!existing) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }


    const body = await req.json();
    const validatedData = updateIdeaSchema.parse(body);

    const payload: any = { ...validatedData };

    // Validate status transition if status is being updated
    if (validatedData.status) {
      const from = existing.status as any;
      const to = validatedData.status as any;
      const allowed: Record<string, string[]> = {
        PENDING: ["VALIDATING", "ARCHIVED"],
        VALIDATING: ["VALIDATED", "ARCHIVED"],
        VALIDATED: ["ARCHIVED"],
        ARCHIVED: [],
      };
      const ok = (allowed[from] ?? []).includes(to);
      if (!ok) {
        return NextResponse.json({ error: `Invalid status transition from ${from} to ${to}` }, { status: 400 });
      }
    }

    // Recalculate ICE score if any component changed
    if (validatedData.impact || validatedData.confidence || validatedData.effort) {
      const newImpact = validatedData.impact ?? existing.impact;
      const newConfidence = validatedData.confidence ?? existing.confidence;
      const newEffort = validatedData.effort ?? existing.effort;
      payload.iceScore = ice(newImpact, newConfidence, newEffort);
    }

    const idea = await prisma.idea.update({
      where: { id: validatedParams.id, deletedAt: null },
      data: payload,
      include: {
        tags: { include: { tag: true } },
        _count: {
          select: { tasks: true, evidences: true, comments: true }
        }
      }
    });

    return NextResponse.json({ idea });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input data", details: error.errors }, { status: 400 });
    }

    console.error("Error updating idea:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string }}) {
  try {

    const validatedParams = idParamSchema.parse(params);

    const existing = await prisma.idea.findUnique({
      where: { id: validatedParams.id, deletedAt: null },
      select: { workspaceId: true }
    });

    if (!existing) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }


    const idea = await prisma.idea.update({
      where: { id: validatedParams.id, deletedAt: null },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ idea });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid parameters", details: error.errors }, { status: 400 });
    }

    console.error("Error deleting idea:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
