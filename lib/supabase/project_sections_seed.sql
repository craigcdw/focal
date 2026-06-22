-- ─────────────────────────────────────────────────────────────────────────────
-- BrightPrompt Agent Factory — section seed data
-- Run AFTER project_sections.sql
-- ─────────────────────────────────────────────────────────────────────────────

insert into project_sections (project_slug, section_id, section_order, data) values

-- ── 01 EXECUTIVE SUMMARY ──────────────────────────────────────────────────────
('bp-agent-factory', 'summary', 1, $j${
  "num": "01",
  "title": "Executive Summary",
  "wrapper": "hero",
  "blocks": [
    {
      "type": "hero",
      "subtitle": "Turn AI knowledge into systematic, repeatable revenue for UK professional services firms. This guide covers everything from positioning to delivery — executed in 30 days.",
      "stats": [
        {"v": "15K", "l": "LinkedIn connections"},
        {"v": "5",   "l": "Active bots target"},
        {"v": "�R175K","l": "Annual revenue target"},
        {"v": "60 days","l": "Pipeline to first close"}
      ],
      "notes": [
        {"variant": "info",    "content": "The BrightPrompt position: We are not an agency that builds tools. We are the partner that ensures AI actually delivers measurable business outcomes — scoped, delivered, and owned."},
        {"variant": "warning", "content": "Focus sectors: Financial Services and Professional Services. These have the budget, the regulatory pressure, and the appetite for structured AI adoption. Do not dilute the pitch."}
      ]
    }
  ]
}$j$::jsonb),

-- ── 02 BIG PICTURE ROADMAP ────────────────────────────────────────────────────
('bp-agent-factory', 'roadmap', 2, $j${
  "num": "02",
  "title": "Big Picture Roadmap",
  "subtitle": "The 7 phases of factory setup — click a card to jump to the relevant section.",
  "blocks": [
    {
      "type": "roadmap",
      "items": [
        {"n":"1","t":"Define Core",       "w":"Weeks 1–2", "desc":"North Star, positioning, target verticals, operating model","id":"north-star"},
        {"n":"2","t":"Build Lead Engine", "w":"Weeks 2–3", "desc":"LinkedIn automation, lead magnet, CRM, follow-up sequences","id":"linkedin"},
        {"n":"3","t":"Productise Offers", "w":"Weeks 3–4", "desc":"3-tier packages, proposal template, onboarding pack","id":"offers"},
        {"n":"4","t":"Artefact Factory",  "w":"Month 2",   "desc":"Prompt library, SOPs, AI workflows, reusable assets","id":"artefacts"},
        {"n":"5","t":"Client Delivery",   "w":"Month 2",   "desc":"Delivery playbook, quality checks, reporting template","id":"delivery"},
        {"n":"6","t":"Scale & IP",        "w":"Month 3",   "desc":"LinkedIn system, case studies, referral program","id":"ip-library"},
        {"n":"7","t":"Measure & Iterate", "w":"Ongoing",   "desc":"KPIs, weekly reviews, funnel optimisation","id":"metrics"}
      ]
    }
  ]
}$j$::jsonb),

-- ── 03 NORTH STAR & POSITIONING ───────────────────────────────────────────────
('bp-agent-factory', 'north-star', 3, $j${
  "num": "03",
  "title": "North Star & Positioning",
  "blocks": [
    {
      "type": "cards",
      "cols": 3,
      "items": [
        {"title":"Who we serve",  "content":"UK Financial Services & Professional Services firms, 50–500 employees, with budget and regulatory appetite for AI adoption."},
        {"title":"What we do",   "content":"Agent-led, outcome-priced AI adoption — from discovery through to deployed, trained, and owned agents."},
        {"title":"How we differ","content":"We are not a dev shop. We scope, build, and hand over. Clients own the IP. We earn the retainer through results."}
      ]
    },
    {
      "type": "badges",
      "label": "Target verticals",
      "items": [
        {"label":"Financial Services","variant":"blue"},
        {"label":"Wealth Management","variant":"blue"},
        {"label":"Legal & Compliance","variant":"blue"},
        {"label":"HR & Recruitment","variant":"blue"},
        {"label":"Accountancy","variant":"blue"},
        {"label":"Commercial Property","variant":"blue"},
        {"label":"Insurance Broking","variant":"blue"}
      ]
    },
    {
      "type": "checklist",
      "label": "Positioning checklist",
      "items": [
        {"id":"ns-0","label":"Define your \"who and what\" statement — target client, transformation delivered, method used"},
        {"id":"ns-1","label":"Lock 3 core verticals (Financial Services + Professional Services + 1 opportunistic)"},
        {"id":"ns-2","label":"Write your LinkedIn headline & summary using the BrightPrompt brand voice"}
      ]
    }
  ]
}$j$::jsonb),

-- ── 04 OPERATING MODEL ────────────────────────────────────────────────────────
('bp-agent-factory', 'operating-model', 4, $j${
  "num": "04",
  "title": "Operating Model",
  "subtitle": "The 4-layer BrightPrompt factory.",
  "blocks": [
    {
      "type": "cards",
      "cols": 4,
      "items": [
        {"title":"1 — Client Brief",      "content":"Discovery call captures goals, pain points, data sources, existing tools, and success metrics."},
        {"title":"2 — AI Engine",         "content":"ChatGPT for drafts, Claude for analysis, Claude Code for automation, Copilot Studio for bots."},
        {"title":"3 — BrightPrompt QA",   "content":"Human review of every AI output — accuracy, tone, compliance, and client fit verified."},
        {"title":"4 — Output Package",    "content":"Deployed agent, training session, handover doc, and 30-day support included as standard."}
      ]
    },
    {
      "type": "note",
      "variant": "info",
      "content": "Each engagement starts with a fixed-fee Rapid Assessment (�R500). This funds discovery, de-risks the client, and creates the brief for the full engagement."
    }
  ]
}$j$::jsonb),

