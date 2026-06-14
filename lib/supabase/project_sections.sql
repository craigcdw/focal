-- Project content table — store section data out of the codebase
create table if not exists project_sections (
  id            uuid        primary key default gen_random_uuid(),
  project_slug  text        not null,
  section_id    text        not null,
  section_order int         not null,
  data          jsonb       not null default '{}',
  unique(project_slug, section_id)
);

alter table project_sections enable row level security;

-- Only authenticated (logged-in) users can read
create policy "authenticated users can read project sections"
  on project_sections for select
  to authenticated
  using (true);

-- No public writes — manage content via Supabase dashboard or seed script
