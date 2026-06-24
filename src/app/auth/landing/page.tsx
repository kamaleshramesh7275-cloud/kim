"use client";

import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap, Shield, TrendingUp, Users, Activity, HeartPulse,
  AlertTriangle, Flame, BarChart3, CheckCircle2, Star,
  ArrowRight, Trophy, Target, Brain, Clock, X
} from "lucide-react";

/* ── reusable fade-up wrapper ── */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 200 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const STATS = [
  { value: "94%", label: "Injury prevention rate", color: "#4ade80" },
  { value: "2.4×", label: "Faster recovery time", color: "#a855f7" },
  { value: "500+", label: "Elite athletes monitored", color: "#22d3ee" },
  { value: "12ms", label: "Real-time data latency", color: "#fbbf24" },
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Risk Prediction",
    desc: "Machine learning models trained on millions of athlete records predict injury risk up to 14 days in advance.",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.15)",
  },
  {
    icon: Activity,
    title: "Live Biometric Tracking",
    desc: "Continuous monitoring of sleep, hydration, soreness, fatigue and training load — all in one dashboard.",
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.15)",
  },
  {
    icon: HeartPulse,
    title: "Match Readiness Score",
    desc: "Know exactly who is ready to perform at 100% before every match with our composite readiness index.",
    color: "#4ade80",
    glow: "rgba(74,222,128,0.15)",
  },
  {
    icon: BarChart3,
    title: "Workload Intelligence",
    desc: "Acute:Chronic workload ratio alerts prevent overtraining and reduce soft-tissue injuries by up to 60%.",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.15)",
  },
  {
    icon: Trophy,
    title: "Gamified Recovery Streaks",
    desc: "Players earn XP, unlock milestones and compete on leaderboards — turning compliance into competition.",
    color: "#f97316",
    glow: "rgba(249,115,22,0.15)",
  },
  {
    icon: Target,
    title: "Personalised Rehab Plans",
    desc: "Every athlete gets a custom recovery protocol generated from their biometric profile and injury history.",
    color: "#f43f5e",
    glow: "rgba(244,63,94,0.15)",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Athletes log daily data", desc: "Sleep, soreness, hydration and mood — captured in under 60 seconds via the Player Portal.", icon: Clock },
  { step: "02", title: "AI analyses & scores", desc: "Our engine processes biometrics against historical baselines to generate a live Recovery Score.", icon: Brain },
  { step: "03", title: "Coaches get alerts", desc: "High-risk athletes surface automatically. Coaches act fast with data-backed decisions.", icon: AlertTriangle },
  { step: "04", title: "Performance improves", desc: "Teams reduce injury rates, optimise training loads and keep players on the pitch longer.", icon: TrendingUp },
];

