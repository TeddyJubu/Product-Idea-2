"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export type ValidationTask = {
  id: string;
  ideaId: string;
  title: string;
  kind: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  weight?: number;
};

export function IdeaTasksSection({ ideaId }: { ideaId: string }) {
  const [tasks, setTasks] = useState<ValidationTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("INTERVIEW");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ideas/${ideaId}/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/ideas/${ideaId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, kind }),
    });
    if (res.ok) {
      setTitle("");
      await load();
    }
  }

  async function toggleDone(task: ValidationTask) {
    const toStatus = task.status === "DONE" ? "TODO" : "DONE";
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: toStatus }),
    });
    if (res.ok) await load();
  }

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter(t => t.status === "DONE").length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-2">
          <Input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} required />
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Kind" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="INTERVIEW">Interview</SelectItem>
              <SelectItem value="SURVEY">Survey</SelectItem>
              <SelectItem value="EXPERIMENT">Experiment</SelectItem>
              <SelectItem value="RESEARCH">Research</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">Add</Button>
        </form>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Validation progress</div>
          <div className="h-2 w-full rounded bg-muted overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        {loading ? <div className="text-sm text-muted-foreground">Loading tasks…</div> :
          tasks.length === 0 ? <div className="text-sm text-muted-foreground">No tasks yet.</div> :
          tasks.map(t => (
            <Card key={t.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-muted-foreground">{t.kind}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant={t.status === "DONE" ? "secondary" : "outline"} onClick={() => toggleDone(t)}>
                  {t.status === "DONE" ? "Mark TODO" : "Mark DONE"}
                </Button>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

