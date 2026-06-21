"use client";

import { useAppStore } from "@/lib/store";
import { CheckCircle2, ShieldAlert, Target } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MatchReadinessPage() {
  const { athletes } = useAppStore();

  const readyAthletes = athletes.filter(a => a.recoveryScore >= 70 && a.injuryStatus === "Healthy");
  const questionableAthletes = athletes.filter(a => (a.recoveryScore >= 50 && a.recoveryScore < 70) || a.injuryStatus === "Caution");
  const outAthletes = athletes.filter(a => a.recoveryScore < 50 || a.injuryStatus === "Injured");

  const Section = ({ title, athletesList, color, borderColor, bg, icon: Icon, delay }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor, background: "rgba(15,23,42,0.6)" }}
    >
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor, background: bg }}>
        <Icon className="w-4 h-4" style={{ color }} />
        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color }}>
          {title}
        </h2>
        <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-black border" style={{ color, borderColor: `${color}50`, background: `${color}15` }}>
          {athletesList.length}
        </span>
      </div>
      {athletesList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
          {athletesList.map((a: any) => {
            const scoreColor = a.recoveryScore >= 70 ? "#4ade80" : a.recoveryScore >= 50 ? "#fbbf24" : "#f43f5e";
            return (
              <motion.div
                key={a.id}
                whileHover={{ scale: 1.03, y: -3, borderColor: `${color}40` }}
                whileTap={{ scale: 0.97 }}
                className="flex justify-between items-center p-3.5 rounded-xl border border-white/5 cursor-pointer transition-all"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div>
                  <p className="font-bold text-slate-200 text-sm">{a.name}</p>
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider mt-0.5">{a.position}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm" style={{ color: scoreColor }}>{a.recoveryScore}%</p>
                  <p className="text-[10px] text-slate-700 uppercase tracking-wider">Readiness</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <p className="px-5 py-6 text-slate-600 text-sm">No athletes in this category.</p>
      )}
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 grid-bg min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <h1 className="text-2xl font-black text-white">Match Readiness</h1>
          </div>
          <p className="text-slate-500 text-sm ml-11">Assess player availability for the upcoming fixture.</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168,85,247,0.3)" }}
          className="px-4 py-2 rounded-xl border border-purple-500/30 text-sm font-bold text-purple-300"
          style={{ background: "rgba(168,85,247,0.1)" }}
        >
          Next Match: Saturday
        </motion.div>
      </motion.div>

      <Section title="Ready to Play" athletesList={readyAthletes} color="#4ade80" borderColor="rgba(74,222,128,0.2)" bg="rgba(74,222,128,0.04)" icon={CheckCircle2} delay={0.1} />
      <Section title="Questionable / Monitor" athletesList={questionableAthletes} color="#fbbf24" borderColor="rgba(251,191,36,0.2)" bg="rgba(251,191,36,0.04)" icon={ShieldAlert} delay={0.2} />
      <Section title="Out / Not Ready" athletesList={outAthletes} color="#f43f5e" borderColor="rgba(244,63,94,0.2)" bg="rgba(244,63,94,0.04)" icon={ShieldAlert} delay={0.3} />
    </div>
  );
}
