"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import "react-day-picker/style.css";

interface DatePickerProps {
  value: string; // "yyyy-MM-dd"
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "Pick a date" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const isValidDate = selected && isValid(selected);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors hover:border-gray-300 dark:hover:border-zinc-600"
      >
        <CalendarIcon size={14} className="text-gray-400 dark:text-zinc-500 flex-shrink-0" />
        <span className={isValidDate ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-zinc-500"}>
          {isValidDate ? format(selected, "MMM d, yyyy") : placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden">
          <DayPicker
            mode="single"
            selected={isValidDate ? selected : undefined}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, "yyyy-MM-dd"));
                setOpen(false);
              }
            }}
            classNames={{
              root: "p-3",
              month_caption: "flex items-center justify-between px-1 mb-2",
              caption_label: "text-sm font-semibold text-gray-900 dark:text-white",
              nav: "flex items-center gap-1",
              button_previous: "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors",
              button_next: "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors",
              weekdays: "flex mb-1",
              weekday: "w-9 text-center text-xs font-medium text-gray-400 dark:text-zinc-500 py-1",
              weeks: "space-y-0.5",
              week: "flex",
              day: "w-9 h-9 flex items-center justify-center",
              day_button: "w-8 h-8 rounded-xl text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 focus:outline-none",
              selected: "bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800",
              today: "text-blue-500 font-semibold",
              outside: "opacity-30",
              disabled: "opacity-20 cursor-not-allowed",
            }}
          />
        </div>
      )}
    </div>
  );
}
