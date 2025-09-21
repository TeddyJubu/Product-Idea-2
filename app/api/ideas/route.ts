import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ice } from "@/lib/utils";
import { ideaQuerySchema, createIdeaSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const validatedQuery = ideaQuerySchema.parse(searchParams);

    // Verify user has access to the workspace
    const membership = await prisma.membership.findFirst({
      where: {
        userId: userId,
        workspaceId: validatedQuery.ws
      }
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied to workspace" }, { status: 403 });
    }

    const ideas = await prisma.idea.findMany({
      where: {
        workspaceId: validatedQuery.ws,
        deletedAt: null,
        status: validatedQuery.status || undefined,
        AND: validatedQuery.q ? [{ OR: [
          { title: { contains: validatedQuery.q, mode: "insensitive" } },
          { description: { contains: validatedQuery.q, mode: "insensitive" } }
        ]}] : undefined,
        ...(validatedQuery.tag ? { tags: { some: { tag: { name: validatedQuery.tag } } } } : {})
      },
      include: {
        tags: { include: { tag: true } },
        _count: {
          select: {
            tasks: true,
            evidences: true,
            comments: true
          }
        }
      },
      orderBy: [{ iceScore: "desc" }, { updatedAt: "desc" }],
      skip: (validatedQuery.page - 1) * validatedQuery.limit,
      take: validatedQuery.limit
    });

    return NextResponse.json({
      ideas,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: ideas.length
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: "Invalid query parameters",
        details: error.errors
      }, { status: 400 });
    }

    console.error("Error fetching ideas:", error);
    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const body = await req.json();
    const validatedData = createIdeaSchema.parse(body);

    // Verify user has access to the workspace
    const membership = await prisma.membership.findFirst({
      where: {
        userId: userId,
        workspaceId: validatedData.workspaceId
      }
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied to workspace" }, { status: 403 });
    }

    const iceScore = ice(validatedData.impact, validatedData.confidence, validatedData.effort);

    const idea = await prisma.$transaction(async (tx) => {
      const created = await tx.idea.create({
        data: {
          workspaceId: validatedData.workspaceId,
          title: validatedData.title,
          description: validatedData.description,
          impact: validatedData.impact,
          confidence: validatedData.confidence,
          effort: validatedData.effort,
          iceScore,
          createdById: "system" // TODO: Replace with actual user ID from session
        },
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

      if (validatedData.tags && validatedData.tags.length > 0) {
        const tagRows = await Promise.all(validatedData.tags.map(async (name: string) =>
          tx.tag.upsert({
            where: { workspaceId_name: { workspaceId: validatedData.workspaceId, name } },
            update: {},
            create: { workspaceId: validatedData.workspaceId, name }
          })
        ));

        for (const tag of tagRows) {
          await tx.ideaTag.create({
            data: { ideaId: created.id, tagId: tag.id }
          });
        }
      }

      return created;
    });

    return NextResponse.json({ idea }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: "Invalid input data",
        details: error.errors
      }, { status: 400 });
    }

    console.error("Error creating idea:", error);
    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 });
  }
}