-- ── 05 FULL SEQUENCE ──────────────────────────────────────────────────────────
('bp-agent-factory', 'sequence', 5, $j${
  "num": "05",
  "title": "Full Sequence",
  "subtitle": "From first contact to ongoing retainer.",
  "blocks": [
    {
      "type": "sequence",
      "items": [
        {"title":"Initial Outreach",   "date":"Day 1",        "dep":"LinkedIn connection + personalised message referencing a specific pain point in their sector.",               "output":"Connection accepted & reply"},
        {"title":"Discovery Call",     "date":"Days 3–5",     "dep":"30-min call. Ask: What's slowing your team? Where are you losing hours? What does good look like?",           "output":"Pain points mapped"},
        {"title":"Rapid Assessment",   "date":"Days 7–10",    "dep":"Fixed-fee �R500. 2-hour structured session. Deliver: AI Readiness Score + Quick Wins Report.",                 "output":"Assessment report delivered"},
        {"title":"Proposal",           "date":"Days 12–15",   "dep":"Tailored scope based on assessment. Choose from 3-tier pricing. Include ROI estimate.",                       "output":"Proposal sent & followed up"},
        {"title":"Onboarding",         "date":"Days 17–21",   "dep":"Contract signed. Kick-off call. Access granted to systems. Project plan shared.",                             "output":"Project live"},
        {"title":"Build & Deliver",    "date":"Weeks 4–6",    "dep":"Agents built, tested, and reviewed with client. Iterate on feedback.",                                        "output":"Agents deployed"},
        {"title":"Handover & Training","date":"Weeks 7–8",    "dep":"Live training session. Documentation handed over. Success metrics reviewed.",                                  "output":"Client self-sufficient"},
        {"title":"Retainer",           "date":"Month 3+",     "dep":"Monthly check-in. New use cases identified. Expansion sold on outcomes.",                                     "output":"Recurring revenue"}
      ]
    }
  ]
}$j$::jsonb),

-- ── 06 LINKEDIN REFINEMENT ────────────────────────────────────────────────────
('bp-agent-factory', 'linkedin', 6, $j${
  "num": "06",
  "title": "LinkedIn Refinement",
  "subtitle": "The primary pipeline engine for BrightPrompt.",
  "blocks": [
    {
      "type": "checklist",
      "label": "Profile setup",
      "items": [
        {"id":"li-0","label":"Profile photo + banner + headline live — 'AI Adoption Partner for UK Financial & Professional Services'"},
        {"id":"li-1","label":"Publish 3 proof posts: one case study, one thought leadership, one social proof / testimonial"},
        {"id":"li-2","label":"Activate daily connection requests — 20/day max, personalised message template in place"}
      ]
    },
    {
      "type": "cards",
      "cols": 2,
      "label": "Content pillars",
      "items": [
        {"title":"Real stories",    "content":"What did AI actually do for a client this week?"},
        {"title":"Myth busting",    "content":"What most people get wrong about AI agents."},
        {"title":"Process reveals", "content":"A peek inside how BrightPrompt works."},
        {"title":"Future framing",  "content":"What will X sector look like in 12 months?"}
      ]
    },
    {
      "type": "copybox",
      "label": "LinkedIn connection message template",
      "content": "Hi [First name],\n\nI work with [sector] firms helping them deploy AI agents that cut admin time and surface better data for decisions — without the usual tech headache.\n\nNoticed [specific observation from their profile or company].\n\nWould love to connect and share what we've been seeing across the space.\n\n— Craig"
    }
  ]
}$j$::jsonb),

-- ── 07 LEAD ENGINE ────────────────────────────────────────────────────────────
('bp-agent-factory', 'lead-engine', 7, $j${
  "num": "07",
  "title": "Lead Engine",
  "subtitle": "Three tracks running in parallel.",
  "blocks": [
    {
      "type": "lead-cards",
      "items": [
        {
          "title": "Email Sequence",
          "badge": "5 emails over 14 days",
          "items": [
            "Day 1 — Introduction + 1 quick win idea",
            "Day 3 — Case study / proof point",
            "Day 5 — Educational content (AI myth busting)",
            "Day 8 — Direct CTA: book Rapid Assessment",
            "Day 14 — Final nudge + open door"
          ]
        },
        {
          "title": "Call Sequence",
          "badge": "Warm calls",
          "items": [
            "Trigger: LinkedIn connection accepted",
            "Day 2 — Call attempt + voicemail",
            "Day 5 — Follow-up call",
            "Day 9 — Final attempt, move to email-only",
            "Gate: Aim for 50% to agree to discovery call"
          ]
        },
        {
          "title": "Lead Magnet",
          "badge": "AI Readiness Scorecard",
          "items": [
            "10-question form, scores across 5 dimensions",
            "Instant PDF report generated",
            "CTA: book a free 20-min debrief call",
            "Distribute via LinkedIn posts + DM",
            "Target: 10 downloads → 3 debrief calls/week"
          ]
        }
      ]
    }
  ]
}$j$::jsonb),

