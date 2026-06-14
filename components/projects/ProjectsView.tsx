"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Copy, Check, ChevronDown, ChevronUp, ArrowRight,
  AlertCircle, CheckCircle2, Info, AlertTriangle,
  RotateCcw, Printer, Menu, X,
} from "lucide-react";

// ── Block type definitions ─────────────────────────────────────────────────────

interface NoteBlock       { type: "note";        variant: "info"|"success"|"warning"|"danger"; content: string }
interface CopyBoxBlock    { type: "copybox";     label: string; content: string }
interface CheckItem       { id: string; label: string; dep?: string }
interface ChecklistBlock  { type: "checklist";  label?: string; items: CheckItem[] }
interface CardItem        { title: string; badge?: string; badgeVariant?: string; content: string; label?: string }
interface CardsBlock      { type: "cards";      cols?: number; label?: string; items: CardItem[] }
interface TableBlock      { type: "table";      headers: string[]; rows: string[][] }
interface ExpandableBlock { type: "expandable"; summary: string; blocks: Block[] }
interface KPIItem         { value: string; label: string; gold?: boolean }
interface KPIBlock        { type: "kpi";        items: KPIItem[] }
interface RoadmapItem     { n: string; t: string; w: string; desc: string; id: string }
interface RoadmapBlock    { type: "roadmap";    items: RoadmapItem[] }
interface HeroStat        { v: string; l: string }
interface HeroNote        { variant: "info"|"success"|"warning"|"danger"; content: string }
interface HeroBlock       { type: "hero";       subtitle: string; stats: HeroStat[]; notes: HeroNote[] }
interface PricingItem     { title: string; price: string; period: string; desc: string; badge: string; badgeVariant: string }
interface PricingBlock    { type: "pricing";    items: PricingItem[] }
interface SeqItem         { title: string; date: string; dep: string; output: string }
interface SequenceBlock   { type: "sequence";   items: SeqItem[] }
interface WeekItem        { id: string; label: string }
interface WeekBlock       { type: "week";       label: string; subtitle: string; items: WeekItem[] }
interface MonthCard       { period: string; focus: string; target: string }
interface MonthCardsBlock { type: "month-cards"; items: MonthCard[] }
interface BadgeItem       { label: string; variant?: string }
interface BadgesBlock     { type: "badges";     label?: string; items: BadgeItem[] }
interface LeadCard        { title: string; badge: string; items: string[] }
interface LeadCardsBlock  { type: "lead-cards"; items: LeadCard[] }

type Block =
  | NoteBlock | CopyBoxBlock | ChecklistBlock | CardsBlock | TableBlock
  | ExpandableBlock | KPIBlock | RoadmapBlock | HeroBlock | PricingBlock
  | SequenceBlock | WeekBlock | MonthCardsBlock | BadgesBlock | LeadCardsBlock;

interface SectionData {
  num: string;
  title: string;
  subtitle?: string;
  wrapper?: string;
  blocks: Block[];
}

interface ProjectSection {
  section_id: string;
  section_order: number;
  data: SectionData;
}

type Checks = Record<string, boolean>;

// ── Static nav labels (not sensitive) ─────────────────────────────────────────

const NAV_SECTIONS = [
  { id: "summary",          label: "Executive Summary" },
  { id: "roadmap",          label: "Big Picture Roadmap" },
  { id: "north-star",       label: "North Star & Positioning" },
  { id: "operating-model",  label: "Operating Model" },
  { id: "sequence",         label: "Full Sequence" },
  { id: "linkedin",         label: "LinkedIn Refinement" },
  { id: "lead-engine",      label: "Lead Engine" },
  { id: "offers",           label: "Productised Offers" },
  { id: "artefacts",        label: "Artefact Factory" },
  { id: "ip-library",       label: "IP Library" },
  { id: "folder-structure", label: "Folder Structure" },
  { id: "tool-workflow",    label: "AI Tool Workflow" },
  { id: "chatgpt-setup",    label: "ChatGPT Setup" },
  { id: "claude-setup",     label: "Claude Setup" },
  { id: "claude-code-setup",label: "Claude Code Setup" },
  { id: "copilot-studio",   label: "Copilot Studio Build" },
  { id: "enterprise",       label: "Enterprise Licensing" },
  { id: "sales",            label: "Sales Process" },
  { id: "delivery",         label: "Delivery Playbook" },
  { id: "prompts",          label: "Prompt Library" },
  { id: "metrics",          label: "Metrics & KPIs" },
  { id: "tracker30",        label: "30-Day Tracker" },
  { id: "roadmap90",        label: "90-Day Roadmap" },
];

