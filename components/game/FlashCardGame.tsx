"use client";

import { useState, useEffect } from "react";
import { Brain, ChevronRight, RotateCcw, Trophy, Zap, BookOpen, Star, Check, X } from "lucide-react";

type Deck = "microsoft365" | "copilotStudio" | "azureAI" | "powerPlatform" | "anthropic" | "ab730";

interface Card {
  id: string;
  question: string;
  answer: string;       // must exactly match one of the options
  explanation: string;  // shown in feedback after answering
  deck: Deck;
  options: string[];
}

const DECKS: Record<Deck, { label: string; color: string; icon: string }> = {
  microsoft365:  { label: "Microsoft 365 Copilot", color: "#0078d4", icon: "M"  },
  copilotStudio: { label: "Copilot Studio",         color: "#7719aa", icon: "CS" },
  azureAI:       { label: "Azure AI",               color: "#0062ad", icon: "Az" },
  powerPlatform: { label: "Power Platform",         color: "#742774", icon: "PP" },
  anthropic:     { label: "Anthropic & Claude",     color: "#c96442", icon: "Cl" },
  ab730:         { label: "AB-730 Exam Prep",       color: "#107c10", icon: "AB" },
};

const ALL_CARDS: Card[] = [
  // ── Microsoft 365 Copilot ──────────────────────────────────────────────────
  {
    id: "m1", deck: "microsoft365",
    question: "What is Microsoft 365 Copilot?",
    answer: "An AI assistant integrated into Microsoft 365 apps",
    explanation: "Microsoft 365 Copilot is embedded in apps like Word, Excel, Teams, and Outlook. It uses large language models grounded in your organisation's data via Microsoft Graph to help you work smarter.",
    options: ["A new Office suite", "An AI assistant integrated into Microsoft 365 apps", "A cloud storage service", "A project management tool"],
  },
  {
    id: "m2", deck: "microsoft365",
    question: "Which Microsoft 365 Copilot feature summarises missed Teams meetings?",
    answer: "Meeting Recap",
    explanation: "Meeting Recap (Copilot in Teams) generates summaries, action items, and key highlights from recorded or transcribed meetings, so you can catch up without watching the full recording.",
    options: ["Smart Reply", "Meeting Recap", "Focus Time", "Auto-Transcript"],
  },
  {
    id: "m3", deck: "microsoft365",
    question: "What does Copilot in Excel primarily help with?",
    answer: "Analysing data and generating formulas",
    explanation: "Copilot in Excel can analyse datasets, suggest and explain formulas, highlight trends, create charts, and answer natural-language questions about your spreadsheet data.",
    options: ["Writing emails", "Analysing data and generating formulas", "Scheduling meetings", "Creating presentations from scratch"],
  },
  {
    id: "m4", deck: "microsoft365",
    question: "What is Microsoft Graph's role in Microsoft 365 Copilot?",
    answer: "It connects Copilot to org data — emails, calendar, files, and chats",
    explanation: "Microsoft Graph is the data backbone that gives Copilot contextual awareness of your organisation's content: emails, meetings, chats, files, and contacts — all within your tenant's security boundary.",
    options: ["It powers the underlying AI model", "It connects Copilot to org data — emails, calendar, files, and chats", "It stores user credentials", "It manages Teams channels"],
  },
  {
    id: "m5", deck: "microsoft365",
    question: "What is Copilot Pages in Microsoft 365?",
    answer: "A collaborative canvas for editing and sharing Copilot responses",
    explanation: "Copilot Pages is a multiplayer canvas where AI-generated content can be edited, expanded, and shared as a living document — bridging Copilot responses and human collaboration.",
    options: ["A new Word template type", "A collaborative canvas for editing and sharing Copilot responses", "A SharePoint replacement", "A meeting notes format"],
  },
  {
    id: "m6", deck: "microsoft365",
    question: "What licence is required for Microsoft 365 Copilot?",
    answer: "Microsoft 365 Copilot add-on licence",
    explanation: "Microsoft 365 Copilot requires a paid add-on licence, available on top of Microsoft 365 E3, E5, Business Standard, or Business Premium subscriptions.",
    options: ["Any Microsoft 365 licence", "Microsoft 365 Copilot add-on licence", "Azure AD Premium only", "Dynamics 365 licence"],
  },

  // ── Copilot Studio ─────────────────────────────────────────────────────────
  {
    id: "cs1", deck: "copilotStudio",
    question: "What is Microsoft Copilot Studio?",
    answer: "A low-code platform for building custom AI copilots",
    explanation: "Copilot Studio (formerly Power Virtual Agents) is a low-code tool for designing, testing, and publishing custom AI copilots and chatbots using a visual canvas and generative AI capabilities.",
    options: ["A Teams plugin builder", "A low-code platform for building custom AI copilots", "An Azure ML tool", "A Dynamics 365 module"],
  },
  {
    id: "cs2", deck: "copilotStudio",
    question: "What are 'Topics' in Copilot Studio?",
    answer: "Conversation flows triggered by user intents",
    explanation: "Topics define how a copilot responds to specific triggers or user intents. Each topic is a flow built from nodes such as questions, messages, conditions, and actions.",
    options: ["AI training datasets", "Conversation flows triggered by user intents", "Plugin configurations", "API endpoints"],
  },
  {
    id: "cs3", deck: "copilotStudio",
    question: "How does Copilot Studio connect to external data?",
    answer: "Through connectors, Power Automate flows, and plugins",
    explanation: "Copilot Studio integrates with external systems via connectors, Power Automate cloud flows, and plugins that call REST APIs — enabling retrieval from SharePoint, Dataverse, and third-party services.",
    options: ["Only via SharePoint", "Through connectors, Power Automate flows, and plugins", "By importing CSV files", "Via Azure Blob Storage only"],
  },
  {
    id: "cs4", deck: "copilotStudio",
    question: "What is Generative Answers in Copilot Studio?",
    answer: "Dynamic AI answers sourced from a knowledge source without specific topics",
    explanation: "Generative Answers lets the copilot answer questions dynamically using a knowledge source (website, document, or SharePoint) powered by AI — without needing a manually authored topic for each question.",
    options: ["Auto-generated topic names", "Dynamic AI answers sourced from a knowledge source without specific topics", "GPT-4 direct integration", "A reporting dashboard feature"],
  },
  {
    id: "cs5", deck: "copilotStudio",
    question: "Where can a Copilot Studio copilot be published?",
    answer: "Teams, websites, SharePoint, mobile apps, and other channels",
    explanation: "A finished copilot can be deployed to Microsoft Teams, custom websites, SharePoint, mobile apps, Facebook Messenger, and other supported channels via the publishing settings.",
    options: ["Teams only", "Teams, websites, SharePoint, mobile apps, and other channels", "Azure Portal only", "Outlook and Word only"],
  },
  {
    id: "cs6", deck: "copilotStudio",
    question: "What is an 'Action' in Copilot Studio?",
    answer: "A task the copilot performs, like calling an API or running a flow",
    explanation: "Actions extend a copilot beyond conversation — they can call REST APIs, trigger Power Automate flows, query Dataverse, or run custom code to retrieve or update data in real time.",
    options: ["A keyboard shortcut", "A task the copilot performs, like calling an API or running a flow", "A topic trigger phrase", "A user permission level"],
  },

  // ── Azure AI ───────────────────────────────────────────────────────────────
  {
    id: "az1", deck: "azureAI",
    question: "What is Azure OpenAI Service?",
    answer: "Azure's enterprise access to OpenAI models with built-in security and compliance",
    explanation: "Azure OpenAI Service provides access to OpenAI models (GPT-4, DALL-E, Whisper, Embeddings) through Azure's infrastructure, with enterprise-grade security, compliance, private networking, and usage controls.",
    options: ["A free ChatGPT alternative", "Azure's enterprise access to OpenAI models with built-in security and compliance", "Azure's own in-house AI model", "A Python ML framework"],
  },
  {
    id: "az2", deck: "azureAI",
    question: "What is Azure AI Search?",
    answer: "A cloud search service with vector search and semantic ranking for RAG",
    explanation: "Azure AI Search supports full-text, vector, and hybrid search with semantic ranking, making it the retrieval layer in Retrieval-Augmented Generation (RAG) architectures alongside Azure OpenAI.",
    options: ["A Bing Search API wrapper", "A cloud search service with vector search and semantic ranking for RAG", "An Azure SQL feature", "A Teams enterprise search plugin"],
  },
  {
    id: "az3", deck: "azureAI",
    question: "What does RAG stand for in Azure AI?",
    answer: "Retrieval-Augmented Generation",
    explanation: "RAG is a pattern where the AI retrieves relevant documents from a knowledge store first, then generates an answer grounded in that retrieved content — reducing hallucinations and improving accuracy.",
    options: ["Rapid Agent Generation", "Retrieval-Augmented Generation", "Real-time API Gateway", "Recursive AI Graph"],
  },
  {
    id: "az4", deck: "azureAI",
    question: "What is Azure AI Foundry?",
    answer: "A unified platform for building, evaluating, and deploying AI applications",
    explanation: "Azure AI Foundry (formerly Azure AI Studio) is Microsoft's platform for building production AI apps — bringing together model catalogue, prompt flow, evaluations, safety tools, and deployment in one place.",
    options: ["An Azure data warehouse", "A unified platform for building, evaluating, and deploying AI applications", "An Azure DevOps plugin", "A low-code app builder"],
  },
  {
    id: "az5", deck: "azureAI",
    question: "What is prompt flow in Azure AI?",
    answer: "A tool for visually building and testing LLM-based workflows",
    explanation: "Prompt flow lets developers design, test, evaluate, and deploy LLM-based workflows by connecting prompts, tools, Python steps, and data sources in a visual DAG — and then track performance in CI/CD.",
    options: ["A CI/CD pipeline tool", "A tool for visually building and testing LLM-based workflows", "An Azure Functions feature", "A data ingestion pipeline"],
  },

  // ── Power Platform ─────────────────────────────────────────────────────────
  {
    id: "pp1", deck: "powerPlatform",
    question: "What are the four core products of Microsoft Power Platform?",
    answer: "Power Apps, Power Automate, Power BI, Power Pages",
    explanation: "The Power Platform family is: Power Apps (app builder), Power Automate (workflow automation), Power BI (analytics), and Power Pages (external websites). Copilot Studio is now also part of the family.",
    options: ["Teams, SharePoint, OneDrive, Outlook", "Power Apps, Power Automate, Power BI, Power Pages", "Azure, Dynamics, Microsoft 365, Teams", "PowerShell, Power Query, Power BI, Power Apps"],
  },
  {
    id: "pp2", deck: "powerPlatform",
    question: "What is Microsoft Dataverse?",
    answer: "A cloud data platform underlying Power Platform apps",
    explanation: "Dataverse is a scalable, secure, cloud-based data service that stores and manages structured data for Power Apps, Power Automate, Copilot Studio, and Dynamics 365 — with built-in security and business logic.",
    options: ["A SQL Server add-on", "A cloud data platform underlying Power Platform apps", "An Excel-based database", "An Azure Cosmos DB variant"],
  },
  {
    id: "pp3", deck: "powerPlatform",
    question: "What is a Power Automate flow trigger?",
    answer: "An event that starts an automated flow",
    explanation: "A trigger is the event that kicks off a Power Automate flow — e.g. a new email, a form submission, a file upload, a scheduled time, or a manual button press. Without a trigger, a flow cannot run.",
    options: ["A cloud function", "An event that starts an automated flow", "A Power Apps button component", "An API response object"],
  },
  {
    id: "pp4", deck: "powerPlatform",
    question: "What does Power BI's 'DirectQuery' mode do?",
    answer: "Queries the source database live on every report interaction",
    explanation: "In DirectQuery mode, Power BI sends a live query to the source database each time a visual loads or a filter is applied, ensuring real-time data — unlike Import mode which caches a snapshot.",
    options: ["Imports data on a scheduled refresh", "Queries the source database live on every report interaction", "Caches data in Azure Blob", "Enables offline report viewing"],
  },
  {
    id: "pp5", deck: "powerPlatform",
    question: "What is Copilot in Power Apps?",
    answer: "An AI that builds app screens and tables from natural language descriptions",
    explanation: "Copilot in Power Apps Studio lets makers describe what they want in plain language and generates app screens, Dataverse tables, and formulas automatically — accelerating low-code development.",
    options: ["A Power Apps marketplace plugin", "An AI that builds app screens and tables from natural language descriptions", "A data connector manager", "A UI theme generator"],
  },

  // ── Anthropic & Claude ─────────────────────────────────────────────────────
  {
    id: "an1", deck: "anthropic",
    question: "What is Anthropic's core AI safety training method called?",
    answer: "Constitutional AI",
    explanation: "Constitutional AI trains Claude using a set of written principles (a 'constitution') so the model can critique and revise its own outputs for safety — reducing reliance on human feedback for every edge case.",
    options: ["Ethical AI Framework", "Constitutional AI", "Safe Reinforcement Learning", "Responsible Scaling Policy"],
  },
  {
    id: "an2", deck: "anthropic",
    question: "What are Claude's properties listed in priority order?",
    answer: "Broadly safe, broadly ethical, adherent to principles, genuinely helpful",
    explanation: "Anthropic's priority order for Claude is: (1) Broadly safe, (2) Broadly ethical, (3) Adherent to Anthropic's principles, (4) Genuinely helpful. Safety comes before helpfulness.",
    options: ["Helpful, harmless, honest", "Broadly safe, broadly ethical, adherent to principles, genuinely helpful", "Fast, accurate, safe", "Truthful, kind, efficient"],
  },
  {
    id: "an3", deck: "anthropic",
    question: "What is Claude's maximum context window?",
    answer: "Up to 200,000 tokens",
    explanation: "Claude supports up to 200,000 tokens of context — roughly 150,000 words — enabling processing of entire codebases, legal documents, or long research papers in a single conversation.",
    options: ["4,096 tokens", "32,000 tokens", "Up to 200,000 tokens", "Unlimited tokens"],
  },
  {
    id: "an4", deck: "anthropic",
    question: "What is the Claude API's 'tool use' feature?",
    answer: "Lets Claude call external tools and APIs you define, then use the results",
    explanation: "Tool use (function calling) allows Claude to invoke developer-defined tools — like web search, database queries, or custom APIs — and incorporate the results into its response, enabling agentic workflows.",
    options: ["A way to chain multiple AI models", "Lets Claude call external tools and APIs you define, then use the results", "A file upload feature", "A streaming output mode"],
  },
  {
    id: "an5", deck: "anthropic",
    question: "What is prompt caching in Claude's API?",
    answer: "Caching repeated prompt prefixes to reduce cost and latency",
    explanation: "Prompt caching stores a repeated prefix (like a long system prompt or document) server-side so subsequent requests reuse it without reprocessing — cutting both cost and time-to-first-token significantly.",
    options: ["Saving prompts to a user database", "Caching repeated prompt prefixes to reduce cost and latency", "A rate limiting mechanism", "Storing full chat history server-side"],
  },
  {
    id: "an6", deck: "anthropic",
    question: "What does MCP stand for in the context of Claude?",
    answer: "Model Context Protocol",
    explanation: "Model Context Protocol is an open standard that lets Claude connect to external data sources, tools, and services (like file systems, databases, and APIs) through a standardised interface — enabling richer agentic use.",
    options: ["Multi-Claude Pipeline", "Model Context Protocol", "Managed Compute Platform", "Meta Cognitive Process"],
  },
  {
    id: "an7", deck: "anthropic",
    question: "What is Claude's 'extended thinking' feature?",
    answer: "Step-by-step reasoning in a scratchpad before the final answer",
    explanation: "Extended thinking gives Claude a private reasoning scratchpad to work through complex problems step by step before producing its visible response — improving accuracy on maths, logic, and multi-step tasks.",
    options: ["A longer streaming response mode", "Step-by-step reasoning in a scratchpad before the final answer", "A multi-turn persistent memory feature", "A slower but cheaper API tier"],
  },

  // ── AB-730: Understand generative AI fundamentals (25–30%) ─────────────────
  {
    id: "ab1", deck: "ab730",
    question: "How does Microsoft 365 Copilot keep your organisation's data private?",
    answer: "It operates within your tenant boundary and your data is never used to train AI models",
    explanation: "Copilot processes your data within your Microsoft 365 tenant. Your prompts, responses, and content are protected by Microsoft's enterprise compliance controls and are never used to retrain the underlying AI models.",
    options: ["It anonymises all prompts before sending them to OpenAI", "It operates within your tenant boundary and your data is never used to train AI models", "It stores data in a separate encrypted silo outside Microsoft", "It requires manual data classification before use"],
  },
  {
    id: "ab2", deck: "ab730",
    question: "What is the key difference between a Copilot chat experience and an agent experience?",
    answer: "Chat is general-purpose; agents are purpose-built with specific knowledge and tasks",
    explanation: "A chat experience is an open-ended AI conversation. An agent is a configured copilot with defined knowledge sources, instructions, and capabilities — designed to handle a specific workflow or domain.",
    options: ["Chat is faster; agents are slower", "Chat is general-purpose; agents are purpose-built with specific knowledge and tasks", "Chat requires a licence; agents are free", "Chat uses GPT-4; agents use a smaller model"],
  },
  {
    id: "ab3", deck: "ab730",
    question: "What is a 'fabrication' (hallucination) in generative AI?",
    answer: "When the AI generates plausible but factually incorrect content",
    explanation: "Fabrications occur when an AI model produces confident-sounding responses that contain invented facts, fake citations, or incorrect data — a key risk to verify through citation checks and human review.",
    options: ["When the AI refuses to answer a question", "When the AI generates plausible but factually incorrect content", "When the AI repeats the same answer twice", "When the AI is too slow to respond"],
  },
  {
    id: "ab4", deck: "ab730",
    question: "What is prompt injection?",
    answer: "Malicious instructions in external content that manipulate AI behaviour",
    explanation: "Prompt injection is an attack where hidden instructions inside a document, webpage, or email are processed by the AI and cause it to take unintended actions — a key risk when Copilot reads external content.",
    options: ["Adding too many instructions to a single prompt", "Malicious instructions in external content that manipulate AI behaviour", "Injecting executable code into a Copilot response", "Using profanity or sensitive words in a prompt"],
  },
  {
    id: "ab5", deck: "ab730",
    question: "How does context affect Microsoft 365 Copilot responses?",
    answer: "Context from files, the app you're using, and web data shapes relevance and accuracy",
    explanation: "Copilot tailors responses using the context of your prompt, any referenced files, the Microsoft 365 app you're in, and available web data. Richer, more specific context consistently produces better results.",
    options: ["Context has no measurable effect on AI responses", "Context from files, the app you're using, and web data shapes relevance and accuracy", "Only the Microsoft 365 app context matters", "Only web search data affects Copilot responses"],
  },

  // ── AB-730: Manage prompts and conversations (35–40%) ──────────────────────
  {
    id: "ab6", deck: "ab730",
    question: "What are the key components of an effective Microsoft 365 Copilot prompt?",
    answer: "Goal, Context, Expectations, and Source (GCES)",
    explanation: "Microsoft's framework for effective prompts is GCES: a clear Goal (what you want), Context (relevant background), Expectations (format/tone/length), and Source (which files or data to reference).",
    options: ["Just a clear question", "Goal, Context, Expectations, and Source (GCES)", "A keyword list and user name", "A template ID and output language"],
  },
  {
    id: "ab7", deck: "ab730",
    question: "Where can you save and reuse prompts in Microsoft 365 Copilot?",
    answer: "The Copilot prompt gallery",
    explanation: "The Copilot prompt gallery lets you save prompts you've crafted, browse prompts shared by Microsoft and your organisation, and access them across Microsoft 365 apps for reuse or scheduling.",
    options: ["A Word document saved to OneDrive", "The Copilot prompt gallery", "A pinned Teams message", "A OneNote notebook section"],
  },
  {
    id: "ab8", deck: "ab730",
    question: "When should you use the Agent Store instead of creating a new agent?",
    answer: "When a pre-built agent already meets your needs",
    explanation: "The Agent Store provides ready-made agents for common scenarios. You should create a custom agent only when you need specific knowledge, tailored instructions, or workflows not available in existing agents.",
    options: ["Always — the Agent Store is always the best option", "When a pre-built agent already meets your needs", "Only IT admins should ever create new agents", "When you need an agent to work offline"],
  },
  {
    id: "ab9", deck: "ab730",
    question: "What can you configure when creating a Microsoft 365 Copilot agent?",
    answer: "Knowledge sources, instructions, suggested prompts, capabilities, and sharing",
    explanation: "When building an agent you configure: knowledge sources (SharePoint, websites), system instructions (behaviour and tone), suggested starter prompts, capabilities (web search, image generation), and who can access it.",
    options: ["Only the agent's name and icon", "Knowledge sources, instructions, suggested prompts, capabilities, and sharing", "Only which Microsoft 365 apps it can access", "The underlying AI model version only"],
  },
  {
    id: "ab10", deck: "ab730",
    question: "What happens when you add a Copilot conversation to a notebook?",
    answer: "It saves the conversation as an editable document in a Copilot Pages notebook",
    explanation: "Adding a conversation to a notebook creates a persistent, editable Copilot Pages document — so you and your team can continue refining the AI-generated content, add notes, and link it to other work.",
    options: ["It permanently deletes the chat history", "It saves the conversation as an editable document in a Copilot Pages notebook", "It exports the chat to an Outlook email", "It creates a new shared Teams channel"],
  },

  // ── AB-730: Draft and analyse business content (25–30%) ───────────────────
  {
    id: "ab11", deck: "ab730",
    question: "How do you generate a Word document from an existing file using Copilot?",
    answer: "Reference the existing file with '/' in the Copilot prompt inside Word",
    explanation: "In Word, type '/' in a Copilot prompt to reference an existing file (e.g. '/Q3-Report.docx'). Copilot uses that document's content to draft a new document, summary, or reformatted version.",
    options: ["Copy and paste content into the prompt manually", "Reference the existing file with '/' in the Copilot prompt inside Word", "Upload the file to a Copilot web portal", "Email the file to a Copilot address"],
  },
  {
    id: "ab12", deck: "ab730",
    question: "How does Copilot assist during a Microsoft Teams meeting?",
    answer: "It takes real-time notes, summarises discussions, and suggests action items",
    explanation: "During a Teams meeting, Copilot can take live notes, answer questions about what was said, summarise the discussion so far, suggest action items, and produce a full recap after the meeting ends.",
    options: ["It can only transcribe audio to text", "It takes real-time notes, summarises discussions, and suggests action items", "It only works in pre-scheduled calendar meetings", "It translates meetings into other languages in real time"],
  },
  {
    id: "ab13", deck: "ab730",
    question: "What is Copilot Pages used for in a team collaboration context?",
    answer: "A multiplayer canvas for co-editing AI-generated content in real time",
    explanation: "Copilot Pages is a shared, editable canvas where team members can collaboratively refine AI-generated content, add their own context, and build on each other's contributions — in real time.",
    options: ["It replaces SharePoint document libraries", "A multiplayer canvas for co-editing AI-generated content in real time", "A read-only view of Copilot conversation history", "A meeting scheduling and room-booking tool"],
  },
  {
    id: "ab14", deck: "ab730",
    question: "What does 'moving data and insights between Microsoft 365 apps' with Copilot mean?",
    answer: "Using Copilot to carry insights from one app to create content in another",
    explanation: "Copilot can take data from one Microsoft 365 app (e.g. an Excel table or an email thread) and use it to generate content in another (e.g. a PowerPoint deck or a Word report) — eliminating manual copy-paste work.",
    options: ["Automatically syncing files between OneDrive and SharePoint", "Using Copilot to carry insights from one app to create content in another", "Migrating data between two Microsoft tenants", "Exporting Teams chat history to an Excel spreadsheet"],
  },
  {
    id: "ab15", deck: "ab730",
    question: "What score is required to pass the AB-730 exam, and how long is it?",
    answer: "700 or greater (out of 1000), 45 minutes",
    explanation: "The AB-730 AI Business Professional exam requires a score of 700/1000 to pass and must be completed within 45 minutes. It is proctored and may include interactive question types.",
    options: ["500 or greater, 60 minutes", "650 or greater, 30 minutes", "700 or greater (out of 1000), 45 minutes", "800 or greater, 90 minutes"],
  },
];