-- ── 08 PRODUCTISED OFFERS ─────────────────────────────────────────────────────
('bp-agent-factory', 'offers', 8, $j${
  "num": "08",
  "title": "Productised Offers",
  "subtitle": "Three tiers — priced on outcomes, not hours.",
  "blocks": [
    {
      "type": "pricing",
      "items": [
        {"title":"Rapid Assessment",    "price":"�R500",         "period":"Fixed fee · 1 day",           "badge":"Entry point",   "badgeVariant":"gold",  "desc":"Structured 2-hour session. AI Readiness Score (10 dimensions). Quick Wins Report (3 immediate opportunities). Written briefing for next step."},
        {"title":"AI Readiness Package","price":"�R3,500",       "period":"Fixed fee · 30 days",         "badge":"Most popular",  "badgeVariant":"blue",  "desc":"Full agent scoped and deployed. Process redesign documentation. Staff training session. 30-day support included."},
        {"title":"Agent of Record",     "price":"�R9,500",       "period":"Per month · 3-month min",     "badge":"Highest value", "badgeVariant":"green", "desc":"Ongoing fractional AI partner. Multiple agents in scope. Monthly optimisation cycle. Quarterly strategy review."}
      ]
    },
    {
      "type": "checklist",
      "label": "Offer documentation checklist",
      "items": [
        {"id":"of-0","label":"Rapid Assessment (�R500) — one-pager written, pricing rationale documented, delivery template ready"},
        {"id":"of-1","label":"AI Readiness Package (�R3,500) — scope doc written, deliverables listed, proposal template built"},
        {"id":"of-2","label":"Agent of Record (�R9,500/month) — retainer contract drafted, monthly touchpoint agenda defined"}
      ]
    }
  ]
}$j$::jsonb),

-- ── 09 ARTEFACT FACTORY ───────────────────────────────────────────────────────
('bp-agent-factory', 'artefacts', 9, $j${
  "num": "09",
  "title": "Artefact Factory",
  "subtitle": "Reusable assets that multiply output per engagement.",
  "blocks": [
    {
      "type": "cards",
      "cols": 3,
      "items": [
        {"title":"Brief Template",    "content":"Structured discovery doc — captures goals, data, tools, stakeholders, constraints, and success metrics."},
        {"title":"Proposal Template", "content":"Executive summary → problem → solution → scope → pricing → ROI estimate → next step."},
        {"title":"Scope Document",    "content":"Technical and functional requirements, agent architecture, integration map, timeline."},
        {"title":"Delivery Report",   "content":"Week-by-week progress, decisions made, blockers resolved, metrics tracked, next actions."},
        {"title":"Training Pack",     "content":"Video walkthrough + written SOP for every agent delivered. Client owns it from day one."},
        {"title":"Case Study",        "content":"Anonymised results template: situation → what we did → result → quote. Used in LinkedIn + proposals."}
      ]
    },
    {
      "type": "note",
      "variant": "success",
      "content": "Every artefact lives in the BrightPrompt OneDrive → Client Folder. Each new client gets a copy of the template set. Save variants that worked especially well into the Master Templates folder."
    }
  ]
}$j$::jsonb),

-- ── 10 IP LIBRARY ─────────────────────────────────────────────────────────────
('bp-agent-factory', 'ip-library', 10, $j${
  "num": "10",
  "title": "IP Library",
  "subtitle": "Your proprietary AI tools — the core of the BrightPrompt edge.",
  "blocks": [
    {
      "type": "lead-cards",
      "items": [
        {"title":"ChatGPT Custom GPTs", "badge":"4 tools",  "items":["Brief Builder GPT","Proposal Generator GPT","Client Comms GPT","Scope Writer GPT"]},
        {"title":"Claude Projects",     "badge":"4 projects","items":["BA Analysis Project","Requirements Writing Project","Process Mapping Project","Executive Summary Project"]},
        {"title":"Claude Code Repos",   "badge":"4 scripts", "items":["Copilot Studio topic builder","LinkedIn post formatter","Report summariser","Assessment scorer"]}
      ]
    },
    {
      "type": "checklist",
      "label": "IP setup checklist",
      "items": [
        {"id":"ip-0","label":"ChatGPT Custom GPTs — at least 3 set up, tested, and saved to BrightPrompt workspace"},
        {"id":"ip-1","label":"Claude Projects — 1 per core use case (BA Analysis, Requirements Writing, Process Mapping)"},
        {"id":"ip-2","label":"Claude Code workflows documented — CLAUDE.md in each repo, SOPs written"}
      ]
    }
  ]
}$j$::jsonb),

-- ── 11 FOLDER STRUCTURE ───────────────────────────────────────────────────────
('bp-agent-factory', 'folder-structure', 11, $j${
  "num": "11",
  "title": "Folder Structure",
  "subtitle": "OneDrive — BrightPrompt master layout.",
  "blocks": [
    {
      "type": "copybox",
      "label": "OneDrive folder tree",
      "content": "BrightPrompt/\n├── 01 - Strategy/\n│   ├── North Star.docx\n│   ├── Positioning Guide.docx\n│   └── Competitive Landscape.xlsx\n├── 02 - Sales/\n│   ├── Templates/\n│   │   ├── Proposal Template.docx\n│   │   ├── Scope Document Template.docx\n│   │   └── Brief Template.docx\n│   ├── Active Pipeline/\n│   └── Won/\n├── 03 - Clients/\n│   └── [Client Name]/\n│       ├── Brief.docx\n│       ├── Proposal.docx\n│       ├── Delivery/\n│       └── Handover/\n├── 04 - IP Library/\n│   ├── Prompt Library/\n│   ├── ChatGPT GPTs/\n│   ├── Claude Projects/\n│   └── Claude Code/\n├── 05 - Marketing/\n│   ├── LinkedIn Posts/\n│   ├── Lead Magnets/\n│   └── Case Studies/\n└── 06 - Operations/\n    ├── SOPs/\n    ├── Reporting Templates/\n    └── Financial Tracking/"
    }
  ]
}$j$::jsonb),

