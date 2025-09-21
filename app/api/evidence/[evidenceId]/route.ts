import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ZodError, z } from "zod";
import { updateEvidenceSchema } from "@/lib/validators";

const evidenceIdParamSchema = z.object({ evidenceId: z.string().min(1) });

async function ensureEvidenceExists(evidenceId: string) {
  const evidence = await prisma.evidence.findUnique({
    where: { id: evidenceId },
    select: { id: true },
  });
  if (!evidence) return { ok: false as const, status: 404 as const, error: "Evidence not found" as const };
  return { ok: true as const };
}

export async function PATCH(req: NextRequest, { params }: { params: { evidenceId: string } }) {
  try {
    const { evidenceId } = evidenceIdParamSchema.parse(params);
    const body = await req.json();
    const data = updateEvidenceSchema.parse(body);

    const exists = await ensureEvidenceExists(evidenceId);
    if (!exists.ok) return NextResponse.json({ error: exists.error }, { status: exists.status });

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
    const { evidenceId } = evidenceIdParamSchema.parse(params);
    const exists = await ensureEvidenceExists(evidenceId);
    if (!exists.ok) return NextResponse.json({ error: exists.error }, { status: exists.status });

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

