"use client";

import { useAppStore } from "@/lib/store";
import { MetricGauge } from "@/components/shared/MetricGauge";
import { InjuryBadge } from "@/components/shared/InjuryBadge";
import { Activity, SortAsc, SortDesc } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function RecoveryScorePage() {
  const { athletes } = useAppStore();
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...athletes].sort((a, b) =>
    sortAsc ? a.recoveryScore - b.recoveryScore : b.recoveryScore - a.recoveryScore
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto p-6 space-y-6 grid-bg min-h-screen"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-green-400" />
            </div>
            <h1 className="text-2xl font-black text-white">Recovery Scores</h1>
          </div>
          <p className="text-slate-500 text-sm ml-11">Live biometric recovery data for all athletes.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm font-semibold transition-colors"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {sortAsc ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          {sortAsc ? "Lowest First" : "Highest First"}
        </motion.button>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sorted.map((athlete, i) => {
          const scoreColor = athlete.recoveryScore >= 80 ? "#4ade80" : athlete.recoveryScore >= 60 ? "#fbbf24" : "#f43f5e";
          const glowColor = athlete.recoveryScore >= 80 ? "rgba(74,222,128,0.15)" : athlete.recoveryScore >= 60 ? "rgba(251,191,36,0.15)" : "rgba(244,63,94,0.15)";

          return (
            <motion.div
              key={athlete.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
              whileHover={{
                scale: 1.04,
                y: -6,
                boxShadow: `0 0 30px ${glowColor}, 0 20px 40px rgba(0,0,0,0.3)`,
                borderColor: `${scoreColor}40`,
              }}
              whileTap={{ scale: 0.97 }}
              className="rounded-2xl border border-white/5 p-5 flex flex-col items-center gap-3 cursor-pointer transition-all"
              style={{ background: `radial-gradient(ellipse at top, ${glowColor} 0%, transparent 60%), rgba(15,23,42,0.7)` }}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white"
                style={{ background: `${scoreColor}20`, border: `1px solid ${scoreColor}30` }}>
                {athlete.name.split(" ").map(n => n[0]).join("")}
              </div>

              <div className="text-center">
                <p className="font-bold text-slate-200 text-sm">{athlete.name}</p>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider">{athlete.position}</p>
              </div>

              <MetricGauge value={athlete.recoveryScore} label="" size="sm" />

              <InjuryBadge status={athlete.injuryStatus} />

              {/* Biometric mini bars */}
              <div className="w-full space-y-1.5 pt-2 border-t border-white/5">
                {[
                  { label: "SLP", val: athlete.biometrics.sleep, color: "#a855f7" },
                  { label: "HYD", val: athlete.biometrics.hydration, color: "#22d3ee" },
                  { label: "FAT", val: athlete.biometrics.fatigue, color: "#fbbf24" },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-700 uppercase w-6">{b.label}</span>
                    <div className="flex-1 h-1 rounded-full bg-white/5">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: b.color, width: `${b.val}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${b.val}%` }}
                        transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                      />
                    </div>
                    <span className="text-[9px] font-bold w-6 text-right" style={{ color: b.color }}>{b.val}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
