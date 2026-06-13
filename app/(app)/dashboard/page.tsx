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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
          {greeting()}, {name}
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">
          {format(new Date(), "EEEE, MMMM d")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active tasks", value: tasks?.length ?? 0, icon: CheckSquare, color: "blue" },
          { label: "Upcoming events", value: events?.length ?? 0, icon: Calendar, color: "purple" },
          { label: "Notes", value: notes?.length ?? 0, icon: FileText, color: "green" },
          { label: "Focus sessions today", value: sessions?.length ?? 0, icon: Timer, color: "orange" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800">
            <div className={`inline-flex p-2 rounded-xl mb-3 ${
              color === "blue" ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400" :
              color === "purple" ? "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400" :
              color === "green" ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400" :
              "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400"
            }`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming tasks */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Active tasks</h2>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.slice(0, 6).map((t) => (
                <div key={t.id} className="flex items-start gap-3 py-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    t.priority === "urgent" ? "bg-red-500" :
                    t.priority === "high" ? "bg-orange-500" :
                    t.priority === "medium" ? "bg-yellow-500" : "bg-gray-300"
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">{t.title}</p>
                    {t.due_date && (
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                        Due {format(new Date(t.due_date), "MMM d")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-zinc-500">No active tasks — nice work!</p>
          )}
        </div>

        {/* Upcoming events */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Upcoming events</h2>
          {events && events.length > 0 ? (
            <div className="space-y-3">
              {events.map((e) => (
                <div key={e.id} className="flex items-start gap-3">
                  <div className="w-1 h-full rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{e.title}</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">
                      {format(new Date(e.start_date), "MMM d, HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-zinc-500">No upcoming events</p>
          )}
        </div>

        {/* Recent notes */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent notes</h2>
          {notes && notes.length > 0 ? (
            <div className="space-y-2">
              {notes.map((n) => (
                <div key={n.id} className="flex items-center justify-between py-1.5">
                  <p className="text-sm text-gray-900 dark:text-white truncate">{n.title}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 ml-4 flex-shrink-0">
                    {format(new Date(n.updated_at), "MMM d")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-zinc-500">No notes yet</p>
          )}
        </div>

        {/* Today's focus */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Today&apos;s focus</h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-semibold text-gray-900 dark:text-white">{sessions?.length ?? 0}</div>
            <div>
              <p className="text-sm text-gray-500 dark:text-zinc-400">pomodoro sessions completed</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                {((sessions?.length ?? 0) * 25)} minutes of deep work
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
