import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const STOP_WORDS = new Set([
  "the", "and", "a", "an", "of", "to", "in", "is", "for", "with", "on", "at", "by", "about", "as",
  "into", "like", "through", "after", "over", "between", "out", "against", "during", "without", "before",
  "under", "around", "among", "what", "how", "why", "who", "where", "when", "which", "should", "could",
  "would", "i", "me", "my", "you", "your", "he", "she", "it", "they", "we", "us", "them", "do", "does",
  "did", "from", "up", "down"
]);

function parseCSV(text: string) {
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
  if (lines.length === 0) return { headers: [], records: [] as Record<string, string>[] };

  const splitRow = (row: string) => {
    const result: string[] = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(cell.trim());
        cell = "";
      } else {
        cell += char;
      }
    }

    result.push(cell.trim());
    return result.map((value) => value.replace(/^"|"$/g, ""));
  };

  const headers = splitRow(lines[0]);
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitRow(lines[i]);
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || "";
    });
    records.push(record);
  }

  return { headers, records };
}

function formatRecordForSearch(record: Record<string, string>) {
  return Object.entries(record)
    .filter(([, value]) => value && value.trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

async function loadBackendDatasets() {
  const dataDir = path.join(process.cwd(), "public", "data");
  const files = [
    { file: "Athlete_recovery_dataset.csv", name: "Athlete Recovery Dataset" },
    { file: "Athlete_Training_Recovery_Tracker_Dataset.csv", name: "Athlete Training Recovery Tracker Dataset" },
    { file: "multimodal_sports_injury_dataset.csv", name: "Multimodal Sports Injury Dataset" },
  ];

  const datasets: Array<{ dataset: string; text: string; score: number; record: Record<string, string> }> = [];

  for (const entry of files) {
    const filePath = path.join(dataDir, entry.file);
    try {
      const content = await fs.readFile(filePath, "utf8");
      const { records } = parseCSV(content);
      for (const record of records) {
        datasets.push({
          dataset: entry.name,
          text: formatRecordForSearch(record),
          score: 0,
          record,
        });
      }
    } catch {
      // Ignore missing files so the API still works with whatever data is available.
    }
  }

  return datasets;
}

function retrieveRelevantContext(query: string, records: Array<{ dataset: string; text: string; score: number; record: Record<string, string> }>) {
  const queryTokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

  return records
    .map((item) => {
      const textLower = item.text.toLowerCase();
      let score = 0;

      if (queryTokens.length === 0) {
        score = 0.1;
      } else {
        for (const token of queryTokens) {
          if (textLower.includes(token)) score += 1;
          if (item.record[token] && item.record[token].toLowerCase().includes(token)) score += 2;
        }
      }

      return { ...item, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => ({ dataset: item.dataset, text: item.text }));
}

function buildOfflineAnswer(message: string, context: Array<{ dataset: string; text: string }>) {
  const intro = context.length > 0
    ? "I found a few recovery patterns that match your question, and here is a practical coaching-style response:"
    : "I could not find a strong direct match in the available recovery data, so here is a safe general plan you can follow:";

  const actionItems = context.length > 0
    ? context
        .slice(0, 3)
        .map((item) => `- ${item.text.split(";").slice(0, 2).join(" • ")}`)
        .join("\n")
    : "- Rest and monitor your recovery signals such as sleep, fatigue, and soreness.\n- Avoid heavy training if your body is showing warning signs.\n- Keep hydration and nutrition steady while you recover.";

  const progressItems = context.length > 0
    ? [
        "- Build back gradually instead of jumping straight back into your usual load.",
        "- Keep your routine consistent and track how you feel day by day.",
        "- If soreness or fatigue rises, reduce the intensity and recover first.",
      ].join("\n")
    : "- Return to training slowly and only when your recovery markers improve.\n- Keep your recovery habits consistent so you can build momentum safely.";

  const nutritionItems = context.length > 0
    ? [
        "- Aim for a balanced meal with protein, carbohydrates, and fluids after training.",
        "- Use hydration and electrolytes throughout the day, especially if you are sweating heavily.",
        "- Keep meals simple and recovery-focused rather than overly restrictive.",
      ].join("\n")
    : "- Drink enough water and include electrolytes if needed.\n- Eat a protein-forward meal with carbohydrates to support recovery.";

  return `${intro}\n\n**What to do**\n${actionItems}\n\n**How to continue progress**\n${progressItems}\n\n**What to eat**\n${nutritionItems}\n\nIf you want, I can also turn this into a more specific plan for your sport, injury, or training day.`;
}

export async function POST(req: Request) {
  try {
    const { message, apiKey: clientApiKey } = await req.json();

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
    const backendRecords = await loadBackendDatasets();
    const context = retrieveRelevantContext(message, backendRecords);

    const contextText = context.length > 0
      ? context.map((c: any) => `[Source: ${c.dataset}]\n${c.text}`).join("\n\n")
      : "No direct matching CSV records found in the datasets.";

    if (!apiKey) {
      return NextResponse.json({
        reply: buildOfflineAnswer(message, context),
        matchedSources: context,
      });
    }

    const prompt = `You are "Smart Recovery AI", a premium athletic recovery coach, sports nutritionist, and injury intelligence assistant.
Your job is to guide athletes and coaches with natural, conversational coaching advice that feels like a helpful AI assistant, not a raw dump of database rows.

Below is the retrieved context from the athletic data sources matching the user's query:
---
${contextText}
---

Use the relevant details from the context above to answer the user's question. If the context contains useful information, ground your answer in it and paraphrase it naturally.
If the data does not contain enough detail, use your expert sports science knowledge to give the best advice, but clearly present it as general recovery guidance.

Write the answer like a smart, supportive coach in plain language. Avoid quoting raw CSV fields or listing records. Instead:
- Start with a short, helpful overview.
- Organize the response into three clear sections:
  1. **WHAT TO DO**
  2. **HOW TO CONTINUE PROGRESS**
  3. **WHAT TO EAT**
- Keep it concise, encouraging, and practical.
- Use markdown bullets and short paragraphs.

User Question: ${message}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Gemini API Error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated by the AI.";

    return NextResponse.json({ reply, matchedSources: context });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
