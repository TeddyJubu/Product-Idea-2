import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/lib/db', () => {
  return {
    prisma: {
      validationTask: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
      membership: { findFirst: vi.fn() },
    },
  };
});

vi.mock('next-auth/next', () => ({ getServerSession: vi.fn() }));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));

import { PATCH, DELETE } from '@/app/api/tasks/[taskId]/route';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';

const prismaMock = prisma as unknown as {
  validationTask: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  membership: { findFirst: ReturnType<typeof vi.fn> };
};

describe('tasks/[taskId] API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue({ user: { id: 'u1' } });
    prismaMock.validationTask.findUnique.mockResolvedValue({ idea: { workspaceId: 'ws1' } });
    prismaMock.membership.findFirst.mockResolvedValue({ id: 'm1' });
  });
  afterEach(() => vi.restoreAllMocks());

  it('updates a task', async () => {
    prismaMock.validationTask.update.mockResolvedValue({ id: 't1', status: 'DONE' });
    const req: any = { json: async () => ({ status: 'DONE' }) };
    const res = await PATCH(req, { params: { taskId: 't1' } });
    expect(res.status).toBe(200);
  });

  it('deletes a task', async () => {
    prismaMock.validationTask.delete.mockResolvedValue({});
    const res = await DELETE({} as any, { params: { taskId: 't1' } });
    expect(res.status).toBe(200);
  });
});

