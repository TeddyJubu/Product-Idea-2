import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.user.upsert({
    where: { email: "founder@example.com" },
    update: {},
    create: { email: "founder@example.com", name: "Founder" }
  });
  const ws = await prisma.workspace.create({ data: { id: "demo-workspace", name: "Demo Workspace" } }).catch(async () => {
    return prisma.workspace.findFirstOrThrow({ where: { id: "demo-workspace" } });
  });
  await prisma.membership.upsert({
    where: { id: "demo-membership" },
    update: {},
    create: { id: "demo-membership", userId: u.id, workspaceId: ws.id, role: "OWNER" }
  });
  const ideas = [
    { title: "Landing page validator", description: "Auto build LP + collect emails", impact: 8, confidence: 6, effort: 3 },
    { title: "Interview assistant", description: "Guided user interviews + transcript insights", impact: 7, confidence: 5, effort: 4 }
  ];
  for (const it of ideas) {
    await prisma.idea.create({
      data: {
        workspaceId: ws.id,
        title: it.title,
        description: it.description,
        impact: it.impact,
        confidence: it.confidence,
        effort: it.effort,
        iceScore: (it.impact * it.confidence) / Math.max(1, it.effort),
        createdById: u.id
      }
    });
  }
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
