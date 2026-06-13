-- Run this in your Supabase SQL editor

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  priority text not null default 'medium',
  status text not null default 'todo',
  due_date date,
  tags text[] default '{}',
  subtasks jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  all_day boolean default false,
  recurrence jsonb,
  color text default '#3b82f6',
  created_at timestamptz default now()
);

create table if not exists note_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text default '#6b7280',
  created_at timestamptz default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled',
  content text default '',
  folder_id uuid references note_folders(id) on delete set null,
  tags text[] default '{}',
  linked_task_ids uuid[] default '{}',
  linked_event_ids uuid[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  completed_at timestamptz default now(),
  work_duration int not null default 25,
  break_duration int not null default 5,
  task_id uuid references tasks(id) on delete set null
);

create table if not exists pomodoro_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  work_duration int not null default 25,
  short_break int not null default 5,
  long_break int not null default 15,
  sessions_before_long_break int not null default 4
);

-- Enable RLS
alter table tasks enable row level security;
alter table calendar_events enable row level security;
alter table note_folders enable row level security;
alter table notes enable row level security;
alter table pomodoro_sessions enable row level security;
alter table pomodoro_settings enable row level security;

-- RLS policies
create policy "Users manage own tasks" on tasks for all using (auth.uid() = user_id);
create policy "Users manage own events" on calendar_events for all using (auth.uid() = user_id);
create policy "Users manage own folders" on note_folders for all using (auth.uid() = user_id);
create policy "Users manage own notes" on notes for all using (auth.uid() = user_id);
create policy "Users manage own pomodoro sessions" on pomodoro_sessions for all using (auth.uid() = user_id);
create policy "Users manage own pomodoro settings" on pomodoro_settings for all using (auth.uid() = user_id);