const ALL_CHECK_IDS = [
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

// ── Micro-components ──────────────────────────────────────────────────────────

function Note({ variant = "info", children }: { variant?: "info"|"success"|"warning"|"danger"; children: React.ReactNode }) {
  const cfg = {
    info:    { cls: "border-[#1E4D8C] bg-blue-50/70 dark:bg-blue-950/30 text-[#0D1B2A] dark:text-blue-100",     Icon: Info },
    success: { cls: "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-200",       Icon: CheckCircle2 },
    warning: { cls: "border-[#D4A017] bg-[#FBF3DC] dark:bg-amber-950/30 text-[#6B4F00] dark:text-amber-200",    Icon: AlertTriangle },
    danger:  { cls: "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200",                Icon: AlertCircle },
  }[variant];
  return (
    <div className={`border-l-4 rounded-xl px-4 py-3 flex gap-3 items-start text-sm leading-relaxed ${cfg.cls}`}>
      <cfg.Icon size={14} className="flex-shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

function CopyBoxUI({ label, content }: { label: string; content: string }) {
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

function KPICard({ value, label, gold }: KPIItem) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 text-center">
      <div className={`text-3xl font-bold mb-1 ${gold ? "text-[#D4A017]" : "text-[#0D1B2A] dark:text-white"}`}>{value}</div>
      <div className="text-xs text-[#5C6370] dark:text-zinc-400 font-medium">{label}</div>
    </div>
  );
}

function ExpandableUI({ summary, children }: { summary: string; children: React.ReactNode }) {
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
            {headers.map((h, i) => <th key={i} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-[#F5F4EE]/60 dark:bg-zinc-800/40"}>
              {row.map((cell, j) => <td key={j} className="px-4 py-3 text-[#0D1B2A] dark:text-zinc-200 align-top">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ label, variant = "default" }: { label: string; variant?: string }) {
  const cls: Record<string, string> = {
    default: "bg-gray-100 dark:bg-zinc-800 text-[#5C6370] dark:text-zinc-300",
    gold:    "bg-[#FBF3DC] text-[#8A6600] dark:bg-amber-900/30 dark:text-amber-300",
    blue:    "bg-blue-50 text-[#1E4D8C] dark:bg-blue-900/30 dark:text-blue-300",
    green:   "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    red:     "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${cls[variant] ?? cls.default}`}>{label}</span>;
}

// ── Generic block renderer (recursive) ────────────────────────────────────────

function RenderBlock({ block, checks, onCheck }: {
  block: Block;
  checks: Checks;
  onCheck: (id: string, v: boolean) => void;
}) {
  switch (block.type) {

    case "note":
      return <Note variant={block.variant}>{block.content}</Note>;

    case "copybox":
      return <CopyBoxUI label={block.label} content={block.content} />;

    case "checklist":
      return (
        <div className="space-y-2">
          {block.label && (
            <p className="text-xs font-semibold text-[#5C6370] dark:text-zinc-500 uppercase tracking-widest">{block.label}</p>
          )}
          {block.items.map(item => (
            <CB key={item.id} id={item.id} label={item.label} dep={item.dep} checks={checks} onCheck={onCheck} />
          ))}
        </div>
      );

    case "cards":
      return (
        <div className="space-y-2">
          {block.label && (
            <p className="text-xs font-semibold text-[#5C6370] dark:text-zinc-500 uppercase tracking-widest">{block.label}</p>
          )}
          <div className={`grid grid-cols-1 gap-3 ${
            block.cols === 4 ? "md:grid-cols-4" :
            block.cols === 3 ? "md:grid-cols-3" :
            "md:grid-cols-2"
          }`}>
            {block.items.map((card, i) => (
              <div key={i} className="bg-[#F5F4EE] dark:bg-zinc-800/60 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700">
                {card.badge && <Badge label={card.badge} variant={card.badgeVariant} />}
                <div className="text-xs font-semibold text-[#0D1B2A] dark:text-white mt-2 mb-2">{card.title}</div>
                <p className="text-xs text-[#5C6370] dark:text-zinc-400 leading-relaxed">{card.content}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "table":
      return <DataTable headers={block.headers} rows={block.rows} />;

    case "expandable":
      return (
        <ExpandableUI summary={block.summary}>
          {block.blocks.map((b, i) => (
            <RenderBlock key={i} block={b} checks={checks} onCheck={onCheck} />
          ))}
        </ExpandableUI>
      );

    case "kpi":
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {block.items.map((item, i) => <KPICard key={i} {...item} />)}
        </div>
      );

    case "roadmap":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {block.items.map(({ n, t, w, desc, id }) => (
            <a key={n} href={`#${id}`}
              className="group block bg-[#F5F4EE] dark:bg-zinc-800/60 hover:bg-[#0D1B2A] rounded-2xl p-4 border border-gray-100 dark:border-zinc-700 transition-all duration-200 cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-[#0D1B2A] group-hover:bg-white/20 flex items-center justify-center mb-3 transition-colors">
                <span className="text-sm font-bold text-[#D4A017]">{n}</span>
              </div>
              <div className="text-sm font-semibold text-[#0D1B2A] group-hover:text-white mb-0.5 transition-colors">{t}</div>
              <div className="text-[10px] font-medium text-[#D4A017] mb-2">{w}</div>
              <div className="text-xs text-[#5C6370] group-hover:text-white/70 leading-relaxed transition-colors">{desc}</div>
            </a>
          ))}
        </div>
      );

    case "hero":
      return null; // hero is rendered by the wrapper

    case "pricing":
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {block.items.map((item, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 flex flex-col">
              <Badge label={item.badge} variant={item.badgeVariant} />
              <div className="mt-3 text-3xl font-bold text-[#0D1B2A] dark:text-white">{item.price}</div>
              <div className="text-[11px] text-[#5C6370] dark:text-zinc-500 mb-3">{item.period}</div>
              <div className="text-sm font-semibold text-[#0D1B2A] dark:text-white mb-2">{item.title}</div>
              <p className="text-xs text-[#5C6370] dark:text-zinc-400 leading-relaxed flex-1">{item.desc}</p>
            </div>
          ))}
        </div>
      );

    case "sequence":
      return (
        <div className="space-y-3">
          {block.items.map(({ title, date, dep, output }, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#0D1B2A] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#D4A017]">{i + 1}</span>
                </div>
                {i < block.items.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 dark:bg-zinc-800 my-1" />}
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-[#0D1B2A] dark:text-white">{title}</span>
                  <Badge label={date} variant="gold" />
                </div>
                <p className="text-xs text-[#5C6370] dark:text-zinc-400 leading-relaxed mb-1">{dep}</p>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-md">
                  <CheckCircle2 size={9} /> {output}
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case "week":
      return (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge label={block.label} variant="blue" />
            <span className="text-xs text-[#5C6370] dark:text-zinc-400">{block.subtitle}</span>
          </div>
          <div className="space-y-2">
            {block.items.map(item => (
              <CB key={item.id} id={item.id} label={item.label} checks={checks} onCheck={onCheck} />
            ))}
          </div>
        </div>
      );

    case "month-cards":
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {block.items.map(({ period, focus, target }, i) => (
            <div key={i} className="bg-[#0D1B2A] rounded-2xl p-5">
              <div className="text-[10px] font-semibold text-[#D4A017] uppercase tracking-widest mb-1">{period}</div>
              <div className="text-sm font-bold text-white mb-2">{focus}</div>
              <p className="text-xs text-white/60 leading-relaxed">{target}</p>
            </div>
          ))}
        </div>
      );

    case "badges":
      return (
        <div className="space-y-2">
          {block.label && (
            <p className="text-xs font-semibold text-[#5C6370] dark:text-zinc-500 uppercase tracking-widest">{block.label}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {block.items.map((b, i) => <Badge key={i} label={b.label} variant={b.variant} />)}
          </div>
        </div>
      );

    case "lead-cards":
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {block.items.map(({ title, badge, items }, i) => (
            <div key={i} className="bg-[#F5F4EE] dark:bg-zinc-800/60 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700">
              <div className="text-sm font-semibold text-[#0D1B2A] dark:text-white mb-1">{title}</div>
              <Badge label={badge} variant="gold" />
              <ul className="mt-3 space-y-1.5">
                {items.map((item, j) => (
                  <li key={j} className="flex gap-2 text-xs text-[#5C6370] dark:text-zinc-400">
                    <ArrowRight size={10} className="flex-shrink-0 mt-0.5 text-[#D4A017]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

// ── Hero section wrapper ───────────────────────────────────────────────────────

function HeroSection({ sectionId, data, checks, onCheck }: {
  sectionId: string; data: SectionData;
  checks: Checks; onCheck: (id: string, v: boolean) => void;
}) {
  const hero = data.blocks.find((b): b is HeroBlock => b.type === "hero");
  if (!hero) return null;
  return (
    <section id={sectionId} className="rounded-3xl overflow-hidden border border-[#0D1B2A]/20 scroll-mt-28">
      <div className="bg-[#0D1B2A] px-6 md:px-10 py-10 md:py-14">
        <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-3">{data.title}</h1>
        <p className="text-[#F5F4EE]/70 text-base md:text-lg leading-relaxed max-w-2xl mb-8">{hero.subtitle}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {hero.stats.map(({ v, l }) => (
            <div key={l} className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-[#D4A017] mb-0.5">{v}</div>
              <div className="text-[11px] text-white/60">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#F5F4EE] dark:bg-zinc-800/60 px-6 md:px-10 py-5 space-y-3">
        {hero.notes.map((note, i) => (
          <Note key={i} variant={note.variant}>{note.content}</Note>
        ))}
      </div>
    </section>
  );
}

// ── Standard section wrapper ───────────────────────────────────────────────────

function StandardSection({ sectionId, data, checks, onCheck }: {
  sectionId: string; data: SectionData;
  checks: Checks; onCheck: (id: string, v: boolean) => void;
}) {
  return (
    <section
      id={sectionId}
      className="bg-white dark:bg-zinc-900/60 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 md:p-8 scroll-mt-28 space-y-5"
    >
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs font-mono font-semibold text-[#D4A017]">{data.num}</span>
          <h2 className="text-xl font-bold text-[#0D1B2A] dark:text-white">{data.title}</h2>
        </div>
        {data.subtitle && (
          <p className="text-sm text-[#5C6370] dark:text-zinc-400 ml-10">{data.subtitle}</p>
        )}
      </div>
      {data.blocks.map((block, i) => (
        <RenderBlock key={i} block={block} checks={checks} onCheck={onCheck} />
      ))}
    </section>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProjectsView() {
  const [checks, setChecks]     = useState<Checks>({});
  const [sections, setSections] = useState<ProjectSection[]>([]);
  const [loading, setLoading]   = useState(true);
  const [navOpen, setNavOpen]   = useState(false);
  const supabase = createClient();

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [progressRes, sectionsRes] = await Promise.all([
      supabase
        .from("project_progress")
        .select("checks")
        .eq("user_id", user.id)
        .eq("project_slug", "bp-agent-factory")
        .single(),
      supabase
        .from("project_sections")
        .select("section_id, section_order, data")
        .eq("project_slug", "bp-agent-factory")
        .order("section_order"),
    ]);

    if (progressRes.data?.checks) setChecks(progressRes.data.checks as Checks);
    if (sectionsRes.data) setSections(sectionsRes.data as ProjectSection[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

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
    const empty: Checks = {};
    setChecks(empty);
    saveProgress(empty);
  }

  const done  = ALL_CHECK_IDS.filter(id => checks[id]).length;
  const total = ALL_CHECK_IDS.length;
  const pct   = Math.round((done / total) * 100);

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

      {/* Sticky progress bar */}
      <div className="sticky top-0 z-20 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#0D1B2A] dark:text-white">BrightPrompt Agent Factory</span>
            <span className="text-xs font-mono text-[#D4A017] font-semibold">{done}/{total} · {pct}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#D4A017] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button onClick={() => setNavOpen(o => !o)}
          className="flex items-center gap-1.5 text-xs text-[#5C6370] dark:text-zinc-400 hover:text-[#0D1B2A] dark:hover:text-white bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 px-3 py-1.5 rounded-xl transition-colors">
          {navOpen ? <X size={13} /> : <Menu size={13} />}
          <span className="hidden sm:block">Sections</span>
        </button>
        <button onClick={() => window.print()}
          className="flex items-center gap-1.5 text-xs text-[#5C6370] dark:text-zinc-400 hover:text-[#0D1B2A] dark:hover:text-white bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 px-3 py-1.5 rounded-xl transition-colors">
          <Printer size={13} />
          <span className="hidden sm:block">Print</span>
        </button>
        <button onClick={resetAll}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 px-3 py-1.5 rounded-xl transition-colors">
          <RotateCcw size={13} />
          <span className="hidden sm:block">Reset</span>
        </button>
      </div>

      {/* Section jump nav */}
      {navOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4">
          <p className="text-[10px] font-semibold text-[#5C6370] dark:text-zinc-500 uppercase tracking-widest mb-3">Jump to section</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
            {NAV_SECTIONS.map(({ id, label }) => (
              <a key={id} href={`#${id}`} onClick={() => setNavOpen(false)}
                className="text-xs text-[#1E4D8C] dark:text-blue-400 hover:text-[#D4A017] bg-[#F5F4EE] dark:bg-zinc-800 px-3 py-2 rounded-xl truncate transition-colors">
                {label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Render sections fetched from Supabase */}
      {sections.map(({ section_id, data }) =>
        data.wrapper === "hero" ? (
          <HeroSection key={section_id} sectionId={section_id} data={data} checks={checks} onCheck={onCheck} />
        ) : (
          <StandardSection key={section_id} sectionId={section_id} data={data} checks={checks} onCheck={onCheck} />
        )
      )}

    </div>
  );
}
