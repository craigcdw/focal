"use client";

import { useState, useEffect, useCallback } from "react";

const WORDS = [
  "FOCUS","THINK","LEARN","BUILD","WRITE","NOTES","TASKS","PLANS","GOALS","READS",
  "CODES","HOURS","BRAIN","SWIFT","SHARP","SMART","CLEAR","DAILY","MINDS","WORKS",
  "DRAFT","IDEAS","FLOWS","POWER","DRIVE","GROWN","LIGHT","LINKS","CRAFT","VIEWS",
  "TRACK","AUDIT","EARLY","LATER","TRUST","INPUT","BLOCK","SCOPE","SPACE","GRASP",
];

const QWERTY = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

function getTodayWord(): string {
  const start = new Date("2024-01-01").getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayIndex = Math.floor((today.getTime() - start) / (1000 * 60 * 60 * 24));
  return WORDS[dayIndex % WORDS.length];
}

type LetterState = "correct" | "present" | "absent" | "empty" | "active";

export function WordGame() {
  const [target] = useState(getTodayWord);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState("");

  const MAX_GUESSES = 6;
  const WORD_LEN = 5;

  const getLetterStates = useCallback((guess: string): LetterState[] => {
    const result: LetterState[] = Array(WORD_LEN).fill("absent");
    const targetArr = target.split("");
    const guessArr = guess.split("");
    const used = Array(WORD_LEN).fill(false);

    // First pass: correct
    guessArr.forEach((l, i) => {
      if (l === targetArr[i]) { result[i] = "correct"; used[i] = true; }
    });
    // Second pass: present
    guessArr.forEach((l, i) => {
      if (result[i] === "correct") return;
      const j = targetArr.findIndex((t, idx) => !used[idx] && t === l);
      if (j !== -1) { result[i] = "present"; used[j] = true; }
    });
    return result;
  }, [target]);

  const getKeyState = useCallback((key: string): LetterState | null => {
    let state: LetterState | null = null;
    for (const guess of guesses) {
      const states = getLetterStates(guess);
      guess.split("").forEach((l, i) => {
        if (l === key) {
          if (states[i] === "correct") state = "correct";
          else if (states[i] === "present" && state !== "correct") state = "present";
          else if (state === null) state = "absent";
        }
      });
    }
    return state;
  }, [guesses, getLetterStates]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  };

  const submitGuess = useCallback(() => {
    if (current.length !== WORD_LEN) { setShake(true); setTimeout(() => setShake(false), 600); showMessage("Not enough letters"); return; }
    const newGuesses = [...guesses, current];
    setGuesses(newGuesses);
    setCurrent("");
    if (current === target) {
      setWon(true);
      setGameOver(true);
      const msgs = ["Genius!", "Magnificent!", "Impressive!", "Splendid!", "Great!", "Phew!"];
      showMessage(msgs[newGuesses.length - 1] || "Nice!");
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
      showMessage(target);
    }
  }, [current, guesses, target]);

  const handleKey = useCallback((key: string) => {
    if (gameOver) return;
    if (key === "ENTER") { submitGuess(); return; }
    if (key === "⌫" || key === "BACKSPACE") { setCurrent(p => p.slice(0, -1)); return; }
    if (/^[A-Z]$/.test(key) && current.length < WORD_LEN) { setCurrent(p => p + key); }
  }, [gameOver, current, submitGuess]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKey(e.key.toUpperCase());
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  const allRows = [
    ...guesses,
    ...(gameOver ? [] : [current]),
    ...Array(Math.max(0, MAX_GUESSES - guesses.length - (gameOver ? 0 : 1))).fill(""),
  ].slice(0, MAX_GUESSES);

  const STATE_COLORS: Record<LetterState, string> = {
    correct: "bg-green-500 dark:bg-green-600 text-white border-green-500 dark:border-green-600",
    present: "bg-yellow-500 dark:bg-yellow-600 text-white border-yellow-500 dark:border-yellow-600",
    absent: "bg-gray-500 dark:bg-zinc-600 text-white border-gray-500 dark:border-zinc-600",
    empty: "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-gray-200 dark:border-zinc-700",
    active: "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-gray-400 dark:border-zinc-400",
  };

  const KEY_COLORS: Record<string, string> = {
    correct: "bg-green-500 text-white",
    present: "bg-yellow-500 text-white",
    absent: "bg-gray-400 dark:bg-zinc-600 text-white",
  };

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">Word Game</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">Daily 5-letter word · {guesses.length}/{MAX_GUESSES} guesses</p>
      </div>

      {/* Message */}
      <div className="h-8 flex items-center justify-center">
        {message && (
          <div className="px-4 py-1.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold animate-bounce">
            {message}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex flex-col items-center gap-1.5">
        {allRows.map((row, ri) => {
          const isCurrentRow = !gameOver && ri === guesses.length;
          const isGuessed = ri < guesses.length;
          const states = isGuessed ? getLetterStates(row) : null;

          return (
            <div key={ri} className={`flex gap-1.5 ${shake && isCurrentRow ? "animate-pulse" : ""}`}>
              {Array(WORD_LEN).fill(null).map((_, ci) => {
                const letter = row[ci] ?? "";
                const state: LetterState = isGuessed && states
                  ? states[ci]
                  : isCurrentRow && letter ? "active" : "empty";

                return (
                  <div
                    key={ci}
                    className={`w-14 h-14 border-2 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-300 ${STATE_COLORS[state]}`}
                    style={{ transitionDelay: isGuessed ? `${ci * 80}ms` : "0ms" }}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Keyboard */}
      <div className="flex flex-col items-center gap-1.5">
        {QWERTY.map((row, ri) => (
          <div key={ri} className="flex gap-1">
            {row.map(key => {
              const state = getKeyState(key);
              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  className={`${key.length > 1 ? "px-3 text-xs" : "w-10"} h-14 rounded-xl font-semibold text-sm transition-colors ${
                    state ? KEY_COLORS[state] : "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Game over */}
      {gameOver && (
        <div className={`text-center p-6 rounded-2xl border ${won ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900" : "bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"}`}>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {won ? "You got it!" : "Better luck tomorrow!"}
          </p>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">
            The word was <span className="font-bold text-gray-900 dark:text-white">{target}</span>
          </p>
          {won && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Solved in {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-3">New word tomorrow</p>
        </div>
      )}
    </div>
  );
}
