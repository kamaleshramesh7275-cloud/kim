"use client";

import { useAppStore } from "@/lib/store";
import { AlertBadge } from "@/components/shared/AlertBadge";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InjuryAlertsPage() {
  const { alerts, resolveAlert } = useAppStore();
  const injuryAlerts = alerts.filter(a => a.type === "injury" && !a.isResolved);
  const resolvedAlerts = alerts.filter(a => a.type === "injury" && a.isResolved);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto p-6 space-y-6 grid-bg min-h-screen"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <h1 className="text-2xl font-black text-white">Injury Alerts</h1>
        </div>
        <p className="text-slate-500 text-sm ml-11">Review and manage reported injuries.</p>
      </motion.div>

      {/* Active Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-rose-500/20 overflow-hidden"
        style={{ background: "rgba(15,23,42,0.6)" }}
      >
        <div className="px-5 py-4 border-b border-rose-500/10 flex items-center gap-3"
          style={{ background: "rgba(244,63,94,0.05)" }}>
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-bold text-rose-300 uppercase tracking-widest">
            Active Alerts
          </h2>
          <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-black text-rose-400 border border-rose-500/30 bg-rose-500/10">
            {injuryAlerts.length}
          </span>
        </div>
        <div className="divide-y divide-white/5">
          <AnimatePresence>
            {injuryAlerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: i * 0.06 }}
                className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group"
                style={{ background: "transparent" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(244,63,94,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors">{alert.athleteName}</h3>
                    <AlertBadge severity={alert.severity} type="injury" />
                  </div>
                  <p className="text-sm text-slate-500">{alert.message}</p>
                  <p className="text-xs text-slate-700 mt-1">{new Date(alert.date).toLocaleDateString()}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(74,222,128,0.15)", borderColor: "rgba(74,222,128,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => resolveAlert(alert.id)}
                  className="shrink-0 px-4 py-2 rounded-xl border border-white/10 text-slate-400 text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Resolved
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
          {injuryAlerts.length === 0 && (
            <div className="px-5 py-10 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" style={{ filter: "drop-shadow(0 0 8px rgba(74,222,128,0.5))" }} />
              <p className="text-slate-600 text-sm">All clear. No active injury alerts.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Resolved */}
      {resolvedAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/5 overflow-hidden"
          style={{ background: "rgba(15,23,42,0.4)" }}
        >
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recently Resolved</h2>
          </div>
          <div className="divide-y divide-white/5 opacity-50">
            {resolvedAlerts.map(alert => (
              <div key={alert.id} className="px-5 py-3.5">
                <p className="text-sm font-semibold text-slate-400">{alert.athleteName}</p>
                <p className="text-xs text-slate-600 mt-0.5">{alert.message}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
