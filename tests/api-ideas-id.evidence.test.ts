import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/lib/db', () => {
  return {
    prisma: {
      idea: { findUnique: vi.fn() },
      membership: { findFirst: vi.fn() },
      evidence: { findMany: vi.fn(), create: vi.fn() },
    },
  };
});

vi.mock('next-auth/next', () => ({ getServerSession: vi.fn() }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));

import { GET, POST } from '@/app/api/ideas/[id]/evidence/route';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';

const prismaMock = prisma as unknown as {
  idea: { findUnique: ReturnType<typeof vi.fn> };
  membership: { findFirst: ReturnType<typeof vi.fn> };
  evidence: { findMany: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
};

describe('ideas/[id]/evidence API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1' } });
  });
  afterEach(() => vi.restoreAllMocks());

  it('lists evidence for idea', async () => {
    prismaMock.idea.findUnique.mockResolvedValue({ workspaceId: 'ws1' });
    prismaMock.membership.findFirst.mockResolvedValue({ id: 'm1' });
    prismaMock.evidence.findMany.mockResolvedValue([{ id: 'e1', title: 'Link' }]);

    const res = await GET({} as any, { params: { id: 'i1' } });
    expect(res.status).toBe(200);
    const body = await (res as Response).json();
    expect(body.evidences).toHaveLength(1);
  });

  it('creates an evidence item for idea', async () => {
    prismaMock.idea.findUnique.mockResolvedValue({ workspaceId: 'ws1' });
    prismaMock.membership.findFirst.mockResolvedValue({ id: 'm1' });
    prismaMock.evidence.create.mockResolvedValue({ id: 'e1' });

    const req: any = { json: async () => ({ title: 'Doc', url: 'https://example.com' }) };
    const res = await POST(req, { params: { id: 'i1' } });
    expect(res.status).toBe(201);
  });
});

