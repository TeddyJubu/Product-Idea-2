import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/lib/db', () => {
  return {
    prisma: {
      evidence: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
      membership: { findFirst: vi.fn() },
    },
  };
});

vi.mock('next-auth/next', () => ({ getServerSession: vi.fn() }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));

import { PATCH, DELETE } from '@/app/api/evidence/[evidenceId]/route';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';

const prismaMock = prisma as unknown as {
  evidence: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  membership: { findFirst: ReturnType<typeof vi.fn> };
};

describe('evidence/[evidenceId] API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1' } });
    prismaMock.evidence.findUnique.mockResolvedValue({ idea: { workspaceId: 'ws1' } });
    prismaMock.membership.findFirst.mockResolvedValue({ id: 'm1' });
  });
  afterEach(() => vi.restoreAllMocks());

  it('updates an evidence item', async () => {
    prismaMock.evidence.update.mockResolvedValue({ id: 'e1', title: 'New' });
    const req: any = { json: async () => ({ title: 'New' }) };
    const res = await PATCH(req, { params: { evidenceId: 'e1' } });
    expect(res.status).toBe(200);
  });

  it('deletes an evidence item', async () => {
    prismaMock.evidence.delete.mockResolvedValue({});
    const res = await DELETE({} as any, { params: { evidenceId: 'e1' } });
    expect(res.status).toBe(200);
  });
});

