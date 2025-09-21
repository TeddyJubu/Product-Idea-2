import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ZodError, z } from "zod";
import { updateEvidenceSchema } from "@/lib/validators";

const evidenceIdParamSchema = z.object({ evidenceId: z.string().min(1) });

async function ensureMembershipByEvidence(evidenceId: string, userId: string) {
  const evidence = await prisma.evidence.findUnique({
    where: { id: evidenceId },
    select: { idea: { select: { workspaceId: true } } },
  });
  if (!evidence) return { ok: false as const, status: 404 as const, error: "Evidence not found" as const };
  const membership = await prisma.membership.findFirst({ where: { userId, workspaceId: evidence.idea.workspaceId } });
  if (!membership) return { ok: false as const, status: 403 as const, error: "Access denied to workspace" as const };
  return { ok: true as const };
}

export async function PATCH(req: NextRequest, { params }: { params: { evidenceId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { evidenceId } = evidenceIdParamSchema.parse(params);
    const body = await req.json();
    const data = updateEvidenceSchema.parse(body);

    const userId = (session.user as any).id as string;
    const membershipCheck = await ensureMembershipByEvidence(evidenceId, userId);
    if (!membershipCheck.ok) return NextResponse.json({ error: membershipCheck.error }, { status: membershipCheck.status });

    const evidence = await prisma.evidence.update({ where: { id: evidenceId }, data });
    return NextResponse.json({ evidence });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input data", details: error.errors }, { status: 400 });
    }
    console.error("PATCH /evidence/[evidenceId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { evidenceId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { evidenceId } = evidenceIdParamSchema.parse(params);
    const userId = (session.user as any).id as string;
    const membershipCheck = await ensureMembershipByEvidence(evidenceId, userId);
    if (!membershipCheck.ok) return NextResponse.json({ error: membershipCheck.error }, { status: membershipCheck.status });

    await prisma.evidence.delete({ where: { id: evidenceId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid parameters", details: error.errors }, { status: 400 });
    }
    console.error("DELETE /evidence/[evidenceId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

