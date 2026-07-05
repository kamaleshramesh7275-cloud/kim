"use client";

import { useAppStore } from "@/lib/store";
import { InjuryBadge } from "@/components/shared/InjuryBadge";
import Link from "next/link";
import { Search, Filter, ChevronRight, Zap } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AthletesPage() {
  const { athletes } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAthletes = athletes.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto p-6 space-y-6 grid-bg min-h-screen"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">All Athletes</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor your complete roster.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search athletes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all w-full md:w-56 text-sm"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(168,85,247,0.15)" }}
            whileTap={{ scale: 0.95 }}
            className="p-2 border border-white/10 rounded-xl text-slate-500 hover:text-purple-400 transition-colors"
          >
            <Filter className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/5 overflow-hidden"
        style={{ background: "rgba(15,23,42,0.6)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Name", "Position", "Recovery Score", "Status", "Last Updated", ""].map((col) => (
                  <th key={col} className="px-5 py-3.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredAthletes.map((athlete, i) => {
                  const scoreColor = athlete.recoveryScore >= 80 ? "#4ade80" : athlete.recoveryScore >= 60 ? "#fbbf24" : "#f43f5e";
                  return (
                    <motion.tr
                      key={athlete.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-white/5 group cursor-pointer transition-all"
                      style={{ background: "transparent" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(168,85,247,0.05)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white"
                            style={{ background: `linear-gradient(135deg, ${scoreColor}33, ${scoreColor}11)`, border: `1px solid ${scoreColor}30` }}>
                            {athlete.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="font-semibold text-slate-200 group-hover:text-white transition-colors text-sm">{athlete.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600 uppercase tracking-wider">
                        {athlete.position}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-1.5 rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${athlete.recoveryScore}%`, background: scoreColor, boxShadow: `0 0 6px ${scoreColor}80` }}
                            />
                          </div>
                          <span className="text-sm font-bold" style={{ color: scoreColor }}>{athlete.recoveryScore}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <InjuryBadge status={athlete.injuryStatus} />
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600">
                        {athlete.lastUpdated}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <Link href={`/coach/athletes/${athlete.id}`}>
                          <motion.span
                            whileHover={{ x: 4 }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <Zap className="w-3 h-3" />
                            View Profile
                            <ChevronRight className="w-3.5 h-3.5" />
                          </motion.span>
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filteredAthletes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-600 text-sm">
                    No athletes found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
