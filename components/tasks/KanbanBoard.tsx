"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Task, KanbanColumn, Priority } from "@/lib/types";
import { Plus, X } from "lucide-react";
import { format } from "date-fns";

const COLUMNS: { id: KanbanColumn; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "bg-gray-400" },
  { id: "todo", label: "To Do", color: "bg-blue-500" },
  { id: "in_progress", label: "In Progress", color: "bg-yellow-500" },
  { id: "done", label: "Done", color: "bg-green-500" },
];

const PRIORITY_DOT: Record<Priority, string> = {
  low: "bg-gray-400",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState<KanbanColumn | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at");
    setTasks(data ?? []);
    setLoading(false);
  }

  async function addCard(colId: KanbanColumn) {
    if (!newTitle.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: newTitle,
      priority: "medium",
      status: colId,
      tags: [],
      subtasks: [],
    }).select().single();
    if (data) setTasks(prev => [...prev, data]);
    setNewTitle("");
    setAddingTo(null);
  }

  async function moveTask(id: string, status: KanbanColumn) {
    await supabase.from("tasks").update({ status }).eq("id", id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }

  async function deleteTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  if (loading) return <div className="text-center py-12 text-gray-400 dark:text-zinc-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">Kanban</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">{tasks.length} total tasks</p>
      </div>

      <div className="grid grid-cols-4 gap-4 min-h-96">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex flex-col gap-3">
              {/* Column header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.color}`} />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{col.label}</span>
                  <span className="text-xs text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => setAddingTo(col.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 flex-1">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className="group bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 transition-all cursor-grab"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-900 dark:text-white font-medium leading-snug">{task.title}</p>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 dark:text-zinc-600 hover:text-red-500 transition-all flex-shrink-0"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
                      <span className="text-xs text-gray-400 dark:text-zinc-500 capitalize">{task.priority}</span>
                      {task.due_date && (
                        <span className="text-xs text-gray-400 dark:text-zinc-500">
                          {format(new Date(task.due_date), "MMM d")}
                        </span>
                      )}
                    </div>
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map(tag => (
                          <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Quick move */}
                    <div className="hidden group-hover:flex gap-1 mt-3 flex-wrap">
                      {COLUMNS.filter(c => c.id !== col.id).map(c => (
                        <button
                          key={c.id}
                          onClick={() => moveTask(task.id, c.id)}
                          className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Add card inline */}
                {addingTo === col.id ? (
                  <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-blue-300 dark:border-blue-700 space-y-2">
                    <input
                      autoFocus
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") addCard(col.id);
                        if (e.key === "Escape") { setAddingTo(null); setNewTitle(""); }
                      }}
                      placeholder="Task title..."
                      className="w-full text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => addCard(col.id)} className="text-xs px-2.5 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium">Add</button>
                      <button onClick={() => { setAddingTo(null); setNewTitle(""); }} className="text-xs text-gray-400 dark:text-zinc-500">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingTo(col.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 transition-all border border-dashed border-gray-200 dark:border-zinc-800"
                  >
                    <Plus size={14} />
                    Add card
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
