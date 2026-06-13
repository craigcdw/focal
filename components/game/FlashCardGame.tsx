"use client";

import { useState, useEffect, useCallback } from "react";
import { Brain, ChevronRight, RotateCcw, Trophy, Zap, BookOpen, Star, Check, X } from "lucide-react";

type Deck = "microsoft365" | "copilotStudio" | "azureAI" | "powerPlatform" | "anthropic" | "ab730";

interface Card {
  id: string;
  question: string;
  answer: string;
  deck: Deck;
  options: string[];
}

const DECKS: Record<Deck, { label: string; color: string; bg: string; darkBg: string; icon: string }> = {
  microsoft365: {
    label: "Microsoft 365 Copilot",
    color: "#0078d4",
    bg: "bg-blue-50",
    darkBg: "dark:bg-blue-950",
    icon: "M",
  },
  copilotStudio: {
    label: "Copilot Studio",
    color: "#7719aa",
    bg: "bg-purple-50",
    darkBg: "dark:bg-purple-950",
    icon: "CS",
  },
  azureAI: {
    label: "Azure AI",
    color: "#0062ad",
    bg: "bg-sky-50",
    darkBg: "dark:bg-sky-950",
    icon: "Az",
  },
  powerPlatform: {
    label: "Power Platform",
    color: "#742774",
    bg: "bg-fuchsia-50",
    darkBg: "dark:bg-fuchsia-950",
    icon: "PP",
  },
  anthropic: {
    label: "Anthropic & Claude",
    color: "#c96442",
    bg: "bg-orange-50",
    darkBg: "dark:bg-orange-950",
    icon: "Cl",
  },
  ab730: {
    label: "AB-730 Exam Prep",
    color: "#107c10",
    bg: "bg-green-50",
    darkBg: "dark:bg-green-950",
    icon: "AB",
  },
};

