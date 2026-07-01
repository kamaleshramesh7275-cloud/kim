"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Key,
  Database,
  Upload,
  Eye,
  Trash2,
  Settings,
  Check,
  FileSpreadsheet,
  X,
  Info,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- PRELOADED DATASETS (RAW CSV FORMAT) ---
const DEFAULT_NUTRITION_CSV = `Category,ActivityLevel,Goal,Recommendation,MealPlan
Nutrition,Heavy Training,Muscle Recovery,Eat complex carbohydrates and high-quality protein (chicken, fish, tofu) within 45 minutes post-workout.,"Breakfast: Oatmeal with berries & whey protein. Lunch: Grilled salmon, quinoa, asparagus. Dinner: Turkey breast, sweet potato, broccoli. Snacks: Greek yogurt, almonds."
Nutrition,Rest Day,Inflammation Control,Incorporate anti-inflammatory foods rich in Omega-3 and antioxidants to promote tissue healing.,"Breakfast: Chia seed pudding with walnuts. Lunch: Spinach salad with boiled eggs & olive oil. Dinner: Baked cod, mixed roasted vegetables. Snacks: Green tea, blueberries."
Nutrition,Light Training,Energy Balance,Maintain moderate carb intake, focusing on hydration and micronutrients.,"Breakfast: Scrambled eggs on whole wheat toast. Lunch: Chicken breast wrap with avocado. Dinner: Lean beef stir-fry with brown rice. Snacks: Apple slices with peanut butter."
Nutrition,Injury Rehab,Tissue Repair,Increase protein and Vitamin C intake to support collagen synthesis and prevent muscle atrophy.,"Breakfast: Smoothie with spinach, collagen peptides, and banana. Lunch: Chicken breast, quinoa, bell peppers. Dinner: Grilled trout, baked potato, spinach salad. Snacks: Orange slices, cottage cheese."`;

const DEFAULT_RECOVERY_CSV = `Condition,MetricType,Status,Instruction,NextSteps
High Soreness,Muscle Soreness,Warning,Reduce high-impact loading. Focus on myofascial release (foam rolling) and active recovery (swimming or walking).,"Perform 15 mins foam rolling. Keep training load below 50%. Ensure 8.5+ hours of sleep."
Low Sleep,Sleep Quality,Alert,Prioritize sleep hygiene. Avoid caffeine after 12 PM. Use a cold, dark room. Limit screen time 1 hour before bed.,"Cancel high-intensity training today. Take a 20-minute power nap before 3 PM. Perform light mobility work."
High Stress,Mental Fatigue,Alert,Incorporate mindfulness or deep breathing exercises (box breathing). Reduce cognitive training load.,"Perform 10 minutes of guided meditation. Lower training volume. Avoid stressful decision-making."
Dehydration,Hydration,Warning,Drink 500ml water immediately with electrolytes. Sip continuously throughout the day rather than gulping.,"Monitor urine color (aim for pale yellow). Avoid salty foods. Re-evaluate hydration status in 2 hours."
Low Recovery,Overall Recovery,Danger,Critical recovery deficit. Rest day is highly recommended. Focus on nutrition and hydration. No training.,"Rest completely. Take a warm contrast bath. Do gentle stretching. Consult coach if score is below 40."
Healthy,Normal,Good,Continue with scheduled training. Maintain current sleep and hydration habits to sustain streak.,"Follow standard warmup. Execute planned workout. Hydrate during training."`;

const DEFAULT_PROGRESS_CSV = `AthleteName,ActivityLog,WeeklyProgress,Status,CoachAdvice
Marcus Johnson,Completed 4 sessions,Streaks: 5 days. Recovery scores stable. Cardio endurance up 5%.,Ready for Progression,Can increase training load by 10% next week. Focus on ankle mobility.
David Chen,Completed 0 sessions,Resting due to Medium Hamstring Strain. Recovery score: 45.,Rehabilitation,Continue rest. Execute light stretching and ice therapy. Do not participate in team drills.
James Wilson,Completed 3 sessions,Recovery score: 68. High training load yesterday (80). Mild soreness.,Monitor Workload,Reduce load today by 30%. Focus on stretching and 8+ hours sleep.
Joseph Anderson,Completed 0 sessions,ACL Tear. Post-op rehabilitation active.,Medical Rest,Strict compliance with physical therapy. Keep leg elevated. Avoid weight-bearing exercises.
Robert Davis,Completed 4 sessions,High training load (85). Fatigue score high. Sleep: 55.,Overreaching Warning,Mandatory rest day tomorrow. Hydration and light stretching only.`;

