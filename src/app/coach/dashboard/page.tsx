"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { AlertBadge } from "@/components/shared/AlertBadge";
import { Users, AlertTriangle, Flame, TrendingUp, Shield, Database } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function CoachDashboard() {
  const { teamOverview, alerts, athletes, datasetSummary, hydrateFromDatasets } = useAppStore();

  useEffect(() => {
    void hydrateFromDatasets();
  }, [hydrateFromDatasets]);

  const avgScore = teamOverview.avgRecoveryScore;
  const scoreColor = avgScore >= 80 ? "#4ade80" : avgScore >= 60 ? "#fbbf24" : "#f43f5e";
  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (avgScore / 100) * circumference;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto p-6 space-y-6 grid-bg min-h-screen"
    >
      {/* Page Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Team Command Center</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor. Analyze. Dominate.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-500/30 bg-green-500/10">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-green-400">LIVE</span>
        </div>
      </motion.div>

      {datasetSummary && (
        <motion.div variants={item} className="rounded-2xl border border-cyan-500/20 p-4 flex items-center justify-between" style={{ background: "rgba(34,211,238,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Dataset-backed insights</p>
              <p className="text-xs text-slate-400">Loaded {datasetSummary.recoveryRows} recovery records and {datasetSummary.trainingRows} training records.</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Sources</p>
            <p className="font-semibold text-slate-300">Athlete recovery + training tracker</p>
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recovery Score Gauge */}
        <motion.div
          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(168,85,247,0.2)" }}
          className="col-span-2 lg:col-span-1 rounded-2xl border border-purple-500/20 p-5 flex flex-col items-center justify-center gap-3"
          style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(34,211,238,0.04))" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-purple-400">Avg Recovery</p>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="56" strokeWidth="6" fill="none" stroke="rgba(255,255,255,0.05)" />
              <motion.circle
                cx="64" cy="64" r="56" strokeWidth="6" fill="none"
                stroke={scoreColor}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${scoreColor})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="text-3xl font-black text-white"
              >{avgScore}%</motion.span>
              <span className="text-[10px] text-slate-500">TEAM AVG</span>
            </div>
          </div>
        </motion.div>

        {/* Total Athletes */}
        <motion.div
          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34,211,238,0.15)" }}
          className="rounded-2xl border border-cyan-500/20 p-5 flex flex-col justify-between"
          style={{ background: "rgba(34,211,238,0.05)" }}
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-white">{teamOverview.totalAthletes}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Athletes</p>
          </div>
          <div className="w-full h-1 rounded-full bg-white/5 mt-2">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300" style={{ width: "100%" }} />
          </div>
        </motion.div>

        {/* High Risk */}
        <motion.div
          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(244,63,94,0.15)" }}
          className="rounded-2xl border border-rose-500/20 p-5 flex flex-col justify-between"
          style={{ background: "rgba(244,63,94,0.05)" }}
        >
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-white">{teamOverview.highRiskCount}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">High Risk</p>
          </div>
          <div className="w-full h-1 rounded-full bg-white/5 mt-2">
            <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400"
              style={{ width: `${(teamOverview.highRiskCount / teamOverview.totalAthletes) * 100}%` }} />
          </div>
        </motion.div>

        {/* Workload Alerts */}
        <motion.div
          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(251,191,36,0.15)" }}
          className="rounded-2xl border border-amber-500/20 p-5 flex flex-col justify-between"
          style={{ background: "rgba(251,191,36,0.05)" }}
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-white">{teamOverview.workloadAlertsCount}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Workload Alerts</p>
          </div>
          <div className="w-full h-1 rounded-full bg-white/5 mt-2">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300"
              style={{ width: `${(teamOverview.workloadAlertsCount / teamOverview.totalAthletes) * 100}%` }} />
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <motion.div variants={item} className="lg:col-span-2 rounded-2xl border border-white/5 overflow-hidden"
          style={{ background: "rgba(15,23,42,0.6)" }}>
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Alerts</h2>
            </div>
            <Link href="/coach/injury-alerts">
              <span className="text-xs font-semibold text-purple-400 hover:text-purple-300 cursor-pointer transition-colors">View All →</span>
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {alerts.filter(a => !a.isResolved).slice(0, 5).map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-white/3 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-white">{alert.athleteName}</span>
                    <AlertBadge severity={alert.severity} type={alert.type} />
                  </div>
                  <p className="text-xs text-slate-500">{alert.message}</p>
                </div>
                <span className="text-[10px] text-slate-600">{new Date(alert.date).toLocaleDateString()}</span>
              </motion.div>
            ))}
            {alerts.filter(a => !a.isResolved).length === 0 && (
              <div className="px-5 py-8 text-center text-slate-600 text-sm">All clear. No active alerts.</div>
            )}
          </div>
        </motion.div>

        {/* Top Performers */}
        <motion.div variants={item} className="rounded-2xl border border-white/5 overflow-hidden"
          style={{ background: "rgba(15,23,42,0.6)" }}>
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Top Performers</h2>
          </div>
          <div className="p-4 space-y-3">
            {[...athletes].sort((a, b) => b.recoveryScore - a.recoveryScore).slice(0, 5).map((athlete, i) => (
              <motion.div
                key={athlete.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <span className={`text-xs font-black w-5 ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-600" : "text-slate-600"}`}>
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{athlete.name}</p>
                  <div className="w-full h-1 rounded-full bg-white/5 mt-1">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: athlete.recoveryScore >= 80 ? "linear-gradient(90deg,#4ade80,#22d3ee)" :
                          athlete.recoveryScore >= 60 ? "linear-gradient(90deg,#fbbf24,#f97316)" :
                            "linear-gradient(90deg,#f43f5e,#f97316)",
                        width: `${athlete.recoveryScore}%`
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${athlete.recoveryScore}%` }}
                      transition={{ duration: 1, delay: 0.6 + i * 0.08 }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-white">{athlete.recoveryScore}%</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
