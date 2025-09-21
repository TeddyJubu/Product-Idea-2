import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/lib/db', () => {
  return {
    prisma: {
      idea: { findUnique: vi.fn(), update: vi.fn() },
      membership: { findFirst: vi.fn() },
    },
  };
});

vi.mock('next-auth/next', () => ({ getServerSession: vi.fn() }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));

import { PATCH } from '@/app/api/ideas/[id]/route';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';

const prismaMock = prisma as unknown as {
  idea: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  membership: { findFirst: ReturnType<typeof vi.fn> };
};

describe('ideas/[id] status transitions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1' } });
    prismaMock.membership.findFirst.mockResolvedValue({ id: 'm1' });
  });
  afterEach(() => vi.restoreAllMocks());

  it('allows PENDING -> VALIDATING', async () => {
    prismaMock.idea.findUnique.mockResolvedValue({ workspaceId: 'ws1', impact: 1, confidence: 1, effort: 1, status: 'PENDING' });
    prismaMock.idea.update.mockResolvedValue({ id: 'i1', status: 'VALIDATING' });
    const req: any = { json: async () => ({ status: 'VALIDATING' }) };
    const res = await PATCH(req, { params: { id: 'i1' } });
    expect(res.status).toBe(200);
  });

  it('blocks PENDING -> VALIDATED', async () => {
    prismaMock.idea.findUnique.mockResolvedValue({ workspaceId: 'ws1', impact: 1, confidence: 1, effort: 1, status: 'PENDING' });
    const req: any = { json: async () => ({ status: 'VALIDATED' }) };
    const res = await PATCH(req, { params: { id: 'i1' } });
    expect(res.status).toBe(400);
  });
});

