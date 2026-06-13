export type Priority = "low" | "medium" | "high" | "urgent";
export type KanbanColumn = "backlog" | "todo" | "in_progress" | "done";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: KanbanColumn;
  due_date?: string;
  tags: string[];
  subtasks: Subtask[];
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  recurrence?: RecurrenceRule;
  color: string;
  reminder_enabled: boolean;
  created_at: string;
}

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly";
  interval: number;
  days_of_week?: number[];
  end_date?: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  folder_id?: string;
  tags: string[];
  linked_task_ids: string[];
  linked_event_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface NoteFolder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface PomodoroSession {
  id: string;
  user_id: string;
  completed_at: string;
  work_duration: number;
  break_duration: number;
  task_id?: string;
}

export interface PomodoroSettings {
  work_duration: number;
  short_break: number;
  long_break: number;
  sessions_before_long_break: number;
}
