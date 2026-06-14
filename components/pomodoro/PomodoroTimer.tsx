"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { playWorkDone, playBreakDone, playReminderChime } from "@/lib/audio";
import { createClient } from "@/lib/supabase/client";
import { PomodoroSettings, PomodoroSession } from "@/lib/types";
import { Play, Pause, RotateCcw, Settings, X } from "lucide-react";
import { format } from "date-fns";

function playSound(type: "work_done" | "break_done") {
  if (type === "work_done") playWorkDone(); else playBreakDone();
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  work_duration: 25,
  short_break: 5,
  long_break: 15,
  sessions_before_long_break: 4,
};

type Phase = "work" | "short_break" | "long_break";

export function PomodoroTimer() {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SETTINGS.work_duration * 60);
  const [running, setRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [todaySessions, setTodaySessions] = useState<PomodoroSession[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(DEFAULT_SETTINGS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            handlePhaseEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: s } = await supabase.from("pomodoro_settings").select("*").eq("user_id", user.id).single();
    if (s) {
      setSettings(s);
      setTempSettings(s);
      setSecondsLeft(s.work_duration * 60);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: sessions } = await supabase.from("pomodoro_sessions").select("*").eq("user_id", user.id).gte("completed_at", today.toISOString()).order("completed_at", { ascending: false });
    setTodaySessions(sessions ?? []);
  }

  async function handlePhaseEnd() {
    if (phase === "work") {
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);

      // Log session
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("pomodoro_sessions").insert({
          user_id: user.id,
          work_duration: settings.work_duration,
          break_duration: settings.short_break,
        }).select().single();
        if (data) setTodaySessions(prev => [data, ...prev]);
      }

      // Sound + notification
      playSound("work_done");
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Focal — Focus session complete!", { body: "Time for a break." });
      }

      // Determine next break
      if (newCount % settings.sessions_before_long_break === 0) {
        switchPhase("long_break");
      } else {
        switchPhase("short_break");
      }
    } else {
      playSound("break_done");
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Focal — Break over!", { body: "Ready to focus?" });
      }
      switchPhase("work");
    }
  }

  function switchPhase(p: Phase) {
    setPhase(p);
    const duration = p === "work" ? settings.work_duration : p === "short_break" ? settings.short_break : settings.long_break;
    setSecondsLeft(duration * 60);
    setRunning(false);
  }

  function reset() {
    setRunning(false);
    const duration = phase === "work" ? settings.work_duration : phase === "short_break" ? settings.short_break : settings.long_break;
    setSecondsLeft(duration * 60);
  }

  async function saveSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("pomodoro_settings").upsert({ user_id: user.id, ...tempSettings });
    setSettings(tempSettings);
    setSecondsLeft(tempSettings.work_duration * 60);
    setPhase("work");
    setRunning(false);
    setShowSettings(false);
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const total = (phase === "work" ? settings.work_duration : phase === "short_break" ? settings.short_break : settings.long_break) * 60;
  const progress = ((total - secondsLeft) / total) * 100;

  const phaseLabel = phase === "work" ? "Focus" : phase === "short_break" ? "Short break" : "Long break";
  const phaseColor = phase === "work" ? "#1E4D8C" : phase === "short_break" ? "#34c759" : "#5e5ce6";

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0D1B2A] dark:text-white tracking-tight">Focus</h1>
          <p className="text-[#5C6370] dark:text-zinc-400 mt-1">{todaySessions.length} sessions today</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => playWorkDone()}
            title="Test sound"
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Test sound
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Phase selector */}
      <div className="flex gap-2 justify-center">
        {(["work", "short_break", "long_break"] as Phase[]).map(p => (
          <button
            key={p}
            onClick={() => switchPhase(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              phase === p ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
            }`}
          >
            {p === "work" ? "Focus" : p === "short_break" ? "Short break" : "Long break"}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="flex justify-center">
        <div className="relative">
          <svg width="280" height="280" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-zinc-800" />
            <circle
              cx="140" cy="140" r={radius}
              fill="none"
              stroke={phaseColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 140 140)"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: phaseColor }}>{phaseLabel}</p>
            <p className="text-5xl font-semibold text-gray-900 dark:text-white tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
            <div className="flex gap-3 mt-4">
              {(["work", "short_break", "work", "short_break"] as const).slice(0, settings.sessions_before_long_break).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < (sessionsCompleted % settings.sessions_before_long_break) ? "bg-[#D4A017]" : "bg-gray-200 dark:bg-zinc-700"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={reset} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors">
          <RotateCcw size={20} />
        </button>
        <button
          onClick={() => {
            if (!running && "Notification" in window && Notification.permission === "default") {
              Notification.requestPermission();
            }
            setRunning(r => !r);
          }}
          className="flex items-center gap-2 px-10 py-4 rounded-2xl text-white font-semibold text-lg transition-all hover:opacity-90 shadow-lg"
          style={{ backgroundColor: phaseColor }}
        >
          {running ? <Pause size={22} /> : <Play size={22} />}
          {running ? "Pause" : "Start"}
        </button>
      </div>

      {/* Today's sessions log */}
      {todaySessions.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Today&apos;s sessions</h2>
          <div className="space-y-2">
            {todaySessions.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-700 dark:text-zinc-300">Session {todaySessions.length - i}</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-zinc-500">{format(new Date(s.completed_at), "h:mm a")} · {s.work_duration}min</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Total: <span className="font-semibold text-gray-900 dark:text-white">{todaySessions.reduce((a, s) => a + s.work_duration, 0)} minutes</span> of focused work
            </p>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Timer settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"><X size={18} /></button>
            </div>
            {[
              { label: "Focus duration (min)", key: "work_duration" as const },
              { label: "Short break (min)", key: "short_break" as const },
              { label: "Long break (min)", key: "long_break" as const },
              { label: "Sessions before long break", key: "sessions_before_long_break" as const },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1.5 block">{label}</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={tempSettings[key]}
                  onChange={e => setTempSettings(p => ({ ...p, [key]: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div className="flex gap-3 pt-1">
              <button onClick={saveSettings} className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity">Save</button>
              <button onClick={() => setShowSettings(false)} className="px-5 py-2 text-gray-500 dark:text-zinc-400 text-sm hover:text-gray-700 dark:hover:text-zinc-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
