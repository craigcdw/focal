"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function useTimeTracker() {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (activeTaskId) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeTaskId]);

  async function start(taskId: string) {
    if (activeTaskId === taskId) return;
    if (activeTaskId) await stop();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from("time_entries").insert({
      user_id: user.id,
      task_id: taskId,
      started_at: new Date().toISOString(),
    }).select().single();

    if (data) {
      setActiveTaskId(taskId);
      setActiveEntryId(data.id);
      setElapsed(0);
    }
  }

  async function stop() {
    if (!activeEntryId || !activeTaskId) return;
    const endedAt = new Date().toISOString();
    await supabase.from("time_entries").update({
      ended_at: endedAt,
      duration_seconds: elapsed,
    }).eq("id", activeEntryId);

    setActiveTaskId(null);
    setActiveEntryId(null);
    setElapsed(0);
  }

  function formatElapsed(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return { activeTaskId, elapsed, formatElapsed, start, stop };
}
