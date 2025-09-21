import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/lib/db', () => {
  return {
    prisma: {
      idea: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      membership: {
        findFirst: vi.fn(),
      },
    },
  };
});

vi.mock('next-auth/next', () => ({ getServerSession: vi.fn() }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));

import { DELETE } from '@/app/api/ideas/[id]/route';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';

const prismaMock = prisma as unknown as {
  idea: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  membership: { findFirst: ReturnType<typeof vi.fn> };
};

describe('DELETE /api/ideas/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1' } });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('soft deletes idea by setting deletedAt', async () => {
    prismaMock.idea.findUnique.mockResolvedValue({ workspaceId: 'ws1' });
    prismaMock.membership.findFirst.mockResolvedValue({ id: 'm1' });
    prismaMock.idea.update.mockResolvedValue({ id: 'i1', deletedAt: new Date().toISOString() });

    const res = await DELETE({} as any, { params: { id: 'i1' } });
    expect(res.status).toBe(200);
    expect(prismaMock.idea.update).toHaveBeenCalled();
    const args = prismaMock.idea.update.mock.calls[0][0];
    expect(args.data).toHaveProperty('deletedAt');
  });
});

