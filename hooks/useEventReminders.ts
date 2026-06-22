"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { CalendarEvent } from "@/lib/types";
import { parseISO, differenceInMinutes, format, isToday } from "date-fns";
import { playReminderChime } from "@/lib/audio";

type NotifyKey = string; // `${id}-${alertLabel}` e.g. "abc-15min"

function fireNotification(title: string, body: string) {
  playReminderChime();
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/icon-192.png" });
  }
}

export function useEventReminders() {
  const notified = useRef<Set<NotifyKey>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const windowEnd = new Date(now.getTime() + 16 * 60 * 1000); // look 16 min ahead

      // ── Calendar events ────────────────────────────────────────────────────
      const { data: events } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .eq("reminder_enabled", true)
        .gte("start_date", now.toISOString())
        .lte("start_date", windowEnd.toISOString());

      for (const event of (events ?? []) as CalendarEvent[]) {
        const mins = differenceInMinutes(parseISO(event.start_date), now);

        if (mins <= 15 && mins > 10 && !notified.current.has(`${event.id}-15min`)) {
          notified.current.add(`${event.id}-15min`);
          fireNotification(`📅 ${event.title}`, "Starting in 15 minutes");
        } else if (mins <= 5 && mins > 1 && !notified.current.has(`${event.id}-5min`)) {
          notified.current.add(`${event.id}-5min`);
          fireNotification(`📅 ${event.title}`, "Starting in 5 minutes");
        } else if (mins <= 1 && !notified.current.has(`${event.id}-now`)) {
          notified.current.add(`${event.id}-now`);
          fireNotification(`📅 ${event.title}`, mins <= 0 ? "Starting now!" : "Starting in 1 minute");
        }
      }

      // ── Tasks due today ────────────────────────────────────────────────────
      const todayStr = format(now, "yyyy-MM-dd");
      const taskKey = `tasks-due-${todayStr}`;
      if (!notified.current.has(taskKey) && now.getHours() === 9 && now.getMinutes() < 2) {
        const { data: dueTasks } = await supabase
          .from("tasks")
          .select("id, title")
          .eq("user_id", user.id)
          .eq("due_date", todayStr)
          .neq("status", "done");

        if (dueTasks && dueTasks.length > 0) {
          notified.current.add(taskKey);
          const names = dueTasks.slice(0, 3).map((t) => t.title as string).join(", ");
          const extra = dueTasks.length > 3 ? ` +${dueTasks.length - 3} more` : "";
          fireNotification(
            `📋 ${dueTasks.length} task${dueTasks.length > 1 ? "s" : ""} due today`,
            names + extra
          );
        }
      }
    }

    check();
    const interval = setInterval(check, 60 * 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
