"use client";

export function Footer() {
  return (
    <footer className="mt-16 pt-6 border-t border-gray-100 dark:border-zinc-800 text-center">
      <p className="text-xs text-gray-400 dark:text-zinc-600">
        Focal v2.0 &nbsp;·&nbsp; Built by{" "}
        <a
          href="https://brightprompt.co.za"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600 dark:hover:text-zinc-400 transition-colors"
        >
          BrightPrompt AI
        </a>
        &nbsp;·&nbsp; © {new Date().getFullYear()} BrightPrompt. All rights reserved.
      </p>
    </footer>
  );
}
