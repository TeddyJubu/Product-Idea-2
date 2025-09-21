import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { IdeaTasksSection } from '@/components/idea-tasks-section';

describe('IdeaTasksSection', () => {
  beforeEach(() => {
    // @ts-expect-error
    global.fetch = vi.fn()
      // initial GET
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: [] }) })
      // POST create
      .mockResolvedValueOnce({ ok: true, json: async () => ({ task: { id: 't1' } }) })
      // reload GET
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: [{ id: 't1', ideaId: 'i1', title: 'Do interviews', kind: 'INTERVIEW', status: 'TODO' }] }) })
      // PATCH toggle
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      // reload GET
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: [{ id: 't1', ideaId: 'i1', title: 'Do interviews', kind: 'INTERVIEW', status: 'DONE' }] }) })
  });

  it('creates a task and toggles status', async () => {
    render(<IdeaTasksSection ideaId="i1" />);

    // Wait initial load
    await screen.findByText(/No tasks yet/i);

    // Enter title and add
    await userEvent.type(screen.getByPlaceholderText(/Task title/i), 'Do interviews');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    // Task appears
    await screen.findByText('Do interviews');

    // Toggle DONE
    await userEvent.click(screen.getByRole('button', { name: /mark done/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mark todo/i })).toBeInTheDocument();
    });
  });
});

