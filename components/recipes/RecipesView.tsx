"use client";

import { useEffect, useState } from "react";
import {
  Sparkles, Clock, Users, Wallet, ChevronDown, ChevronUp,
  RotateCcw, Loader2, Flame, Leaf, ShoppingBag, Lightbulb,
  Bookmark, BookmarkCheck, Trash2, BookOpen, Mail, ClipboardCopy, Check,
} from "lucide-react";
import { format } from "date-fns";

interface Ingredient {
  amount: string;
  unit: string;
  note: string;
}

interface Recipe {
  name: string;
  tagline: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  estimatedCost: string;
  difficulty: string;
  pan: boolean;
  protein: string;
  ingredients: Ingredient[];
  method: string[];
  herbs: string[];
  tip: string;
  tags: string[];
}

interface SavedRecipe extends Recipe {
  savedAt: string;
  savedId: string;
}

const SAVED_KEY = "focal_saved_recipes";

function loadSaved(): SavedRecipe[] {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]"); } catch { return []; }
}
function persistSaved(recipes: SavedRecipe[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(recipes));
}

function buildEmailBody(recipe: Recipe): string {
  const ingredients = recipe.ingredients
    .map(i => `  • ${i.amount} ${i.unit}${i.note ? ` — ${i.note}` : ""}`)
    .join("\n");
  const method = recipe.method.map((s, i) => `  ${i + 1}. ${s}`).join("\n");
  return [
    recipe.name,
    recipe.tagline,
    "",
    `Prep ${recipe.prepTime} · Cook ${recipe.cookTime} · ${recipe.servings} serving(s) · ~${recipe.estimatedCost}`,
    "",
    "INGREDIENTS",
    ingredients,
    "",
    "METHOD",
    method,
    ...(recipe.tip ? ["", `TIP: ${recipe.tip}`] : []),
    "",
    "—",
    "Sent from Focal",
  ].join("\n");
}

function buildIngredientText(recipe: Recipe): string {
  return [
    `${recipe.name} — Ingredients`,
    "",
    ...recipe.ingredients.map(i => `• ${i.amount} ${i.unit}${i.note ? ` (${i.note})` : ""}`),
  ].join("\n");
}

