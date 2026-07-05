"use client";

import { useAppStore } from "@/lib/store";
import { Trophy, Flame, Star, Crown, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Leaderboard() {
  const { athletes } = useAppStore();
  const sorted = [...athletes].sort((a, b) => b.recoveryScore - a.recoveryScore);

  const rankColors: Record<number, { color: string; glow: string; icon: any; label: string }> = {
    0: { color: "#fbbf24", glow: "rgba(251,191,36,0.4)", icon: Crown, label: "Gold" },
    1: { color: "#94a3b8", glow: "rgba(148,163,184,0.3)", icon: Trophy, label: "Silver" },
    2: { color: "#f97316", glow: "rgba(249,115,22,0.3)", icon: Trophy, label: "Bronze" },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-6 space-y-6 grid-bg min-h-screen"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <h1 className="text-2xl font-black text-white">Leaderboard</h1>
        </div>
        <p className="text-slate-500 text-sm ml-11">Team recovery rankings. Stay on top.</p>
      </motion.div>

      {/* Top 3 Podium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4 pt-4"
      >
        {sorted.slice(0, 3).map((athlete, i) => {
          const rank = rankColors[i];
          const RankIcon = rank.icon;
          return (
            <motion.div
              key={athlete.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
              whileHover={{ scale: 1.04, y: -6, boxShadow: `0 0 40px ${rank.glow}` }}
              className={cn(
                "flex flex-col items-center p-5 rounded-2xl border text-center transition-all cursor-pointer",
                i === 0 ? "col-start-2" : ""
              )}
              style={{ borderColor: `${rank.color}30`, background: `radial-gradient(ellipse at top, ${rank.glow} 0%, transparent 70%), rgba(15,23,42,0.7)` }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: `${rank.color}20`, border: `1px solid ${rank.color}40` }}>
                <RankIcon className="w-6 h-6" style={{ color: rank.color, filter: `drop-shadow(0 0 6px ${rank.color})` }} />
              </div>
              <p className="font-black text-xs uppercase tracking-widest mb-1" style={{ color: rank.color }}>#{i + 1} {rank.label}</p>
              <p className="font-bold text-white text-sm">{athlete.name.split(" ")[0]}</p>
              <p className="text-[10px] text-slate-600 uppercase">{athlete.position}</p>
              <p className="text-2xl font-black mt-2" style={{ color: rank.color }}>{athlete.recoveryScore}%</p>
              <div className="flex items-center gap-1 mt-1">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-[10px] text-slate-500">{athlete.streakDays}d streak</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Full Ranking Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-white/5 overflow-hidden"
        style={{ background: "rgba(15,23,42,0.6)" }}
      >
        <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-2">
          <Star className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Full Rankings</h2>
        </div>
        <div className="divide-y divide-white/5">
          {sorted.map((athlete, i) => {
            const scoreColor = athlete.recoveryScore >= 80 ? "#4ade80" : athlete.recoveryScore >= 60 ? "#fbbf24" : "#f43f5e";
            const isTop3 = i < 3;
            return (
              <motion.div
                key={athlete.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.04 }}
                className="flex items-center gap-4 px-5 py-3.5 transition-all group cursor-pointer"
                style={{ background: "transparent" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(168,85,247,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span className={cn("text-sm font-black w-6 text-center", isTop3 ? "" : "text-slate-700")}
                  style={isTop3 ? { color: Object.values(rankColors)[i]?.color } : {}}>
                  {i + 1}
                </span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white flex-shrink-0"
                  style={{ background: `${scoreColor}20`, border: `1px solid ${scoreColor}30` }}>
                  {athlete.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate">{athlete.name}</p>
                  <p className="text-[10px] text-slate-600 uppercase">{athlete.position}</p>
                </div>
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame className="w-3 h-3" />
                  <span className="text-xs font-bold">{athlete.streakDays}d</span>
                </div>
                <div className="w-24 h-1.5 rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: scoreColor, boxShadow: `0 0 4px ${scoreColor}80` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${athlete.recoveryScore}%` }}
                    transition={{ duration: 0.8, delay: 0.6 + i * 0.04 }}
                  />
                </div>
                <span className="text-sm font-black w-10 text-right" style={{ color: scoreColor }}>
                  {athlete.recoveryScore}%
                </span>
                {isTop3 && (
                  <Zap className="w-3.5 h-3.5" style={{ color: Object.values(rankColors)[i]?.color }} />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
