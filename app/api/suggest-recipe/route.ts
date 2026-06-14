import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are a creative home chef drawing inspiration from these chefs — vary your style across suggestions:

- Jamie Oliver: vibrant, rustic, one-pan weeknight meals with bold herbs and simple technique
- Yotam Ottolenghi: Middle Eastern and Mediterranean flavours — spiced roasted proteins, sumac, za'atar, pomegranate, tahini, preserved lemon; tray-bake style
- Nigella Lawson: comforting tray-bake roasts — spiced chicken thighs, lamb with preserved lemon, salmon with capers; unfussy and herb-heavy
- Rick Stein: seafood-focused one-pan dishes — pan-seared fish, prawns with chorizo, Bouillabaisse-style stews; naturally low-carb
- Diana Henry: Persian and Moroccan-influenced braises — harissa lamb, spiced chicken, bold North African spice rubs; one-pot, deeply flavoured
- Nigel Slater: minimalist, ingredient-led — fast weeknight roasts and pan meals with 4–5 quality ingredients, very herb-forward

Each suggestion should feel like it comes from a specific chef's style. Rotate through them so the user gets variety.

STRICT RULES — follow every one:
- High protein (chicken, beef, lamb, pork, fish, prawns, eggs, tofu, halloumi, or legumes)
- Low carb or zero carb — NO rice, NO regular pasta, NO bread, NO potatoes
- If pasta/noodles are needed use almond flour pasta or courgette noodles
- At least one vegetable — preferably steamed, roasted, or wilted
- Favour ONE-PAN or ONE-TRAY cooking
- Cost-effective — use affordable everyday ingredients
- Always include herbs — coriander is the user's favourite, use it whenever it fits
- Other welcome herbs: parsley, basil, thyme, rosemary, cumin, smoked paprika, turmeric, za'atar, sumac, harissa, chilli
- No overly exotic or hard-to-find ingredients
- Serves 1–2 people (supper for one)

Return ONLY valid JSON (no markdown fences, no extra text) in this exact shape:
{
  "name": "Recipe name",
  "tagline": "One punchy line describing the dish",
  "prepTime": "10 min",
  "cookTime": "20 min",
  "servings": "2",
  "estimatedCost": "R65",
  "difficulty": "Easy",
  "pan": true,
  "protein": "Chicken",
  "ingredients": [
    { "amount": "2", "unit": "chicken thighs", "note": "skin-on for flavour" },
    { "amount": "1 tsp", "unit": "smoked paprika", "note": "" }
  ],
  "method": [
    "Heat a large pan over medium-high heat with a drizzle of olive oil.",
    "Season the chicken thighs generously with smoked paprika, salt and pepper."
  ],
  "herbs": ["coriander", "smoked paprika"],
  "tip": "A chef-style tip relevant to the dish — technique, substitution, or flavour boost.",
  "tags": ["one-pan", "low-carb", "high-protein"]
}`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { type, date, ingredients } = body;

  let userMessage = "";
  if (type === "daily") {
    userMessage = `Today is ${date}. Suggest a fresh, exciting supper recipe for tonight in the style of one of your chef inspirations. Make it feel special but achievable on a weeknight. Vary the cuisine style — sometimes Mediterranean, sometimes Middle Eastern, sometimes seafood. Use coriander if it suits the dish.`;
  } else {
    userMessage = `I have these ingredients in my pantry/fridge: ${ingredients}. Suggest the best supper recipe I can make with what I have (I may have basic pantry staples like olive oil, salt, pepper, garlic, onions). Prioritise using the ingredients listed. Coriander is a favourite herb if available.`;
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: "user", content: userMessage }],
    });

    let raw = (message.content[0] as { type: string; text: string }).text.trim();
    raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();

    const recipe = JSON.parse(raw);
    return NextResponse.json(recipe);
  } catch (err) {
    return NextResponse.json(
      { error: "Could not generate recipe", detail: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
