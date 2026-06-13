"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { CalendarEvent } from "@/lib/types";
import { parseISO, differenceInMinutes } from "date-fns";
import { playReminderChime } from "@/lib/audio";

export function useEventReminders() {
  const notifiedIds = useRef<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    async function checkEvents() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const windowEnd = new Date(now.getTime() + 2 * 60 * 1000);

      const { data: events } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .eq("reminder_enabled", true)
        .gte("start_date", now.toISOString())
        .lte("start_date", windowEnd.toISOString());

      if (!events) return;

      for (const event of events as CalendarEvent[]) {
        if (notifiedIds.current.has(event.id)) continue;

        const minsUntil = differenceInMinutes(parseISO(event.start_date), now);
        if (minsUntil <= 1) {
          notifiedIds.current.add(event.id);
          playReminderChime();
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`📅 ${event.title}`, {
              body: minsUntil <= 0 ? "Starting now!" : "Starting in 1 minute",
            });
          }
        }
      }
    }

    checkEvents();
    const interval = setInterval(checkEvents, 60 * 1000);
    return () => clearInterval(interval);
  }, []);
}