-- ── 12 AI TOOL WORKFLOW ───────────────────────────────────────────────────────
('bp-agent-factory', 'tool-workflow', 12, $j${
  "num": "12",
  "title": "AI Tool Workflow",
  "subtitle": "Which tool to reach for — and when.",
  "blocks": [
    {
      "type": "table",
      "headers": ["Task","Best Tool","Why"],
      "rows": [
        ["First draft of any document",        "ChatGPT (GPT-4o)",              "Fast, broad, good at structured output"],
        ["Deep analysis, long documents",       "Claude (Sonnet)",               "Better reasoning, larger context window"],
        ["Code, automation, CLI tasks",         "Claude Code",                   "Agentic, file-aware, runs terminal commands"],
        ["Microsoft 365 bots",                 "Copilot Studio",                "Native M365 integration, no-code deployment"],
        ["Client-facing chat agents",          "Copilot Studio + Claude",       "Copilot for UX, Claude API for intelligence"],
        ["Process analysis & mapping",         "Claude Project",                "System prompt primed with client context"],
        ["LinkedIn content drafts",            "ChatGPT (Brief Builder GPT)",   "Tuned to BrightPrompt voice and format"],
        ["Requirements documents",             "Claude (Requirements Project)", "Structured output, consistent notation"]
      ]
    },
    {
      "type": "note",
      "variant": "warning",
      "content": "Never send real client data to any AI tool without confirming their data handling policy. Use anonymised examples in prompts during setup and testing."
    }
  ]
}$j$::jsonb),

-- ── 13 CHATGPT SETUP ──────────────────────────────────────────────────────────
('bp-agent-factory', 'chatgpt-setup', 13, $j${
  "num": "13",
  "title": "ChatGPT Setup",
  "subtitle": "Three Custom GPTs to build first.",
  "blocks": [
    {
      "type": "expandable",
      "summary": "Brief Builder GPT — system prompt",
      "blocks": [
        {
          "type": "copybox",
          "label": "ChatGPT Custom GPT — Brief Builder",
          "content": "You are the BrightPrompt Brief Builder. Your job is to help Craig capture a structured client brief after a discovery call.\n\nAsk the following questions one at a time, then produce a formatted brief document:\n\n1. What is the client's company name and sector?\n2. What is the primary pain point they described?\n3. What tools do they currently use (ERP, CRM, comms)?\n4. What does good look like in 6 months?\n5. Who are the key stakeholders and decision makers?\n6. What is their rough budget range?\n7. What is their timeline to see results?\n\nOutput format: Use headings for each section. Write in clear business English. Include a recommended next step at the end."
        }
      ]
    },
    {
      "type": "expandable",
      "summary": "Proposal Generator GPT — system prompt",
      "blocks": [
        {
          "type": "copybox",
          "label": "ChatGPT Custom GPT — Proposal Generator",
          "content": "You are the BrightPrompt Proposal Generator. When given a client brief, produce a professional proposal document.\n\nStructure the proposal as follows:\n1. Executive Summary (2–3 sentences — what we'll do and why it matters)\n2. The Problem (restate their pain in their language)\n3. Our Solution (what we'll build, how it works, what changes)\n4. Scope & Deliverables (bullet list — be specific)\n5. Pricing (choose from 3 tiers based on scope — Rapid Assessment �R500, AI Readiness Package �R3,500, Agent of Record �R9,500/month)\n6. ROI Estimate (time saved × hourly rate × team size)\n7. Timeline (phases with weeks)\n8. Next Step (single clear CTA)\n\nWrite in professional but accessible UK English. Avoid jargon. Use numbers wherever possible."
        }
      ]
    },
    {
      "type": "checklist",
      "items": [
        {"id":"gpt-0","label":"Create \"Brief Builder\" Custom GPT — system prompt added, tested with mock discovery call output"},
        {"id":"gpt-1","label":"Create \"Proposal Generator\" Custom GPT — tested end-to-end from brief → proposal"},
        {"id":"gpt-2","label":"Create \"Client Comms\" Custom GPT — email drafts, follow-up messages, post-call summaries"}
      ]
    }
  ]
}$j$::jsonb),

