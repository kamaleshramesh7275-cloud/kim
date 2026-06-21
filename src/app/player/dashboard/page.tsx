"use client";

import { useAppStore } from "@/lib/store";
import { CheckCircle2, XCircle, ChevronRight, Activity, Moon, Droplets, Flame, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function PlayerDashboard() {
  const { user, athletes } = useAppStore();
  const athlete = athletes.find(a => a.id === user?.id) || athletes[0];

  const score = athlete.recoveryScore;
  const scoreColor = score >= 80 ? "#4ade80" : score >= 60 ? "#fbbf24" : "#f43f5e";
  const glowColor = score >= 80 ? "rgba(74,222,128,0.3)" : score >= 60 ? "rgba(251,191,36,0.3)" : "rgba(244,63,94,0.3)";
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (score / 100) * circumference;

  const xpLevel = Math.floor(athlete.streakDays / 7) + 1;
  const xpProgress = (athlete.streakDays % 7) / 7 * 100;

  const recommendations = [
    { id: 1, text: "Increase sleep duration to 8+ hours", icon: Moon, color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "border-purple-500/20" },
    { id: 2, text: "Drink 1L of water in the next 2 hours", icon: Droplets, color: "#22d3ee", bg: "rgba(34,211,238,0.1)", border: "border-cyan-500/20" },
    { id: 3, text: "Light stretching for hamstring tightness", icon: Activity, color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "border-green-500/20" },
  ];

  const statuses = [
    { label: "Sleep", value: athlete.biometrics.sleep, icon: Moon },
    { label: "Hydration", value: athlete.biometrics.hydration, icon: Droplets },
    { label: "Soreness", value: athlete.biometrics.soreness, icon: Activity },
    { label: "Stress", value: athlete.biometrics.stress, icon: Flame },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto p-6 space-y-6 grid-bg min-h-screen"
    >
      {/* Greeting */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">
            Welcome back, <span className="text-purple-400">{athlete.name.split(" ")[0]}</span>!
          </h1>
          <p className="text-slate-500 text-sm mt-1">Your recovery intel for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10">
            <Flame className="w-4 h-4 text-amber-400 fill-current" />
            <span className="text-sm font-bold text-amber-300">{athlete.streakDays} day streak</span>
          </div>
        </div>
      </motion.div>

      {/* XP Bar */}
      <motion.div variants={item} className="rounded-xl border border-purple-500/20 p-3 flex items-center gap-4"
        style={{ background: "rgba(168,85,247,0.05)" }}>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">LVL {xpLevel}</span>
        </div>
        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #a855f7, #22d3ee)" }}
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
          />
        </div>
        <span className="text-xs text-slate-500">{athlete.streakDays % 7}/7 days to LVL {xpLevel + 1}</span>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Ring */}
        <motion.div
          variants={item}
          whileHover={{ scale: 1.02, boxShadow: glowColor ? `0 0 40px ${glowColor}` : undefined }}
          className="lg:col-span-1 rounded-2xl border p-6 flex flex-col items-center justify-center gap-4 text-center transition-all"
          style={{
            borderColor: `${scoreColor}30`,
            background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 70%), rgba(15,23,42,0.6)`
          }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Recovery Score</p>
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90">
              <circle cx="70" cy="70" r="60" strokeWidth="8" fill="none" stroke="rgba(255,255,255,0.05)" />
              <motion.circle
                cx="70" cy="70" r="60" strokeWidth="8" fill="none"
                stroke={scoreColor}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 8px ${scoreColor})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, type: "spring" }}
                className="text-4xl font-black text-white"
              >{score}%</motion.span>
              <span className="text-[10px] uppercase tracking-widest" style={{ color: scoreColor }}>
                {score >= 80 ? "Peak Form" : score >= 60 ? "Moderate" : "High Risk"}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-[180px]">
            {score >= 80 ? "You're primed for peak performance." : "Take it easy. Prioritize recovery."}
          </p>
          <div className="flex gap-2">
            {["STR", "END", "SPD"].map((stat, i) => (
              <div key={stat} className="flex flex-col items-center px-3 py-1.5 rounded-lg border border-white/5 bg-white/3">
                <span className="text-[10px] text-slate-600 uppercase">{stat}</span>
                <span className="text-xs font-bold text-white">{Math.floor(70 + i * 8 + score * 0.1)}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Daily Status */}
          <motion.div variants={item} className="rounded-2xl border border-white/5 p-5"
            style={{ background: "rgba(15,23,42,0.6)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Daily Biometrics</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {statuses.map((stat, idx) => {
                const isGood = stat.value >= 70;
                const statColor = isGood ? "#4ade80" : "#f43f5e";
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col items-center p-3 rounded-xl border border-white/5 bg-white/3 gap-2"
                  >
                    <stat.icon className="w-5 h-5" style={{ color: statColor }} />
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                    <span className="text-lg font-black text-white">{stat.value}%</span>
                    <div className="w-full h-1 rounded-full bg-white/5">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: statColor, boxShadow: `0 0 6px ${statColor}` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                      />
                    </div>
                    {isGood
                      ? <CheckCircle2 className="w-3 h-3 text-green-400" />
                      : <XCircle className="w-3 h-3 text-rose-400" />}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Smart Recommendations */}
          <motion.div variants={item} className="rounded-2xl border border-white/5 p-5"
            style={{ background: "rgba(15,23,42,0.6)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Smart Recommendations</h2>
            </div>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  whileHover={{ x: 4, borderColor: rec.color + "40" }}
                  className={`flex items-center p-3 rounded-xl border ${rec.border} cursor-pointer group transition-all`}
                  style={{ background: rec.bg }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 border border-white/5">
                    <rec.icon className="w-4 h-4" style={{ color: rec.color }} />
                  </div>
                  <p className="flex-1 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                    {rec.text}
                  </p>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
