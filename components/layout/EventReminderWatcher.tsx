"use client";

import { useEffect } from "react";
import { useEventReminders } from "@/hooks/useEventReminders";
import { initAudio } from "@/lib/audio";

export function EventReminderWatcher() {
  useEventReminders();

  useEffect(() => {
    // Re-init on every interaction to keep AudioContext from suspending
    window.addEventListener("click", initAudio);
    window.addEventListener("keydown", initAudio);
    return () => {
      window.removeEventListener("click", initAudio);
      window.removeEventListener("keydown", initAudio);
    };
  }, []);

  return null;
}