-- ── 14 CLAUDE SETUP ───────────────────────────────────────────────────────────
('bp-agent-factory', 'claude-setup', 14, $j${
  "num": "14",
  "title": "Claude Setup",
  "subtitle": "Claude Projects for deep analytical work.",
  "blocks": [
    {
      "type": "expandable",
      "summary": "BA Analysis Project — system prompt",
      "blocks": [
        {
          "type": "copybox",
          "label": "Claude Project — BA Analysis system prompt",
          "content": "You are a senior business analyst working for BrightPrompt, an AI adoption consultancy. Your job is to help analyse business processes, identify AI opportunities, and produce structured analysis documents.\n\nWhen given process descriptions, meeting notes, or workflow documentation:\n- Identify bottlenecks and manual effort points\n- Flag where AI agents could replace or augment tasks\n- Estimate time savings with confidence levels (high/medium/low)\n- Suggest which AI tool is best suited (ChatGPT, Claude, Copilot Studio, Claude Code)\n- Note any compliance or data risks\n- Produce findings in a structured format suitable for presenting to a non-technical client\n\nAlways ask clarifying questions before producing analysis. Be specific with numbers. Flag assumptions clearly."
        }
      ]
    },
    {
      "type": "expandable",
      "summary": "Requirements Writing Project — system prompt",
      "blocks": [
        {
          "type": "copybox",
          "label": "Claude Project — Requirements Writing system prompt",
          "content": "You are a business requirements writer for BrightPrompt. You help convert discovery call notes and process analysis into formal requirements documents for AI agent builds.\n\nFor each requirement:\n- Write in the format: \"The system shall [action] so that [outcome]\"\n- Add an acceptance criterion for each requirement\n- Classify as: Functional / Non-functional / Integration / Data\n- Rate priority: Must Have / Should Have / Could Have / Won't Have (MoSCoW)\n\nAlso produce:\n- A stakeholder register\n- An assumption log\n- An out-of-scope list\n\nOutput as a structured Word-ready document. Use UK English. Keep language accessible to a non-technical client sponsor."
        }
      ]
    },
    {
      "type": "checklist",
      "items": [
        {"id":"cl-0","label":"\"BA Analysis\" Project created in Claude — system prompt live, test run completed"},
        {"id":"cl-1","label":"\"Requirements Writing\" Project created — tested with a sample discovery call transcript"},
        {"id":"cl-2","label":"\"Process Mapping\" Project created — outputs process maps in text notation (flowchart-ready)"}
      ]
    }
  ]
}$j$::jsonb),

-- ── 15 CLAUDE CODE SETUP ──────────────────────────────────────────────────────
('bp-agent-factory', 'claude-code-setup', 15, $j${
  "num": "15",
  "title": "Claude Code Setup",
  "subtitle": "Agentic workflows for automation and delivery.",
  "blocks": [
    {
      "type": "note",
      "variant": "info",
      "content": "Claude Code operates best with a strong CLAUDE.md in the project root. This primes Claude with your conventions, constraints, and what it is/isn't allowed to do."
    },
    {
      "type": "expandable",
      "summary": "CLAUDE.md template for BrightPrompt projects",
      "blocks": [
        {
          "type": "copybox",
          "label": "CLAUDE.md — BrightPrompt project template",
          "content": "# BrightPrompt Project\n\n## Context\nThis is a BrightPrompt client delivery project. All code and automation is for [CLIENT NAME] in the [SECTOR] sector.\n\n## What you can do\n- Read and write files in this project directory\n- Run PowerShell and Node.js commands\n- Query APIs using keys stored in .env (never log or expose key values)\n- Create and modify Copilot Studio topic YAML files\n- Generate documentation in /docs\n\n## What you must NOT do\n- Push to git without explicit instruction\n- Delete files without confirmation\n- Make API calls to production endpoints during development\n- Send emails or messages to real addresses during testing\n\n## Code conventions\n- TypeScript preferred for all scripts\n- Use named exports, not default exports\n- Comment only when the WHY is non-obvious\n- All currency in GBP unless specified\n\n## Project structure\n/src      → source code and scripts\n/docs     → client documentation\n/prompts  → prompt templates\n/tests    → test scripts\n.env      → secrets (never commit)"
        }
      ]
    },
    {
      "type": "expandable",
      "summary": "Key Claude Code use cases for BrightPrompt",
      "blocks": [
        {
          "type": "cards",
          "cols": 2,
          "items": [
            {"title":"Copilot Studio topic builder","content":"Generate YAML topic files from a brief description. Saves 2–3 hours per bot build."},
            {"title":"Assessment scorer",           "content":"Takes 10 scorecard answers, outputs AI Readiness Score + recommended tier."},
            {"title":"Report formatter",            "content":"Converts bullet notes from a delivery session into a formatted PDF-ready report."},
            {"title":"LinkedIn post formatter",     "content":"Takes a raw idea or case study, formats it as a LinkedIn post in BrightPrompt voice."}
          ]
        }
      ]
    }
  ]
}$j$::jsonb),

