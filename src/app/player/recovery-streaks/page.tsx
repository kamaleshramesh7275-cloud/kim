"use client";

import { useAppStore } from "@/lib/store";
import { Flame, Star, CheckCircle2, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";

const MILESTONES = [
  { days: 3, label: "3-Day Streak", icon: "🔥", color: "#f97316" },
  { days: 7, label: "One Week", icon: "⚡", color: "#fbbf24" },
  { days: 14, label: "Two Weeks", icon: "🌟", color: "#a855f7" },
  { days: 30, label: "Monthly", icon: "💎", color: "#22d3ee" },
  { days: 60, label: "Champion", icon: "👑", color: "#4ade80" },
];

export default function RecoveryStreaks() {
  const { user, athletes, updateBiometrics } = useAppStore();
  const athlete = athletes.find(a => a.id === user?.id) || athletes[0];
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      sleep: athlete.biometrics.sleep,
      hydration: athlete.biometrics.hydration,
      soreness: athlete.biometrics.soreness,
      fatigue: athlete.biometrics.fatigue,
      stress: athlete.biometrics.stress,
    }
  });

  const onSubmit = (data: any) => {
    updateBiometrics(athlete.id, {
      sleep: Number(data.sleep),
      hydration: Number(data.hydration),
      soreness: Number(data.soreness),
      fatigue: Number(data.fatigue),
      stress: Number(data.stress),
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    reset();
  };

  const fields = [
    { key: "sleep", label: "Sleep Quality", color: "#a855f7" },
    { key: "hydration", label: "Hydration", color: "#22d3ee" },
    { key: "soreness", label: "Soreness (lower = better)", color: "#f43f5e" },
    { key: "fatigue", label: "Fatigue (lower = better)", color: "#fbbf24" },
    { key: "stress", label: "Stress (lower = better)", color: "#f97316" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-6 space-y-6 grid-bg min-h-screen"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <h1 className="text-2xl font-black text-white">Recovery Streaks</h1>
          </div>
          <p className="text-slate-500 text-sm ml-11">Log daily biometrics. Build your streak.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-500/30"
          style={{ background: "rgba(249,115,22,0.1)" }}>
          <Flame className="w-4 h-4 text-orange-400 fill-current" />
          <span className="text-lg font-black text-orange-300">{athlete.streakDays}</span>
          <span className="text-xs text-slate-500">day streak</span>
        </div>
      </motion.div>

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/5 p-5"
        style={{ background: "rgba(15,23,42,0.6)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Streak Milestones</h2>
        </div>
        <div className="flex gap-3 flex-wrap">
          {MILESTONES.map((m, i) => {
            const unlocked = athlete.streakDays >= m.days;
            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.08, y: -4, boxShadow: unlocked ? `0 0 20px ${m.color}40` : "none" }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border cursor-pointer transition-all"
                style={{
                  borderColor: unlocked ? `${m.color}40` : "rgba(255,255,255,0.05)",
                  background: unlocked ? `${m.color}10` : "rgba(255,255,255,0.02)",
                  opacity: unlocked ? 1 : 0.4
                }}
              >
                <span className="text-xl">{m.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: unlocked ? m.color : "#475569" }}>
                  {m.label}
                </span>
                {unlocked && <Zap className="w-3 h-3" style={{ color: m.color }} />}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Daily Log Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/5 p-5"
        style={{ background: "rgba(15,23,42,0.6)" }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Log Today's Biometrics</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map(({ key, label, color }) => (
            <div key={key}>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                <span className="text-xs font-bold" style={{ color }}>0–100</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                {...register(key as any)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: color }}
              />
            </div>
          ))}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(168,85,247,0.4)" }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mt-2"
            style={{ background: "linear-gradient(135deg, #a855f7, #22d3ee)" }}
          >
            {submitted ? (
              <><CheckCircle2 className="w-4 h-4" /> Logged! Streak Updated</>
            ) : (
              <><Flame className="w-4 h-4" /> Submit Daily Log</>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
