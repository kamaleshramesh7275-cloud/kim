"use client";

import { useAppStore } from "@/lib/store";
import { Calendar, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function InjuryCalendar() {
  const { user, athletes } = useAppStore();
  const athlete = athletes.find(a => a.id === user?.id) || athletes[0];
  const injuries = athlete.pastInjuries || [];

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const injuryDates = new Set(
    injuries.map(inj => {
      const d = new Date(inj.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-6 space-y-6 grid-bg min-h-screen"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-black text-white">Injury Calendar</h1>
        </div>
        <p className="text-slate-500 text-sm ml-11">Track your injury history and rehab timeline.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-2xl border border-white/5 p-5"
          style={{ background: "rgba(15,23,42,0.6)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white">{MONTHS[month]} {year}</h2>
            <div className="flex items-center gap-3 text-[10px] text-slate-600 uppercase tracking-wider">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Injury</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Clear</span>
            </div>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-700 uppercase tracking-wider py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === now.getDate();
              const isInjuryDay = injuryDates.has(`${year}-${month}-${day}`);
              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  whileTap={{ scale: 0.9 }}
                  className="aspect-square rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all relative"
                  style={{
                    background: isInjuryDay
                      ? "rgba(244,63,94,0.2)"
                      : isToday
                      ? "rgba(168,85,247,0.25)"
                      : "rgba(255,255,255,0.03)",
                    border: isToday
                      ? "1px solid rgba(168,85,247,0.5)"
                      : isInjuryDay
                      ? "1px solid rgba(244,63,94,0.3)"
                      : "1px solid rgba(255,255,255,0.04)",
                    color: isInjuryDay ? "#f43f5e" : isToday ? "#a855f7" : "#64748b",
                    boxShadow: isToday ? "0 0 12px rgba(168,85,247,0.3)" : isInjuryDay ? "0 0 8px rgba(244,63,94,0.2)" : "none"
                  }}
                >
                  {day}
                  {isInjuryDay && <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-rose-500" />}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Injury History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/5 overflow-hidden"
          style={{ background: "rgba(15,23,42,0.6)" }}
        >
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Injury History</h2>
          </div>
          <div className="divide-y divide-white/5">
            {injuries.length > 0 ? injuries.map((inj: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="px-5 py-3.5 transition-all group cursor-pointer"
                style={{ background: "transparent" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(244,63,94,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{inj.type}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{
                      background: inj.status === "Recovered" ? "rgba(74,222,128,0.1)" : "rgba(244,63,94,0.1)",
                      color: inj.status === "Recovered" ? "#4ade80" : "#f43f5e",
                      border: `1px solid ${inj.status === "Recovered" ? "rgba(74,222,128,0.3)" : "rgba(244,63,94,0.3)"}`
                    }}>
                    {inj.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-600">
                  <Clock className="w-3 h-3" />
                  {inj.date} · {inj.duration}
                </div>
              </motion.div>
            )) : (
              <div className="px-5 py-10 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" style={{ filter: "drop-shadow(0 0 8px rgba(74,222,128,0.5))" }} />
                <p className="text-slate-600 text-sm">No injury history. Keep it up!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