-- ── 16 COPILOT STUDIO BUILD ───────────────────────────────────────────────────
('bp-agent-factory', 'copilot-studio', 16, $j${
  "num": "16",
  "title": "Copilot Studio Build",
  "subtitle": "Building the BA Agent — the flagship demo product.",
  "blocks": [
    {
      "type": "note",
      "variant": "warning",
      "content": "The BA Agent for Premium Investments Limited (PIL) is the first live reference case. Build this first. Document everything. It becomes the template for all subsequent builds."
    },
    {
      "type": "table",
      "headers": ["Phase","Task","Tool","Output"],
      "rows": [
        ["1 — Environment","Create Power Platform environment",     "Power Platform Admin",   "Isolated sandbox confirmed"],
        ["1 — Environment","Enable AI Builder credits",             "PPAC settings",          "AI Builder live"],
        ["2 — Bot scaffold","Create Copilot Studio agent",          "Copilot Studio",         "Empty bot created"],
        ["2 — Bot scaffold","Set greeting topic with trigger phrases","Topic editor",          "Greeting live"],
        ["3 — Core topics","Build BA Kick-off topic",              "YAML / code editor",     "Topic deployed"],
        ["3 — Core topics","Build Requirements topic",             "YAML / code editor",     "Topic deployed"],
        ["3 — Core topics","Build Stakeholder Mapping topic",      "YAML / code editor",     "Topic deployed"],
        ["3 — Core topics","Build Risk Analysis topic",            "YAML / code editor",     "Topic deployed"],
        ["4 — AI overlay","Add generative answers fallback",       "Bot settings",           "AI answers enabled"],
        ["4 — AI overlay","Connect SharePoint knowledge source",   "Knowledge config",       "SharePoint indexed"],
        ["5 — Integration","Add Teams channel",                    "Channels settings",      "Teams bot live"],
        ["5 — Integration","Test all topics end-to-end",           "Copilot Studio test pane","All topics green"],
        ["6 — Handover","Record walkthrough video",               "Screen capture",         "Video delivered"],
        ["6 — Handover","Write user guide",                       "Word doc",               "Documentation delivered"]
      ]
    },
    {
      "type": "expandable",
      "summary": "Trigger phrase strategy — avoid GenAI interception",
      "blocks": [
        {
          "type": "note",
          "variant": "info",
          "content": "Use unique, non-generic trigger phrases so topics are matched exactly rather than being intercepted by the generative AI fallback. Examples from PIL: pilkickoff, pilrisk, pilreview."
        },
        {
          "type": "copybox",
          "label": "Trigger phrase naming convention",
          "content": "Pattern: [client-code][topic-name]\n\nExamples:\n- pilkickoff       → PIL: Start a BA kick-off session\n- pilrisk          → PIL: Risk identification\n- pilreview        → PIL: Sprint / delivery review\n- pilrequirements  → PIL: Requirements gathering\n- pilstakeholders  → PIL: Stakeholder mapping\n\nRule: Always prefix with the client code. Never use generic phrases like \"start\", \"help\", \"analyse\" as primary triggers — these will be caught by GenAI before your topic is matched."
        }
      ]
    }
  ]
}$j$::jsonb),

-- ── 17 ENTERPRISE LICENSING ───────────────────────────────────────────────────
('bp-agent-factory', 'enterprise', 17, $j${
  "num": "17",
  "title": "Enterprise Licensing",
  "subtitle": "What Microsoft licences unlock what AI capabilities.",
  "blocks": [
    {
      "type": "table",
      "headers": ["Licence","Monthly (est.)","Key AI Features","Best for"],
      "rows": [
        ["M365 Business Basic",    "�R5/user",  "Teams, SharePoint, web apps",                                         "Minimum viable comms"],
        ["M365 Business Standard", "�R10/user", "+ Copilot for M365 add-on eligible, full Office",                     "Most SME clients"],
        ["M365 Business Premium",  "�R18/user", "+ Intune, Defender, Entra ID P1",                                     "Compliance-sensitive clients"],
        ["M365 E3",                "�R28/user", "Enterprise identity, audit logs, full DLP",                           "Financial services regulated"],
        ["M365 E5",                "�R52/user", "+ Purview, Sentinel, Defender for Endpoint",                          "FCA/PRA regulated firms"],
        ["Copilot for M365 add-on","�R25/user", "Copilot in Word, Excel, Teams, Outlook",                             "Knowledge workers (add to any E3/E5)"],
        ["Power Platform (per app)","�R16/user","1 app/flow per user",                                                 "Targeted automation projects"],
        ["Power Platform (per user)","�R36/user","Unlimited apps + flows",                                             "Heavy automation clients"]
      ]
    },
    {
      "type": "note",
      "variant": "info",
      "content": "Copilot Studio is included in the Power Platform per-user plan. For clients who only need bot functionality, this is often the most cost-effective route — no Copilot for M365 licence needed."
    }
  ]
}$j$::jsonb),

-- ── 18 SALES PROCESS ──────────────────────────────────────────────────────────
('bp-agent-factory', 'sales', 18, $j${
  "num": "18",
  "title": "Sales Process",
  "subtitle": "Five stages, measurable gates.",
  "blocks": [
    {
      "type": "sequence",
      "items": [
        {"title":"Awareness",  "date":"100 connections/week", "dep":"LinkedIn post + connection request",                            "output":"Connection accepted"},
        {"title":"Interest",   "date":"20% reply rate",       "dep":"Personalised follow-up + lead magnet offer",                   "output":"Reply or scorecard downloaded"},
        {"title":"Discovery",  "date":"5 calls/week",         "dep":"30-min discovery call — pain points mapped",                   "output":"Pain point clearly articulated"},
        {"title":"Proposal",   "date":"60% close rate",       "dep":"Rapid Assessment sold or full proposal sent within 48 hours",  "output":"Proposal sent"},
        {"title":"Close",      "date":"2 clients/month",      "dep":"Contract signed, onboarding call booked",                     "output":"Invoice raised, kick-off scheduled"}
      ]
    }
  ]
}$j$::jsonb),

