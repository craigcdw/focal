"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Copy, Check, ChevronDown, ChevronUp, ArrowRight,
  AlertCircle, CheckCircle2, Info, AlertTriangle,
  RotateCcw, Printer, Menu, X,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type Checks = Record<string, boolean>;

// ── All check IDs (order matters for progress) ────────────────────────────────

const ALL_CHECKS = [
  "ns-0","ns-1","ns-2",
  "li-0","li-1","li-2",
  "of-0","of-1","of-2",
  "ip-0","ip-1","ip-2",
  "gpt-0","gpt-1","gpt-2",
  "cl-0","cl-1","cl-2",
  "w1-0","w1-1","w1-2","w1-3","w1-4","w1-5","w1-6",
  "w2-0","w2-1","w2-2","w2-3","w2-4","w2-5","w2-6",
  "w3-0","w3-1","w3-2","w3-3","w3-4","w3-5",
  "w4-0","w4-1","w4-2","w4-3","w4-4","w4-5","w4-6",
  "r90-0","r90-1","r90-2","r90-3","r90-4","r90-5",
];

const NAV_SECTIONS = [
  { id: "summary", label: "Executive Summary" },
  { id: "roadmap", label: "Big Picture Roadmap" },
  { id: "north-star", label: "North Star & Positioning" },
  { id: "operating-model", label: "Operating Model" },
  { id: "sequence", label: "Full Sequence" },
  { id: "linkedin", label: "LinkedIn Refinement" },
  { id: "lead-engine", label: "Lead Engine" },
  { id: "offers", label: "Productised Offers" },
  { id: "artefacts", label: "Artefact Factory" },
  { id: "ip-library", label: "IP Library" },
  { id: "folder-structure", label: "Folder Structure" },
  { id: "tool-workflow", label: "AI Tool Workflow" },
  { id: "chatgpt-setup", label: "ChatGPT Setup" },
  { id: "claude-setup", label: "Claude Setup" },
  { id: "claude-code-setup", label: "Claude Code Setup" },
  { id: "copilot-studio", label: "Copilot Studio Build" },
  { id: "enterprise", label: "Enterprise Licensing" },
  { id: "sales", label: "Sales Process" },
  { id: "delivery", label: "Delivery Playbook" },
  { id: "prompts", label: "Prompt Library" },
  { id: "metrics", label: "Metrics & KPIs" },
  { id: "tracker30", label: "30-Day Tracker" },
  { id: "roadmap90", label: "90-Day Roadmap" },
];

// ── Micro-components ──────────────────────────────────────────────────────────

