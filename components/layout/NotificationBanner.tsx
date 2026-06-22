"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

export function NotificationBanner() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  if (!permission || permission === "granted" || dismissed) return null;

  async function requestPermission() {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      new Notification("Focal notifications enabled", {
        body: "You'll get reminders 15 min, 5 min, and 1 min before events.",
      });
    }
  }

  return (
    <div className="flex items-center gap-3 bg-[#1E4D8C]/10 dark:bg-blue-950/30 border border-[#1E4D8C]/20 dark:border-blue-800/40 rounded-2xl px-4 py-3 mb-6">
      <Bell size={15} className="text-[#1E4D8C] dark:text-blue-400 flex-shrink-0" />
      <p className="text-sm text-[#0D1B2A] dark:text-zinc-200 flex-1">
        {permission === "denied"
          ? "Notifications are blocked. Enable them in your browser's site settings to get event reminders."
          : "Enable browser notifications to get reminders before your events and tasks."}
      </p>
      {permission !== "denied" && (
        <button
          onClick={requestPermission}
          className="px-3 py-1.5 bg-[#1E4D8C] text-white text-xs font-semibold rounded-lg hover:bg-[#0077ed] transition-colors flex-shrink-0"
        >
          Enable
        </button>
      )}
      <button onClick={() => setDismissed(true)} className="text-[#5C6370] hover:text-[#0D1B2A] dark:hover:text-white flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}
