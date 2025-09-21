"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export type Evidence = {
  id: string;
  ideaId: string;
  title: string;
  url?: string | null;
  content?: string | null;
  kind?: string | null;
};

export function IdeaEvidenceSection({ ideaId }: { ideaId: string }) {
  const [items, setItems] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ideas/${ideaId}/evidence`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.evidences ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId]);

  async function addEvidence(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/ideas/${ideaId}/evidence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url }),
    });
    if (res.ok) {
      setTitle("");
      setUrl("");
      await load();
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <form onSubmit={addEvidence} className="flex flex-col sm:flex-row gap-2">
          <Input placeholder="Evidence title" value={title} onChange={e => setTitle(e.target.value)} required />
          <Input placeholder="URL (optional)" value={url} onChange={e => setUrl(e.target.value)} />
          <Button type="submit">Add</Button>
        </form>
      </Card>

      <div className="space-y-2">
        {loading ? <div className="text-sm text-muted-foreground">Loading evidence…</div> :
          items.length === 0 ? <div className="text-sm text-muted-foreground">No evidence yet.</div> :
          items.map(ev => (
            <Card key={ev.id} className="p-3">
              <div className="font-medium">{ev.title}</div>
              {ev.url ? <a className="text-xs text-blue-600 underline" href={ev.url} target="_blank" rel="noreferrer">{ev.url}</a> : null}
            </Card>
          ))}
      </div>
    </div>
  );
}

