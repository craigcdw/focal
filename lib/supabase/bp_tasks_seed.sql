-- ─────────────────────────────────────────────────────────────────────────────
-- BrightPrompt Agent Factory — Kanban task seed
-- Run in Supabase SQL Editor AFTER schema.sql has been applied.
-- Inserts 13 tasks + 51 subtasks for craigcdw@gmail.com
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_uid uuid;
begin
  select id into v_uid from auth.users where email = 'craigcdw@gmail.com' limit 1;

  if v_uid is null then
    raise exception 'User not found — check email address in script';
  end if;

  -- ── 01 North Star & Positioning ─────────────────────────── todo · urgent ──
  insert into tasks (user_id, title, description, priority, status, tags, subtasks) values (
    v_uid,
    'North Star & positioning',
    'Define who BrightPrompt serves, what we do, and how we differ. The foundation everything else is built on.',
    'urgent', 'todo',
    array['brightprompt','week-1'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Define your "who and what" statement — target client, transformation delivered, method used', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Lock 3 core verticals (Financial Services + Professional Services + 1 opportunistic)', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Write your LinkedIn headline & summary using the BrightPrompt brand voice', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Write and lock North Star statement (who, what, how, for whom)', 'completed', false)
    )
  );

  -- ── 02 LinkedIn Profile & Outreach ──────────────────────── todo · urgent ──
  insert into tasks (user_id, title, description, priority, status, tags, subtasks) values (
    v_uid,
    'LinkedIn profile & outreach setup',
    'Get the profile live and start the daily connection cadence. This is the primary pipeline engine.',
    'urgent', 'todo',
    array['brightprompt','week-1'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Profile photo + banner + headline live — AI Adoption Partner for UK Financial & Professional Services', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Update LinkedIn about section with BrightPrompt brand voice and positioning', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Publish 3 proof posts: one case study, one thought leadership, one social proof / testimonial', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Activate daily connection requests — 20/day max, personalised message template in place', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Send first 100 LinkedIn connection requests (personalised)', 'completed', false)
    )
  );

  -- ── 03 AI Tool Stack Setup ────────────────────────────────── todo · high ──
  insert into tasks (user_id, title, description, priority, status, tags, subtasks) values (
    v_uid,
    'AI tool stack setup (ChatGPT + Claude)',
    'Build the 3 Custom GPTs and 3 Claude Projects that power every BrightPrompt engagement.',
    'high', 'todo',
    array['brightprompt','week-1'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Create "Brief Builder" Custom GPT — system prompt added, tested with mock discovery call output', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Create "Proposal Generator" Custom GPT — tested end-to-end from brief → proposal', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Create "Client Comms" Custom GPT — email drafts, follow-up messages, post-call summaries', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', '"BA Analysis" Project created in Claude — system prompt live, test run completed', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', '"Requirements Writing" Project created — tested with a sample discovery call transcript', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', '"Process Mapping" Project created — outputs process maps in text notation (flowchart-ready)', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Claude Code workflows documented — CLAUDE.md in each repo, SOPs written', 'completed', false)
    )
  );

  -- ── 04 Productise the 3 Offers ───────────────────────────── todo · high ──
  insert into tasks (user_id, title, description, priority, status, tags, subtasks) values (
    v_uid,
    'Productise the 3 offers',
    'Document each tier so it can be explained in 60 seconds and proposed on a single page.',
    'high', 'todo',
    array['brightprompt','week-1'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Rapid Assessment (£500) — one-pager written, pricing rationale documented, delivery template ready', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'AI Readiness Package (£3,500) — scope doc written, deliverables listed, proposal template built', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Agent of Record (£9,500/month) — retainer contract drafted, monthly touchpoint agenda defined', 'completed', false)
    )
  );

  -- ── 05 OneDrive Folder Structure ───────────────────────── todo · medium ──
  insert into tasks (user_id, title, description, priority, status, tags, subtasks) values (
    v_uid,
    'OneDrive folder structure',
    'Set up the master BrightPrompt folder hierarchy — every client and asset has a home from day one.',
    'medium', 'todo',
    array['brightprompt','week-1'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Create OneDrive structure: 01-Strategy, 02-Sales/Templates, 03-Clients, 04-IP Library, 05-Marketing, 06-Operations', 'completed', false)
    )
  );

  -- ── 06 Lead Engine & Lead Magnet ──────────────────────── backlog · high ──
  insert into tasks (user_id, title, description, priority, status, tags, subtasks) values (
    v_uid,
    'Lead engine & launch lead magnet',
    'Activate all three outbound tracks: email sequence, call sequence, and AI Readiness Scorecard lead magnet.',
    'high', 'backlog',
    array['brightprompt','week-2'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Publish first proof post on LinkedIn (case study or quick win)', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Build and publish AI Readiness Scorecard lead magnet (10 questions → PDF report → debrief CTA)', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Set up email follow-up sequence (5 emails over 14 days)', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Book first 3 discovery calls from LinkedIn outreach', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Write proposal template using Proposal Generator GPT', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Maintain LinkedIn connection cadence (100 requests/week)', 'completed', false)
    )
  );

  -- ── 07 Start PIL Copilot Studio Bot ─────────────────── backlog · urgent ──
  insert into tasks (user_id, title, description, priority, status, tags, subtasks) values (
    v_uid,
    'Start PIL Copilot Studio bot',
    'Premium Investments Limited — the first live reference case. Environment, scaffold, and greeting topic.',
    'urgent', 'backlog',
    array['brightprompt','week-2','PIL'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Create Power Platform environment and enable AI Builder credits', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Create Copilot Studio agent — empty bot scaffolded in environment', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Set greeting topic with unique trigger phrases (pilkickoff, pilrisk, pilreview, etc.)', 'completed', false)
    )
  );

  -- ── 08 First Discovery Calls & Proposals ─────────────── backlog · urgent ──
  insert into tasks (user_id, title, description, priority, status, tags, subtasks) values (
    v_uid,
    'First discovery calls & proposals',
    'Run the first 3 discovery calls and convert at least one to a proposal within 48 hours.',
    'urgent', 'backlog',
    array['brightprompt','week-3'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Run first 3 discovery calls — use BA Analysis Claude Project for debrief notes', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Send first proposal using Proposal Generator GPT (within 48 hours of call)', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Publish 2nd LinkedIn post (thought leadership)', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Create delivery report template in OneDrive', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Write first case study (anonymised) from PIL or any previous work', 'completed', false)
    )
  );

  -- ── 09 PIL Bot: Core Topics & Testing ───────────────── backlog · urgent ──
  insert into tasks (user_id, title, description, priority, status, tags, subtasks) values (
    v_uid,
    'PIL bot: core topics & testing',
    'Build all 4 BA Agent topics and test end-to-end in the Copilot Studio test pane — all green before UAT.',
    'urgent', 'backlog',
    array['brightprompt','week-3','PIL'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Build BA Kick-off topic (trigger: pilkickoff)', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Build Requirements Gathering topic (trigger: pilrequirements)', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Build Stakeholder Mapping topic (trigger: pilstakeholders)', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Build Risk Analysis topic (trigger: pilrisk)', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Test all 4 topics end-to-end in Copilot Studio test pane — all green', 'completed', false)
    )
  );

  -- ── 10 Close First Engagement ───────────────────────── backlog · urgent ──
  insert into tasks (user_id, title, description, priority, status, tags, subtasks) values (
    v_uid,
    'Close first engagement',
    'Convert a discovery call to a signed contract. Target: Rapid Assessment (£500) or AI Readiness Package (£3,500).',
    'urgent', 'backlog',
    array['brightprompt','week-4'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Follow up on all outstanding proposals — personalised nudge email for each', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Close first paid engagement and raise invoice', 'completed', false)
    )
  );

  -- ── 11 PIL Bot: UAT & Handover ───────────────────────── backlog · high ──
  insert into tasks (user_id, title, description, priority, status, tags, subtasks) values (
    v_uid,
    'PIL bot: UAT & handover',
    'Complete client UAT, connect Teams channel, record walkthrough video, and hand over full documentation.',
    'high', 'backlog',
    array['brightprompt','week-4','PIL'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'PIL bot — UAT with client, bugs fixed, Teams channel connected', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Record PIL walkthrough video for handover pack', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Write PIL user guide and deliver handover documentation', 'completed', false)
    )
  );

  -- ── 12 30-Day Review & Month 2 Planning ──────────────── backlog · high ──
  insert into tasks (user_id, title, description, priority, status, tags, subtasks) values (
    v_uid,
    '30-day review & month 2 planning',
    'Review all metrics against targets, adjust the outbound approach, and schedule the Month 2 artefact factory build.',
    'high', 'backlog',
    array['brightprompt','week-4'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Publish 3rd LinkedIn post (social proof / first result)', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Review 30-day metrics vs targets — connections, calls, proposals, revenue', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Plan Month 2 — schedule artefact factory build and second bot project', 'completed', false)
    )
  );

  -- ── 13 90-Day Milestone Roadmap ────────────────────── backlog · medium ──
  insert into tasks (user_id, title, description, priority, status, tags, subtasks) values (
    v_uid,
    '90-day milestone roadmap',
    'At 90 days with 3 active clients and one retainer, BrightPrompt is self-funding. These are the gates.',
    'medium', 'backlog',
    array['brightprompt','90-day'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Month 1: First paying client signed and kick-off completed', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Month 1: PIL BA Agent live in Teams and signed off by client', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Month 2: Artefact library complete — all 6 templates built and stored in OneDrive', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Month 2: 3 active client engagements running concurrently', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Month 3: First Agent of Record retainer (£9,500/month) signed', 'completed', false),
      jsonb_build_object('id', gen_random_uuid()::text, 'title', 'Month 3: £10K+ MRR achieved — pipeline strong enough to sustain without new outreach for 30 days', 'completed', false)
    )
  );

  raise notice 'Done: 13 BrightPrompt tasks seeded for user %', v_uid;
end;
$$;
