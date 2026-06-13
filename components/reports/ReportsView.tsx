"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TimeEntry, Task } from "@/lib/types";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, isToday } from "date-fns";
import { Clock, BarChart2, CheckSquare, Timer } from "lucide-react";

interface DayStat {
  date: Date;
  seconds: number;
  sessions: number;
}

function fmt(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function ReportsView() {
  const [entries, setEntries] = useState<(TimeEntry & { task_title: string })[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"week" | "month">("week");
  const supabase = createClient();

  useEffect(() => { loadData(); }, [range]);

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const since = range === "week"
      ? startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString()
      : subDays(new Date(), 30).toISOString();

    const [{ data: entriesData }, { data: tasksData }, { data: pomData }] = await Promise.all([
      supabase.from("time_entries")
        .select("*, tasks(title)")
        .eq("user_id", user.id)
        .gte("started_at", since)
        .not("ended_at", "is", null)
        .order("started_at", { ascending: false }),
      supabase.from("tasks").select("*").eq("user_id", user.id),
      supabase.from("pomodoro_sessions").select("id").eq("user_id", user.id).gte("completed_at", since),
    ]);

    setEntries((entriesData ?? []).map((e: any) => ({ ...e, task_title: e.tasks?.title ?? "Unknown task" })));
    setTasks(tasksData ?? []);
    setPomodoroCount(pomData?.length ?? 0);
    setLoading(false);
  }

  const totalSeconds = entries.reduce((a, e) => a + (e.duration_seconds ?? 0), 0);

  // Daily breakdown
  const days = range === "week"
    ? eachDayOfInterval({ start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfWeek(new Date(), { weekStartsOn: 1 }) })
    : eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });

  const dayStats: DayStat[] = days.map(date => {
    const dayEntries = entries.filter(e => format(new Date(e.started_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
    return {
      date,
      seconds: dayEntries.reduce((a, e) => a + (e.duration_seconds ?? 0), 0),
      sessions: dayEntries.length,
    };
  });

  const maxSeconds = Math.max(...dayStats.map(d => d.seconds), 1);

  // Per-task breakdown
  const taskTotals = entries.reduce<Record<string, { title: string; seconds: number; count: number }>>((acc, e) => {
    if (!acc[e.task_id]) acc[e.task_id] = { title: e.task_title, seconds: 0, count: 0 };
    acc[e.task_id].seconds += e.duration_seconds ?? 0;
    acc[e.task_id].count += 1;
    return acc;
  }, {});
  const taskList = Object.entries(taskTotals).sort((a, b) => b[1].seconds - a[1].seconds);

  const tasksDone = tasks.filter(t => t.status === "done").length;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-100 dark:bg-zinc-800 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 dark:bg-zinc-800 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] dark:text-white tracking-tight">Reports</h1>
          <p className="text-[#6e6e73] dark:text-zinc-400 mt-1">Time tracked and productivity insights</p>
        </div>
        <div className="flex gap-2">
          {(["week", "month"] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                range === r
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              {r === "week" ? "This week" : "Last 30 days"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Time tracked", value: fmt(totalSeconds), icon: Clock },
          { label: "Time entries", value: entries.length, icon: BarChart2 },
          { label: "Tasks completed", value: tasksDone, icon: CheckSquare },
          { label: "Focus sessions", value: pomodoroCount, icon: Timer },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-xl bg-[#f5f5f7] dark:bg-zinc-800 flex items-center justify-center mb-3">
              <Icon size={15} className="text-[#1d1d1f] dark:text-zinc-300" />
            </div>
            <p className="text-2xl font-bold text-[#1d1d1f] dark:text-white">{value}</p>
            <p className="text-xs text-[#6e6e73] dark:text-zinc-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Daily bar chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Daily time tracked</h2>
        <div className="flex items-end gap-1.5 h-40">
          {dayStats.map(({ date, seconds }) => {
            const height = maxSeconds > 0 ? Math.max((seconds / maxSeconds) * 100, seconds > 0 ? 4 : 0) : 0;
            const today = isToday(date);
            return (
              <div key={date.toISOString()} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                {seconds > 0 && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {fmt(seconds)}
                  </div>
                )}
                <div className="w-full flex items-end justify-center" style={{ height: "100%" }}>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${today ? "bg-[#1d1d1f] dark:bg-white" : "bg-[#e5e5e7] dark:bg-zinc-700"}`}
                    style={{ height: `${height}%`, minHeight: seconds > 0 ? "4px" : "0" }}
                  />
                </div>
                <span className={`text-[10px] font-medium ${today ? "text-[#1d1d1f] dark:text-white font-bold" : "text-[#6e6e73] dark:text-zinc-500"}`}>
                  {range === "week" ? format(date, "EEE") : format(date, "d")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-task breakdown */}
      {taskList.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Time by task</h2>
          <div className="space-y-3">
            {taskList.map(([id, { title, seconds, count }]) => (
              <div key={id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-zinc-300 truncate max-w-xs">{title}</span>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span className="text-xs text-gray-400 dark:text-zinc-500">{count} {count === 1 ? "entry" : "entries"}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{fmt(seconds)}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1d1d1f] dark:bg-white rounded-full"
                    style={{ width: `${(seconds / totalSeconds) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent entries */}
      {entries.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent entries</h2>
          <div className="space-y-2">
            {entries.slice(0, 10).map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-zinc-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{e.task_title}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                    {format(new Date(e.started_at), "MMM d, HH:mm")} – {e.ended_at ? format(new Date(e.ended_at), "HH:mm") : "ongoing"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300 ml-4">
                  {fmt(e.duration_seconds ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-zinc-500">
          <Clock size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No time tracked yet. Start a timer on any task.</p>
        </div>
      )}
    </div>
  );
}