const ALL_CARDS: Card[] = [
  // Microsoft 365 Copilot
  { id: "m1", deck: "microsoft365", question: "What is Microsoft 365 Copilot?", answer: "An AI assistant integrated into Microsoft 365 apps like Word, Excel, Teams, and Outlook that uses large language models to help users work smarter.", options: ["A new Office suite", "An AI assistant in Microsoft 365 apps", "A cloud storage service", "A project management tool"] },
  { id: "m2", deck: "microsoft365", question: "Which Microsoft 365 Copilot feature summarises missed Teams meetings?", answer: "Meeting Recap — Copilot in Teams generates summaries, action items, and highlights from recorded meetings.", options: ["Smart Reply", "Meeting Recap", "Focus Time", "Auto-Transcript"] },
  { id: "m3", deck: "microsoft365", question: "What does Copilot in Excel help with?", answer: "Analysing data, generating formulas, creating charts, and explaining trends in natural language.", options: ["Writing emails", "Analysing data and generating formulas", "Scheduling meetings", "Creating presentations from scratch"] },
  { id: "m4", deck: "microsoft365", question: "What is Microsoft Graph's role in Microsoft 365 Copilot?", answer: "Microsoft Graph connects Copilot to your organisation's data — emails, calendar, files, and chats — to provide contextually relevant responses.", options: ["It powers the AI model", "It connects Copilot to org data via emails, calendar, and files", "It stores user credentials", "It manages Teams channels"] },
  { id: "m5", deck: "microsoft365", question: "What is Copilot Pages in Microsoft 365?", answer: "A collaborative canvas where Copilot responses can be edited, expanded, and shared as living documents across your team.", options: ["A new Word template", "A collaborative canvas for Copilot responses", "A SharePoint replacement", "A meeting notes format"] },
  { id: "m6", deck: "microsoft365", question: "What licence is required for Microsoft 365 Copilot?", answer: "A Microsoft 365 Copilot licence (add-on), available on top of Microsoft 365 E3, E5, Business Standard, or Business Premium plans.", options: ["Any Microsoft 365 licence", "Microsoft 365 Copilot add-on licence", "Azure AD Premium only", "Dynamics 365 licence"] },

  // Copilot Studio
  { id: "cs1", deck: "copilotStudio", question: "What is Microsoft Copilot Studio?", answer: "A low-code platform for building, testing, and publishing custom AI copilots and chatbots, formerly known as Power Virtual Agents.", options: ["A Teams plugin builder", "A low-code platform for building custom AI copilots", "An Azure ML tool", "A Dynamics 365 module"] },
  { id: "cs2", deck: "copilotStudio", question: "What are 'Topics' in Copilot Studio?", answer: "Topics are conversation flows — they define how a copilot responds to specific triggers or user intents using nodes like questions, messages, and actions.", options: ["AI training datasets", "Conversation flows triggered by user intents", "Plugin configurations", "API endpoints"] },
  { id: "cs3", deck: "copilotStudio", question: "How does Copilot Studio connect to external data?", answer: "Through connectors, Power Automate flows, and plugins that call APIs or retrieve data from SharePoint, Dataverse, and third-party services.", options: ["Only via SharePoint", "Through connectors, Power Automate flows, and plugins", "By importing CSV files", "Via Azure Blob Storage only"] },
  { id: "cs4", deck: "copilotStudio", question: "What is Generative Answers in Copilot Studio?", answer: "A feature that allows the copilot to answer questions dynamically from a knowledge source (like a website or document) using AI, without creating specific topics.", options: ["Auto-generated topic names", "Dynamic AI answers from a knowledge source", "GPT-4 integration", "A reporting feature"] },
  { id: "cs5", deck: "copilotStudio", question: "Where can a Copilot Studio copilot be published?", answer: "Microsoft Teams, websites, SharePoint, mobile apps, Facebook, and other channels via the publishing settings.", options: ["Teams only", "Teams, websites, SharePoint, mobile apps, and more", "Azure Portal only", "Outlook and Word only"] },
  { id: "cs6", deck: "copilotStudio", question: "What is an 'Action' in Copilot Studio?", answer: "An action lets the copilot perform tasks beyond conversation — like calling an API, running a Power Automate flow, or querying a database.", options: ["A keyboard shortcut", "A task the copilot performs like calling an API or flow", "A topic trigger", "A user permission level"] },

  // Azure AI
  { id: "az1", deck: "azureAI", question: "What is Azure OpenAI Service?", answer: "A Microsoft Azure service that provides access to OpenAI models (GPT-4, DALL-E, Whisper) with enterprise security, compliance, and Azure integrations.", options: ["A free ChatGPT alternative", "Azure service with enterprise access to OpenAI models", "Azure's own AI model", "A Python ML framework"] },
  { id: "az2", deck: "azureAI", question: "What is Azure AI Search?", answer: "A cloud search service with AI capabilities including vector search, semantic ranking, and integration with LLMs for retrieval-augmented generation (RAG).", options: ["A Bing API", "A cloud search service with AI and vector search for RAG", "An Azure SQL feature", "A Teams search plugin"] },
  { id: "az3", deck: "azureAI", question: "What does RAG stand for in Azure AI?", answer: "Retrieval-Augmented Generation — a pattern where an AI model retrieves relevant documents first, then generates answers grounded in that data.", options: ["Rapid Agent Generation", "Retrieval-Augmented Generation", "Real-time API Gateway", "Recursive AI Graph"] },
  { id: "az4", deck: "azureAI", question: "What is Azure AI Foundry?", answer: "Microsoft's unified platform for building, evaluating, and deploying AI applications and agents, bringing together models, tools, and safety features.", options: ["An Azure data warehouse", "A unified platform for building and deploying AI apps", "An Azure DevOps plugin", "A low-code app builder"] },
  { id: "az5", deck: "azureAI", question: "What is prompt flow in Azure AI?", answer: "A development tool for building, testing, and evaluating LLM-based workflows by visually connecting prompts, tools, and data sources.", options: ["A CI/CD pipeline tool", "A tool for building and testing LLM workflows visually", "An Azure Functions feature", "A data ingestion pipeline"] },

  // Power Platform
  { id: "pp1", deck: "powerPlatform", question: "What are the four core products of Microsoft Power Platform?", answer: "Power Apps, Power Automate, Power BI, and Power Pages — with Copilot Studio now also part of the family.", options: ["Teams, SharePoint, OneDrive, Outlook", "Power Apps, Power Automate, Power BI, Power Pages", "Azure, Dynamics, Microsoft 365, Teams", "Power Shell, Power Query, Power BI, Power Apps"] },
  { id: "pp2", deck: "powerPlatform", question: "What is Microsoft Dataverse?", answer: "A cloud-based data platform underlying Power Platform that stores and manages data used by Power Apps, Power Automate, and Copilot Studio.", options: ["A SQL Server add-on", "A cloud data platform for Power Platform apps", "An Excel-based database", "An Azure Cosmos DB variant"] },
  { id: "pp3", deck: "powerPlatform", question: "What is a Power Automate flow trigger?", answer: "An event that starts a flow — such as a new email arriving, a form submission, a scheduled time, or a button press.", options: ["A cloud function", "An event that starts an automated flow", "A Power Apps button", "An API response"] },
  { id: "pp4", deck: "powerPlatform", question: "What does Power BI's 'DirectQuery' mode do?", answer: "Instead of importing data, DirectQuery queries the source database in real time every time a report visual is loaded, ensuring live data.", options: ["Imports data on a schedule", "Queries the source database live on every report load", "Caches data in Azure", "Enables offline reports"] },
  { id: "pp5", deck: "powerPlatform", question: "What is Copilot in Power Apps?", answer: "An AI assistant in Power Apps Studio that helps build apps by describing what you want in natural language, generating screens, tables, and formulas.", options: ["A Power Apps plugin", "An AI that builds apps from natural language descriptions", "A data connector", "A UI theme generator"] },

  // Anthropic & Claude
  { id: "an1", deck: "anthropic", question: "What is Anthropic's core safety principle called?", answer: "Constitutional AI — a method where Claude is trained to be helpful, harmless, and honest using a set of principles rather than only human feedback.", options: ["Ethical AI Framework", "Constitutional AI", "Safe Reinforcement Learning", "Responsible Scaling"] },
  { id: "an2", deck: "anthropic", question: "What are Claude's three core properties in order of priority?", answer: "Broadly safe first, broadly ethical second, adherent to Anthropic's principles third, and genuinely helpful fourth.", options: ["Helpful, harmless, honest", "Broadly safe, broadly ethical, adherent to principles, helpful", "Fast, accurate, safe", "Truthful, kind, efficient"] },
  { id: "an3", deck: "anthropic", question: "What is Claude's context window?", answer: "Claude supports up to 200,000 tokens of context — roughly 150,000 words — allowing it to process long documents, codebases, and conversations.", options: ["4,096 tokens", "32,000 tokens", "Up to 200,000 tokens", "Unlimited tokens"] },
  { id: "an4", deck: "anthropic", question: "What is the Claude API's 'tool use' feature?", answer: "Tool use (function calling) lets Claude call external tools or APIs you define — like searching the web, running code, or querying a database — and use the results in its response.", options: ["A way to use multiple AI models", "Lets Claude call external tools/APIs you define", "A file upload feature", "A streaming mode"] },
  { id: "an5", deck: "anthropic", question: "What is prompt caching in Claude's API?", answer: "Prompt caching stores repeated parts of a prompt (like a long system prompt or document) so subsequent requests reuse the cached version, reducing cost and latency.", options: ["Saving prompts to a database", "Caching repeated prompt prefixes to reduce cost and latency", "A rate limiting feature", "Storing chat history"] },
  { id: "an6", deck: "anthropic", question: "What does MCP stand for in the context of Claude?", answer: "Model Context Protocol — an open standard that lets Claude connect to external data sources, tools, and services through a standardised interface.", options: ["Multi-Claude Pipeline", "Model Context Protocol", "Managed Compute Platform", "Meta Cognitive Process"] },
  { id: "an7", deck: "anthropic", question: "What is Claude's 'extended thinking' feature?", answer: "Extended thinking lets Claude reason through complex problems step by step in a scratchpad before giving its final answer, improving accuracy on hard tasks.", options: ["A longer response mode", "Step-by-step reasoning before the final answer", "A multi-turn memory feature", "A slower streaming mode"] },

  // AB-730: Understand generative AI fundamentals (25–30%)
  { id: "ab1", deck: "ab730", question: "How does Microsoft 365 Copilot keep your organisation's information private?", answer: "Copilot operates within your Microsoft 365 tenant boundary — your data is not used to train the underlying AI models and is protected by Microsoft's enterprise compliance and data protection controls.", options: ["It anonymises all prompts before sending them", "It operates within your tenant boundary and data is never used to train AI models", "It stores data in a separate encrypted silo", "It requires manual data classification before use"] },
  { id: "ab2", deck: "ab730", question: "What is the difference between a Copilot chat experience and an agent experience?", answer: "A chat experience is a general-purpose AI conversation, while an agent experience is a purpose-built copilot configured with specific knowledge, instructions, and capabilities for a defined task or workflow.", options: ["Chat is faster; agents are slower", "Chat is general-purpose; agents are purpose-built with specific knowledge and tasks", "Chat requires a licence; agents are free", "Chat uses GPT-4; agents use GPT-3.5"] },
  { id: "ab3", deck: "ab730", question: "What is a 'fabrication' (hallucination) risk in generative AI?", answer: "A fabrication is when an AI model generates content that sounds plausible but is factually incorrect — such as inventing citations, statistics, or details that do not exist.", options: ["When the AI refuses to answer", "When the AI generates plausible but factually incorrect content", "When the AI repeats the same answer twice", "When the AI is too slow to respond"] },
  { id: "ab4", deck: "ab730", question: "What is prompt injection in the context of responsible AI?", answer: "Prompt injection is an attack where malicious instructions hidden in external content (like a webpage or document) manipulate the AI into performing unintended actions.", options: ["Adding too many instructions to a prompt", "Malicious instructions in external content that manipulate AI behaviour", "Injecting code into a Copilot response", "Using profanity in a prompt"] },
  { id: "ab5", deck: "ab730", question: "How does the context you provide affect Copilot responses?", answer: "Copilot uses the context of your prompt, referenced files, web data, and the app you're using to tailor its responses — more specific context produces more relevant and accurate results.", options: ["Context has no effect on AI responses", "Context from files, web data, and the app shapes the relevance and accuracy of responses", "Only the app context matters", "Only web data affects Copilot responses"] },

  // AB-730: Manage prompts and conversations (35–40%)
  { id: "ab6", deck: "ab730", question: "What are the key components of an effective Copilot prompt?", answer: "An effective prompt includes a clear goal, relevant context, the right persona or tone, and specific output format expectations — often remembered as Goal, Context, Expectations, Source (GCES).", options: ["Just a clear question", "Goal, context, expected format, and relevant sources", "A keyword list", "A template ID and user name"] },
  { id: "ab7", deck: "ab730", question: "How can you save a prompt in Microsoft 365 Copilot?", answer: "You can save prompts in the Copilot prompt gallery — accessible via Copilot in Microsoft 365 — to reuse, share, or schedule them later.", options: ["Save it as a Word document", "Use the Copilot prompt gallery to save and reuse prompts", "Copy it to OneNote manually", "Pin it in Teams chat"] },
  { id: "ab8", deck: "ab730", question: "When should you use the Agent Store instead of creating a new agent?", answer: "Use the Agent Store when a pre-built agent already meets your needs — creating a new agent is appropriate when you need custom knowledge, specific instructions, or workflows not available in existing agents.", options: ["Always use the Agent Store to save time", "Use Agent Store for existing needs; create new agents for custom knowledge or workflows", "Create a new agent whenever possible", "Only IT admins can use the Agent Store"] },
  { id: "ab9", deck: "ab730", question: "What can you configure when creating a Microsoft 365 Copilot agent?", answer: "You can configure the agent's knowledge sources, instructions (system prompt), suggested prompts, capabilities (like web search or code interpreter), and sharing permissions.", options: ["Only the agent's name and icon", "Knowledge sources, instructions, suggested prompts, capabilities, and sharing", "Only which Microsoft 365 apps it can access", "The AI model version only"] },
  { id: "ab10", deck: "ab730", question: "What does adding a conversation to a Copilot notebook do?", answer: "It saves the conversation as a persistent, editable document in a Copilot Pages notebook, so you can continue refining it, share it, or link it to other content.", options: ["It deletes the chat history", "It saves the conversation as an editable document in a Copilot Pages notebook", "It exports the chat to Outlook", "It creates a new Teams channel"] },

  // AB-730: Draft and analyse business content (25–30%)
  { id: "ab11", deck: "ab730", question: "How can Copilot generate a document from an existing file?", answer: "In Word, you can reference an existing document in your prompt (e.g. 'based on /filename.docx') and Copilot will use its content to draft a new document, summary, or reformatted version.", options: ["Only by copy-pasting content into the prompt", "By referencing an existing file in the prompt using '/' in Word", "By uploading a file to Copilot's portal", "By emailing the file to Copilot"] },
  { id: "ab12", deck: "ab730", question: "How does Copilot assist in Microsoft Teams meetings?", answer: "Copilot in Teams can take real-time notes, summarise what's been discussed, suggest action items, answer questions about the meeting content, and generate a recap after the call.", options: ["It can only transcribe audio", "It takes notes, summarises discussions, suggests actions, and generates recaps", "It only works in scheduled meetings", "It translates meetings into other languages"] },
  { id: "ab13", deck: "ab730", question: "What is Copilot Pages used for in a collaboration context?", answer: "Copilot Pages is a multiplayer canvas where team members can co-edit AI-generated content, add context, and refine outputs together in real time — bridging AI responses and human collaboration.", options: ["It replaces SharePoint document libraries", "A multiplayer canvas for co-editing AI-generated content in real time", "A read-only view of Copilot responses", "A meeting scheduling tool"] },
  { id: "ab14", deck: "ab730", question: "What does 'move data and insights between Microsoft 365 apps' with Copilot mean?", answer: "Copilot can take information from one app (e.g. an Excel table or email thread) and use it to create content in another (e.g. a PowerPoint deck or Word summary) — reducing manual copy-paste work.", options: ["Automatically syncing files between OneDrive and SharePoint", "Using Copilot to transfer insights from one app to create content in another", "Migrating data between tenants", "Exporting Teams chats to Excel"] },
  { id: "ab15", deck: "ab730", question: "What score is required to pass the AB-730 AI Business Professional exam?", answer: "A score of 700 or greater (out of 1000) is required to pass the AB-730 exam. You have 45 minutes to complete the assessment.", options: ["500 or greater", "650 or greater", "700 or greater", "800 or greater"] },
];