// --- TYPES ---
interface Dataset {
  id: string;
  name: string;
  records: Record<string, string>[];
  headers: string[];
  isPreloaded: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  matchedSources?: { dataset: string; text: string }[];
}

// --- STOP WORDS FOR TF-IDF ---
const STOP_WORDS = new Set([
  "the", "and", "a", "an", "of", "to", "in", "is", "for", "with", "on", "at", 
  "by", "about", "as", "into", "like", "through", "after", "over", "between", 
  "out", "against", "during", "without", "before", "under", "around", "among", 
  "what", "how", "why", "who", "where", "when", "which", "should", "could", "would",
  "i", "me", "my", "you", "your", "he", "she", "it", "they", "we", "us", "them",
  "do", "does", "did", "to", "from", "up", "down", "about", "over", "under"
]);

// --- HELPER CSV PARSER ---
function parseCSV(text: string): { headers: string[]; records: Record<string, string>[] } {
  const lines: string[] = [];
  let currentLine = "";
  let insideQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
      currentLine += char;
    } else if (char === '\n' && !insideQuotes) {
      lines.push(currentLine.trim());
      currentLine = "";
    } else if (char === '\r') {
      // Ignore carriage returns
    } else {
      currentLine += char;
    }
  }
  if (currentLine) {
    lines.push(currentLine.trim());
  }

  if (lines.length === 0) return { headers: [], records: [] };
  
  const splitRow = (row: string): string[] => {
    const result: string[] = [];
    let cell = "";
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cell.replace(/^"|"$/g, '').trim());
        cell = "";
      } else {
        cell += char;
      }
    }
    result.push(cell.replace(/^"|"$/g, '').trim());
    return result;
  };

  const headers = splitRow(lines[0]);
  const records: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const values = splitRow(lines[i]);
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || "";
    });
    records.push(record);
  }
  
  return { headers, records };
}