const TESTIMONIALS = [
  {
    quote: "We reduced soft-tissue injuries by 58% in one season. This platform changed how we manage player welfare.",
    name: "James K.", role: "Head of Performance, Premier League Club",
    color: "#a855f7",
  },
  {
    quote: "The gamification aspect got players actually engaged with recovery. Compliance went from 40% to 95%.",
    name: "Sarah M.", role: "Sports Scientist, National Athletics Team",
    color: "#22d3ee",
  },
  {
    quote: "I can see my recovery data, streak and ranking every morning. It motivates me to take recovery seriously.",
    name: "Marcus J.", role: "Professional Footballer",
    color: "#4ade80",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [coachCode, setCoachCode] = useState("");
  const [playerError, setPlayerError] = useState("");

  const handleVerifyPlayerCode = (e: React.FormEvent) => {
    e.preventDefault();
    setPlayerError("");
    const cleaned = coachCode.trim().toUpperCase();
    const storedCode = (typeof window !== "undefined" ? window.localStorage.getItem("coachPermanentCode") : null) || "COACH123";

    if (cleaned === storedCode.toUpperCase() || cleaned === "COACH123") {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("playerVerifiedCoachCode", cleaned);
      }
      setIsPlayerModalOpen(false);
      router.push(`/auth/player-login?codeVerified=true&code=${cleaned}`);
    } else {
      setPlayerError("Invalid coach permanent code. Check with your coach or try COACH123.");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#050811" }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden grid-bg flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Background blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-8 pointer-events-none"
          style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-8 pointer-events-none"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-4 pointer-events-none"
          style={{ background: "radial-gradient(circle, #4ade80, transparent)" }} />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-6"
          style={{ borderColor: "rgba(168,85,247,0.4)", background: "rgba(168,85,247,0.1)", color: "#c084fc" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          Now with AI-powered injury prediction
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #a855f7, #22d3ee)",
            boxShadow: "0 0 60px rgba(168,85,247,0.6), 0 0 120px rgba(34,211,238,0.3)"
          }}
        >
          <Zap className="w-10 h-10 text-white" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-[11px] font-bold uppercase tracking-[0.4em] text-purple-400 mb-3"
        >
          Smart Recovery · Injury Intelligence
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="text-5xl md:text-6xl font-black text-white leading-[1.05] mb-4"
        >
          Keep Your Athletes<br />
          <span className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, #a855f7 30%, #22d3ee 70%)" }}>
            On The Pitch
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-slate-400 text-lg max-w-xl mx-auto mb-10"
        >
          The elite performance platform that predicts injuries before they happen, gamifies recovery and gives coaches real-time intelligence.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-14"
        >
          <motion.div
            onClick={() => setIsCoachModalOpen(true)}
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(168,85,247,0.6)" }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-3.5 rounded-xl font-bold text-white flex items-center gap-2 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
          >
            <Shield className="w-4 h-4" /> Coach Portal
            <ArrowRight className="w-4 h-4 ml-1" />
          </motion.div>
          <motion.div
            onClick={() => setIsPlayerModalOpen(true)}
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(34,211,238,0.4)", borderColor: "rgba(34,211,238,0.5)" }}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-3.5 rounded-xl font-bold text-white flex items-center gap-2 cursor-pointer border border-cyan-500/30 transition-all"
            style={{ background: "rgba(34,211,238,0.1)" }}
          >
            <Flame className="w-4 h-4 text-cyan-400" /> Player Portal
            <ArrowRight className="w-4 h-4 ml-1" />
          </motion.div>
        </motion.div>

        {/* Live Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.07 }}
              whileHover={{ scale: 1.07, boxShadow: `0 0 20px ${stat.color}30` }}
              className="flex flex-col items-center p-4 rounded-xl border border-white/5 cursor-default"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <span className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</span>
              <span className="text-[10px] text-slate-600 uppercase tracking-wider mt-1 text-center">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <FadeUp className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-purple-400 mb-3">Platform Capabilities</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Everything you need to protect your squad</h2>
          <p className="text-slate-500 max-w-lg mx-auto">Built for elite sports science teams and modern performance coaches.</p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.08}>
              <motion.div
                whileHover={{ scale: 1.03, y: -6, boxShadow: `0 0 40px ${f.glow}`, borderColor: `${f.color}40` }}
                whileTap={{ scale: 0.98 }}
                className="h-full p-6 rounded-2xl border border-white/5 cursor-pointer transition-all"
                style={{ background: `radial-gradient(ellipse at top left, ${f.glow} 0%, transparent 60%), rgba(15,23,42,0.7)` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6" style={{ background: "rgba(168,85,247,0.03)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-400 mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">From raw data to winning decisions</h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <FadeUp key={step.step} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6, borderColor: "rgba(168,85,247,0.3)", boxShadow: "0 0 30px rgba(168,85,247,0.1)" }}
                  className="relative p-5 rounded-2xl border border-white/5 transition-all h-full"
                  style={{ background: "rgba(15,23,42,0.7)" }}
                >
                  {/* Connector line */}
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute top-8 right-0 translate-x-1/2 w-6 h-px z-10"
                      style={{ background: "linear-gradient(90deg, rgba(168,85,247,0.4), rgba(34,211,238,0.4))" }} />
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-black" style={{ color: "rgba(168,85,247,0.6)" }}>{step.step}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
                      <step.icon className="w-4 h-4 text-purple-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-white mb-2 text-sm">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <FadeUp className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-green-400 mb-3">Trusted By The Best</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">What elite teams are saying</h2>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ scale: 1.03, y: -6, borderColor: `${t.color}40`, boxShadow: `0 0 30px ${t.color}15` }}
                className="p-6 rounded-2xl border border-white/5 h-full transition-all"
                style={{ background: "rgba(15,23,42,0.7)" }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" style={{ color: t.color }} />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{ background: `${t.color}25`, border: `1px solid ${t.color}40` }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-slate-600">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-6">
        <FadeUp>
          <motion.div
            whileHover={{ boxShadow: "0 0 80px rgba(168,85,247,0.2)" }}
            className="max-w-3xl mx-auto rounded-3xl border border-purple-500/20 p-12 text-center relative overflow-hidden"
            style={{ background: "radial-gradient(ellipse at center, rgba(168,85,247,0.08) 0%, rgba(34,211,238,0.04) 50%, transparent 100%), rgba(15,23,42,0.8)" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)" }} />

            <div className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #a855f7, #22d3ee)", boxShadow: "0 0 40px rgba(168,85,247,0.5)" }}>
              <Zap className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-3xl font-black text-white mb-3">Ready to protect your squad?</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Join elite teams already using Smart Recovery to prevent injuries and maximise performance.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <motion.div
                onClick={() => setIsCoachModalOpen(true)}
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(168,85,247,0.6)" }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 rounded-xl font-bold text-white cursor-pointer flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #a855f7, #22d3ee)" }}
              >
                <Shield className="w-4 h-4" /> Coach Sign In
              </motion.div>
              <motion.div
                onClick={() => setIsPlayerModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 rounded-xl font-bold text-slate-300 cursor-pointer border border-white/10 hover:border-white/20 transition-all flex items-center gap-2"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <Flame className="w-4 h-4 text-cyan-400" /> Player Sign In
              </motion.div>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {["No setup required", "Mock data ready", "Full feature access", "Both coach & player modes"].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </FadeUp>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #a855f7, #22d3ee)" }}>
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Smart Recovery · Injury Intelligence System</span>
        </div>
        <p className="text-[10px] text-slate-700">Built for elite performance. Powered by data.</p>
      </footer>

      {/* Coach Portal Modal */}
      <AnimatePresence>
        {isCoachModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(5,8,17,0.85)", backdropFilter: "blur(8px)" }}
            onClick={() => setIsCoachModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-purple-500/20 p-8 relative overflow-hidden"
              style={{
                background: "rgba(15,23,42,0.95)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 0 60px rgba(168,85,247,0.15)",
              }}
            >
              <button
                onClick={() => setIsCoachModalOpen(false)}
                className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
                <Shield className="w-6 h-6 text-purple-400" />
              </div>

              <h3 className="text-2xl font-black text-white mb-2">Coach Portal Access</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Choose an action to access the coach command center dashboard.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setIsCoachModalOpen(false);
                    router.push("/auth/coach-login?mode=signin");
                  }}
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 border border-purple-500/30 transition-all hover:bg-purple-500/10 cursor-pointer"
                  style={{ background: "rgba(168,85,247,0.05)" }}
                >
                  Sign In to Coach Account
                </button>
                <button
                  onClick={() => {
                    setIsCoachModalOpen(false);
                    router.push("/auth/coach-login?mode=signup");
                  }}
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                  style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
                >
                  Create New Coach Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Portal Modal */}
      <AnimatePresence>
        {isPlayerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(5,8,17,0.85)", backdropFilter: "blur(8px)" }}
            onClick={() => {
              setIsPlayerModalOpen(false);
              setPlayerError("");
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-cyan-500/20 p-8 relative overflow-hidden"
              style={{
                background: "rgba(15,23,42,0.95)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 0 60px rgba(34,211,238,0.15)",
              }}
            >
              <button
                onClick={() => {
                  setIsPlayerModalOpen(false);
                  setPlayerError("");
                }}
                className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.3)" }}>
                <Flame className="w-6 h-6 text-cyan-400" />
              </div>

              <h3 className="text-2xl font-black text-white mb-2">Player Portal Access</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Enter your coach's permanent code to access the player dashboard.
              </p>

              <form onSubmit={handleVerifyPlayerCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Coach Permanent Code</label>
                  <input
                    type="text"
                    value={coachCode}
                    onChange={(e) => setCoachCode(e.target.value)}
                    placeholder="Enter code (e.g. COACH123)"
                    className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm uppercase tracking-wider"
                    required
                  />
                  {playerError && (
                    <p className="mt-2 text-xs text-rose-300">{playerError}</p>
                  )}
                  <p className="mt-3 text-[11px] text-slate-500">
                    Tip: Ask your coach for their code, or use <span className="text-cyan-400 font-semibold select-all">COACH123</span> for testing.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34,211,238,0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #22d3ee, #0891b2)" }}
                >
                  <Zap className="w-4 h-4" /> Verify & Access Portal
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
