"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CalendarEvent } from "@/lib/types";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  addWeeks, subWeeks, parseISO, isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker";

type ViewMode = "month" | "week" | "day";

const EVENT_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

function nextHourTime(): { start: string; end: string } {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  const start = format(now, "HH:mm");
  now.setHours(now.getHours() + 1);
  const end = format(now, "HH:mm");
  return { start, end };
}

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [current, setCurrent] = useState(new Date());
  const [view, setView] = useState<ViewMode>("month");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", date: "", start_time: "", end_time: "", reminder_enabled: true });
  const [snoozed, setSnoozed] = useState<Set<string>>(new Set());
  const supabase = createClient();

  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    start_time: nextHourTime().start,
    end_time: nextHourTime().end,
    all_day: false,
    color: "#3b82f6",
    recurrence: "none",
    recurrence_days: [2, 4] as number[], // Tue, Thu
    reminder_enabled: true,
  });

  useEffect(() => {
    fetchEvents();
  }, [current]);

  async function fetchEvents() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const start = startOfMonth(subMonths(current, 1)).toISOString();
    const end = endOfMonth(addMonths(current, 1)).toISOString();
    const { data } = await supabase.from("calendar_events").select("*").eq("user_id", user.id).gte("start_date", start).lte("start_date", end).order("start_date");
    setEvents(data ?? []);
  }

  async function createEvent() {
    if (!form.title.trim()) { setFormError("Please enter an event title."); return; }
    if (!form.start_date) { setFormError("Please select a date."); return; }
    setFormError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setFormError("Not signed in — please refresh and try again."); return; }

    const startDt = form.all_day
      ? new Date(form.start_date + "T00:00:00").toISOString()
      : new Date(form.start_date + "T" + form.start_time).toISOString();
    const endDt = form.all_day
      ? new Date(form.start_date + "T23:59:59").toISOString()
      : new Date(form.start_date + "T" + form.end_time).toISOString();

    const recurrence = form.recurrence === "weekly"
      ? { frequency: "weekly", interval: 1, days_of_week: form.recurrence_days }
      : null;

    const { data } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      start_date: startDt,
      end_date: endDt,
      all_day: form.all_day,
      color: form.color,
      recurrence,
      reminder_enabled: form.reminder_enabled,
    }).select().single();

    if (data) setEvents(prev => [...prev, data]);
    setShowForm(false);
    const { start, end } = nextHourTime();
    setForm({ title: "", description: "", start_date: "", start_time: start, end_time: end, all_day: false, color: "#3b82f6", recurrence: "none", recurrence_days: [2, 4], reminder_enabled: true });
  }

  async function deleteEvent(id: string) {
    await supabase.from("calendar_events").delete().eq("id", id);
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  async function saveEventEdit() {
    if (!selectedEvent) return;
    const dateBase = editForm.date || selectedEvent.start_date.split("T")[0];
    const updates: Partial<CalendarEvent> = {
      title: editForm.title,
      description: editForm.description,
      reminder_enabled: editForm.reminder_enabled,
      ...(!selectedEvent.all_day && editForm.start_time ? {
        start_date: new Date(`${dateBase}T${editForm.start_time}`).toISOString(),
        end_date: new Date(`${dateBase}T${editForm.end_time}`).toISOString(),
      } : {}),
      ...(selectedEvent.all_day && editForm.date ? {
        start_date: `${editForm.date}T00:00:00.000Z`,
        end_date: `${editForm.date}T23:59:59.000Z`,
      } : {}),
    };
    await supabase.from("calendar_events").update(updates).eq("id", selectedEvent.id);
    setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...e, ...updates } : e));
    setEditingEvent(false);
    setSelectedEvent(null);
  }

  function openEdit(event: CalendarEvent) {
    setEditForm({
      title: event.title,
      description: event.description ?? "",
      date: event.start_date.split("T")[0],
      start_time: event.all_day ? "" : format(parseISO(event.start_date), "HH:mm"),
      end_time: event.all_day ? "" : format(parseISO(event.end_date), "HH:mm"),
      reminder_enabled: event.reminder_enabled ?? true,
    });
    setEditingEvent(true);
  }

  function snoozeEvent(id: string, minutes: number) {
    setSnoozed(prev => new Set(prev).add(id));
    setTimeout(() => {
      setSnoozed(prev => { const s = new Set(prev); s.delete(id); return s; });
    }, minutes * 60 * 1000);
    setSelectedEvent(null);
  }

  // Generate expanded events including recurring instances
  function getEventsForDay(day: Date): CalendarEvent[] {
    return events.filter(event => {
      if (isSameDay(parseISO(event.start_date), day)) return true;
      if (event.recurrence) {
        const r = event.recurrence;
        if (r.frequency === "weekly" && r.days_of_week) {
          return r.days_of_week.includes(day.getDay());
        }
      }
      return false;
    });
  }

  // Month view
  const monthDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(current)),
    end: endOfWeek(endOfMonth(current)),
  });

  // Week view
  const weekDays = eachDayOfInterval({
    start: startOfWeek(current),
    end: endOfWeek(current),
  });

  const navigate = (dir: 1 | -1) => {
    if (view === "month") setCurrent(dir === 1 ? addMonths(current, 1) : subMonths(current, 1));
    else if (view === "week") setCurrent(dir === 1 ? addWeeks(current, 1) : subWeeks(current, 1));
    else setCurrent(prev => { const d = new Date(prev); d.setDate(d.getDate() + dir); return d; });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">Calendar</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">
            {view === "month" && format(current, "MMMM yyyy")}
            {view === "week" && `${format(startOfWeek(current), "MMM d")} – ${format(endOfWeek(current), "MMM d, yyyy")}`}
            {view === "day" && format(current, "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700">
            {(["month", "week", "day"] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === v ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          {/* Navigate */}
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-zinc-300">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setCurrent(new Date())} className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              Today
            </button>
            <button onClick={() => navigate(1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-zinc-300">
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            <Plus size={16} />
            New event
          </button>
        </div>
      </div>

      {/* Month View */}
      {view === "month" && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
          {/* Day labels */}
          <div className="grid grid-cols-7 border-b border-gray-100 dark:border-zinc-800">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-gray-400 dark:text-zinc-500">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day, i) => {
              const dayEvents = getEventsForDay(day);
              const inMonth = isSameMonth(day, current);
              return (
                <div
                  key={i}
                  onClick={() => { setSelectedDate(day); setForm(p => ({ ...p, start_date: format(day, "yyyy-MM-dd") })); setShowForm(true); }}
                  className={`min-h-24 p-2 border-b border-r border-gray-50 dark:border-zinc-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${
                    !inMonth ? "opacity-40" : ""
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                    isToday(day) ? "bg-blue-500 text-white" : "text-gray-700 dark:text-zinc-200"
                  }`}>
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map(e => (
                      <div
                        key={e.id}
                        onClick={ev => { ev.stopPropagation(); setSelectedEvent(e); }}
                        className="text-xs px-1.5 py-0.5 rounded truncate text-white font-medium cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: e.color }}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div
                        onClick={ev => { ev.stopPropagation(); setCurrent(day); setView("day"); }}
                        className="text-xs text-blue-500 dark:text-blue-400 pl-1 cursor-pointer hover:underline"
                      >
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === "week" && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100 dark:border-zinc-800">
            {weekDays.map(day => (
              <div key={day.toISOString()} className={`py-4 text-center border-r border-gray-50 dark:border-zinc-800 last:border-r-0 ${isToday(day) ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}>
                <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">{format(day, "EEE")}</p>
                <p className={`text-lg font-semibold mt-0.5 ${isToday(day) ? "text-blue-500" : "text-gray-900 dark:text-white"}`}>{format(day, "d")}</p>
                <div className="mt-2 px-2 space-y-1">
                  {getEventsForDay(day).map(e => (
                    <div key={e.id} className="text-xs px-1.5 py-0.5 rounded text-white truncate" style={{ backgroundColor: e.color }}>{e.title}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day View */}
      {view === "day" && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6">
          <div className={`mb-4 pb-4 border-b border-gray-100 dark:border-zinc-800 ${isToday(current) ? "text-blue-500" : "text-gray-900 dark:text-white"}`}>
            <p className="text-2xl font-semibold">{format(current, "EEEE, MMMM d")}</p>
          </div>
          {getEventsForDay(current).length === 0 ? (
            <p className="text-gray-400 dark:text-zinc-500 text-sm">No events today</p>
          ) : (
            <div className="space-y-3">
              {getEventsForDay(current).map(e => (
                <div key={e.id} className="flex items-start gap-3 group">
                  <div className="w-1 h-full min-h-10 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{e.title}</p>
                    {!e.all_day && (
                      <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                        {format(parseISO(e.start_date), "HH:mm")} – {format(parseISO(e.end_date), "HH:mm")}
                      </p>
                    )}
                    {e.description && <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{e.description}</p>}
                  </div>
                  <button onClick={() => deleteEvent(e.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Event detail / edit popup */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setSelectedEvent(null); setEditingEvent(false); }}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100 dark:border-zinc-800" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: selectedEvent.color }} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingEvent ? "Edit event" : selectedEvent.title}
                </h3>
              </div>
              <button onClick={() => { setSelectedEvent(null); setEditingEvent(false); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 flex-shrink-0">
                <X size={18} />
              </button>
            </div>

            {editingEvent ? (
              /* ── Edit mode ── */
              <div className="space-y-3">
                <input
                  autoFocus
                  value={editForm.title}
                  onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Event title"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div>
                  <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1 block">Date</label>
                  <input type="date" value={editForm.date} onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                {!selectedEvent.all_day && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1 block">Start time</label>
                      <input type="time" value={editForm.start_time} onChange={e => setEditForm(p => ({ ...p, start_time: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1 block">End time</label>
                      <input type="time" value={editForm.end_time} onChange={e => setEditForm(p => ({ ...p, end_time: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-700 dark:text-zinc-300">Reminder</span>
                  <button type="button" onClick={() => setEditForm(p => ({ ...p, reminder_enabled: !p.reminder_enabled }))}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${editForm.reminder_enabled ? "bg-blue-500" : "bg-gray-200 dark:bg-zinc-700"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${editForm.reminder_enabled ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveEventEdit} className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity">Save</button>
                  <button onClick={() => setEditingEvent(false)} className="flex-1 py-2 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              /* ── View mode ── */
              <div>
                {selectedEvent.description && (
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mb-3">{selectedEvent.description}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-zinc-300 mb-1">
                  {format(parseISO(selectedEvent.start_date), "EEEE, MMMM d, yyyy")}
                </p>
                {!selectedEvent.all_day && (
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    {format(parseISO(selectedEvent.start_date), "HH:mm")} – {format(parseISO(selectedEvent.end_date), "HH:mm")}
                  </p>
                )}
                {selectedEvent.recurrence && (
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Repeats weekly</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${(selectedEvent.reminder_enabled ?? true) ? "bg-blue-500" : "bg-gray-300 dark:bg-zinc-600"}`} />
                  <span className="text-xs text-gray-400 dark:text-zinc-500">
                    Reminder {(selectedEvent.reminder_enabled ?? true) ? "on" : "off"}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 mt-5">
                  <button
                    onClick={() => openEdit(selectedEvent)}
                    className="py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { deleteEvent(selectedEvent.id); setSelectedEvent(null); }}
                    className="py-2 rounded-xl border border-red-200 dark:border-red-900 text-red-500 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {/* Snooze */}
                <div className="mt-3">
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mb-2">Snooze reminder</p>
                  <div className="flex gap-2">
                    {[5, 10, 30].map(mins => (
                      <button
                        key={mins}
                        onClick={() => snoozeEvent(selectedEvent.id, mins)}
                        className="flex-1 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New event form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">New event</h3>
              <button onClick={() => { setShowForm(false); setFormError(""); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"><X size={18} /></button>
            </div>
            <input
              autoFocus
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Event title"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1.5 block">Date</label>
                <DatePicker value={form.start_date} onChange={v => setForm(p => ({ ...p, start_date: v }))} />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.all_day} onChange={e => setForm(p => ({ ...p, all_day: e.target.checked }))} className="accent-blue-500" />
                  <span className="text-sm text-gray-700 dark:text-zinc-300">All day</span>
                </label>
              </div>
            </div>
            {!form.all_day && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1.5 block">Start time</label>
                  <input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1.5 block">End time</label>
                  <input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1.5 block">Recurrence</label>
              <select value={form.recurrence} onChange={e => setForm(p => ({ ...p, recurrence: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="none">None</option>
                <option value="weekly">Weekly (Tue & Thu — LinkedIn)</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Reminder</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Play sound &amp; notify when event starts</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, reminder_enabled: !p.reminder_enabled }))}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                  form.reminder_enabled ? "bg-blue-500" : "bg-gray-200 dark:bg-zinc-700"
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  form.reminder_enabled ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-zinc-400 mb-2 block">Color</label>
              <div className="flex gap-2">
                {EVENT_COLORS.map(c => (
                  <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${form.color === c ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ring-gray-900 dark:ring-white scale-110" : ""}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            {formError && (
              <p className="text-sm text-red-500 dark:text-red-400">{formError}</p>
            )}
            <div className="flex gap-3 pt-1">
              <button onClick={createEvent} className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity">Create event</button>
              <button onClick={() => { setShowForm(false); setFormError(""); }} className="px-5 py-2 text-gray-500 dark:text-zinc-400 text-sm hover:text-gray-700 dark:hover:text-zinc-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