// Format a single CSV record into structured semantic text
function formatRecordForSearch(datasetName: string, record: Record<string, string>): string {
  return Object.entries(record)
    .filter(([_, value]) => value && value.trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

export default function AIChatbot() {
  // --- STATE ---
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! I am your **Smart Recovery AI Advisor**. 
      
I can search through your local CSV athletic recovery databases, training records, and nutrition plans to give you precise guidance.

Ask me questions like:
- **"What to eat after heavy training?"**
- **"I have a hamstring strain, how do I continue progress?"**
- **"My sleep is low (4 hours) today, what should I do?"**`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [onlineMode, setOnlineMode] = useState(false);
  
  // Custom File upload state
  const [uploadName, setUploadName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active view states
  const [viewingDataset, setViewingDataset] = useState<Dataset | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page number on dataset view change
  useEffect(() => {
    setCurrentPage(1);
  }, [viewingDataset]);

  // --- INITIALIZE PRELOADED DATA ---
  useEffect(() => {
    // Read local storage settings
    const storedKey = localStorage.getItem("gemini_api_key") || "";
    const storedMode = localStorage.getItem("gemini_online_mode") === "true";
    setApiKey(storedKey);
    setOnlineMode(storedMode && !!storedKey);

    const initialDatasets: Dataset[] = [
      {
        id: "nutrition",
        name: "Nutrition & Meal Plans",
        isPreloaded: true,
        ...parseCSV(DEFAULT_NUTRITION_CSV),
      },
      {
        id: "recovery",
        name: "Recovery Guidelines",
        isPreloaded: true,
        ...parseCSV(DEFAULT_RECOVERY_CSV),
      },
      {
        id: "progress",
        name: "Athlete Logs & Coach Advice",
        isPreloaded: true,
        ...parseCSV(DEFAULT_PROGRESS_CSV),
      },
    ];

    // Load custom datasets from localStorage if any
    try {
      const savedCustom = localStorage.getItem("custom_datasets");
      if (savedCustom) {
        const parsedCustom: Dataset[] = JSON.parse(savedCustom);
        initialDatasets.push(...parsedCustom);
      }
    } catch (e) {
      console.error("Failed to load custom datasets", e);
    }

    setDatasets(initialDatasets);

    // Fetch the larger preloaded datasets from public directory
    const loadExtraDatasets = async () => {
      const extraDatasets: Dataset[] = [];
      try {
        const res1 = await fetch("/data/Athlete_recovery_dataset.csv");
        if (res1.ok) {
          const text1 = await res1.text();
          extraDatasets.push({
            id: "athlete_recovery_dataset",
            name: "Athlete Recovery Dataset",
            isPreloaded: true,
            ...parseCSV(text1),
          });
        }
      } catch (err) {
        console.error("Failed to load Athlete Recovery Dataset", err);
      }

      try {
        const res2 = await fetch("/data/Athlete_Training_Recovery_Tracker_Dataset.csv");
        if (res2.ok) {
          const text2 = await res2.text();
          extraDatasets.push({
            id: "athlete_training_recovery_tracker",
            name: "Athlete Training Recovery Tracker Dataset",
            isPreloaded: true,
            ...parseCSV(text2),
          });
        }
      } catch (err) {
        console.error("Failed to load Athlete Training Recovery Tracker Dataset", err);
      }

      try {
        const res3 = await fetch("/data/multimodal_sports_injury_dataset.csv");
        if (res3.ok) {
          const text3 = await res3.text();
          extraDatasets.push({
            id: "multimodal_sports_injury_dataset",
            name: "Multimodal Sports Injury Dataset",
            isPreloaded: true,
            ...parseCSV(text3),
          });
        }
      } catch (err) {
        console.error("Failed to load Multimodal Sports Injury Dataset", err);
      }

      if (extraDatasets.length > 0) {
        setDatasets((prev) => {
          // Filter out existing ones with the same IDs if any, just in case
          const filteredPrev = prev.filter(
            (d) => d.id !== "athlete_recovery_dataset" && d.id !== "athlete_training_recovery_tracker" && d.id !== "multimodal_sports_injury_dataset"
          );
          return [...filteredPrev, ...extraDatasets];
        });
      }
    };

    loadExtraDatasets();
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Save settings helpers
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
    if (!key) {
      setOnlineMode(false);
      localStorage.setItem("gemini_online_mode", "false");
    }
  };

  const handleToggleMode = (checked: boolean) => {
    if (checked && !apiKey) {
      alert("Please enter a Gemini API Key first to enable Online Mode.");
      return;
    }
    setOnlineMode(checked);
    localStorage.setItem("gemini_online_mode", checked ? "true" : "false");
  };

  // --- LOCAL RAG SEARCH ENGINE ---
  const performRAGSearch = (query: string, limit = 4) => {
    const queryTokens = query.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(token => token.length > 2 && !STOP_WORDS.has(token));

    const results: { dataset: string; text: string; score: number; record: Record<string, string> }[] = [];

    // Search through all records in all loaded datasets
    for (const dataset of datasets) {
      for (const record of dataset.records) {
        const text = formatRecordForSearch(dataset.name, record);
        const textLower = text.toLowerCase();
        let score = 0;

        if (queryTokens.length === 0) {
          // If no keywords after filter, match anything
          score = 0.1;
        } else {
          for (const token of queryTokens) {
            if (textLower.includes(token)) {
              score += 1;
              // Give extra weight if match is found in key attributes
              const keyFields = [
                "goal", "condition", "status", "athlete", "athletename", "mealplan", "recommendation", "instruction",
                "injury_type", "injury_severity", "sport_type", "fatigue_level", "recovery_index", "injury_risk", "athlete_id",
                "heart_rate", "body_temperature", "hydration_level", "sleep_quality", "recovery_score", "stress_level",
                "muscle_activity", "joint_angles", "gait_speed", "cadence", "step_count", "jump_height",
                "ground_reaction_force", "range_of_motion", "training_intensity", "training_duration", "training_load",
                "fatigue_index", "injury_occurred", "session_id"
              ];
              for (const field of keyFields) {
                if (record[field] && record[field].toLowerCase().includes(token)) {
                  score += 2;
                }
              }
            }
          }
        }

        if (score > 0) {
          results.push({
            dataset: dataset.name,
            text,
            score,
            record,
          });
        }
      }
    }

    // Sort by relevance score
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => ({ dataset: r.dataset, text: r.text, record: r.record }));
  };

  // --- LOCAL OFFLINE SYNTHESIS ---
  const generateOfflineResponse = (query: string, matches: { dataset: string; text: string; record: Record<string, string> }[]) => {
    if (matches.length === 0) {
      return `*(Running in Local Offline Mode. Add a Gemini API Key in Settings to get a more dynamic AI-style answer)*

I could not find a strong direct match for **"${query}"** in the current recovery data, so here is a safe general coaching response:

### 1. WHAT TO DO
- Rest and monitor your sleep, hydration, soreness, and fatigue before pushing harder.
- Avoid high-intensity work if you are still feeling run down.
- Check with your coach or clinician if symptoms are worsening.

### 2. HOW TO CONTINUE PROGRESS
- Ease back into training gradually rather than jumping straight back to your usual load.
- Keep the routine consistent and track how your body feels each day.
- If recovery markers stay poor, take a lighter day and rebuild slowly.

### 3. WHAT TO EAT
- Prioritize protein and carbohydrates after training to support repair and energy stores.
- Stay well hydrated with water or electrolyte fluids throughout the day.
- Keep meals simple, balanced, and recovery-focused.`;
    }

    const actionItems = matches
      .slice(0, 3)
      .map((match) => `- ${match.text.split(";").slice(0, 2).join(" • ")}`);

    return `*(Running in Local Offline Mode. Add a Gemini API Key in Settings to get a more dynamic AI-style answer)*

I found a few patterns that fit your question, and here is a practical coaching-style response:

### 1. WHAT TO DO
${actionItems.join("\n")}

### 2. HOW TO CONTINUE PROGRESS
- Build back gradually instead of jumping straight back into your usual intensity.
- Keep your recovery habits consistent and watch for changes in fatigue or soreness.
- If your body is still struggling, lower the load and give it more time.

### 3. WHAT TO EAT
- Aim for a balanced recovery meal with protein, carbohydrates, and fluids.
- Stay hydrated throughout the day, especially after training or hard sessions.
- Choose simple foods that support repair rather than anything overly restrictive.`;
  };

  // --- SUBMIT MESSAGE FLOW ---
  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    
    const queryText = customQuery || inputValue;
    if (!queryText.trim()) return;

    if (!customQuery) {
      setInputValue("");
    }

    // Add user message
    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      role: "user",
      content: queryText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    // Retrieve CSV contexts using Local Search
    const searchMatches = performRAGSearch(queryText);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: queryText,
          apiKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch response");
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
          matchedSources: data.matchedSources || [],
        },
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "system",
          content: `**Error while fetching from the backend knowledge base**: ${err.message}.`,
          timestamp: new Date(),
          matchedSources: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- CSV UPLOAD PROCESSOR ---
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = uploadName.trim() || file.name.replace(/\.[^/.]+$/, "");
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const { headers, records } = parseCSV(text);

        if (headers.length === 0 || records.length === 0) {
          alert("Error: The uploaded CSV appears to be empty or misformatted.");
          setIsUploading(false);
          return;
        }

        const newDataset: Dataset = {
          id: `custom_${Date.now()}`,
          name,
          records,
          headers,
          isPreloaded: false,
        };

        const updatedDatasets = [...datasets, newDataset];
        setDatasets(updatedDatasets);

        // Persist only custom datasets in localStorage
        const customOnly = updatedDatasets.filter(d => !d.isPreloaded);
        localStorage.setItem("custom_datasets", JSON.stringify(customOnly));

        setUploadName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        alert(`Success: Dataset "${name}" with ${records.length} records was added!`);
      } catch (error) {
        alert("An error occurred parsing the CSV file.");
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  // Delete custom dataset
  const handleDeleteDataset = (id: string) => {
    const updated = datasets.filter(d => d.id !== id);
    setDatasets(updated);
    
    const customOnly = updated.filter(d => !d.isPreloaded);
    localStorage.setItem("custom_datasets", JSON.stringify(customOnly));
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-57px)] w-full text-slate-200 overflow-hidden">
      {/* --- SIDE PANEL: DATASETS & CONFIG --- */}
      <div className="w-full lg:w-96 border-r border-white/5 bg-[#080d1e]/80 flex flex-col flex-shrink-0 h-1/2 lg:h-full overflow-y-auto p-4 space-y-4">
        {/* settings toggle button */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold tracking-wider text-slate-100 uppercase">Knowledge Base</h2>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-1.5 rounded-lg border hover:bg-white/5 transition-all",
              showSettings ? "border-purple-500/50 text-purple-400" : "border-white/10 text-slate-400"
            )}
            title="AI Config Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* --- SETTINGS CARD --- */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border border-white/10 rounded-2xl bg-white/5 space-y-3"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> API Configuration
            </h3>
            
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Gemini API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                placeholder="Paste Gemini API Key (AI mode)..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-black/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-300 font-medium">Use Gemini AI (Online Mode)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlineMode}
                  onChange={(e) => handleToggleMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
            
            <p className="text-[10px] text-slate-400 leading-normal">
              {onlineMode 
                ? "🚀 Gemini is enabled. RAG matching from CSV will be synthesized by Gemini 2.5."
                : "💡 Running locally. Query inputs will search CSV records and yield matching rows directly."
              }
            </p>
          </motion.div>
        )}

        <div className="p-4 border border-white/5 rounded-2xl bg-white/5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" /> Backend Knowledge Base
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Questions are answered from the preloaded datasets stored on the server, so no CSV upload is needed from the user.
          </p>
        </div>

        {/* --- DATASETS LIST --- */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            <span>Active Datasets</span>
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-slate-300">
              {datasets.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {datasets.map((d) => (
              <div
                key={d.id}
                className="group flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-400 border border-purple-500/20">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-xs font-semibold text-slate-200 truncate">{d.name}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{d.records.length} records</span>
                      <span>•</span>
                      <span className={cn(
                        "px-1 rounded",
                        d.isPreloaded ? "bg-cyan-500/10 text-cyan-400" : "bg-purple-500/10 text-purple-400"
                      )}>
                        {d.isPreloaded ? "preloaded" : "custom"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingDataset(d)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-all"
                    title="View Data Table"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {!d.isPreloaded && (
                    <button
                      onClick={() => handleDeleteDataset(d.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-white/5 transition-all"
                      title="Delete Dataset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MAIN CHAT INTERFACE --- */}
      <div className="flex-1 flex flex-col h-1/2 lg:h-full bg-[#050811] relative">
        {/* Top Header */}
        <div className="px-6 py-3.5 border-b border-white/5 bg-[#050811]/90 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">AI Recovery Advisor</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  onlineMode ? "bg-purple-400 animate-pulse" : "bg-emerald-400"
                )} />
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                  {onlineMode ? "Gemini 2.5 Flash (Synthesizing)" : "Local Offline (Keyword Match)"}
                </span>
              </div>
            </div>
          </div>
          {onlineMode && (
            <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full text-[10px] text-purple-400 font-bold uppercase">
              <Check className="w-3 h-3" /> API Online
            </div>
          )}
        </div>

        {/* Message Logs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const isAI = m.role === "assistant";
              const isSys = m.role === "system";
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "flex gap-4 max-w-4xl mx-auto",
                    isAI ? "justify-start" : isSys ? "justify-center" : "justify-end"
                  )}
                >
                  {isAI && (
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-purple-400 select-none">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className="group/msg flex flex-col max-w-[85%]">
                    <div
                      className={cn(
                        "rounded-2xl p-4 text-sm font-medium border leading-relaxed",
                        isAI
                          ? "bg-[#090d1f]/40 border-white/5 text-slate-200 backdrop-blur-md"
                          : isSys
                          ? "bg-rose-500/5 border-rose-500/10 text-rose-300 w-full"
                          : "bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border-purple-500/25 text-slate-100 shadow-[0_0_20px_rgba(168,85,247,0.03)]"
                      )}
                    >
                      {/* Markdown rendering simplified for standard formats */}
                      <div className="whitespace-pre-line prose prose-invert max-w-none text-left">
                        {m.content.split("\n").map((line, idx) => {
                          // bold formatting **text**
                          let parsed = line;
                          const boldRegex = /\*\*(.*?)\*\*/g;
                          const matchBold = line.match(boldRegex);
                          if (matchBold) {
                            parsed = line.replace(boldRegex, "<strong>$1</strong>");
                          }

                          // bullet points
                          if (line.trim().startsWith("- ")) {
                            return (
                              <div
                                key={idx}
                                className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-purple-400 my-0.5"
                                dangerouslySetInnerHTML={{ __html: parsed.replace(/^- /, "") }}
                              />
                            );
                          }
                          
                          // headers ### 
                          if (line.trim().startsWith("### ")) {
                            return (
                              <h4
                                key={idx}
                                className="text-sm font-bold text-slate-200 mt-4 mb-2 uppercase tracking-wide flex items-center gap-1.5"
                                dangerouslySetInnerHTML={{ __html: parsed.replace(/^### /, "") }}
                              />
                            );
                          }

                          return (
                            <p
                              key={idx}
                              className={cn(line.trim() === "" ? "h-2" : "my-1")}
                              dangerouslySetInnerHTML={{ __html: parsed }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Meta info & Sources */}
                    <div className={cn(
                      "flex items-center gap-2 mt-1.5 text-[10px] text-slate-500",
                      isAI ? "justify-start pl-1" : "justify-end pr-1"
                    )}>
                      <span>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {m.matchedSources && m.matchedSources.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-purple-400/80 font-semibold cursor-help" title={m.matchedSources.map(s => s.dataset).join(", ")}>
                            Matches: {m.matchedSources.length} CSV rows
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {!isAI && !isSys && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400 select-none">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 max-w-4xl mx-auto justify-start"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-purple-400 animate-spin">
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#090d1f]/40 border border-white/5 text-slate-400 rounded-2xl p-4 text-xs font-semibold backdrop-blur-md flex items-center gap-2.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  <span>AI Coach is scanning datasets and synthesizing answer...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Queries Chips */}
        {messages.length === 1 && (
          <div className="max-w-3xl mx-auto px-6 mb-4 w-full">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Suggested Prompt Scenarios</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {[
                { label: "What to eat post-training?", text: "what to eat for muscle recovery after high-intensity training?" },
                { label: "Check progress details", text: "how is David Chen's rehabilitation progressing and what is his plan?" },
                { label: "Low Sleep protocols", text: "what to do when my sleep score is low and sleep quality is poor?" },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(undefined, chip.text)}
                  className="p-3 text-left rounded-xl border border-white/5 bg-[#090d1f]/30 hover:bg-purple-500/5 hover:border-purple-500/30 text-xs font-medium text-slate-300 hover:text-white transition-all duration-300 flex items-start gap-2 group"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-400 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input Form */}
        <div className="p-4 border-t border-white/5 bg-[#050811]/90 backdrop-blur-md">
          <form onSubmit={(e) => handleSendMessage(e)} className="max-w-4xl mx-auto flex items-center gap-3 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask recovery guidelines, nutritional plans, or progress updates..."
              className="flex-1 px-4 py-3 bg-[#080d1e] border border-white/5 rounded-xl text-slate-200 placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/30 transition-all pr-12"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2 p-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-[0_0_10px_rgba(168,85,247,0.4)] disabled:opacity-40 disabled:hover:shadow-none hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="max-w-4xl mx-auto mt-2 flex items-center justify-between text-[9px] text-slate-500 px-1 font-semibold uppercase">
            <span>RAG Model active: {datasets.reduce((acc, d) => acc + d.records.length, 0)} records indexed</span>
            <span>Gemini 2.5 • Antigravity AI</span>
          </div>
        </div>
      </div>

      {/* --- DATA TABLE VIEWER MODAL --- */}
      <AnimatePresence>
        {viewingDataset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-5xl max-h-[85vh] bg-[#080c1d] border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/25 text-purple-400">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">{viewingDataset.name}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Database Content View ({viewingDataset.records.length} records)</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDataset(null)}
                  className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content - Table */}
              <div className="flex-1 overflow-auto p-6">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 text-purple-300 text-[10px] uppercase font-bold tracking-wider">
                      {viewingDataset.headers.map((h, idx) => (
                        <th key={idx} className="pb-3 px-4 font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                    {viewingDataset.records
                      .slice((currentPage - 1) * 15, currentPage * 15)
                      .map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-white/[0.02] transition-all">
                          {viewingDataset.headers.map((h, colIdx) => (
                            <td key={colIdx} className="py-3.5 px-4 font-medium leading-relaxed max-w-sm truncate whitespace-pre-line" title={row[h]}>
                              {row[h] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 border-t border-white/5 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500 font-semibold uppercase">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-purple-400" />
                  RAG indexed • {viewingDataset.records.length} records total
                </span>

                {/* Pagination Controls */}
                {viewingDataset.records.length > 15 && (
                  <div className="flex items-center gap-3 bg-black/20 px-3 py-1 rounded-lg border border-white/5">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-2 py-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 font-bold uppercase transition-colors"
                      type="button"
                    >
                      Prev
                    </button>
                    <span className="text-slate-300 text-xs font-mono font-medium">
                      Page {currentPage} of {Math.ceil(viewingDataset.records.length / 15)}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, Math.ceil(viewingDataset.records.length / 15))
                        )
                      }
                      disabled={currentPage === Math.ceil(viewingDataset.records.length / 15)}
                      className="px-2 py-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 font-bold uppercase transition-colors"
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setViewingDataset(null)}
                  className="px-4 py-1.5 rounded-lg border border-purple-500/20 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 hover:text-white text-[10px] font-bold uppercase transition-all"
                >
                  Close Viewer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