type GameMode = "menu" | "quiz" | "result";

interface QuizState {
  cards: Card[];
  index: number;
  selected: string | null;
  correct: boolean | null;
  score: number;
  streak: number;
  bestStreak: number;
  xp: number;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function FlashCardGame() {
  const [mode, setMode] = useState<GameMode>("menu");
  const [activeDeck, setActiveDeck] = useState<Deck | "all">("all");
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem("focal_learn_xp");
    const mastered = localStorage.getItem("focal_learn_mastered");
    if (saved) setTotalXP(parseInt(saved));
    if (mastered) setMasteredCards(new Set(JSON.parse(mastered)));
  }, []);

  function saveProgress(xp: number, mastered: Set<string>) {
    localStorage.setItem("focal_learn_xp", String(xp));
    localStorage.setItem("focal_learn_mastered", JSON.stringify([...mastered]));
  }

  function startQuiz(deck: Deck | "all") {
    setActiveDeck(deck);
    const pool = deck === "all" ? ALL_CARDS : ALL_CARDS.filter(c => c.deck === deck);
    const cards = shuffle(pool).slice(0, 10);
    setQuiz({ cards, index: 0, selected: null, correct: null, score: 0, streak: 0, bestStreak: 0, xp: 0 });
    setMode("quiz");
  }

  function handleAnswer(option: string) {
    if (!quiz || quiz.selected) return;
    const card = quiz.cards[quiz.index];
    const correct = option === card.answer;
    const xpEarned = correct ? (quiz.streak >= 2 ? 20 : 10) : 0;
    const newStreak = correct ? quiz.streak + 1 : 0;
    const newBestStreak = Math.max(newStreak, quiz.bestStreak);
    const newMastered = new Set(masteredCards);
    if (correct) newMastered.add(card.id);
    const newTotalXP = totalXP + xpEarned;
    setMasteredCards(newMastered);
    setTotalXP(newTotalXP);
    saveProgress(newTotalXP, newMastered);
    setQuiz(q => q ? { ...q, selected: option, correct, score: correct ? q.score + 1 : q.score, streak: newStreak, bestStreak: newBestStreak, xp: q.xp + xpEarned } : null);
  }

  function next() {
    if (!quiz) return;
    if (quiz.index + 1 >= quiz.cards.length) setMode("result");
    else setQuiz(q => q ? { ...q, index: q.index + 1, selected: null, correct: null } : null);
  }

  const level = Math.floor(totalXP / 100) + 1;
  const xpInLevel = totalXP % 100;

  // ── Menu ──────────────────────────────────────────────────────────────────
  if (mode === "menu") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">Learn</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">AI platform flash cards — Microsoft & Anthropic</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1d1d1f] dark:bg-white flex items-center justify-center">
                <span className="text-xs font-bold text-white dark:text-[#1d1d1f]">{level}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Level {level}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">{totalXP} XP total</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400">
              <Star size={14} className="text-yellow-500" />
              {masteredCards.size} mastered
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#0071e3] rounded-full transition-all duration-500" style={{ width: `${xpInLevel}%` }} />
          </div>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5">{xpInLevel}/100 XP to Level {level + 1}</p>
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Choose a deck</h2>
          <div className="space-y-2">
            <button
              onClick={() => startQuiz("all")}
              className="w-full flex items-center justify-between p-4 bg-[#1d1d1f] dark:bg-white rounded-2xl text-white dark:text-[#1d1d1f] hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <Brain size={20} />
                <div className="text-left">
                  <p className="font-semibold">All Decks</p>
                  <p className="text-xs opacity-80">{ALL_CARDS.length} cards · Mixed quiz</p>
                </div>
              </div>
              <ChevronRight size={18} />
            </button>

            {(Object.entries(DECKS) as [Deck, typeof DECKS[Deck]][]).map(([key, deck]) => {
              const deckCards = ALL_CARDS.filter(c => c.deck === key);
              const masteredCount = deckCards.filter(c => masteredCards.has(c.id)).length;
              return (
                <button
                  key={key}
                  onClick={() => startQuiz(key)}
                  className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: deck.color }}>
                      {deck.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{deck.label}</p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500">{deckCards.length} cards · {masteredCount}/{deckCards.length} mastered</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {masteredCount === deckCards.length && <Trophy size={14} className="text-yellow-500" />}
                    <div className="w-12 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(masteredCount / deckCards.length) * 100}%`, backgroundColor: deck.color }} />
                    </div>
                    <ChevronRight size={16} className="text-gray-300 dark:text-zinc-600" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  if (mode === "quiz" && quiz) {
    const card = quiz.cards[quiz.index];
    const deck = DECKS[card.deck];
    const progress = ((quiz.index + (quiz.selected ? 1 : 0)) / quiz.cards.length) * 100;

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <button onClick={() => setMode("menu")} className="text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300">
            ← Back
          </button>
          <div className="flex items-center gap-3">
            {quiz.streak >= 2 && (
              <div className="flex items-center gap-1 text-orange-500 text-sm font-medium">
                <Zap size={14} />{quiz.streak} streak
              </div>
            )}
            <span className="text-sm text-gray-400 dark:text-zinc-500">{quiz.index + 1}/{quiz.cards.length}</span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#0071e3] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: deck.color }}>
            {deck.icon}
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">{deck.label}</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
          <div className="flex items-start gap-3">
            <BookOpen size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-lg font-medium text-gray-900 dark:text-white leading-snug">{card.question}</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {card.options.map(option => {
            const isSelected = quiz.selected === option;
            const isCorrect = option === card.answer;
            let style = "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-600";
            if (quiz.selected) {
              if (isCorrect) style = "bg-green-50 dark:bg-green-950 border-green-400 dark:border-green-600 text-green-800 dark:text-green-200";
              else if (isSelected) style = "bg-red-50 dark:bg-red-950 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200";
              else style = "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 opacity-50";
            }
            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={!!quiz.selected}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${style}`}
              >
                <span className="text-sm font-medium leading-snug">{option}</span>
                {quiz.selected && isCorrect && <Check size={16} className="text-green-600 flex-shrink-0 ml-2" />}
                {quiz.selected && isSelected && !isCorrect && <X size={16} className="text-red-500 flex-shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>

        {quiz.selected && (
          <div className={`rounded-2xl p-4 ${quiz.correct ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className={`text-sm font-semibold mb-1 ${quiz.correct ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}>
                  {quiz.correct ? `Correct! +${quiz.streak >= 2 ? "20" : "10"} XP${quiz.streak >= 2 ? " 🔥 Streak bonus!" : ""}` : `Not quite — correct answer: ${card.answer}`}
                </p>
                <p className={`text-xs leading-relaxed ${quiz.correct ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                  {card.explanation}
                </p>
              </div>
              <button
                onClick={next}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 ${quiz.correct ? "bg-green-600" : "bg-red-500"}`}
              >
                {quiz.index + 1 >= quiz.cards.length ? "Finish" : "Next"}
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (mode === "result" && quiz) {
    const pct = Math.round((quiz.score / quiz.cards.length) * 100);
    const grade = pct >= 90 ? "Outstanding" : pct >= 70 ? "Great work" : pct >= 50 ? "Good effort" : "Keep practising";
    return (
      <div className="max-w-md mx-auto space-y-6 text-center">
        <div className="pt-4">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <Trophy size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{grade}</h2>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">Quiz complete</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Score", value: `${quiz.score}/${quiz.cards.length}` },
            { label: "Accuracy", value: `${pct}%` },
            { label: "XP earned", value: `+${quiz.xp}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800">
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {quiz.bestStreak >= 3 && (
          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-2xl p-4">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              🔥 Best streak: {quiz.bestStreak} in a row!
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => startQuiz(activeDeck)}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <RotateCcw size={16} /> Play again
          </button>
          <button
            onClick={() => setMode("menu")}
            className="flex-1 px-5 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 rounded-2xl font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Change deck
          </button>
        </div>
      </div>
    );
  }

  return null;
}
