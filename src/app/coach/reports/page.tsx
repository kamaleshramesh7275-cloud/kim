"use client";

import { useAppStore } from "@/lib/store";
import { Activity, Download, BarChart3, FileText, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { BiometricChart } from "@/components/shared/BiometricChart";

export default function ReportsPage() {
  const { athletes } = useAppStore();
  const weeklyTrendData = [65, 68, 62, 70, 75, 72, 68];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const reports = [
    { title: "Monthly Medical Summary", icon: FileText, color: "#a855f7", last: "2 days ago" },
    { title: "Load Management Report", icon: Activity, color: "#22d3ee", last: "5 days ago" },
    { title: "End of Season Analytics", icon: TrendingUp, color: "#4ade80", last: "1 week ago" },
  ];

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
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-black text-white">Reports & Analytics</h1>
          </div>
          <p className="text-slate-500 text-sm ml-11">Exportable insights and team-wide trends.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168,85,247,0.3)" }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white border border-purple-500/40 transition-all"
          style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(34,211,238,0.15))" }}
        >
          <Download className="w-4 h-4" />
          Export PDF
        </motion.button>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ borderColor: "rgba(168,85,247,0.3)" }}
          className="rounded-2xl border border-white/5 p-5 transition-all"
          style={{ background: "rgba(15,23,42,0.6)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Team Recovery (7 Days)</h2>
          </div>
          <div className="h-[260px]">
            <BiometricChart data={weeklyTrendData} labels={labels} color="rgba(168,85,247,0.9)" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ borderColor: "rgba(34,211,238,0.3)" }}
          className="rounded-2xl border border-white/5 p-5 transition-all"
          style={{ background: "rgba(15,23,42,0.6)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Injury Distribution</h2>
          </div>
          <div className="space-y-3 mt-4">
            {[
              { label: "Healthy", count: athletes.filter(a => a.injuryStatus === "Healthy").length, color: "#4ade80" },
              { label: "Caution", count: athletes.filter(a => a.injuryStatus === "Caution").length, color: "#fbbf24" },
              { label: "Injured", count: athletes.filter(a => a.injuryStatus === "Injured").length, color: "#f43f5e" },
            ].map(item => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 uppercase tracking-wider">{item.label}</span>
                  <span className="font-bold" style={{ color: item.color }}>{item.count} athletes</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: item.color, boxShadow: `0 0 6px ${item.color}60`, width: `${(item.count / athletes.length) * 100}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / athletes.length) * 100}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Report Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/5 p-5"
        style={{ background: "rgba(15,23,42,0.6)" }}
      >
        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reports.map((report, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              whileHover={{ scale: 1.03, y: -4, borderColor: `${report.color}40`, boxShadow: `0 0 20px ${report.color}20` }}
              whileTap={{ scale: 0.97 }}
              className="p-4 rounded-xl border border-white/5 cursor-pointer transition-all group"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 border border-white/5"
                style={{ background: `${report.color}15` }}>
                <report.icon className="w-5 h-5 transition-colors" style={{ color: report.color }} />
              </div>
              <h3 className="font-bold text-slate-200 text-sm mb-1 group-hover:text-white transition-colors">{report.title}</h3>
              <p className="text-[10px] text-slate-700 uppercase tracking-wider">PDF · {report.last}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
