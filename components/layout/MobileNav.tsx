"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Calendar, FileText, Timer, Brain, Dumbbell, ChefHat, BarChart2, FolderKanban } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/notes", label: "Notes", icon: FileText },
  { href: "/dashboard/pomodoro", label: "Focus", icon: Timer },
  { href: "/dashboard/game", label: "Learn", icon: Brain },
  { href: "/dashboard/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/dashboard/recipes", label: "Recipes", icon: ChefHat },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart2 },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-gray-100 dark:border-zinc-800">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
                active
                  ? "text-[#D4A017]"
                  : "text-[#5C6370] dark:text-zinc-500"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