-- ── 19 DELIVERY PLAYBOOK ──────────────────────────────────────────────────────
('bp-agent-factory', 'delivery', 19, $j${
  "num": "19",
  "title": "Delivery Playbook",
  "subtitle": "Standard phases for every engagement.",
  "blocks": [
    {
      "type": "table",
      "headers": ["Phase","Activities","Deliverable","Duration"],
      "rows": [
        ["Kick-off",  "Intro call, access provisioning, stakeholder register, success metrics agreed","Project charter",        "Day 1–3"],
        ["Discovery", "Process interviews, data review, tool audit, pain mapping",                    "Current state report",   "Week 1"],
        ["Design",    "Agent architecture, user journey, topic list, integration map",                "Solution design doc",    "Week 2"],
        ["Build",     "Topics built, tested in sandbox, iterated with client feedback",               "Tested agent (sandbox)", "Weeks 3–4"],
        ["UAT",       "Client tests real scenarios, bugs logged, fixes applied",                      "Sign-off document",      "Week 5"],
        ["Deploy",    "Agent live in production environment, Teams/SharePoint connected",             "Live agent",             "Week 6"],
        ["Train",     "Recorded walkthrough, live training session, written SOP",                     "Training pack",          "Week 7"],
        ["Handover",  "Docs handed over, support window confirmed, retainer discussed",               "Handover pack",          "Week 8"]
      ]
    }
  ]
}$j$::jsonb),

-- ── 20 PROMPT LIBRARY ─────────────────────────────────────────────────────────
('bp-agent-factory', 'prompts', 20, $j${
  "num": "20",
  "title": "Prompt Library",
  "subtitle": "Core prompts — copy and adapt for each engagement.",
  "blocks": [
    {
      "type": "copybox",
      "label": "Process analysis prompt",
      "content": "I'm going to describe a business process. Please:\n1. Identify the main steps and decision points\n2. Flag any manual, repetitive, or error-prone tasks\n3. Suggest where an AI agent could intervene\n4. Estimate potential time savings (hours/week) with a confidence level\n5. Note any data or compliance risks\n\nProcess description:\n[PASTE NOTES HERE]"
    },
    {
      "type": "copybox",
      "label": "Executive summary prompt",
      "content": "Write a 3-paragraph executive summary for a client proposal.\n\nClient: [NAME], [SECTOR]\nPain point: [WHAT THEY TOLD US]\nOur solution: [WHAT WE'RE BUILDING]\nKey outcome: [QUANTIFIED RESULT]\n\nRequirements:\n- Written for a non-technical C-suite reader\n- Paragraph 1: Situation and problem\n- Paragraph 2: Our approach and why it works\n- Paragraph 3: Expected outcomes and next step\n- UK English, professional but clear, no jargon"
    },
    {
      "type": "copybox",
      "label": "Risk analysis prompt",
      "content": "Analyse the following AI agent project for risks. For each risk:\n- Name the risk\n- Classify it: Technical / Adoption / Data / Compliance / Scope / Timeline\n- Rate likelihood: High / Medium / Low\n- Rate impact: High / Medium / Low\n- Suggest a mitigation\n\nProject description:\n[PASTE PROJECT BRIEF]\n\nFocus on practical risks relevant to a UK financial services or professional services firm deploying a Microsoft Copilot Studio bot."
    },
    {
      "type": "copybox",
      "label": "LinkedIn post prompt",
      "content": "Write a LinkedIn post in Craig Wagner's voice for BrightPrompt.\n\nTopic: [WHAT THE POST IS ABOUT]\nKey message: [THE MAIN POINT]\nProof/example: [A SPECIFIC EXAMPLE OR RESULT]\n\nStyle rules:\n- Maximum 200 words\n- No hashtags in the body (1–2 at the end only)\n- First line must stop the scroll — make it specific and concrete\n- Professional but conversational — like a smart colleague, not a corporate press release\n- End with a question or a clear takeaway\n- UK English"
    },
    {
      "type": "copybox",
      "label": "Discovery call debrief prompt",
      "content": "I've just finished a discovery call. Here are my rough notes. Please:\n\n1. Summarise the key pain points in order of urgency\n2. Identify the 3 most promising AI opportunities\n3. Recommend which BrightPrompt offer tier fits best (Rapid Assessment �R500 / AI Readiness Package �R3,500 / Agent of Record �R9,500/month)\n4. Draft 3 bullet points for a follow-up email\n5. Flag any red flags or risks I should address\n\nCall notes:\n[PASTE NOTES]"
    }
  ]
}$j$::jsonb),

-- ── 21 METRICS & KPIS ─────────────────────────────────────────────────────────
('bp-agent-factory', 'metrics', 21, $j${
  "num": "21",
  "title": "Metrics & KPIs",
  "subtitle": "Track these weekly. Review monthly. Adjust quarterly.",
  "blocks": [
    {
      "type": "kpi",
      "items": [
        {"value":"100+",   "label":"New LinkedIn connections/week","gold":true},
        {"value":"5%",     "label":"Connection → DM reply rate"},
        {"value":"5",      "label":"Discovery calls/week target","gold":true},
        {"value":"60%",    "label":"Discovery → proposal conversion"},
        {"value":"2",      "label":"New clients signed/month","gold":true},
        {"value":"�R175K",  "label":"Annual revenue target"}
      ]
    },
    {
      "type": "table",
      "headers": ["Metric","Weekly target","Monthly target","How to measure"],
      "rows": [
        ["LinkedIn connections sent",  "100",     "400",     "LinkedIn analytics"],
        ["Replies / DM conversations", "20",      "80",      "LinkedIn messaging"],
        ["Discovery calls booked",     "5",       "20",      "Calendar"],
        ["Proposals sent",             "3",       "12",      "CRM / OneDrive"],
        ["Clients signed",             "0.5",     "2",       "CRM"],
        ["Revenue invoiced (�R)",       "�R3,365",  "�R14,583", "Xero / FreeAgent"],
        ["Active agents live",         "—",       "+1/month","Client delivery tracker"],
        ["NPS / client satisfaction",  "—",       "Quarterly","Post-delivery survey"]
      ]
    }
  ]
}$j$::jsonb),