function Note({ variant = "info", children }: { variant?: "info"|"success"|"warning"|"danger"; children: React.ReactNode }) {
  const cfg = {
    info:    { cls: "border-[#1E4D8C] bg-blue-50/70 dark:bg-blue-950/30 text-[#0D1B2A] dark:text-blue-100", Icon: Info },
    success: { cls: "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-200", Icon: CheckCircle2 },
    warning: { cls: "border-[#D4A017] bg-[#FBF3DC] dark:bg-amber-950/30 text-[#6B4F00] dark:text-amber-200", Icon: AlertTriangle },
    danger:  { cls: "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200", Icon: AlertCircle },
  }[variant];
  return (
    <div className={`border-l-4 rounded-xl px-4 py-3 flex gap-3 items-start text-sm leading-relaxed ${cfg.cls}`}>
      <cfg.Icon size={14} className="flex-shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

function CopyBox({ label, content }: { label: string; content: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden border border-[#0D1B2A]/20 dark:border-zinc-700">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0D1B2A]">
        <span className="text-[11px] font-mono text-zinc-400">{label}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="flex items-center gap-1.5 text-[11px] bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg transition-colors"
        >
          {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
        </button>
      </div>
      <pre className="p-4 text-xs text-[#0D1B2A] dark:text-zinc-200 bg-[#F5F4EE] dark:bg-zinc-800/60 overflow-auto leading-relaxed whitespace-pre-wrap font-mono">{content}</pre>
    </div>
  );
}

function CB({ id, label, dep, checks, onCheck }: {
  id: string; label: string; dep?: string;
  checks: Checks; onCheck: (id: string, v: boolean) => void;
}) {
  return (
    <label className="flex gap-3 items-start p-3 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer hover:bg-[#F5F4EE] dark:hover:bg-zinc-800/60 transition-colors">
      <input
        type="checkbox"
        checked={!!checks[id]}
        onChange={e => onCheck(id, e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded accent-[#1E4D8C] flex-shrink-0"
      />
      <div>
        <span className="text-sm text-[#0D1B2A] dark:text-zinc-200">{label}</span>
        {dep && <span className="block text-xs text-[#5C6370] dark:text-zinc-500 mt-0.5">{dep}</span>}
      </div>
    </label>
  );
}

function KPI({ value, label, gold }: { value: string; label: string; gold?: boolean }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 text-center">
      <div className={`text-3xl font-bold mb-1 ${gold ? "text-[#D4A017]" : "text-[#0D1B2A] dark:text-white"}`}>{value}</div>
      <div className="text-xs text-[#5C6370] dark:text-zinc-400 font-medium">{label}</div>
    </div>
  );
}

function Expandable({ summary, children }: { summary: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[#F5F4EE] dark:bg-zinc-800/60 text-left hover:bg-[#EDE9DF] dark:hover:bg-zinc-800 transition-colors"
      >
        <span className="text-sm font-semibold text-[#0D1B2A] dark:text-white">{summary}</span>
        {open ? <ChevronUp size={15} className="text-[#5C6370] flex-shrink-0" /> : <ChevronDown size={15} className="text-[#5C6370] flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-zinc-800">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#0D1B2A] text-white">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-[#F5F4EE]/60 dark:bg-zinc-800/40"}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-[#0D1B2A] dark:text-zinc-200 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Sec({ id, num, title, subtitle, children }: {
  id: string; num: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="bg-white dark:bg-zinc-900/60 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 md:p-8 scroll-mt-28 space-y-5">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs font-mono font-semibold text-[#D4A017]">{num}</span>
          <h2 className="text-xl font-bold text-[#0D1B2A] dark:text-white">{title}</h2>
        </div>
        {subtitle && <p className="text-sm text-[#5C6370] dark:text-zinc-400 ml-10">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Badge({ label, variant = "default" }: { label: string; variant?: "default"|"gold"|"blue"|"green"|"red" }) {
  const cls = {
    default: "bg-gray-100 dark:bg-zinc-800 text-[#5C6370] dark:text-zinc-300",
    gold:    "bg-[#FBF3DC] text-[#8A6600] dark:bg-amber-900/30 dark:text-amber-300",
    blue:    "bg-blue-50 text-[#1E4D8C] dark:bg-blue-900/30 dark:text-blue-300",
    green:   "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    red:     "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  }[variant];
  return <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${cls}`}>{label}</span>;
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProjectsView() {
  const [checks, setChecks] = useState<Checks>({});
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const supabase = createClient();

  const loadProgress = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("project_progress")
      .select("checks")
      .eq("user_id", user.id)
      .eq("project_slug", "bp-agent-factory")
      .single();
    if (data?.checks) setChecks(data.checks as Checks);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const saveProgress = useCallback(async (newChecks: Checks) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("project_progress").upsert(
      { user_id: user.id, project_slug: "bp-agent-factory", checks: newChecks, updated_at: new Date().toISOString() },
      { onConflict: "user_id,project_slug" }
    );
  }, [supabase]);

  function onCheck(id: string, val: boolean) {
    const updated = { ...checks, [id]: val };
    setChecks(updated);
    saveProgress(updated);
  }

  async function resetAll() {
    if (!confirm("Reset all progress? This cannot be undone.")) return;
    setChecks({});
    saveProgress({});
  }

  const done = ALL_CHECKS.filter(id => checks[id]).length;
  const total = ALL_CHECKS.length;
  const pct = Math.round((done / total) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-[#5C6370] dark:text-zinc-400">
        <div className="w-5 h-5 border-2 border-[#1E4D8C] border-t-transparent rounded-full animate-spin mr-3" />
        Loading project…
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Sticky progress bar ── */}
      <div className="sticky top-0 md:top-0 z-20 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#0D1B2A] dark:text-white">BrightPrompt Agent Factory</span>
            <span className="text-xs font-mono text-[#D4A017] font-semibold">{done}/{total} · {pct}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#D4A017] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button
          onClick={() => setNavOpen(o => !o)}
          className="flex items-center gap-1.5 text-xs text-[#5C6370] dark:text-zinc-400 hover:text-[#0D1B2A] dark:hover:text-white bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 px-3 py-1.5 rounded-xl transition-colors"
        >
          {navOpen ? <X size={13} /> : <Menu size={13} />}
          <span className="hidden sm:block">Sections</span>
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-xs text-[#5C6370] dark:text-zinc-400 hover:text-[#0D1B2A] dark:hover:text-white bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 px-3 py-1.5 rounded-xl transition-colors"
        >
          <Printer size={13} />
          <span className="hidden sm:block">Print</span>
        </button>
        <button
          onClick={resetAll}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 px-3 py-1.5 rounded-xl transition-colors"
        >
          <RotateCcw size={13} />
          <span className="hidden sm:block">Reset</span>
        </button>
      </div>

      {/* ── Section jump nav ── */}
      {navOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4">
          <p className="text-[10px] font-semibold text-[#5C6370] dark:text-zinc-500 uppercase tracking-widest mb-3">Jump to section</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
            {NAV_SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setNavOpen(false)}
                className="text-xs text-[#1E4D8C] dark:text-blue-400 hover:text-[#D4A017] bg-[#F5F4EE] dark:bg-zinc-800 px-3 py-2 rounded-xl truncate transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 01 — EXECUTIVE SUMMARY
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="summary" className="rounded-3xl overflow-hidden border border-[#0D1B2A]/20 scroll-mt-28">
        <div className="bg-[#0D1B2A] px-6 md:px-10 py-10 md:py-14">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge label="30-Day Setup Guide" variant="gold" />
            <Badge label="Consolidated Strategy" variant="blue" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-3">
            BrightPrompt Agent Factory
          </h1>
          <p className="text-[#F5F4EE]/70 text-base md:text-lg leading-relaxed max-w-2xl mb-8">
            Turn AI knowledge into systematic, repeatable revenue for UK professional services firms.
            This guide covers everything from positioning to delivery — executed in 30 days.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { v: "15K", l: "LinkedIn connections" },
              { v: "5", l: "Active bots target" },
              { v: "£175K", l: "Annual revenue target" },
              { v: "60 days", l: "Pipeline to first close" },
            ].map(({ v, l }) => (
              <div key={l} className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-[#D4A017] mb-0.5">{v}</div>
                <div className="text-[11px] text-white/60">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#F5F4EE] dark:bg-zinc-800/60 px-6 md:px-10 py-5 space-y-3">
          <Note variant="info">
            <strong>The BrightPrompt position:</strong> We are not an agency that builds tools. We are the partner that ensures AI actually delivers measurable business outcomes — scoped, delivered, and owned.
          </Note>
          <Note variant="warning">
            <strong>Focus sectors:</strong> Financial Services and Professional Services. These have the budget, the regulatory pressure, and the appetite for structured AI adoption. Do not dilute the pitch.
          </Note>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 02 — BIG PICTURE ROADMAP
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="roadmap" num="02" title="Big Picture Roadmap" subtitle="The 7 phases of factory setup — click a card to jump to the relevant section.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { n: "1", t: "Define Core", w: "Weeks 1–2", desc: "North Star, positioning, target verticals, operating model", id: "north-star" },
            { n: "2", t: "Build Lead Engine", w: "Weeks 2–3", desc: "LinkedIn automation, lead magnet, CRM, follow-up sequences", id: "linkedin" },
            { n: "3", t: "Productise Offers", w: "Weeks 3–4", desc: "3-tier packages, proposal template, onboarding pack", id: "offers" },
            { n: "4", t: "Artefact Factory", w: "Month 2", desc: "Prompt library, SOPs, AI workflows, reusable assets", id: "artefacts" },
            { n: "5", t: "Client Delivery", w: "Month 2", desc: "Delivery playbook, quality checks, reporting template", id: "delivery" },
            { n: "6", t: "Scale & IP", w: "Month 3", desc: "LinkedIn system, case studies, referral program", id: "ip-library" },
            { n: "7", t: "Measure & Iterate", w: "Ongoing", desc: "KPIs, weekly reviews, funnel optimisation", id: "metrics" },
          ].map(({ n, t, w, desc, id }) => (
            <a key={n} href={`#${id}`}
              className="group block bg-[#F5F4EE] dark:bg-zinc-800/60 hover:bg-[#0D1B2A] hover:text-white rounded-2xl p-4 border border-gray-100 dark:border-zinc-700 transition-all duration-200 cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-[#0D1B2A] group-hover:bg-white/20 flex items-center justify-center mb-3 transition-colors">
                <span className="text-sm font-bold text-[#D4A017]">{n}</span>
              </div>
              <div className="text-sm font-semibold text-[#0D1B2A] group-hover:text-white mb-0.5 transition-colors">{t}</div>
              <div className="text-[10px] font-medium text-[#D4A017] mb-2">{w}</div>
              <div className="text-xs text-[#5C6370] group-hover:text-white/70 leading-relaxed transition-colors">{desc}</div>
            </a>
          ))}
        </div>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 03 — NORTH STAR & POSITIONING
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="north-star" num="03" title="North Star & Positioning">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { t: "Who we serve", c: "UK Financial Services & Professional Services firms, 50–500 employees, with budget and regulatory appetite for AI adoption." },
            { t: "What we do", c: "Agent-led, outcome-priced AI adoption — from discovery through to deployed, trained, and owned agents." },
            { t: "How we differ", c: "We are not a dev shop. We scope, build, and hand over. Clients own the IP. We earn the retainer through results." },
          ].map(({ t, c }) => (
            <div key={t} className="bg-[#F5F4EE] dark:bg-zinc-800/60 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700">
              <div className="text-[10px] font-semibold text-[#D4A017] uppercase tracking-widest mb-2">{t}</div>
              <p className="text-sm text-[#0D1B2A] dark:text-zinc-200 leading-relaxed">{c}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold text-[#5C6370] dark:text-zinc-500 uppercase tracking-widest mb-3">Target verticals</p>
          <div className="flex flex-wrap gap-2">
            {["Financial Services","Wealth Management","Legal & Compliance","HR & Recruitment","Accountancy","Commercial Property","Insurance Broking"].map(v => (
              <Badge key={v} label={v} variant="blue" />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#5C6370] dark:text-zinc-500 uppercase tracking-widest">Positioning checklist</p>
          <CB id="ns-0" label='Define your "who and what" statement — target client, transformation delivered, method used' checks={checks} onCheck={onCheck} />
          <CB id="ns-1" label="Lock 3 core verticals (Financial Services + Professional Services + 1 opportunistic)" checks={checks} onCheck={onCheck} />
          <CB id="ns-2" label="Write your LinkedIn headline & summary using the BrightPrompt brand voice" checks={checks} onCheck={onCheck} />
        </div>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 04 — OPERATING MODEL
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="operating-model" num="04" title="Operating Model" subtitle="The 4-layer BrightPrompt factory.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { n: "1", t: "Client Brief", d: "Discovery call captures goals, pain points, data sources, existing tools, and success metrics." },
            { n: "2", t: "AI Engine", d: "ChatGPT for drafts, Claude for analysis, Claude Code for automation, Copilot Studio for bots." },
            { n: "3", t: "BrightPrompt QA", d: "Human review of every AI output — accuracy, tone, compliance, and client fit verified." },
            { n: "4", t: "Output Package", d: "Deployed agent, training session, handover doc, and 30-day support included as standard." },
          ].map(({ n, t, d }) => (
            <div key={n} className="relative bg-[#F5F4EE] dark:bg-zinc-800/60 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700">
              <div className="absolute top-4 right-4 text-4xl font-black text-[#0D1B2A]/5 dark:text-white/5 select-none">{n}</div>
              <div className="w-7 h-7 rounded-lg bg-[#0D1B2A] flex items-center justify-center mb-3">
                <span className="text-xs font-bold text-[#D4A017]">{n}</span>
              </div>
              <div className="text-sm font-semibold text-[#0D1B2A] dark:text-white mb-2">{t}</div>
              <p className="text-xs text-[#5C6370] dark:text-zinc-400 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
        <Note variant="info">
          Each engagement starts with a fixed-fee Rapid Assessment (£500). This funds discovery, de-risks the client, and creates the brief for the full engagement.
        </Note>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 05 — FULL SEQUENCE
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="sequence" num="05" title="Full Sequence" subtitle="From first contact to ongoing retainer.">
        <div className="space-y-3">
          {[
            { t: "Initial Outreach", d: "Day 1", dep: "LinkedIn connection + personalised message referencing a specific pain point in their sector.", out: "Connection accepted & reply" },
            { t: "Discovery Call", d: "Days 3–5", dep: "30-min call. Ask: What's slowing your team? Where are you losing hours? What does good look like?", out: "Pain points mapped" },
            { t: "Rapid Assessment", d: "Days 7–10", dep: "Fixed-fee £500. 2-hour structured session. Deliver: AI Readiness Score + Quick Wins Report.", out: "Assessment report delivered" },
            { t: "Proposal", d: "Days 12–15", dep: "Tailored scope based on assessment. Choose from 3-tier pricing. Include ROI estimate.", out: "Proposal sent & followed up" },
            { t: "Onboarding", d: "Days 17–21", dep: "Contract signed. Kick-off call. Access granted to systems. Project plan shared.", out: "Project live" },
            { t: "Build & Deliver", d: "Weeks 4–6", dep: "Agents built, tested, and reviewed with client. Iterate on feedback.", out: "Agents deployed" },
            { t: "Handover & Training", d: "Weeks 7–8", dep: "Live training session. Documentation handed over. Success metrics reviewed.", out: "Client self-sufficient" },
            { t: "Retainer", d: "Month 3+", dep: "Monthly check-in. New use cases identified. Expansion sold on outcomes.", out: "Recurring revenue" },
          ].map(({ t, d, dep, out }, i) => (
            <div key={t} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#0D1B2A] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#D4A017]">{i+1}</span>
                </div>
                {i < 7 && <div className="w-0.5 flex-1 bg-gray-100 dark:bg-zinc-800 my-1" />}
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#0D1B2A] dark:text-white">{t}</span>
                  <Badge label={d} variant="gold" />
                </div>
                <p className="text-xs text-[#5C6370] dark:text-zinc-400 leading-relaxed mb-1">{dep}</p>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-md">
                  <CheckCircle2 size={9} /> {out}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 06 — LINKEDIN REFINEMENT
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="linkedin" num="06" title="LinkedIn Refinement" subtitle="The primary pipeline engine for BrightPrompt.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-[#5C6370] dark:text-zinc-500 uppercase tracking-widest mb-3">Profile setup</p>
            <div className="space-y-2">
              <CB id="li-0" label="Profile photo + banner + headline live — 'AI Adoption Partner for UK Financial & Professional Services'" checks={checks} onCheck={onCheck} />
              <CB id="li-1" label="Publish 3 proof posts: one case study, one thought leadership, one social proof / testimonial" checks={checks} onCheck={onCheck} />
              <CB id="li-2" label="Activate daily connection requests — 20/day max, personalised message template in place" checks={checks} onCheck={onCheck} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5C6370] dark:text-zinc-500 uppercase tracking-widest mb-3">Content pillars</p>
            <div className="space-y-2">
              {[
                { t: "Real stories", d: "What did AI actually do for a client this week?" },
                { t: "Myth busting", d: "What most people get wrong about AI agents." },
                { t: "Process reveals", d: "A peek inside how BrightPrompt works." },
                { t: "Future framing", d: "What will X sector look like in 12 months?" },
              ].map(({ t, d }) => (
                <div key={t} className="flex gap-3 p-3 bg-[#F5F4EE] dark:bg-zinc-800/60 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4A017] mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-[#0D1B2A] dark:text-white">{t} — </span>
                    <span className="text-xs text-[#5C6370] dark:text-zinc-400">{d}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <CopyBox
          label="LinkedIn connection message template"
          content={`Hi [First name],

I work with [sector] firms helping them deploy AI agents that cut admin time and surface better data for decisions — without the usual tech headache.

Noticed [specific observation from their profile or company].

Would love to connect and share what we've been seeing across the space.

— Craig`}
        />
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 07 — LEAD ENGINE
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="lead-engine" num="07" title="Lead Engine" subtitle="Three tracks running in parallel.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              t: "Email Sequence",
              badge: "5 emails over 14 days",
              items: [
                "Day 1 — Introduction + 1 quick win idea",
                "Day 3 — Case study / proof point",
                "Day 5 — Educational content (AI myth busting)",
                "Day 8 — Direct CTA: book Rapid Assessment",
                "Day 14 — Final nudge + open door",
              ]
            },
            {
              t: "Call Sequence",
              badge: "Warm calls",
              items: [
                "Trigger: LinkedIn connection accepted",
                "Day 2 — Call attempt + voicemail",
                "Day 5 — Follow-up call",
                "Day 9 — Final attempt, move to email-only",
                "Gate: Aim for 50% to agree to discovery call",
              ]
            },
            {
              t: "Lead Magnet",
              badge: "AI Readiness Scorecard",
              items: [
                "10-question form, scores across 5 dimensions",
                "Instant PDF report generated",
                "CTA: book a free 20-min debrief call",
                "Distribute via LinkedIn posts + DM",
                "Target: 10 downloads → 3 debrief calls/week",
              ]
            },
          ].map(({ t, badge, items }) => (
            <div key={t} className="bg-[#F5F4EE] dark:bg-zinc-800/60 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700">
              <div className="text-sm font-semibold text-[#0D1B2A] dark:text-white mb-1">{t}</div>
              <Badge label={badge} variant="gold" />
              <ul className="mt-3 space-y-1.5">
                {items.map(item => (
                  <li key={item} className="flex gap-2 text-xs text-[#5C6370] dark:text-zinc-400">
                    <ArrowRight size={10} className="flex-shrink-0 mt-0.5 text-[#D4A017]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 08 — PRODUCTISED OFFERS
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="offers" num="08" title="Productised Offers" subtitle="Three tiers — priced on outcomes, not hours.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              t: "Rapid Assessment",
              price: "£500",
              period: "Fixed fee · 1 day",
              desc: "Structured 2-hour session. AI Readiness Score (10 dimensions). Quick Wins Report (3 immediate opportunities). Written briefing for next step.",
              badge: "Entry point",
              bv: "gold" as const,
            },
            {
              t: "AI Readiness Package",
              price: "£3,500",
              period: "Fixed fee · 30 days",
              desc: "Full agent scoped and deployed. Process redesign documentation. Staff training session. 30-day support included.",
              badge: "Most popular",
              bv: "blue" as const,
            },
            {
              t: "Agent of Record",
              price: "£9,500",
              period: "Per month · 3-month min",
              desc: "Ongoing fractional AI partner. Multiple agents in scope. Monthly optimisation cycle. Quarterly strategy review.",
              badge: "Highest value",
              bv: "green" as const,
            },
          ].map(({ t, price, period, desc, badge, bv }) => (
            <div key={t} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 flex flex-col">
              <Badge label={badge} variant={bv} />
              <div className="mt-3 text-3xl font-bold text-[#0D1B2A] dark:text-white">{price}</div>
              <div className="text-[11px] text-[#5C6370] dark:text-zinc-500 mb-3">{period}</div>
              <div className="text-sm font-semibold text-[#0D1B2A] dark:text-white mb-2">{t}</div>
              <p className="text-xs text-[#5C6370] dark:text-zinc-400 leading-relaxed flex-1">{desc}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#5C6370] dark:text-zinc-500 uppercase tracking-widest">Offer documentation checklist</p>
          <CB id="of-0" label="Rapid Assessment (£500) — one-pager written, pricing rationale documented, delivery template ready" checks={checks} onCheck={onCheck} />
          <CB id="of-1" label="AI Readiness Package (£3,500) — scope doc written, deliverables listed, proposal template built" checks={checks} onCheck={onCheck} />
          <CB id="of-2" label="Agent of Record (£9,500/month) — retainer contract drafted, monthly touchpoint agenda defined" checks={checks} onCheck={onCheck} />
        </div>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 09 — ARTEFACT FACTORY
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="artefacts" num="09" title="Artefact Factory" subtitle="Reusable assets that multiply output per engagement.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { t: "Brief Template", d: "Structured discovery doc — captures goals, data, tools, stakeholders, constraints, and success metrics." },
            { t: "Proposal Template", d: "Executive summary → problem → solution → scope → pricing → ROI estimate → next step." },
            { t: "Scope Document", d: "Technical and functional requirements, agent architecture, integration map, timeline." },
            { t: "Delivery Report", d: "Week-by-week progress, decisions made, blockers resolved, metrics tracked, next actions." },
            { t: "Training Pack", d: "Video walkthrough + written SOP for every agent delivered. Client owns it from day one." },
            { t: "Case Study", d: "Anonymised results template: situation → what we did → result → quote. Used in LinkedIn + proposals." },
          ].map(({ t, d }) => (
            <div key={t} className="bg-[#F5F4EE] dark:bg-zinc-800/60 rounded-2xl p-4 border border-gray-100 dark:border-zinc-700">
              <div className="text-xs font-semibold text-[#0D1B2A] dark:text-white mb-2">{t}</div>
              <p className="text-[11px] text-[#5C6370] dark:text-zinc-400 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
        <Note variant="success">
          Every artefact lives in the BrightPrompt OneDrive → Client Folder. Each new client gets a copy of the template set. Save variants that worked especially well into the Master Templates folder.
        </Note>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 10 — IP LIBRARY
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="ip-library" num="10" title="IP Library" subtitle="Your proprietary AI tools — the core of the BrightPrompt edge.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { t: "ChatGPT Custom GPTs", items: ["Brief Builder GPT","Proposal Generator GPT","Client Comms GPT","Scope Writer GPT"] },
            { t: "Claude Projects", items: ["BA Analysis Project","Requirements Writing Project","Process Mapping Project","Executive Summary Project"] },
            { t: "Claude Code Repos", items: ["Copilot Studio topic builder","LinkedIn post formatter","Report summariser","Assessment scorer"] },
          ].map(({ t, items }) => (
            <div key={t} className="bg-[#F5F4EE] dark:bg-zinc-800/60 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700">
              <div className="text-xs font-semibold text-[#0D1B2A] dark:text-white mb-3">{t}</div>
              <ul className="space-y-1.5">
                {items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-[#5C6370] dark:text-zinc-400">
                    <div className="w-1 h-1 rounded-full bg-[#D4A017] flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#5C6370] dark:text-zinc-500 uppercase tracking-widest">IP setup checklist</p>
          <CB id="ip-0" label="ChatGPT Custom GPTs — at least 3 set up, tested, and saved to BrightPrompt workspace" checks={checks} onCheck={onCheck} />
          <CB id="ip-1" label="Claude Projects — 1 per core use case (BA Analysis, Requirements Writing, Process Mapping)" checks={checks} onCheck={onCheck} />
          <CB id="ip-2" label="Claude Code workflows documented — CLAUDE.md in each repo, SOPs written" checks={checks} onCheck={onCheck} />
        </div>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 11 — FOLDER STRUCTURE
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="folder-structure" num="11" title="Folder Structure" subtitle="OneDrive — BrightPrompt master layout.">
        <CopyBox
          label="OneDrive folder tree"
          content={`BrightPrompt/
├── 01 - Strategy/
│   ├── North Star.docx
│   ├── Positioning Guide.docx
│   └── Competitive Landscape.xlsx
├── 02 - Sales/
│   ├── Templates/
│   │   ├── Proposal Template.docx
│   │   ├── Scope Document Template.docx
│   │   └── Brief Template.docx
│   ├── Active Pipeline/
│   └── Won/
├── 03 - Clients/
│   └── [Client Name]/
│       ├── Brief.docx
│       ├── Proposal.docx
│       ├── Delivery/
│       └── Handover/
├── 04 - IP Library/
│   ├── Prompt Library/
│   ├── ChatGPT GPTs/
│   ├── Claude Projects/
│   └── Claude Code/
├── 05 - Marketing/
│   ├── LinkedIn Posts/
│   ├── Lead Magnets/
│   └── Case Studies/
└── 06 - Operations/
    ├── SOPs/
    ├── Reporting Templates/
    └── Financial Tracking/`}
        />
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 12 — AI TOOL WORKFLOW
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="tool-workflow" num="12" title="AI Tool Workflow" subtitle="Which tool to reach for — and when.">
        <DataTable
          headers={["Task", "Best Tool", "Why"]}
          rows={[
            ["First draft of any document", "ChatGPT (GPT-4o)", "Fast, broad, good at structured output"],
            ["Deep analysis, long documents", "Claude (Sonnet)", "Better reasoning, larger context window"],
            ["Code, automation, CLI tasks", "Claude Code", "Agentic, file-aware, runs terminal commands"],
            ["Microsoft 365 bots", "Copilot Studio", "Native M365 integration, no-code deployment"],
            ["Client-facing chat agents", "Copilot Studio + Claude", "Copilot for UX, Claude API for intelligence"],
            ["Process analysis & mapping", "Claude Project", "System prompt primed with client context"],
            ["LinkedIn content drafts", "ChatGPT (Brief Builder GPT)", "Tuned to BrightPrompt voice and format"],
            ["Requirements documents", "Claude (Requirements Project)", "Structured output, consistent notation"],
          ]}
        />
        <Note variant="warning">
          Never send real client data to any AI tool without confirming their data handling policy. Use anonymised examples in prompts during setup and testing.
        </Note>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 13 — CHATGPT SETUP
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="chatgpt-setup" num="13" title="ChatGPT Setup" subtitle="Three Custom GPTs to build first.">
        <div className="space-y-4">
          <Expandable summary="Brief Builder GPT — system prompt">
            <CopyBox
              label="ChatGPT Custom GPT — Brief Builder"
              content={`You are the BrightPrompt Brief Builder. Your job is to help Craig capture a structured client brief after a discovery call.

Ask the following questions one at a time, then produce a formatted brief document:

1. What is the client's company name and sector?
2. What is the primary pain point they described?
3. What tools do they currently use (ERP, CRM, comms)?
4. What does good look like in 6 months?
5. Who are the key stakeholders and decision makers?
6. What is their rough budget range?
7. What is their timeline to see results?

Output format: Use headings for each section. Write in clear business English. Include a recommended next step at the end.`}
            />
          </Expandable>
          <Expandable summary="Proposal Generator GPT — system prompt">
            <CopyBox
              label="ChatGPT Custom GPT — Proposal Generator"
              content={`You are the BrightPrompt Proposal Generator. When given a client brief, produce a professional proposal document.

Structure the proposal as follows:
1. Executive Summary (2–3 sentences — what we'll do and why it matters)
2. The Problem (restate their pain in their language)
3. Our Solution (what we'll build, how it works, what changes)
4. Scope & Deliverables (bullet list — be specific)
5. Pricing (choose from 3 tiers based on scope — Rapid Assessment £500, AI Readiness Package £3,500, Agent of Record £9,500/month)
6. ROI Estimate (time saved × hourly rate × team size)
7. Timeline (phases with weeks)
8. Next Step (single clear CTA)

Write in professional but accessible UK English. Avoid jargon. Use numbers wherever possible.`}
            />
          </Expandable>
          <div className="space-y-2">
            <CB id="gpt-0" label='Create "Brief Builder" Custom GPT — system prompt added, tested with mock discovery call output' checks={checks} onCheck={onCheck} />
            <CB id="gpt-1" label='Create "Proposal Generator" Custom GPT — tested end-to-end from brief → proposal' checks={checks} onCheck={onCheck} />
            <CB id="gpt-2" label='Create "Client Comms" Custom GPT — email drafts, follow-up messages, post-call summaries' checks={checks} onCheck={onCheck} />
          </div>
        </div>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 14 — CLAUDE SETUP
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="claude-setup" num="14" title="Claude Setup" subtitle="Claude Projects for deep analytical work.">
        <div className="space-y-4">
          <Expandable summary="BA Analysis Project — system prompt">
            <CopyBox
              label="Claude Project — BA Analysis system prompt"
              content={`You are a senior business analyst working for BrightPrompt, an AI adoption consultancy. Your job is to help analyse business processes, identify AI opportunities, and produce structured analysis documents.

When given process descriptions, meeting notes, or workflow documentation:
- Identify bottlenecks and manual effort points
- Flag where AI agents could replace or augment tasks
- Estimate time savings with confidence levels (high/medium/low)
- Suggest which AI tool is best suited (ChatGPT, Claude, Copilot Studio, Claude Code)
- Note any compliance or data risks
- Produce findings in a structured format suitable for presenting to a non-technical client

Always ask clarifying questions before producing analysis. Be specific with numbers. Flag assumptions clearly.`}
            />
          </Expandable>
          <Expandable summary="Requirements Writing Project — system prompt">
            <CopyBox
              label="Claude Project — Requirements Writing system prompt"
              content={`You are a business requirements writer for BrightPrompt. You help convert discovery call notes and process analysis into formal requirements documents for AI agent builds.

For each requirement:
- Write in the format: "The system shall [action] so that [outcome]"
- Add an acceptance criterion for each requirement
- Classify as: Functional / Non-functional / Integration / Data
- Rate priority: Must Have / Should Have / Could Have / Won't Have (MoSCoW)

Also produce:
- A stakeholder register
- An assumption log
- An out-of-scope list

Output as a structured Word-ready document. Use UK English. Keep language accessible to a non-technical client sponsor.`}
            />
          </Expandable>
          <div className="space-y-2">
            <CB id="cl-0" label='"BA Analysis" Project created in Claude — system prompt live, test run completed' checks={checks} onCheck={onCheck} />
            <CB id="cl-1" label='"Requirements Writing" Project created — tested with a sample discovery call transcript' checks={checks} onCheck={onCheck} />
            <CB id="cl-2" label='"Process Mapping" Project created — outputs process maps in text notation (flowchart-ready)' checks={checks} onCheck={onCheck} />
          </div>
        </div>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 15 — CLAUDE CODE SETUP
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="claude-code-setup" num="15" title="Claude Code Setup" subtitle="Agentic workflows for automation and delivery.">
        <Note variant="info">
          Claude Code operates best with a strong <code className="text-[#1E4D8C] font-mono bg-blue-50 dark:bg-blue-950/30 px-1 rounded">CLAUDE.md</code> in the project root. This primes Claude with your conventions, constraints, and what it is/isn&apos;t allowed to do.
        </Note>
        <Expandable summary="CLAUDE.md template for BrightPrompt projects">
          <CopyBox
            label="CLAUDE.md — BrightPrompt project template"
            content={`# BrightPrompt Project

## Context
This is a BrightPrompt client delivery project. All code and automation is for [CLIENT NAME] in the [SECTOR] sector.

## What you can do
- Read and write files in this project directory
- Run PowerShell and Node.js commands
- Query APIs using keys stored in .env (never log or expose key values)
- Create and modify Copilot Studio topic YAML files
- Generate documentation in /docs

## What you must NOT do
- Push to git without explicit instruction
- Delete files without confirmation
- Make API calls to production endpoints during development
- Send emails or messages to real addresses during testing

## Code conventions
- TypeScript preferred for all scripts
- Use named exports, not default exports
- Comment only when the WHY is non-obvious
- All currency in GBP unless specified

## Project structure
/src      → source code and scripts
/docs     → client documentation
/prompts  → prompt templates
/tests    → test scripts
.env      → secrets (never commit)`}
          />
        </Expandable>
        <Expandable summary="Key Claude Code use cases for BrightPrompt">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { t: "Copilot Studio topic builder", d: "Generate YAML topic files from a brief description. Saves 2–3 hours per bot build." },
                { t: "Assessment scorer", d: "Takes 10 scorecard answers, outputs AI Readiness Score + recommended tier." },
                { t: "Report formatter", d: "Converts bullet notes from a delivery session into a formatted PDF-ready report." },
                { t: "LinkedIn post formatter", d: "Takes a raw idea or case study, formats it as a LinkedIn post in BrightPrompt voice." },
              ].map(({ t, d }) => (
                <div key={t} className="bg-[#F5F4EE] dark:bg-zinc-800/60 rounded-xl p-4">
                  <div className="text-xs font-semibold text-[#0D1B2A] dark:text-white mb-1">{t}</div>
                  <p className="text-xs text-[#5C6370] dark:text-zinc-400">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </Expandable>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 16 — COPILOT STUDIO BUILD
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="copilot-studio" num="16" title="Copilot Studio Build" subtitle="Building the BA Agent — the flagship demo product.">
        <Note variant="warning">
          The BA Agent for Premium Investments Limited (PIL) is the first live reference case. Build this first. Document everything. It becomes the template for all subsequent builds.
        </Note>
        <DataTable
          headers={["Phase", "Task", "Tool", "Output"]}
          rows={[
            ["1 — Environment", "Create Power Platform environment", "Power Platform Admin", "Isolated sandbox confirmed"],
            ["1 — Environment", "Enable AI Builder credits", "PPAC settings", "AI Builder live"],
            ["2 — Bot scaffold", "Create Copilot Studio agent", "Copilot Studio", "Empty bot created"],
            ["2 — Bot scaffold", "Set greeting topic with trigger phrases", "Topic editor", "Greeting live"],
            ["3 — Core topics", "Build BA Kick-off topic", "YAML / code editor", "Topic deployed"],
            ["3 — Core topics", "Build Requirements topic", "YAML / code editor", "Topic deployed"],
            ["3 — Core topics", "Build Stakeholder Mapping topic", "YAML / code editor", "Topic deployed"],
            ["3 — Core topics", "Build Risk Analysis topic", "YAML / code editor", "Topic deployed"],
            ["4 — AI overlay", "Add generative answers fallback", "Bot settings", "AI answers enabled"],
            ["4 — AI overlay", "Connect SharePoint knowledge source", "Knowledge config", "SharePoint indexed"],
            ["5 — Integration", "Add Teams channel", "Channels settings", "Teams bot live"],
            ["5 — Integration", "Test all topics end-to-end", "Copilot Studio test pane", "All topics green"],
            ["6 — Handover", "Record walkthrough video", "Screen capture", "Video delivered"],
            ["6 — Handover", "Write user guide", "Word doc", "Documentation delivered"],
          ]}
        />
        <Expandable summary="Trigger phrase strategy — avoid GenAI interception">
          <Note variant="info">
            Use unique, non-generic trigger phrases so topics are matched exactly rather than being intercepted by the generative AI fallback. Examples from PIL: <code className="font-mono bg-blue-50 dark:bg-blue-950/30 px-1 rounded text-[#1E4D8C]">pilkickoff</code>, <code className="font-mono bg-blue-50 dark:bg-blue-950/30 px-1 rounded text-[#1E4D8C]">pilrisk</code>, <code className="font-mono bg-blue-50 dark:bg-blue-950/30 px-1 rounded text-[#1E4D8C]">pilreview</code>.
          </Note>
          <CopyBox
            label="Trigger phrase naming convention"
            content={`Pattern: [client-code][topic-name]

Examples:
- pilkickoff       → PIL: Start a BA kick-off session
- pilrisk          → PIL: Risk identification
- pilreview        → PIL: Sprint / delivery review
- pilrequirements  → PIL: Requirements gathering
- pilstakeholders  → PIL: Stakeholder mapping

Rule: Always prefix with the client code. Never use generic phrases like "start", "help", "analyse" as primary triggers — these will be caught by GenAI before your topic is matched.`}
          />
        </Expandable>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 17 — ENTERPRISE LICENSING
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="enterprise" num="17" title="Enterprise Licensing" subtitle="What Microsoft licences unlock what AI capabilities.">
        <DataTable
          headers={["Licence", "Monthly (est.)", "Key AI Features", "Best for"]}
          rows={[
            ["M365 Business Basic", "£5/user", "Teams, SharePoint, web apps", "Minimum viable comms"],
            ["M365 Business Standard", "£10/user", "+ Copilot for M365 add-on eligible, full Office", "Most SME clients"],
            ["M365 Business Premium", "£18/user", "+ Intune, Defender, Entra ID P1", "Compliance-sensitive clients"],
            ["M365 E3", "£28/user", "Enterprise identity, audit logs, full DLP", "Financial services regulated"],
            ["M365 E5", "£52/user", "+ Purview, Sentinel, Defender for Endpoint", "FCA/PRA regulated firms"],
            ["Copilot for M365 add-on", "£25/user", "Copilot in Word, Excel, Teams, Outlook", "Knowledge workers (add to any E3/E5)"],
            ["Power Platform (per app)", "£16/user", "1 app/flow per user", "Targeted automation projects"],
            ["Power Platform (per user)", "£36/user", "Unlimited apps + flows", "Heavy automation clients"],
          ]}
        />
        <Note variant="info">
          Copilot Studio is included in the Power Platform per-user plan. For clients who only need bot functionality, this is often the most cost-effective route — no Copilot for M365 licence needed.
        </Note>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 18 — SALES PROCESS
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="sales" num="18" title="Sales Process" subtitle="Five stages, measurable gates.">
        <div className="space-y-3">
          {[
            { stage: "Awareness", action: "LinkedIn post + connection request", metric: "100 new connections/week", gate: "Connection accepted" },
            { stage: "Interest", action: "Personalised follow-up + lead magnet offer", metric: "20% response rate target", gate: "Reply received or scorecard downloaded" },
            { stage: "Discovery", action: "30-min discovery call — pain points mapped", metric: "5 calls/week target", gate: "Pain point clearly articulated" },
            { stage: "Proposal", action: "Rapid Assessment sold or full proposal sent", metric: "60% close rate from discovery", gate: "Proposal sent within 48 hours" },
            { stage: "Close", action: "Contract signed, onboarding call booked", metric: "2 new clients/month target", gate: "Invoice raised, kick-off scheduled" },
          ].map(({ stage, action, metric, gate }, i) => (
            <div key={stage} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0D1B2A] flex items-center justify-center">
                <span className="text-xs font-bold text-[#D4A017]">{i+1}</span>
              </div>
              <div className="flex-1 bg-[#F5F4EE] dark:bg-zinc-800/60 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                  <span className="text-sm font-semibold text-[#0D1B2A] dark:text-white">{stage}</span>
                  <Badge label={metric} variant="gold" />
                </div>
                <p className="text-xs text-[#5C6370] dark:text-zinc-400 mb-2">{action}</p>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#1E4D8C] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-md">
                  <ArrowRight size={9} /> Gate: {gate}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 19 — DELIVERY PLAYBOOK
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="delivery" num="19" title="Delivery Playbook" subtitle="Standard phases for every engagement.">
        <DataTable
          headers={["Phase", "Activities", "Deliverable", "Duration"]}
          rows={[
            ["Kick-off", "Intro call, access provisioning, stakeholder register, success metrics agreed", "Project charter", "Day 1–3"],
            ["Discovery", "Process interviews, data review, tool audit, pain mapping", "Current state report", "Week 1"],
            ["Design", "Agent architecture, user journey, topic list, integration map", "Solution design doc", "Week 2"],
            ["Build", "Topics built, tested in sandbox, iterated with client feedback", "Tested agent (sandbox)", "Weeks 3–4"],
            ["UAT", "Client tests real scenarios, bugs logged, fixes applied", "Sign-off document", "Week 5"],
            ["Deploy", "Agent live in production environment, Teams/SharePoint connected", "Live agent", "Week 6"],
            ["Train", "Recorded walkthrough, live training session, written SOP", "Training pack", "Week 7"],
            ["Handover", "Docs handed over, support window confirmed, retainer discussed", "Handover pack", "Week 8"],
          ]}
        />
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 20 — PROMPT LIBRARY
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="prompts" num="20" title="Prompt Library" subtitle="Core prompts — copy and adapt for each engagement.">
        <div className="space-y-4">
          <CopyBox
            label="Process analysis prompt"
            content={`I'm going to describe a business process. Please:
1. Identify the main steps and decision points
2. Flag any manual, repetitive, or error-prone tasks
3. Suggest where an AI agent could intervene
4. Estimate potential time savings (hours/week) with a confidence level
5. Note any data or compliance risks

Process description:
[PASTE NOTES HERE]`}
          />
          <CopyBox
            label="Executive summary prompt"
            content={`Write a 3-paragraph executive summary for a client proposal.

Client: [NAME], [SECTOR]
Pain point: [WHAT THEY TOLD US]
Our solution: [WHAT WE'RE BUILDING]
Key outcome: [QUANTIFIED RESULT]

Requirements:
- Written for a non-technical C-suite reader
- Paragraph 1: Situation and problem
- Paragraph 2: Our approach and why it works
- Paragraph 3: Expected outcomes and next step
- UK English, professional but clear, no jargon`}
          />
          <CopyBox
            label="Risk analysis prompt"
            content={`Analyse the following AI agent project for risks. For each risk:
- Name the risk
- Classify it: Technical / Adoption / Data / Compliance / Scope / Timeline
- Rate likelihood: High / Medium / Low
- Rate impact: High / Medium / Low
- Suggest a mitigation

Project description:
[PASTE PROJECT BRIEF]

Focus on practical risks relevant to a UK financial services or professional services firm deploying a Microsoft Copilot Studio bot.`}
          />
          <CopyBox
            label="LinkedIn post prompt"
            content={`Write a LinkedIn post in Craig Wagner's voice for BrightPrompt.

Topic: [WHAT THE POST IS ABOUT]
Key message: [THE MAIN POINT]
Proof/example: [A SPECIFIC EXAMPLE OR RESULT]

Style rules:
- Maximum 200 words
- No hashtags in the body (1–2 at the end only)
- First line must stop the scroll — make it specific and concrete
- Professional but conversational — like a smart colleague, not a corporate press release
- End with a question or a clear takeaway
- UK English`}
          />
          <CopyBox
            label="Discovery call debrief prompt"
            content={`I've just finished a discovery call. Here are my rough notes. Please:

1. Summarise the key pain points in order of urgency
2. Identify the 3 most promising AI opportunities
3. Recommend which BrightPrompt offer tier fits best (Rapid Assessment £500 / AI Readiness Package £3,500 / Agent of Record £9,500/month)
4. Draft 3 bullet points for a follow-up email
5. Flag any red flags or risks I should address

Call notes:
[PASTE NOTES]`}
          />
        </div>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 21 — METRICS & KPIS
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="metrics" num="21" title="Metrics & KPIs" subtitle="Track these weekly. Review monthly. Adjust quarterly.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KPI value="100+" label="New LinkedIn connections/week" gold />
          <KPI value="5%" label="Connection → DM reply rate" />
          <KPI value="5" label="Discovery calls/week target" gold />
          <KPI value="60%" label="Discovery → proposal conversion" />
          <KPI value="2" label="New clients signed/month" gold />
          <KPI value="£175K" label="Annual revenue target" />
        </div>
        <DataTable
          headers={["Metric", "Weekly target", "Monthly target", "How to measure"]}
          rows={[
            ["LinkedIn connections sent", "100", "400", "LinkedIn analytics"],
            ["Replies / DM conversations", "20", "80", "LinkedIn messaging"],
            ["Discovery calls booked", "5", "20", "Calendar"],
            ["Proposals sent", "3", "12", "CRM / OneDrive"],
            ["Clients signed", "0.5", "2", "CRM"],
            ["Revenue invoiced (£)", "£3,365", "£14,583", "Xero / FreeAgent"],
            ["Active agents live", "—", "+1 per month", "Client delivery tracker"],
            ["NPS / client satisfaction", "—", "Review quarterly", "Post-delivery survey"],
          ]}
        />
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 22 — 30-DAY TRACKER
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="tracker30" num="22" title="30-Day Tracker" subtitle="The setup sprint — complete these in order.">
        <div className="space-y-5">
          {/* Week 1 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge label="Week 1" variant="blue" />
              <span className="text-xs text-[#5C6370] dark:text-zinc-400">Days 1–7 · Foundation</span>
            </div>
            <div className="space-y-2">
              <CB id="w1-0" label="Write and lock North Star statement (who, what, how, for whom)" checks={checks} onCheck={onCheck} />
              <CB id="w1-1" label="Update LinkedIn headline, about section, and banner" checks={checks} onCheck={onCheck} />
              <CB id="w1-2" label="Set up OneDrive BrightPrompt folder structure" checks={checks} onCheck={onCheck} />
              <CB id="w1-3" label="Create the 3 ChatGPT Custom GPTs (Brief Builder, Proposal Generator, Client Comms)" checks={checks} onCheck={onCheck} />
              <CB id="w1-4" label="Create the 3 Claude Projects (BA Analysis, Requirements Writing, Process Mapping)" checks={checks} onCheck={onCheck} />
              <CB id="w1-5" label="Build offer one-pagers for all 3 tiers" checks={checks} onCheck={onCheck} />
              <CB id="w1-6" label="Send first 100 LinkedIn connection requests (personalised)" checks={checks} onCheck={onCheck} />
            </div>
          </div>
          {/* Week 2 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge label="Week 2" variant="blue" />
              <span className="text-xs text-[#5C6370] dark:text-zinc-400">Days 8–14 · Pipeline</span>
            </div>
            <div className="space-y-2">
              <CB id="w2-0" label="Publish first proof post on LinkedIn (case study or quick win)" checks={checks} onCheck={onCheck} />
              <CB id="w2-1" label="Build and publish AI Readiness Scorecard lead magnet" checks={checks} onCheck={onCheck} />
              <CB id="w2-2" label="Set up email follow-up sequence (5 emails, 14-day drip)" checks={checks} onCheck={onCheck} />
              <CB id="w2-3" label="Book first 3 discovery calls from LinkedIn outreach" checks={checks} onCheck={onCheck} />
              <CB id="w2-4" label="Write proposal template using Proposal Generator GPT" checks={checks} onCheck={onCheck} />
              <CB id="w2-5" label="Start PIL Copilot Studio bot — environment + greeting topic" checks={checks} onCheck={onCheck} />
              <CB id="w2-6" label="Continue LinkedIn connections (100/week maintained)" checks={checks} onCheck={onCheck} />
            </div>
          </div>
          {/* Week 3 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge label="Week 3" variant="blue" />
              <span className="text-xs text-[#5C6370] dark:text-zinc-400">Days 15–21 · Delivery</span>
            </div>
            <div className="space-y-2">
              <CB id="w3-0" label="Run first 3 discovery calls — use BA Analysis Claude Project for debrief" checks={checks} onCheck={onCheck} />
              <CB id="w3-1" label="Send first proposal using Proposal Generator GPT" checks={checks} onCheck={onCheck} />
              <CB id="w3-2" label="Complete PIL bot — all 4 core topics built and tested" checks={checks} onCheck={onCheck} />
              <CB id="w3-3" label="Publish 2nd LinkedIn post (thought leadership)" checks={checks} onCheck={onCheck} />
              <CB id="w3-4" label="Create delivery report template in OneDrive" checks={checks} onCheck={onCheck} />
              <CB id="w3-5" label="Write first case study (anonymised) from PIL or any previous work" checks={checks} onCheck={onCheck} />
            </div>
          </div>
          {/* Week 4 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge label="Week 4" variant="blue" />
              <span className="text-xs text-[#5C6370] dark:text-zinc-400">Days 22–30 · Close</span>
            </div>
            <div className="space-y-2">
              <CB id="w4-0" label="Follow up on all outstanding proposals — personalised nudge email" checks={checks} onCheck={onCheck} />
              <CB id="w4-1" label="Close first paid engagement (Rapid Assessment or AI Readiness Package)" checks={checks} onCheck={onCheck} />
              <CB id="w4-2" label="PIL bot — UAT with client, fixes applied, Teams channel connected" checks={checks} onCheck={onCheck} />
              <CB id="w4-3" label="Record PIL walkthrough video for handover pack" checks={checks} onCheck={onCheck} />
              <CB id="w4-4" label="Publish 3rd LinkedIn post (social proof / first result)" checks={checks} onCheck={onCheck} />
              <CB id="w4-5" label="Review 30-day metrics vs targets — adjust approach for Month 2" checks={checks} onCheck={onCheck} />
              <CB id="w4-6" label="Plan Month 2 — schedule artefact factory build and second bot project" checks={checks} onCheck={onCheck} />
            </div>
          </div>
        </div>
      </Sec>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 23 — 90-DAY ROADMAP
      ═══════════════════════════════════════════════════════════════════════ */}
      <Sec id="roadmap90" num="23" title="90-Day Roadmap" subtitle="Milestones beyond the 30-day setup sprint.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {[
            { period: "Month 1", focus: "Foundation", target: "1 client signed, £500–£3,500 revenue, PIL bot live" },
            { period: "Month 2", focus: "Build", target: "2–3 clients active, artefact library built, 2nd bot deployed" },
            { period: "Month 3", focus: "Scale", target: "£10K+ MRR, first retainer, LinkedIn system running autonomously" },
          ].map(({ period, focus, target }) => (
            <div key={period} className="bg-[#0D1B2A] rounded-2xl p-5">
              <div className="text-[10px] font-semibold text-[#D4A017] uppercase tracking-widest mb-1">{period}</div>
              <div className="text-sm font-bold text-white mb-2">{focus}</div>
              <p className="text-xs text-white/60 leading-relaxed">{target}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#5C6370] dark:text-zinc-500 uppercase tracking-widest">90-day milestone checklist</p>
          <CB id="r90-0" label="Month 1: First paying client signed and kick-off completed" checks={checks} onCheck={onCheck} />
          <CB id="r90-1" label="Month 1: PIL BA Agent live in Teams and signed off by client" checks={checks} onCheck={onCheck} />
          <CB id="r90-2" label="Month 2: Artefact library complete — all 6 templates built and stored in OneDrive" checks={checks} onCheck={onCheck} />
          <CB id="r90-3" label="Month 2: 3 active client engagements running concurrently" checks={checks} onCheck={onCheck} />
          <CB id="r90-4" label="Month 3: First Agent of Record retainer (£9,500/month) signed" checks={checks} onCheck={onCheck} />
          <CB id="r90-5" label="Month 3: £10K+ MRR achieved — pipeline strong enough to sustain without new outreach for 30 days" checks={checks} onCheck={onCheck} />
        </div>
        <Note variant="success">
          At 90 days with 3 active clients and one retainer, BrightPrompt is self-funding. Focus shifts from acquiring clients to deepening relationships and building the IP library that makes each engagement faster than the last.
        </Note>
      </Sec>

    </div>
  );
}
