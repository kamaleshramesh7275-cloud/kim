"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! I am your **AI Chatbot**. Ask me anything!`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    
    const queryText = customQuery || inputValue;
    if (!queryText.trim()) return;

    if (!customQuery) {
      setInputValue("");
    }

    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      role: "user",
      content: queryText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: queryText,
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
        },
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `*(Error: ${err.message})*`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  function formatMessageTime(timestamp: Date) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(timestamp);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] w-full text-slate-200 bg-[#050811] relative">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-[#050811]/90 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-wide">AI Assistant</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400 font-medium tracking-wide">Online</span>
            </div>
          </div>
        </div>
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
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-purple-400 select-none shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div className="group/msg flex flex-col max-w-[85%]">
                  <div
                    className={cn(
                      "rounded-2xl p-5 text-[15px] font-medium border leading-relaxed shadow-sm",
                      isAI
                        ? "bg-[#090d1f]/60 border-white/5 text-slate-200 backdrop-blur-md"
                        : isSys
                        ? "bg-rose-500/5 border-rose-500/10 text-rose-300 w-full"
                        : "bg-gradient-to-br from-purple-500/15 to-cyan-500/10 border-purple-500/30 text-slate-100 shadow-[0_0_20px_rgba(168,85,247,0.05)]"
                    )}
                  >
                    <div className="whitespace-pre-line prose prose-invert max-w-none text-left">
                      {m.content}
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className={cn(
                    "flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium",
                    isAI ? "justify-start pl-2" : "justify-end pr-2"
                  )}>
                    <span>{formatMessageTime(m.timestamp)}</span>
                  </div>
                </div>

                {!isAI && !isSys && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400 select-none shadow-sm">
                    <User className="w-5 h-5" />
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
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-purple-400 animate-spin shadow-sm">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="bg-[#090d1f]/60 border border-white/5 text-slate-400 rounded-2xl p-5 text-sm font-semibold backdrop-blur-md flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400 flex-shrink-0" />
                  <span>Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Message Input Form */}
      <div className="p-5 border-t border-white/5 bg-[#050811]/90 backdrop-blur-md">
        <form onSubmit={(e) => handleSendMessage(e)} className="max-w-4xl mx-auto flex items-center gap-3 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-5 py-4 bg-[#080d1e] border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all pr-14 shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-3 p-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] disabled:opacity-40 disabled:hover:shadow-none hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
