import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { CheckSquare, Calendar, FileText, Timer } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: tasks }, { data: events }, { data: notes }, { data: sessions }] = await Promise.all([
    supabase.from("tasks").select("*").eq("user_id", user!.id).neq("status", "done"),
    supabase.from("calendar_events").select("*").eq("user_id", user!.id).gte("start_date", new Date().toISOString()).order("start_date").limit(5),
    supabase.from("notes").select("id, title, updated_at").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(5),
    supabase.from("pomodoro_sessions").select("id").eq("user_id", user!.id).gte("completed_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const name = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  const PRIORITY_DOT: Record<string, string> = {
    urgent: "bg-[#1d1d1f] dark:bg-white",
    high:   "bg-[#6e6e73]",
    medium: "bg-[#aeaeb2]",
    low:    "bg-[#d1d1d6]",
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <p className="text-xs font-semibold text-[#6e6e73] dark:text-zinc-500 uppercase tracking-widest mb-1">
          {format(new Date(), "EEEE, MMMM d")}
        </p>
        <h1 className="text-3xl font-bold text-[#1d1d1f] dark:text-white tracking-tight">
          {greeting()}, {name}.
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active tasks", value: tasks?.length ?? 0, icon: CheckSquare },
          { label: "Upcoming events", value: events?.length ?? 0, icon: Calendar },
          { label: "Notes", value: notes?.length ?? 0, icon: FileText },
          { label: "Focus sessions", value: sessions?.length ?? 0, icon: Timer },
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

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Active tasks */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
          <p className="text-xs font-semibold text-[#6e6e73] dark:text-zinc-500 uppercase tracking-widest mb-4">Active tasks</p>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-0">
              {tasks.slice(0, 6).map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-[#f5f5f7] dark:border-zinc-800 last:border-0">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[t.priority] ?? "bg-[#d1d1d6]"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1d1d1f] dark:text-white truncate">{t.title}</p>
                  </div>
                  {t.due_date && (
                    <p className="text-xs text-[#6e6e73] dark:text-zinc-500 flex-shrink-0">
                      {format(new Date(t.due_date), "MMM d")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6e6e73] dark:text-zinc-500">No active tasks — nice work!</p>
          )}
        </div>

        {/* Upcoming events */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
          <p className="text-xs font-semibold text-[#6e6e73] dark:text-zinc-500 uppercase tracking-widest mb-4">Upcoming events</p>
          {events && events.length > 0 ? (
            <div className="space-y-0">
              {events.map((e) => (
                <div key={e.id} className="flex items-center gap-3 py-2.5 border-b border-[#f5f5f7] dark:border-zinc-800 last:border-0">
                  <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1d1d1f] dark:text-white truncate">{e.title}</p>
                    <p className="text-xs text-[#6e6e73] dark:text-zinc-500">
                      {format(new Date(e.start_date), "MMM d, HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6e6e73] dark:text-zinc-500">No upcoming events</p>
          )}
        </div>

        {/* Recent notes */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
          <p className="text-xs font-semibold text-[#6e6e73] dark:text-zinc-500 uppercase tracking-widest mb-4">Recent notes</p>
          {notes && notes.length > 0 ? (
            <div className="space-y-0">
              {notes.map((n) => (
                <div key={n.id} className="flex items-center justify-between py-2.5 border-b border-[#f5f5f7] dark:border-zinc-800 last:border-0">
                  <p className="text-sm text-[#1d1d1f] dark:text-white truncate">{n.title}</p>
                  <p className="text-xs text-[#6e6e73] dark:text-zinc-500 ml-4 flex-shrink-0">
                    {format(new Date(n.updated_at), "MMM d")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6e6e73] dark:text-zinc-500">No notes yet</p>
          )}
        </div>

        {/* Today's focus */}
        <div className="bg-[#1d1d1f] dark:bg-zinc-800 rounded-2xl p-6 border border-transparent">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">Today&apos;s focus</p>
          <p className="text-5xl font-bold text-white mb-1">{sessions?.length ?? 0}</p>
          <p className="text-sm text-white/60">sessions · {(sessions?.length ?? 0) * 25} min of deep work</p>
        </div>
      </div>
    </div>
  );
}
