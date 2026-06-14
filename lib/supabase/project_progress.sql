create table if not exists project_progress (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users on delete cascade not null,
  project_slug text       not null,
  checks      jsonb       not null default '{}',
  updated_at  timestamptz not null default now(),
  unique(user_id, project_slug)
);

alter table project_progress enable row level security;

create policy "users manage own project progress"
  on project_progress for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
