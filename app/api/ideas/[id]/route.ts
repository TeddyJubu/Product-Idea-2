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
        tasks: {
          orderBy: { createdAt: "desc" }
        },
        evidences: {
          orderBy: { createdAt: "desc" }
        },
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
    const body = await req.json();
    const validatedData = updateIdeaSchema.parse(body);

    const payload: any = { ...validatedData };

    // Recalculate ICE score if any component changed
    if (validatedData.impact || validatedData.confidence || validatedData.effort) {
      const currentIdea = await prisma.idea.findUnique({
        where: { id: validatedParams.id },
        select: { impact: true, confidence: true, effort: true }
      });

      if (!currentIdea) {
        return NextResponse.json({ error: "Idea not found" }, { status: 404 });
      }

      const newImpact = validatedData.impact ?? currentIdea.impact;
      const newConfidence = validatedData.confidence ?? currentIdea.confidence;
      const newEffort = validatedData.effort ?? currentIdea.effort;

      payload.iceScore = ice(newImpact, newConfidence, newEffort);
    }

    const idea = await prisma.idea.update({
      where: { id: validatedParams.id, deletedAt: null },
      data: payload,
      include: {
        tags: { include: { tag: true } },
        _count: {
          select: {
            tasks: true,
            evidences: true,
            comments: true
          }
        }
      }
    });

    return NextResponse.json({ idea });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: "Invalid input data",
        details: error.errors
      }, { status: 400 });
    }

    console.error("Error updating idea:", error);
    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string }}) {
  try {
    const validatedParams = idParamSchema.parse(params);

    const idea = await prisma.idea.update({
      where: { id: validatedParams.id, deletedAt: null },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ idea });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: "Invalid parameters",
        details: error.errors
      }, { status: 400 });
    }

    console.error("Error deleting idea:", error);
    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 });
  }
}
