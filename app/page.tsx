import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignInButton } from "@/components/layout/SignInButton";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      {/* Nav */}
      <nav className="px-8 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">Focal</span>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-32">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-medium mb-8">
          Your personal productivity workspace
        </div>

        <h1 className="text-6xl font-semibold tracking-tight text-gray-900 dark:text-white max-w-2xl leading-tight mb-6">
          Everything you need.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">
            Nothing you don&apos;t.
          </span>
        </h1>

        <p className="text-xl text-gray-500 dark:text-zinc-400 max-w-lg mb-12 leading-relaxed">
          Tasks, kanban, calendar, notes, focus timer, and a word game — all in one beautifully minimal space.
        </p>

        <SignInButton />

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-16">
          {["Todo & Kanban", "Calendar", "Rich Notes", "Pomodoro Timer", "Word Game", "Dark Mode"].map((f) => (
            <span key={f} className="px-4 py-2 rounded-full bg-gray-100 dark:bg-zinc-900 text-sm text-gray-600 dark:text-zinc-300 font-medium">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
