-- Fix currency: replace £ with R in existing Supabase data
-- Run in Supabase SQL Editor

-- ── Tasks: title, description, subtask titles ─────────────────────────────
update tasks
set
  title       = replace(title,       '£', 'R'),
  description = replace(description, '£', 'R'),
  subtasks    = replace(subtasks::text, '£', 'R')::jsonb
where
  title       like '%£%'
  or description like '%£%'
  or subtasks::text like '%£%';

-- ── Project sections: all JSONB data ─────────────────────────────────────
update project_sections
set data = replace(data::text, '£', 'R')::jsonb
where data::text like '%£%';
