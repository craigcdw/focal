"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Task, Priority, KanbanColumn } from "@/lib/types";
import { Plus, X, Play, Square, Sparkles, Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker";
import { format } from "date-fns";
import { useTimeTracker } from "@/hooks/useTimeTracker";

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300",
  medium: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  high: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  urgent: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
};

const PRIORITY_DOT: Record<Priority, string> = {
  low: "bg-gray-400",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

export function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<KanbanColumn | "all">("all");
  const supabase = createClient();
  const { activeTaskId, elapsed, formatElapsed, start, stop } = useTimeTracker();
  const [nlInput, setNlInput] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlError, setNlError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    status: "todo" as KanbanColumn,
    due_date: "",
    tags: "",
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  async function parseNL() {
    if (!nlInput.trim()) return;
    setNlLoading(true);
    setNlError("");
    try {
      const res = await fetch("/api/parse-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: nlInput }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setForm({
        title: data.title ?? "",
        description: data.description ?? "",
        priority: data.priority ?? "medium",
        status: "todo",
        due_date: data.due_date ?? "",
        tags: (data.tags ?? []).join(", "),
      });
      setNlInput("");
      setShowForm(true);
    } catch {
      setNlError("Could not parse task. Try again.");
    } finally {
      setNlLoading(false);
    }
  }

  async function fetchTasks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setTasks(data ?? []);
    setLoading(false);
  }

  async function createTask() {
    if (!form.title.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: form.status,
      due_date: form.due_date || null,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      subtasks: [],
    }).select().single();
    if (data) setTasks(prev => [data, ...prev]);
    setForm({ title: "", description: "", priority: "medium", status: "todo", due_date: "", tags: "" });
    setShowForm(false);
  }

  async function toggleSubtask(task: Task, subtaskId: string) {
    const updated = task.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
    await supabase.from("tasks").update({ subtasks: updated }).eq("id", task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, subtasks: updated } : t));
  }

  async function deleteTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  async function updateColumn(id: string, status: KanbanColumn) {
    await supabase.from("tasks").update({ status }).eq("id", id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">Tasks</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">{tasks.filter(t => t.status !== "done").length} active</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          <Plus size={16} />
          New task
        </button>
      </div>

      {/* Natural language input */}
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Sparkles size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
            <input
              value={nlInput}
              onChange={e => setNlInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && parseNL()}
              placeholder='Try "Call John tomorrow, high priority" or "Write report by Friday #work"'
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/40 text-gray-900 dark:text-white placeholder-purple-300 dark:placeholder-purple-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <button
            onClick={parseNL}
            disabled={nlLoading || !nlInput.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {nlLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {nlLoading ? "Parsing..." : "Add with AI"}
          </button>
        </div>
        {nlError && <p className="text-xs text-red-500 pl-1">{nlError}</p>}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "backlog", "todo", "in_progress", "done"] as const).map(col => (
          <button
            key={col}
            onClick={() => setFilter(col)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === col
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {col === "all" ? "All" : col === "in_progress" ? "In Progress" : col.charAt(0).toUpperCase() + col.slice(1)}
          </button>
        ))}
      </div>

      {/* New task form */}
      {showForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">New task</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200">
              <X size={18} />
            </button>
          </div>
          <input
            autoFocus
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Task title"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => e.key === "Enter" && createTask()}
          />
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Description (optional)"
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1.5 block">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value as Priority }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1.5 block">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as KanbanColumn }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1.5 block">Due date</label>
              <DatePicker value={form.due_date} onChange={v => setForm(p => ({ ...p, due_date: v }))} placeholder="No due date" />
            </div>
          </div>
          <input
            value={form.tags}
            onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
            placeholder="Tags (comma separated)"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-3 pt-1">
            <button onClick={createTask} className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity">
              Create task
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 text-gray-500 dark:text-zinc-400 text-sm hover:text-gray-700 dark:hover:text-zinc-200">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 dark:text-zinc-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-zinc-500">No tasks yet</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => (
            <div key={task.id} className="group bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 transition-all">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-gray-400 dark:text-zinc-500" : "text-gray-900 dark:text-white"}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {activeTaskId === task.id && (
                        <span className="text-xs font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                          {formatElapsed(elapsed)}
                        </span>
                      )}
                      <button
                        onClick={() => activeTaskId === task.id ? stop() : start(task.id)}
                        className={`opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg ${
                          activeTaskId === task.id
                            ? "opacity-100 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                            : "text-gray-300 dark:text-zinc-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
                        }`}
                        title={activeTaskId === task.id ? "Stop timer" : "Start timer"}
                      >
                        {activeTaskId === task.id ? <Square size={13} /> : <Play size={13} />}
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 dark:text-zinc-600 hover:text-red-500 transition-all"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                    <select
                      value={task.status}
                      onChange={e => updateColumn(task.id, e.target.value as KanbanColumn)}
                      className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-none focus:outline-none cursor-pointer"
                    >
                      <option value="backlog">Backlog</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    {task.due_date && (
                      <span className="text-xs text-gray-400 dark:text-zinc-500">
                        Due {format(new Date(task.due_date), "MMM d")}
                      </span>
                    )}
                    {task.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {task.subtasks.length > 0 && (
                    <div className="mt-3 space-y-1.5 pl-1">
                      {task.subtasks.map(sub => (
                        <div key={sub.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={sub.completed}
                            onChange={() => toggleSubtask(task, sub.id)}
                            className="w-3.5 h-3.5 rounded accent-blue-500"
                          />
                          <span className={`text-xs ${sub.completed ? "line-through text-gray-400 dark:text-zinc-500" : "text-gray-700 dark:text-zinc-300"}`}>
                            {sub.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
