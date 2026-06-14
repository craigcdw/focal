"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Kanban,
  Calendar,
  FileText,
  Timer,
  Brain,
  BarChart2,
  Dumbbell,
  ChefHat,
  FolderKanban,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { FocalIcon } from "@/components/ui/FocalLogo";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/kanban", label: "Kanban", icon: Kanban },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/notes", label: "Notes", icon: FileText },
  { href: "/dashboard/pomodoro", label: "Focus", icon: Timer },
  { href: "/dashboard/game", label: "Learn", icon: Brain },
  { href: "/dashboard/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/dashboard/recipes", label: "Recipes", icon: ChefHat },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart2 },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <aside className="hidden md:flex w-64 h-screen fixed left-0 top-0 flex-col bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-r border-gray-100 dark:border-zinc-800 z-40">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2.5">
        <FocalIcon size={30} />
        <span className="text-xl font-semibold tracking-tight text-[#0D1B2A] dark:text-white">
          Focal<span className="text-[#D4A017]">.</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border-l-2 ${
                active
                  ? "bg-[#F5F4EE] dark:bg-zinc-800 text-[#0D1B2A] dark:text-white border-[#D4A017]"
                  : "text-[#5C6370] dark:text-zinc-400 hover:bg-[#F5F4EE] dark:hover:bg-zinc-900 hover:text-[#0D1B2A] dark:hover:text-white border-transparent"
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-zinc-800 space-y-0.5">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#5C6370] dark:text-zinc-400 hover:bg-[#F5F4EE] dark:hover:bg-zinc-900 hover:text-[#0D1B2A] dark:hover:text-white transition-all duration-150"
        >
          {theme === "dark" ? <Sun size={17} strokeWidth={1.5} /> : <Moon size={17} strokeWidth={1.5} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#5C6370] dark:text-zinc-400 hover:bg-[#F5F4EE] dark:hover:bg-zinc-900 hover:text-[#0D1B2A] dark:hover:text-white transition-all duration-150"
        >
          <LogOut size={17} strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
