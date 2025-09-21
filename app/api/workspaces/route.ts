import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z, ZodError } from "zod";

const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

export async function GET(_req: NextRequest) {
  try {
    const workspaces = await prisma.workspace.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    });

    // No-auth mode: return all workspaces with a default role
    const result = workspaces.map((w) => ({
      id: w.id,
      name: w.name,
      role: "OWNER",
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/workspaces error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createWorkspaceSchema.parse(body);

    const ws = await prisma.workspace.create({
      data: { name: data.name.trim() },
      select: { id: true, name: true },
    });

    // No-auth mode: respond with default role
    return NextResponse.json(
      { id: ws.id, name: ws.name, role: "OWNER" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("POST /api/workspaces error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}