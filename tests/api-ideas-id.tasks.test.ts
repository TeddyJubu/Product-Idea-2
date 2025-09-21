import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/lib/db', () => {
  return {
    prisma: {
      idea: { findUnique: vi.fn() },
      membership: { findFirst: vi.fn() },
      validationTask: { findMany: vi.fn(), create: vi.fn() },
    },
  };
});

vi.mock('next-auth/next', () => ({ getServerSession: vi.fn() }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));

import { GET, POST } from '@/app/api/ideas/[id]/tasks/route';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';

const prismaMock = prisma as unknown as {
  idea: { findUnique: ReturnType<typeof vi.fn> };
  membership: { findFirst: ReturnType<typeof vi.fn> };
  validationTask: { findMany: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
};

describe('ideas/[id]/tasks API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1' } });
  });
  afterEach(() => vi.restoreAllMocks());

  it('lists tasks for idea', async () => {
    prismaMock.idea.findUnique.mockResolvedValue({ workspaceId: 'ws1' });
    prismaMock.membership.findFirst.mockResolvedValue({ id: 'm1' });
    prismaMock.validationTask.findMany.mockResolvedValue([{ id: 't1', title: 'Task' }]);

    const res = await GET({} as any, { params: { id: 'i1' } });
    expect(res.status).toBe(200);
    const body = await (res as Response).json();
    expect(body.tasks).toHaveLength(1);
  });

  it('creates task for idea', async () => {
    prismaMock.idea.findUnique.mockResolvedValue({ workspaceId: 'ws1' });
    prismaMock.membership.findFirst.mockResolvedValue({ id: 'm1' });
    prismaMock.validationTask.create.mockResolvedValue({ id: 't1' });

    const req: any = { json: async () => ({ title: 'Do interviews', kind: 'INTERVIEW' }) };
    const res = await POST(req, { params: { id: 'i1' } });
    expect(res.status).toBe(201);
  });
});

