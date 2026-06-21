"use client";

import { useAppStore } from "@/lib/store";
import { InjuryBadge } from "@/components/shared/InjuryBadge";
import Link from "next/link";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const cardItem = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function TeamOverviewPage() {
  const { athletes } = useAppStore();

  const groups = [
    { title: "Forwards", emoji: "⚡", players: athletes.filter(a => a.position === "Forward") },
    { title: "Midfielders", emoji: "🎯", players: athletes.filter(a => a.position === "Midfielder") },
    { title: "Defenders", emoji: "🛡️", players: athletes.filter(a => a.position === "Defender") },
    { title: "Goalkeepers", emoji: "🥅", players: athletes.filter(a => a.position === "Goalkeeper") },
  ].filter(g => g.players.length > 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 grid-bg min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white tracking-tight">Team Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Tactical view of roster health and readiness.</p>
      </motion.div>

      {groups.map((group, gi) => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{group.emoji}</span>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{group.title}</h2>
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-slate-600">{group.players.length} players</span>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {group.players.map(p => {
              const scoreColor = p.recoveryScore >= 80 ? "#4ade80" : p.recoveryScore >= 60 ? "#fbbf24" : "#f43f5e";
              const glowColor = p.recoveryScore >= 80 ? "rgba(74,222,128,0.12)" : p.recoveryScore >= 60 ? "rgba(251,191,36,0.12)" : "rgba(244,63,94,0.12)";
              return (
                <motion.div
                  key={p.id}
                  variants={cardItem}
                  whileHover={{
                    scale: 1.03,
                    y: -4,
                    boxShadow: `0 0 30px ${glowColor}, 0 20px 40px rgba(0,0,0,0.3)`,
                    borderColor: `${scoreColor}40`
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl border border-white/5 p-4 cursor-pointer transition-all"
                  style={{ background: "rgba(15,23,42,0.7)" }}
                >
                  <Link href={`/coach/athletes/${p.id}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white"
                          style={{ background: `linear-gradient(135deg, ${scoreColor}30, ${scoreColor}10)`, border: `1px solid ${scoreColor}30` }}
                        >
                          {p.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-200 text-sm">{p.name}</h3>
                          <p className="text-[10px] text-slate-600 uppercase tracking-wider">{p.position}</p>
                        </div>
                      </div>
                      <InjuryBadge status={p.injuryStatus} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 uppercase tracking-wider">Recovery</span>
                        <span className="font-black" style={{ color: scoreColor }}>{p.recoveryScore}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}80)`, boxShadow: `0 0 6px ${scoreColor}60` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${p.recoveryScore}%` }}
                          transition={{ duration: 1, delay: 0.3 + gi * 0.1 }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-slate-700">Streak: {p.streakDays}d</span>
                      <span className="text-[10px] font-semibold text-purple-400 group-hover:text-purple-300">
                        View Profile →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