function RecipeCard({
  recipe, onRefresh, loading, onSave, isSaved,
}: {
  recipe: Recipe;
  onRefresh?: () => void;
  loading?: boolean;
  onSave: (r: Recipe) => void;
  isSaved: boolean;
}) {
  const [showMethod, setShowMethod] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyIngredients() {
    navigator.clipboard.writeText(buildIngredientText(recipe)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function emailRecipe() {
    const subject = encodeURIComponent(`Recipe: ${recipe.name}`);
    const body = encodeURIComponent(buildEmailBody(recipe));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <div className="rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm">
      {/* Apple-style hero: deep charcoal, crisp white text */}
      <div className="relative bg-[#1d1d1f] dark:bg-black px-7 pt-7 pb-8">
        {/* Top-right actions */}
        <div className="absolute top-5 right-5 flex gap-1.5">
          <button
            onClick={copyIngredients}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
            title="Copy ingredients"
          >
            {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
          </button>
          <button
            onClick={emailRecipe}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
            title="Email recipe"
          >
            <Mail size={14} />
          </button>
          <button
            onClick={() => onSave(recipe)}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
              isSaved
                ? "bg-white/20 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
            }`}
            title={isSaved ? "Saved" : "Save recipe"}
          >
            {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all disabled:opacity-40"
              title="New suggestion"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
            </button>
          )}
        </div>

        {/* One-pan badge */}
        {recipe.pan && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-white/50 uppercase mb-4">
            🍳 One-Pan
          </span>
        )}

        {/* Title */}
        <h2 className="text-[1.65rem] font-bold text-white leading-tight tracking-tight mb-2 pr-36">
          {recipe.name}
        </h2>
        <p className="text-sm text-white/60 leading-relaxed mb-7 max-w-lg">{recipe.tagline}</p>

        {/* Stats row — frosted pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: <Clock size={11} />, label: `Prep ${recipe.prepTime}` },
            { icon: <Flame size={11} />, label: `Cook ${recipe.cookTime}` },
            { icon: <Users size={11} />, label: `${recipe.servings} serving${recipe.servings !== "1" ? "s" : ""}` },
            { icon: <Wallet size={11} />, label: `~${recipe.estimatedCost}` },
          ].map(({ icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium backdrop-blur-sm">
              {icon}{label}
            </span>
          ))}
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">
            {recipe.difficulty}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-7 py-6 space-y-6 bg-white dark:bg-zinc-900">

        {/* Protein + herbs */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-[#f5f5f7] dark:bg-zinc-800 text-[#1d1d1f] dark:text-zinc-200 font-medium">
            🥩 {recipe.protein}
          </span>
          {recipe.herbs.slice(0, 5).map(h => (
            <span key={h} className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-[#f0faf4] dark:bg-green-950 text-green-800 dark:text-green-300 font-medium">
              <Leaf size={9} />{h}
            </span>
          ))}
          {recipe.tags.filter(t => t !== "one-pan").map(t => (
            <span key={t} className="text-xs px-3 py-1 rounded-full bg-[#f5f5f7] dark:bg-zinc-800 text-[#6e6e73] dark:text-zinc-400 font-medium">
              {t}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 dark:bg-zinc-800" />

        {/* Ingredients */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={13} className="text-[#6e6e73] dark:text-zinc-400" />
            <h3 className="text-xs font-semibold text-[#6e6e73] dark:text-zinc-400 uppercase tracking-widest">Ingredients</h3>
          </div>
          <div className="space-y-0">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="flex items-baseline gap-4 py-2.5 border-b border-gray-50 dark:border-zinc-800 last:border-0">
                <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white w-14 flex-shrink-0 text-right tabular-nums">
                  {ing.amount}
                </span>
                <span className="text-sm text-[#1d1d1f] dark:text-zinc-200 flex-1">
                  {ing.unit}
                  {ing.note && <span className="text-[#6e6e73] dark:text-zinc-500 text-xs ml-1">— {ing.note}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Jamie tip */}
        {recipe.tip && (
          <div className="flex items-start gap-3 bg-[#f5f5f7] dark:bg-zinc-800 rounded-2xl px-4 py-4">
            <Lightbulb size={13} className="text-[#6e6e73] dark:text-zinc-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#1d1d1f] dark:text-zinc-300 leading-relaxed">{recipe.tip}</p>
          </div>
        )}

        {/* Method */}
        <button
          onClick={() => setShowMethod(s => !s)}
          className="w-full flex items-center justify-between py-4 border-t border-gray-100 dark:border-zinc-800 text-sm font-semibold text-[#1d1d1f] dark:text-white group"
        >
          <span>Method <span className="text-[#6e6e73] dark:text-zinc-500 font-normal text-xs ml-1">{recipe.method.length} steps</span></span>
          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#f5f5f7] dark:bg-zinc-800 text-[#1d1d1f] dark:text-zinc-300 group-hover:bg-gray-200 dark:group-hover:bg-zinc-700 transition-colors">
            {showMethod ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        </button>

        {showMethod && (
          <ol className="space-y-4 pt-1">
            {recipe.method.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="w-6 h-6 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-[#1d1d1f] dark:text-zinc-300 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function RecipeSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden border border-gray-100 dark:border-zinc-800 animate-pulse">
      <div className="bg-[#1d1d1f] dark:bg-black h-52 px-7 pt-7 pb-8 space-y-3">
        <div className="h-3 w-20 bg-white/10 rounded-full" />
        <div className="h-7 w-3/4 bg-white/10 rounded-xl" />
        <div className="h-4 w-1/2 bg-white/10 rounded-lg" />
        <div className="flex gap-2 pt-4">
          {[1,2,3,4].map(i => <div key={i} className="h-7 w-20 bg-white/10 rounded-full" />)}
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 p-7 space-y-4">
        <div className="flex gap-2">{[1,2,3].map(i => <div key={i} className="h-6 w-20 bg-gray-100 dark:bg-zinc-800 rounded-full" />)}</div>
        <div className="space-y-3 pt-2">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-4 bg-gray-100 dark:bg-zinc-800 rounded" style={{ width: `${50 + i * 8}%` }} />)}
        </div>
      </div>
    </div>
  );
}

function SavedRecipeRow({ saved, onDelete, onSave, isSaved }: {
  saved: SavedRecipe;
  onDelete: (id: string) => void;
  onSave: (r: Recipe) => void;
  isSaved: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#f5f5f7] dark:hover:bg-zinc-800 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-[#1d1d1f] dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
          <BookOpen size={15} className="text-white dark:text-zinc-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white truncate">{saved.name}</p>
          <p className="text-xs text-[#6e6e73] dark:text-zinc-500 mt-0.5">
            🥩 {saved.protein} · {saved.prepTime} prep · ~{saved.estimatedCost} · {format(new Date(saved.savedAt), "d MMM yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onDelete(saved.savedId); }}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#6e6e73] dark:text-zinc-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
          >
            <Trash2 size={13} />
          </button>
          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#f5f5f7] dark:bg-zinc-800 text-[#6e6e73] dark:text-zinc-400">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-zinc-800">
          <RecipeCard recipe={saved} onSave={onSave} isSaved={isSaved} />
        </div>
      )}
    </div>
  );
}

type Tab = "daily" | "pantry" | "saved";

export function RecipesView() {
  const [tab, setTab] = useState<Tab>("daily");
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);

  const [dailyRecipe, setDailyRecipe] = useState<Recipe | null>(null);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailyError, setDailyError] = useState("");

  const [pantryInput, setPantryInput] = useState("");
  const [pantryRecipe, setPantryRecipe] = useState<Recipe | null>(null);
  const [pantryLoading, setPantryLoading] = useState(false);
  const [pantryError, setPantryError] = useState("");

  const today = format(new Date(), "EEEE, MMMM d yyyy");
  const cacheKey = `focal_recipe_${format(new Date(), "yyyy-MM-dd")}`;

  useEffect(() => {
    setSavedRecipes(loadSaved());
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { setDailyRecipe(JSON.parse(cached)); setDailyLoading(false); return; } catch {}
    }
    loadDailyRecipe();
  }, []);

  function isSavedFn(recipe: Recipe) {
    return savedRecipes.some(s => s.name === recipe.name);
  }

  function handleSave(recipe: Recipe) {
    if (isSavedFn(recipe)) return;
    const entry: SavedRecipe = { ...recipe, savedAt: new Date().toISOString(), savedId: crypto.randomUUID() };
    const updated = [entry, ...savedRecipes];
    setSavedRecipes(updated);
    persistSaved(updated);
  }

  function handleDelete(savedId: string) {
    const updated = savedRecipes.filter(s => s.savedId !== savedId);
    setSavedRecipes(updated);
    persistSaved(updated);
  }

  async function loadDailyRecipe() {
    setDailyLoading(true);
    setDailyError("");
    try {
      const res = await fetch("/api/suggest-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "daily", date: today }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.detail || data.error);
      setDailyRecipe(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      setDailyError(err instanceof Error ? err.message : "Could not generate recipe.");
    } finally {
      setDailyLoading(false);
    }
  }

  async function refreshDailyRecipe() {
    localStorage.removeItem(cacheKey);
    await loadDailyRecipe();
  }

  async function spinPantryRecipe() {
    if (!pantryInput.trim()) return;
    setPantryLoading(true);
    setPantryError("");
    setPantryRecipe(null);
    try {
      const res = await fetch("/api/suggest-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pantry", ingredients: pantryInput }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.detail || data.error);
      setPantryRecipe(data);
    } catch (err) {
      setPantryError(err instanceof Error ? err.message : "Could not generate recipe.");
    } finally {
      setPantryLoading(false);
    }
  }

  return (
    <div className="space-y-7 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1d1d1f] dark:text-white tracking-tight">Recipes</h1>
        <p className="text-[#6e6e73] dark:text-zinc-400 mt-1 text-sm">Low-carb · High protein · One-pan · Herb-forward</p>
      </div>

      {/* Segmented control — Apple style */}
      <div className="inline-flex bg-[#f5f5f7] dark:bg-zinc-800 p-1 rounded-xl gap-0.5">
        {([
          { key: "daily",  label: "Tonight" },
          { key: "pantry", label: "Pantry Spinner" },
          { key: "saved",  label: savedRecipes.length > 0 ? `Saved  ${savedRecipes.length}` : "Saved" },
        ] as { key: Tab; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-white dark:bg-zinc-700 text-[#1d1d1f] dark:text-white shadow-sm"
                : "text-[#6e6e73] dark:text-zinc-400 hover:text-[#1d1d1f] dark:hover:text-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tonight */}
      {tab === "daily" && (
        <section className="space-y-4">
          <p className="text-xs text-[#6e6e73] dark:text-zinc-500 flex items-center gap-1.5">
            <Sparkles size={11} className="text-[#0071e3]" />
            {today} · Refreshes daily · Hit ↺ for a different suggestion
          </p>
          {dailyLoading && <RecipeSkeleton />}
          {dailyError && (
            <div className="bg-[#fff2f2] dark:bg-red-950 border border-red-100 dark:border-red-800 rounded-2xl p-4 text-sm text-red-600 dark:text-red-300">
              {dailyError} — <button onClick={refreshDailyRecipe} className="underline">Try again</button>
            </div>
          )}
          {dailyRecipe && !dailyLoading && (
            <RecipeCard
              recipe={dailyRecipe}
              onRefresh={refreshDailyRecipe}
              loading={dailyLoading}
              onSave={handleSave}
              isSaved={isSavedFn(dailyRecipe)}
            />
          )}
        </section>
      )}

      {/* Pantry */}
      {tab === "pantry" && (
        <section className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white mb-1">What's in your fridge?</p>
              <p className="text-xs text-[#6e6e73] dark:text-zinc-400 mb-3">List ingredients separated by commas — Claude will find the best meal you can make.</p>
              <textarea
                value={pantryInput}
                onChange={e => setPantryInput(e.target.value)}
                placeholder="e.g. chicken breast, eggs, broccoli, feta, garlic, lemon, coriander, cumin..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-[#f5f5f7] dark:bg-zinc-800 text-sm text-[#1d1d1f] dark:text-white placeholder-[#6e6e73] dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0071e3] resize-none"
              />
            </div>
            <button
              onClick={spinPantryRecipe}
              disabled={pantryLoading || !pantryInput.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#006edb] disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {pantryLoading
                ? <><Loader2 size={14} className="animate-spin" /> Finding your recipe…</>
                : <><Sparkles size={14} /> Spin a Recipe</>
              }
            </button>
            {pantryError && <p className="text-xs text-red-500">{pantryError}</p>}
          </div>

          {pantryRecipe && (
            <RecipeCard
              recipe={pantryRecipe}
              onRefresh={spinPantryRecipe}
              loading={pantryLoading}
              onSave={handleSave}
              isSaved={isSavedFn(pantryRecipe)}
            />
          )}
        </section>
      )}

      {/* Saved */}
      {tab === "saved" && (
        <section className="space-y-3">
          {savedRecipes.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#f5f5f7] dark:bg-zinc-800 flex items-center justify-center mx-auto">
                <Bookmark size={22} className="text-[#6e6e73] dark:text-zinc-500" />
              </div>
              <p className="text-sm font-medium text-[#1d1d1f] dark:text-white">No saved recipes yet</p>
              <p className="text-xs text-[#6e6e73] dark:text-zinc-500">Tap the bookmark on any recipe to save it here.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#6e6e73] dark:text-zinc-500">
                {savedRecipes.length} recipe{savedRecipes.length !== 1 ? "s" : ""} · Tap any to expand
              </p>
              <div className="space-y-2">
                {savedRecipes.map(s => (
                  <SavedRecipeRow
                    key={s.savedId}
                    saved={s}
                    onDelete={handleDelete}
                    onSave={handleSave}
                    isSaved={true}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
