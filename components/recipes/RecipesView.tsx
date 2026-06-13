"use client";

import { useEffect, useState } from "react";
import { Sparkles, Clock, Users, Wallet, ChevronDown, ChevronUp, RotateCcw, Loader2, Flame, Leaf, ShoppingBag, Lightbulb } from "lucide-react";
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

function RecipeCard({ recipe, onRefresh, loading }: { recipe: Recipe; onRefresh: () => void; loading: boolean }) {
  const [showMethod, setShowMethod] = useState(false);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 p-6 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {recipe.pan && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full mb-3">
                🍳 One-Pan
              </span>
            )}
            <h2 className="text-2xl font-bold leading-tight mb-1">{recipe.name}</h2>
            <p className="text-sm opacity-90 leading-relaxed">{recipe.tagline}</p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 transition-colors p-2 rounded-xl flex-shrink-0"
            title="Generate new recipe"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl text-xs font-medium">
            <Clock size={12} /> Prep {recipe.prepTime}
          </span>
          <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl text-xs font-medium">
            <Flame size={12} /> Cook {recipe.cookTime}
          </span>
          <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl text-xs font-medium">
            <Users size={12} /> {recipe.servings} serving{recipe.servings !== "1" ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl text-xs font-medium">
            <Wallet size={12} /> ~{recipe.estimatedCost}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Tags + protein */}
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 font-medium">
            🥩 {recipe.protein}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-medium">
            {recipe.difficulty}
          </span>
          {recipe.herbs.slice(0, 4).map(h => (
            <span key={h} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 font-medium">
              <Leaf size={9} /> {h}
            </span>
          ))}
          {recipe.tags.filter(t => t !== "one-pan").map(t => (
            <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-medium">
              {t}
            </span>
          ))}
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag size={14} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Ingredients</h3>
          </div>
          <div className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="flex items-start gap-3 py-1.5 border-b border-gray-50 dark:border-zinc-800 last:border-0">
                <span className="text-xs font-semibold text-gray-900 dark:text-white w-16 flex-shrink-0 text-right">{ing.amount}</span>
                <span className="text-xs text-gray-700 dark:text-zinc-300 flex-1">{ing.unit}{ing.note ? <span className="text-gray-400 dark:text-zinc-500"> — {ing.note}</span> : null}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Jamie tip */}
        {recipe.tip && (
          <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5">
            <Lightbulb size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{recipe.tip}</p>
          </div>
        )}

        {/* Method toggle */}
        <button
          onClick={() => setShowMethod(s => !s)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800 text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
        >
          <span>Method ({recipe.method.length} steps)</span>
          {showMethod ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {showMethod && (
          <ol className="space-y-3">
            {recipe.method.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{step}</p>
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
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden animate-pulse">
      <div className="bg-gradient-to-br from-orange-300 to-yellow-300 p-6 h-44" />
      <div className="p-5 space-y-4">
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-100 dark:bg-zinc-800 rounded-lg" />
          <div className="h-6 w-16 bg-gray-100 dark:bg-zinc-800 rounded-lg" />
          <div className="h-6 w-24 bg-gray-100 dark:bg-zinc-800 rounded-lg" />
        </div>
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-gray-100 dark:bg-zinc-800 rounded" style={{ width: `${60 + i * 8}%` }} />)}
        </div>
      </div>
    </div>
  );
}

export function RecipesView() {
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
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { setDailyRecipe(JSON.parse(cached)); setDailyLoading(false); return; } catch {}
    }
    loadDailyRecipe();
  }, []);

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">Recipes</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">Low-carb · High protein · One-pan · Herb-forward</p>
      </div>

      {/* Daily recipe */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-amber-500" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">Tonight's Suggestion</h2>
          <span className="text-xs text-gray-400 dark:text-zinc-500 ml-1">{today}</span>
        </div>

        {dailyLoading && <RecipeSkeleton />}
        {dailyError && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-sm text-red-700 dark:text-red-300">
            {dailyError} — <button onClick={refreshDailyRecipe} className="underline">Try again</button>
          </div>
        )}
        {dailyRecipe && !dailyLoading && (
          <RecipeCard recipe={dailyRecipe} onRefresh={refreshDailyRecipe} loading={dailyLoading} />
        )}
      </section>

      {/* Pantry spinner */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ShoppingBag size={15} className="text-green-500" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">Pantry Spinner</h2>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-500 dark:text-zinc-400 mb-2 block">
              What's in your fridge / pantry? List ingredients separated by commas.
            </label>
            <textarea
              value={pantryInput}
              onChange={e => setPantryInput(e.target.value)}
              placeholder="e.g. chicken breast, eggs, broccoli, feta, garlic, lemon, coriander, cumin..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
          </div>
          <button
            onClick={spinPantryRecipe}
            disabled={pantryLoading || !pantryInput.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            {pantryLoading
              ? <><Loader2 size={15} className="animate-spin" /> Finding your recipe…</>
              : <><Sparkles size={15} /> Spin a Recipe</>
            }
          </button>
          {pantryError && (
            <p className="text-xs text-red-500">{pantryError}</p>
          )}
        </div>

        {pantryRecipe && (
          <RecipeCard
            recipe={pantryRecipe}
            onRefresh={spinPantryRecipe}
            loading={pantryLoading}
          />
        )}
      </section>
    </div>
  );
}
