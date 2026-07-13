import { NextResponse } from "next/server";

async function runOpenRouterChat(message: string, apiKey: string) {
  if (!apiKey) {
    throw new Error("API key is not configured.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct",
      messages: [
        { role: "system", content: "You are a helpful and supportive AI assistant." },
        { role: "user", content: message },
      ],
      temperature: 0.6,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No response generated.";
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const openRouterApiKey = process.env.OPENROUTER_API_KEY || "";
    
    const reply = await runOpenRouterChat(message, openRouterApiKey);

    return NextResponse.json({
      reply,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

