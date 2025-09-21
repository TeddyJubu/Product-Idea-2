import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IdeaTasksSection } from "@/components/idea-tasks-section";
import { IdeaEvidenceSection } from "@/components/idea-evidence-section";

export default async function IdeaDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    redirect("/");
  }

  const idea = await prisma.idea.findUnique({
    where: { id: params.id, deletedAt: null },
    include: {
      tags: { include: { tag: true } },
      _count: { select: { tasks: true, evidences: true, comments: true } },
      tasks: true,
      evidences: true,
      comments: { include: { author: { select: { name: true, email: true } } } },
    },
  });

  if (!idea) {
    notFound();
  }

  const userId = (session!.user as any).id as string;
  const membership = await prisma.membership.findFirst({
    where: { userId, workspaceId: idea!.workspaceId },
  });
  if (!membership) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              <Link href="/">Ideas</Link> / <span className="text-foreground">{idea!.title}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{idea!.title}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{idea!.status}</Badge>
              <span className="text-sm text-muted-foreground">ICE: {idea!.iceScore.toFixed(1)}</span>
            </div>
          </div>
          <div>
            <Link href="/">
              <Button variant="outline">Back</Button>
            </Link>
          </div>
        </div>

        {/* Simple tab nav */}
        <div className="flex items-center gap-4 border-b pb-2 text-sm">
          <a href="#overview" className="hover:underline">Overview</a>
          <a href="#validation" className="hover:underline">Validation</a>
          <a href="#evidence" className="hover:underline">Evidence</a>
          <a href="#comments" className="hover:underline">Comments</a>
        </div>

        {/* Overview */}
        <section id="overview" className="space-y-4">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{idea!.description}</p>
          </Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">Impact</div><div className="text-2xl font-bold">{idea!.impact}</div></Card>
            <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">Confidence</div><div className="text-2xl font-bold">{idea!.confidence}</div></Card>
            <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">Effort</div><div className="text-2xl font-bold">{idea!.effort}</div></Card>
            <Card className="p-4 text-center"><div className="text-sm text-muted-foreground">ICE</div><div className="text-2xl font-bold">{idea!.iceScore.toFixed(1)}</div></Card>
          </div>
        </section>

        {/* Validation */}
        <section id="validation" className="space-y-2">
          <h2 className="text-xl font-semibold">Validation</h2>
          <IdeaTasksSection ideaId={idea!.id} />
        </section>

        {/* Evidence */}
        <section id="evidence" className="space-y-2">
          <h2 className="text-xl font-semibold">Evidence</h2>
          <IdeaEvidenceSection ideaId={idea!.id} />
        </section>

        {/* Comments (placeholder) */}
        <section id="comments" className="space-y-2">
          <h2 className="text-xl font-semibold">Comments</h2>
          <p className="text-muted-foreground">{idea!._count.comments} comments. UI coming soon.</p>
        </section>
      </div>
    </div>
  );
}

