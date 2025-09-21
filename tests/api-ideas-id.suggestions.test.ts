import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/lib/db', () => {
  return {
    prisma: {
      idea: { findUnique: vi.fn() },
      membership: { findFirst: vi.fn() },
      validationTask: { count: vi.fn() },
      evidence: { count: vi.fn() },
    },
  };
});

vi.mock('next-auth/next', () => ({ getServerSession: vi.fn() }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));

import { GET } from '@/app/api/ideas/[id]/suggestions/route';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';

const prismaMock = prisma as unknown as {
  idea: { findUnique: ReturnType<typeof vi.fn> };
  membership: { findFirst: ReturnType<typeof vi.fn> };
  validationTask: { count: ReturnType<typeof vi.fn> };
  evidence: { count: ReturnType<typeof vi.fn> };
};

describe('ideas/[id]/suggestions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1' } });
  });
  afterEach(() => vi.restoreAllMocks());

  it('returns suggested confidence based on tasks and evidence', async () => {
    prismaMock.idea.findUnique.mockResolvedValue({ workspaceId: 'ws1', confidence: 5 });
    prismaMock.membership.findFirst.mockResolvedValue({ id: 'm1' });
    prismaMock.validationTask.count.mockResolvedValue(5); // +2
    prismaMock.evidence.count.mockResolvedValue(3); // +1

    const res = await GET({} as any, { params: { id: 'i1' } });
    expect(res.status).toBe(200);
    const body = await (res as Response).json();
    expect(body.suggestedConfidence).toBe(8);
  });
});

