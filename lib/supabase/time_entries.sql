-- Run this in your Supabase SQL editor

create table if not exists time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete cascade not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds int,
  note text,
  created_at timestamptz default now()
);

alter table time_entries enable row level security;
create policy "Users manage own time entries" on time_entries for all using (auth.uid() = user_id);
