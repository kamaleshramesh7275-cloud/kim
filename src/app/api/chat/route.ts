import { promises as fs } from "fs";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { NextResponse } from "next/server";

const execFileAsync = promisify(execFile);

const STOP_WORDS = new Set([
  "the", "and", "a", "an", "of", "to", "in", "is", "for", "with", "on", "at", "by", "about", "as",
  "into", "like", "through", "after", "over", "between", "out", "against", "during", "without", "before",
  "under", "around", "among", "what", "how", "why", "who", "where", "when", "which", "should", "could",
  "would", "i", "me", "my", "you", "your", "he", "she", "it", "they", "we", "us", "them", "do", "does",
  "did", "from", "up", "down"
]);

type BackendRecord = {
  dataset: string;
  text: string;
  score: number;
  record: Record<string, string>;
};

type ContextItem = {
  dataset: string;
  text: string;
  score: number;
};

type KnowledgeChunk = {
  id: string;
  source: string;
  text: string;
  tokens: string[];
};

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

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

async function loadBackendDatasets() {
  const dataDir = path.join(process.cwd(), "public", "data");
  const files = [
    { file: "Athlete_recovery_dataset.csv", name: "Athlete Recovery Dataset" },
    { file: "Athlete_Training_Recovery_Tracker_Dataset.csv", name: "Athlete Training Recovery Tracker Dataset" },
    { file: "multimodal_sports_injury_dataset.csv", name: "Multimodal Sports Injury Dataset" },
  ];

  const datasets: BackendRecord[] = [];

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

async function loadKnowledgeChunks() {
  const dataDir = path.join(process.cwd(), "public", "data");
  const knowledgePath = path.join(dataDir, "recovery-rag-documents.md");
  const chunks: KnowledgeChunk[] = [];

  try {
    const content = await fs.readFile(knowledgePath, "utf8");
    const sections = content
      .split(/\n##\s+/)
      .map((section) => section.trim())
      .filter(Boolean);

    sections.forEach((section, index) => {
      const text = section.replace(/^#.*$/m, "").trim();
      if (text) {
        chunks.push({
          id: `knowledge-${index + 1}`,
          source: "recovery-rag-documents.md",
          text,
          tokens: tokenize(text),
        });
      }
    });
  } catch {
    // Fall back to an empty corpus if the document is unavailable.
  }

  return chunks;
}

function buildTfIdfVectors(chunks: KnowledgeChunk[]) {
  const vocabulary = new Set<string>();
  const docFrequencies = new Map<string, number>();

  chunks.forEach((chunk) => {
    const uniqueTokens = new Set(chunk.tokens);
    uniqueTokens.forEach((token) => {
      vocabulary.add(token);
      docFrequencies.set(token, (docFrequencies.get(token) || 0) + 1);
    });
  });

  const vocabularyList = Array.from(vocabulary);
  const idfMap = new Map<string, number>();
  const documentCount = Math.max(chunks.length, 1);

  vocabularyList.forEach((token) => {
    const frequency = docFrequencies.get(token) || 1;
    idfMap.set(token, Math.log((documentCount + 1) / (frequency + 1)) + 1);
  });

  return chunks.map((chunk) => {
    const tokenCounts = new Map<string, number>();
    chunk.tokens.forEach((token) => {
      tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
    });

    const vector = vocabularyList.map((token) => {
      const tf = tokenCounts.get(token) || 0;
      return tf * (idfMap.get(token) || 1);
    });

    return { ...chunk, vector };
  });
}

function cosineSimilarity(left: number[], right: number[]) {
  if (!left.length || !right.length) return 0;

  const magnitudeLeft = Math.sqrt(left.reduce((sum, value) => sum + value * value, 0));
  const magnitudeRight = Math.sqrt(right.reduce((sum, value) => sum + value * value, 0));

  if (!magnitudeLeft || !magnitudeRight) return 0;

  const dotProduct = left.reduce((sum, value, index) => sum + value * (right[index] || 0), 0);
  return dotProduct / (magnitudeLeft * magnitudeRight);
}

function buildQueryVector(query: string, vocabulary: string[], idfMap: Map<string, number>) {
  const queryTokens = tokenize(query);
  const tokenCounts = new Map<string, number>();
  queryTokens.forEach((token) => {
    tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
  });

  return vocabulary.map((token) => {
    const tf = tokenCounts.get(token) || 0;
    return tf * (idfMap.get(token) || 1);
  });
}

async function retrieveRelevantContext(query: string, records: BackendRecord[]) {
  const [backendChunks, knowledgeChunks] = await Promise.all([Promise.resolve(records.map((item) => ({
    id: item.dataset,
    source: item.dataset,
    text: item.text,
    tokens: tokenize(item.text),
  }))), loadKnowledgeChunks()]);

  const allChunks = [...backendChunks, ...knowledgeChunks];
  if (allChunks.length === 0) {
    return [] as ContextItem[];
  }

  const vectorized = buildTfIdfVectors(allChunks);
  const vocabulary = Array.from(new Set(vectorized.flatMap((chunk) => chunk.tokens)));
  const idfMap = new Map<string, number>();
  const documentCount = Math.max(vectorized.length, 1);

  vocabulary.forEach((token) => {
    const frequency = vectorized.filter((chunk) => chunk.tokens.includes(token)).length;
    idfMap.set(token, Math.log((documentCount + 1) / (frequency + 1)) + 1);
  });

  const queryVector = buildQueryVector(query, vocabulary, idfMap);

  const scored = vectorized
    .map((chunk) => {
      const similarity = cosineSimilarity(queryVector, chunk.vector);
      const lexicalScore = tokenize(query).reduce((score, token) => {
        return score + (chunk.text.toLowerCase().includes(token) ? 1 : 0);
      }, 0);

      return {
        dataset: chunk.source,
        text: chunk.text,
        score: similarity * 100 + lexicalScore * 2,
      } satisfies ContextItem;
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return scored;
}

function buildOfflineAnswer(message: string, context: ContextItem[]) {
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

function getPythonExecutable() {
  const candidates = [
    path.join(process.cwd(), ".venv", process.platform === "win32" ? "Scripts" : "bin", process.platform === "win32" ? "python.exe" : "python"),
    process.env.PYTHON_PATH,
    "python",
  ];

  return candidates.find((candidate): candidate is string => Boolean(candidate)) || "python";
}

async function runPythonRag(message: string, apiKey: string) {
  const pythonExecutable = getPythonExecutable();
  const scriptPath = path.join(process.cwd(), "utils", "groq_rag.py");

  // Extract the last line of stdout that looks like JSON — this skips any
  // non-JSON noise (tqdm bars, warnings) that a library might emit to stdout.
  const extractJson = (raw: string) => {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].startsWith("{") || lines[i].startsWith("[")) {
        return lines[i];
      }
    }
    return raw.trim();
  };

  try {
    const { stdout } = await execFileAsync(
      pythonExecutable,
      [scriptPath, message],
      {
        env: {
          ...process.env,
          GROQ_API_KEY: apiKey || process.env.GROQ_API_KEY || "",
          GROQ_MODEL: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
          // Silence HuggingFace / tqdm noise
          TOKENIZERS_PARALLELISM: "false",
          TRANSFORMERS_VERBOSITY: "error",
        },
        timeout: 180000,
      }
    );

    const parsed = JSON.parse(extractJson(stdout));
    return {
      reply: parsed.reply || buildOfflineAnswer(message, []),
      matchedSources: Array.isArray(parsed.matchedSources) ? parsed.matchedSources : [],
    };
  } catch (error: any) {
    // execFileAsync throws on non-zero exit code, but the process may still
    // have written valid JSON to stdout before exiting (e.g. due to a tqdm
    // warning triggering a non-zero exit in some environments).
    const stdoutFallback: string = error?.stdout ?? "";
    if (stdoutFallback) {
      try {
        const parsed = JSON.parse(extractJson(stdoutFallback));
        if (parsed?.reply) {
          return {
            reply: parsed.reply,
            matchedSources: Array.isArray(parsed.matchedSources) ? parsed.matchedSources : [],
          };
        }
      } catch {
        // stdout was not valid JSON — fall through to offline answer
      }
    }
    return {
      reply: buildOfflineAnswer(message, []),
      matchedSources: [],
      error: error.message || "Python RAG pipeline failed",
    };
  }
}

export async function POST(req: Request) {
  try {
    const { message, apiKey: clientApiKey } = await req.json();

    const apiKey = clientApiKey || process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    const backendRecords = await loadBackendDatasets();
    const context = await retrieveRelevantContext(message, backendRecords);

    const ragResponse = await runPythonRag(message, apiKey || "");

    return NextResponse.json({
      reply: ragResponse.reply,
      matchedSources: ragResponse.matchedSources.length > 0
        ? ragResponse.matchedSources
        : context.map(({ dataset, text }) => ({ dataset, text })),
      ...(ragResponse.error ? { error: ragResponse.error } : {}),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
