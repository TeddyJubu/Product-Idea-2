import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock workspace permissions to avoid needing the provider
vi.mock('@/contexts/workspace-context', () => ({
  useWorkspacePermissions: () => ({ canDeleteIdeas: true }),
}));

import { IdeaTable } from '@/components/idea-table';

describe('IdeaTable view details', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls onIdeaClick when selecting View Details from row menu', async () => {
    const idea = {
      id: 'i1',
      title: 'Idea One',
      description: 'Desc',
      impact: 5,
      confidence: 6,
      effort: 4,
      iceScore: (5 * 6) / 4,
      status: 'PENDING' as const,
      tags: [],
      _count: { tasks: 0, evidences: 0, comments: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const fetchMock = vi.fn()
      // first call: list ideas
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ideas: [idea] }) });
    // @ts-expect-error
    global.fetch = fetchMock;

    const onIdeaClick = vi.fn();

    render(
      <IdeaTable workspaceId="ws1" onIdeaClick={onIdeaClick} />
    );

    // Wait for list load
    await screen.findByText('Idea One');

    // Open row menu (the "more" button in the actions column)
    const menuButtons = screen.getAllByRole('button', { name: /open menu/i });
    await userEvent.click(menuButtons[0]);

    const viewItem = await screen.findByText(/view details/i);
    await userEvent.click(viewItem);

    await waitFor(() => {
      expect(onIdeaClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'i1' }));
    });
  });
});

