"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Copy, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

const generatePermanentCode = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const saveCoachPermanentCode = (code: string) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("coachPermanentCode", code);
    document.cookie = `coachPermanentCode=${code}; path=/`;
  }
};

export default function CoachProfilePage() {
  const { user, setCoachPermanentCode, coachPermanentCode } = useAppStore();
  const [code, setCode] = useState<string>(coachPermanentCode || "");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedCode = window.localStorage.getItem("coachPermanentCode");
    if (savedCode) {
      setCode(savedCode);
      setCoachPermanentCode(savedCode);
      return;
    }

    const newCode = generatePermanentCode();
    setCode(newCode);
    setCoachPermanentCode(newCode);
    saveCoachPermanentCode(newCode);
  }, [setCoachPermanentCode]);

  const handleRegenerate = () => {
    const newCode = generatePermanentCode();
    setCode(newCode);
    setCoachPermanentCode(newCode);
    saveCoachPermanentCode(newCode);
  };

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
  };

  const userName = user?.name ?? "Coach";

  const instructions = useMemo(
    () => [
      "Sign in to your coach account.",
      "Visit this profile page to generate your permanent coach code.",
      "Share the code only with players who should sign in.",
      "Players must enter the correct code before using their email and password.",
    ],
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-6 grid-bg min-h-screen"
    >
      <div className="flex items-center gap-3 text-slate-400 text-sm mb-4">
        <Link href="/coach/dashboard" className="inline-flex items-center gap-2 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>
      </div>

      <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#09101f] shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
        <div className="px-8 py-8 border-b border-white/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-300">Coach Profile</p>
              <h1 className="mt-3 text-3xl lg:text-4xl font-black text-white">Welcome back, {userName}</h1>
              <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-6">
                This page generates your permanent coach access code. Players must enter this code on the player login page before they can sign in with email and password.
              </p>
            </div>
            <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-cyan-100">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.32em] text-slate-300">Current role</p>
                  <p className="mt-2 text-lg font-semibold">Coach</p>
                </div>
                <ShieldCheck className="w-7 h-7 text-cyan-300" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#091825] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Permanent Coach Code</p>
                  <div className="mt-3 inline-flex items-center gap-3 rounded-3xl border border-white/10 bg-[#07101c] px-4 py-3">
                    <p className="text-4xl font-black text-white tracking-[0.2em]">
                      {code || "GENERATING"}
                    </p>
                    <button
                      type="button"
                      onClick={handleCopy}
                      title="Copy permanent code"
                      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/15"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <RefreshCcw className="w-4 h-4" /> Regenerate
                  </button>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-400 leading-6">
                Share this code only with trusted players on your team. Once entered correctly, players can finish signing in with their email and password.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#091825] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">How it works</p>
              <ol className="mt-4 space-y-3 text-slate-300 text-sm list-decimal list-inside">
                {instructions.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0c1723] p-6">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Account details</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-white/5 bg-[#09101d] p-4">
                <p className="text-xs uppercase text-slate-500">Name</p>
                <p className="mt-2 text-lg font-semibold text-white">{userName}</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-[#09101d] p-4">
                <p className="text-xs uppercase text-slate-500">Role</p>
                <p className="mt-2 text-lg font-semibold text-white">Coach</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
