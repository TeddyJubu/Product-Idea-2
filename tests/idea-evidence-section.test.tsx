import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { IdeaEvidenceSection } from '@/components/idea-evidence-section';

describe('IdeaEvidenceSection', () => {
  beforeEach(() => {
    // @ts-expect-error
    global.fetch = vi.fn()
      // initial GET
      .mockResolvedValueOnce({ ok: true, json: async () => ({ evidences: [] }) })
      // POST create
      .mockResolvedValueOnce({ ok: true, json: async () => ({ evidence: { id: 'e1' } }) })
      // reload GET
      .mockResolvedValueOnce({ ok: true, json: async () => ({ evidences: [{ id: 'e1', ideaId: 'i1', title: 'Doc', url: 'https://x' }] }) })
  });

  it('creates an evidence item and shows it', async () => {
    render(<IdeaEvidenceSection ideaId="i1" />);

    await screen.findByText(/No evidence yet/i);

    await userEvent.type(screen.getByPlaceholderText(/Evidence title/i), 'Doc');
    await userEvent.type(screen.getByPlaceholderText(/URL/), 'https://x');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    await screen.findByText('Doc');
    expect(screen.getByText('https://x')).toBeInTheDocument();
  });
});