type GameMode = "menu" | "quiz" | "flashcard" | "result";

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
    const cards = shuffle(deck === "all" ? ALL_CARDS : ALL_CARDS.filter(c => c.deck === deck)).slice(0, 10);
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

    setQuiz(q => q ? {
      ...q,
      selected: option,
      correct,
      score: correct ? q.score + 1 : q.score,
      streak: newStreak,
      bestStreak: newBestStreak,
      xp: q.xp + xpEarned,
    } : null);
  }

  function next() {
    if (!quiz) return;
    if (quiz.index + 1 >= quiz.cards.length) {
      setMode("result");
    } else {
      setQuiz(q => q ? { ...q, index: q.index + 1, selected: null, correct: null } : null);
    }
  }

  const level = Math.floor(totalXP / 100) + 1;
  const xpInLevel = totalXP % 100;

  if (mode === "menu") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">Learn</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">AI platform flash cards — Microsoft & Anthropic</p>
        </div>

        {/* XP bar */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{level}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Level {level}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">{totalXP} XP total</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400">
              <Star size={14} className="text-yellow-500" />
              {masteredCards.size} cards mastered
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${xpInLevel}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5">{xpInLevel}/100 XP to Level {level + 1}</p>
        </div>

        {/* Quick start */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Choose a deck</h2>
          <div className="space-y-2">
            <button
              onClick={() => startQuiz("all")}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white hover:opacity-90 transition-opacity"
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
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: deck.color }}
                    >
                      {deck.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{deck.label}</p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500">
                        {deckCards.length} cards · {masteredCount}/{deckCards.length} mastered
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {masteredCount === deckCards.length && (
                      <Trophy size={14} className="text-yellow-500" />
                    )}
                    <div className="w-12 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(masteredCount / deckCards.length) * 100}%`, backgroundColor: deck.color }}
                      />
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

  if (mode === "quiz" && quiz) {
    const card = quiz.cards[quiz.index];
    const deck = DECKS[card.deck];
    const progress = ((quiz.index + (quiz.selected ? 1 : 0)) / quiz.cards.length) * 100;

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setMode("menu")} className="text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300">
            ← Back
          </button>
          <div className="flex items-center gap-3">
            {quiz.streak >= 2 && (
              <div className="flex items-center gap-1 text-orange-500 text-sm font-medium">
                <Zap size={14} />
                {quiz.streak} streak
              </div>
            )}
            <span className="text-sm text-gray-400 dark:text-zinc-500">{quiz.index + 1}/{quiz.cards.length}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Deck badge */}
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
            style={{ backgroundColor: deck.color }}
          >
            {deck.icon}
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">{deck.label}</span>
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
          <div className="flex items-start gap-3">
            <BookOpen size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-lg font-medium text-gray-900 dark:text-white leading-snug">{card.question}</p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {card.options.map((option) => {
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

        {/* Feedback + next */}
        {quiz.selected && (
          <div className={`rounded-2xl p-4 ${quiz.correct ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-sm font-semibold mb-1 ${quiz.correct ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}>
                  {quiz.correct ? `Correct! +${quiz.streak >= 2 ? "20" : "10"} XP${quiz.streak >= 2 ? " 🔥 Streak bonus!" : ""}` : "Not quite"}
                </p>
                <p className={`text-xs leading-relaxed ${quiz.correct ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                  {card.answer}
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
            <RotateCcw size={16} />
            Play again
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
