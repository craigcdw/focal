-- Run in Supabase SQL editor
alter table tasks add column if not exists due_time text;
