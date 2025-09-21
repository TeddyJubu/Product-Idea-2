import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ authOptions: {} }));

// Import after mocks
import { PATCH } from '@/app/api/ideas/[id]/route';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';

const prismaMock = prisma as unknown as {
  idea: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  membership: { findFirst: ReturnType<typeof vi.fn> };
};

describe('PATCH /api/ideas/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1' } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('recalculates iceScore and returns updated idea', async () => {
    prismaMock.idea.findUnique.mockResolvedValue({
      workspaceId: 'ws1',
      impact: 5,
      confidence: 6,
      effort: 5,
    });
    prismaMock.membership.findFirst.mockResolvedValue({ id: 'm1' });
    prismaMock.idea.update.mockResolvedValue({ id: 'i1', iceScore: (9 * 6) / 5 });

    const req: any = { json: async () => ({ impact: 9 }) };
    const res = await PATCH(req, { params: { id: 'i1' } });

    expect(res.status).toBe(200);
    const payload = await (res as Response).json();
    expect(payload.idea.iceScore).toBeCloseTo((9 * 6) / 5, 5);

    expect(prismaMock.idea.update).toHaveBeenCalled();
  });
});

