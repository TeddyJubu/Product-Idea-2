import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { IdeaEditDialog } from '@/components/idea-edit-dialog';

describe('IdeaEditDialog', () => {
  const idea = {
    id: '1',
    title: 'Original Title',
    description: 'Original Description',
    impact: 5,
    confidence: 6,
    effort: 4,
    iceScore: (5 * 6) / 4,
    status: 'PENDING' as const,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('submits PATCH with current values and calls onSuccess', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    // @ts-expect-error: stub global fetch for test
    global.fetch = fetchMock;

    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();

    render(
      <IdeaEditDialog idea={idea} open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />
    );

    // Button should be present
    const submitBtn = await screen.findByRole('button', { name: /update idea/i });

    // Click submit without changing anything (uses initial values from idea)
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    // Verify request
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`/api/ideas/${idea.id}`);
    expect(init.method).toBe('PATCH');
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      title: idea.title,
      description: idea.description,
      impact: idea.impact,
      confidence: idea.confidence,
      effort: idea.effort,
      status: idea.status,
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});