-- ── 22 30-DAY TRACKER ─────────────────────────────────────────────────────────
('bp-agent-factory', 'tracker30', 22, $j${
  "num": "22",
  "title": "30-Day Tracker",
  "subtitle": "The setup sprint — complete these in order.",
  "blocks": [
    {
      "type": "week",
      "label": "Week 1",
      "subtitle": "Days 1–7 · Foundation",
      "items": [
        {"id":"w1-0","label":"Write and lock North Star statement (who, what, how, for whom)"},
        {"id":"w1-1","label":"Update LinkedIn headline, about section, and banner"},
        {"id":"w1-2","label":"Set up OneDrive BrightPrompt folder structure"},
        {"id":"w1-3","label":"Create the 3 ChatGPT Custom GPTs (Brief Builder, Proposal Generator, Client Comms)"},
        {"id":"w1-4","label":"Create the 3 Claude Projects (BA Analysis, Requirements Writing, Process Mapping)"},
        {"id":"w1-5","label":"Build offer one-pagers for all 3 tiers"},
        {"id":"w1-6","label":"Send first 100 LinkedIn connection requests (personalised)"}
      ]
    },
    {
      "type": "week",
      "label": "Week 2",
      "subtitle": "Days 8–14 · Pipeline",
      "items": [
        {"id":"w2-0","label":"Publish first proof post on LinkedIn (case study or quick win)"},
        {"id":"w2-1","label":"Build and publish AI Readiness Scorecard lead magnet"},
        {"id":"w2-2","label":"Set up email follow-up sequence (5 emails, 14-day drip)"},
        {"id":"w2-3","label":"Book first 3 discovery calls from LinkedIn outreach"},
        {"id":"w2-4","label":"Write proposal template using Proposal Generator GPT"},
        {"id":"w2-5","label":"Start PIL Copilot Studio bot — environment + greeting topic"},
        {"id":"w2-6","label":"Continue LinkedIn connections (100/week maintained)"}
      ]
    },
    {
      "type": "week",
      "label": "Week 3",
      "subtitle": "Days 15–21 · Delivery",
      "items": [
        {"id":"w3-0","label":"Run first 3 discovery calls — use BA Analysis Claude Project for debrief"},
        {"id":"w3-1","label":"Send first proposal using Proposal Generator GPT"},
        {"id":"w3-2","label":"Complete PIL bot — all 4 core topics built and tested"},
        {"id":"w3-3","label":"Publish 2nd LinkedIn post (thought leadership)"},
        {"id":"w3-4","label":"Create delivery report template in OneDrive"},
        {"id":"w3-5","label":"Write first case study (anonymised) from PIL or any previous work"}
      ]
    },
    {
      "type": "week",
      "label": "Week 4",
      "subtitle": "Days 22–30 · Close",
      "items": [
        {"id":"w4-0","label":"Follow up on all outstanding proposals — personalised nudge email"},
        {"id":"w4-1","label":"Close first paid engagement (Rapid Assessment or AI Readiness Package)"},
        {"id":"w4-2","label":"PIL bot — UAT with client, fixes applied, Teams channel connected"},
        {"id":"w4-3","label":"Record PIL walkthrough video for handover pack"},
        {"id":"w4-4","label":"Publish 3rd LinkedIn post (social proof / first result)"},
        {"id":"w4-5","label":"Review 30-day metrics vs targets — adjust approach for Month 2"},
        {"id":"w4-6","label":"Plan Month 2 — schedule artefact factory build and second bot project"}
      ]
    }
  ]
}$j$::jsonb),

-- ── 23 90-DAY ROADMAP ─────────────────────────────────────────────────────────
('bp-agent-factory', 'roadmap90', 23, $j${
  "num": "23",
  "title": "90-Day Roadmap",
  "subtitle": "Milestones beyond the 30-day setup sprint.",
  "blocks": [
    {
      "type": "month-cards",
      "items": [
        {"period":"Month 1","focus":"Foundation","target":"1 client signed, �R500–�R3,500 revenue, PIL bot live"},
        {"period":"Month 2","focus":"Build",     "target":"2–3 clients active, artefact library built, 2nd bot deployed"},
        {"period":"Month 3","focus":"Scale",     "target":"�R10K+ MRR, first retainer, LinkedIn system running autonomously"}
      ]
    },
    {
      "type": "checklist",
      "label": "90-day milestone checklist",
      "items": [
        {"id":"r90-0","label":"Month 1: First paying client signed and kick-off completed"},
        {"id":"r90-1","label":"Month 1: PIL BA Agent live in Teams and signed off by client"},
        {"id":"r90-2","label":"Month 2: Artefact library complete — all 6 templates built and stored in OneDrive"},
        {"id":"r90-3","label":"Month 2: 3 active client engagements running concurrently"},
        {"id":"r90-4","label":"Month 3: First Agent of Record retainer (�R9,500/month) signed"},
        {"id":"r90-5","label":"Month 3: �R10K+ MRR achieved — pipeline strong enough to sustain without new outreach for 30 days"}
      ]
    },
    {
      "type": "note",
      "variant": "success",
      "content": "At 90 days with 3 active clients and one retainer, BrightPrompt is self-funding. Focus shifts from acquiring clients to deepening relationships and building the IP library that makes each engagement faster than the last."
    }
  ]
}$j$::jsonb)

on conflict (project_slug, section_id) do update set data = excluded.data, section_order = excluded.section_order;
