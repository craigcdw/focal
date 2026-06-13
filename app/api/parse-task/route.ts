import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a task parser for a productivity app. The user will type a natural language task description and you must extract structured data from it.

Today's date is ${new Date().toISOString().split("T")[0]}.

Return ONLY a valid JSON object with these fields (no markdown, no explanation):
{
  "title": "string - the task title, clean and concise",
  "description": "string - any additional details, or empty string",
  "priority": "low" | "medium" | "high" | "urgent",
  "due_date": "YYYY-MM-DD string or empty string if no date mentioned",
  "tags": ["array", "of", "tags"] or []
}

Rules:
- "tomorrow" = today + 1 day
- "next week" = today + 7 days
- "urgent", "ASAP", "!" = priority urgent
- "important", "high" = priority high
- "low", "whenever" = priority low
- Default priority is medium
- Extract hashtags or keywords as tags (e.g. #work #personal)
- Keep the title short and clean — strip date/priority words from it`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }
  const { text } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });

    let raw = (message.content[0] as { type: string; text: string }).text.trim();
    raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("parse-task error:", err);
    return NextResponse.json({ error: "Failed to parse task", detail: String(err) }, { status: 500 });
  }
}
