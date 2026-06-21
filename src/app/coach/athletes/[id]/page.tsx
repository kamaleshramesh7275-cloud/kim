"use client";

import { useAppStore } from "@/lib/store";
import { useParams, useRouter } from "next/navigation";
import { MetricGauge } from "@/components/shared/MetricGauge";
import { InjuryBadge } from "@/components/shared/InjuryBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ArrowLeft, MessageSquare, Activity, HeartPulse, ShieldAlert, Settings, Flame, User } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AthleteProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { athletes } = useAppStore();
  const athlete = athletes.find(a => a.id === id);
  const [dialogConfig, setDialogConfig] = useState<{ title: string; desc: string } | null>(null);

  if (!athlete) {
    return <div className="min-h-screen grid-bg flex items-center justify-center text-slate-600">Athlete not found</div>;
  }

  const scoreColor = athlete.recoveryScore >= 80 ? "#4ade80" : athlete.recoveryScore >= 60 ? "#fbbf24" : "#f43f5e";
  const glowColor = athlete.recoveryScore >= 80 ? "rgba(74,222,128,0.15)" : athlete.recoveryScore >= 60 ? "rgba(251,191,36,0.15)" : "rgba(244,63,94,0.15)";

  const actions = [
    { label: "Adjust Training Load", icon: Settings, color: "#a855f7", hoverGlow: "rgba(168,85,247,0.15)", title: "Adjust Training", desc: `Reduce load for ${athlete.name} for the next 3 days.` },
    { label: "Medical Referral", icon: ShieldAlert, color: "#f43f5e", hoverGlow: "rgba(244,63,94,0.15)", title: "Medical Referral", desc: `Send ${athlete.name} for an MRI and medical evaluation.` },
    { label: "Message Player", icon: MessageSquare, color: "#22d3ee", hoverGlow: "rgba(34,211,238,0.15)", title: "Message Player", desc: `Send a direct message to ${athlete.name}.` },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto p-6 space-y-6 grid-bg min-h-screen"
    >
      {/* Confirm Dialog */}
      {dialogConfig && (
        <ConfirmDialog
          title={dialogConfig.title}
          description={dialogConfig.desc}
          onConfirm={() => { alert(`Action '${dialogConfig.title}' confirmed.`); setDialogConfig(null); }}
          onCancel={() => setDialogConfig(null)}
        />
      )}

      {/* Back */}
      <motion.button
        variants={item}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to roster
      </motion.button>

      {/* Profile Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row gap-5">
        <div className="flex-1 rounded-2xl border border-white/5 p-6 flex items-center gap-6"
          style={{ background: `radial-gradient(ellipse at left, ${glowColor} 0%, transparent 60%), rgba(15,23,42,0.7)` }}>
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
            style={{ background: `${scoreColor}20`, border: `2px solid ${scoreColor}40`, boxShadow: `0 0 20px ${glowColor}` }}>
            {athlete.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-black text-white">{athlete.name}</h1>
              <InjuryBadge status={athlete.injuryStatus} />
            </div>
            <p className="text-slate-500 text-sm uppercase tracking-wider">{athlete.position}</p>
            <div className="flex gap-3 mt-4 flex-wrap">
              <div className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/5 text-slate-500"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                Updated: {athlete.lastUpdated}
              </div>
              <div className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316" }}>
                <Flame className="w-3 h-3" />
                {athlete.streakDays} Day Streak
              </div>
              <div className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: `${scoreColor}15`, border: `1px solid ${scoreColor}30`, color: scoreColor }}>
                Recovery: {athlete.recoveryScore}%
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="rounded-2xl border border-white/5 p-5 md:w-72 space-y-2"
          style={{ background: "rgba(15,23,42,0.7)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">Coach Actions</p>
          {actions.map(action => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.02, x: 4, backgroundColor: action.hoverGlow, borderColor: `${action.color}40` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDialogConfig({ title: action.title, desc: action.desc })}
              className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl border border-white/5 text-sm font-semibold transition-all text-left"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <action.icon className="w-4 h-4" style={{ color: action.color }} />
              <span className="text-slate-300">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biometrics */}
        <motion.div variants={item} className="rounded-2xl border border-white/5 p-6"
          style={{ background: "rgba(15,23,42,0.7)" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="font-bold text-white uppercase tracking-wider text-sm">Recovery Breakdown</h2>
            </div>
            <span className="text-2xl font-black" style={{ color: scoreColor }}>{athlete.recoveryScore}%</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: athlete.biometrics.sleep, label: "Sleep" },
              { value: athlete.biometrics.hydration, label: "Hydration" },
              { value: athlete.biometrics.soreness, label: "Soreness" },
              { value: athlete.biometrics.fatigue, label: "Fatigue" },
              { value: athlete.biometrics.stress, label: "Stress" },
              { value: athlete.biometrics.trainingLoad, label: "Load" },
            ].map(m => (
              <motion.div
                key={m.label}
                whileHover={{ scale: 1.08 }}
                className="flex justify-center cursor-default"
              >
                <MetricGauge value={m.value} label={m.label} size="sm" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Medical Status */}
        <div className="space-y-4">
          <motion.div variants={item} className="rounded-2xl border border-white/5 p-5"
            style={{ background: "rgba(15,23,42,0.7)" }}>
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <h2 className="font-bold text-white uppercase tracking-wider text-sm">Current Medical Status</h2>
            </div>
            {athlete.currentInjury ? (
              <div className="space-y-3">
                {[
                  { label: "Diagnosis", value: athlete.currentInjury.type, color: "#f43f5e" },
                  { label: "Severity", value: athlete.currentInjury.severity, color: "#fbbf24" },
                  { label: "Est. Return", value: athlete.currentInjury.timeline, color: "#22d3ee" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-xs text-slate-600 uppercase tracking-wider">{row.label}</span>
                    <span className="text-sm font-bold capitalize" style={{ color: row.color }}>{row.value}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <p className="text-xs text-slate-600 uppercase tracking-wider mb-2">Rehab Protocol</p>
                  <p className="text-sm text-slate-400 leading-relaxed p-3 rounded-xl border border-white/5"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    {athlete.currentInjury.rehabPlan}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-green-500/20"
                style={{ background: "rgba(74,222,128,0.06)" }}>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: "0 0 6px rgba(74,222,128,0.6)" }} />
                <span className="text-sm font-semibold text-green-300">Athlete cleared for full training.</span>
              </div>
            )}
          </motion.div>

          {/* Injury History */}
          <motion.div variants={item} className="rounded-2xl border border-white/5 overflow-hidden"
            style={{ background: "rgba(15,23,42,0.7)" }}>
            <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <h2 className="font-bold text-white uppercase tracking-wider text-sm">Injury History</h2>
            </div>
            <div className="divide-y divide-white/5">
              {athlete.pastInjuries.length > 0 ? athlete.pastInjuries.map(injury => (
                <motion.div
                  key={injury.id}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.02)", x: 4 }}
                  className="flex justify-between items-center px-5 py-3 cursor-pointer transition-all"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-300">{injury.type}</p>
                    <p className="text-xs text-slate-600">{injury.date}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" }}>
                    Resolved
                  </span>
                </motion.div>
              )) : (
                <p className="px-5 py-6 text-sm text-slate-600">No past injuries on record.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
