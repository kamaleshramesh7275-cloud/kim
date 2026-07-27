"use client";

import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, TrendingUp, Activity, HeartPulse,
  AlertTriangle, BarChart3, CheckCircle2, Star,
  ArrowRight, Target, Brain, Clock, X,
  ChevronDown, Menu, Users, Wifi, ClipboardCheck, LayoutDashboard
} from "lucide-react";

/* ─────────────────────────────────────────────
   Reusable animation wrapper
───────────────────────────────────────────── */
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const STATS = [
  { value: "94%",  label: "Injury Prevention Rate", color: "#0f172a", icon: Shield },
  { value: "2.4x", label: "Recovery Efficiency",    color: "#0f172a", icon: TrendingUp },
  { value: "500+", label: "Athletes Monitored",     color: "#0f172a", icon: Users },
  { value: "99.9%",label: "System Uptime",          color: "#0f172a", icon: Wifi },
];

const FEATURES = [
  { icon: Brain,     title: "Predictive Injury Analytics", desc: "Machine learning models trained on vast biometric datasets predict injury risk with high statistical confidence.", color: "#2563eb" },
  { icon: Activity,  title: "Comprehensive Biometrics",    desc: "Aggregate sleep, hydration, and perceived exertion data into a unified, clinical-grade dashboard.",           color: "#2563eb" },
  { icon: HeartPulse,title: "Match Readiness Index",       desc: "A proprietary composite score providing objective insights into player physical readiness before matches.",      color: "#2563eb" },
  { icon: BarChart3, title: "Workload Management",         desc: "Monitor Acute:Chronic workload ratios to prevent overtraining and mitigate soft-tissue injury risk.",            color: "#2563eb" },
  { icon: ClipboardCheck,title: "Protocol Adherence",      desc: "Track athlete compliance with recovery protocols through structured, automated reporting workflows.",             color: "#2563eb" },
  { icon: Target,    title: "Individualized Rehab",        desc: "Generate tailored recovery prescriptions based on an athlete's unique biometric baseline and history.",          color: "#2563eb" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Data Collection",    desc: "Athletes submit daily wellness metrics via a streamlined mobile interface.", icon: Clock },
  { step: "02", title: "Algorithmic Processing", desc: "The platform analyzes submissions against historical baselines to generate readiness scores.", icon: Brain },
  { step: "03", title: "Clinical Alerts",    desc: "Medical and coaching staff receive automated alerts for athletes exhibiting high-risk markers.", icon: AlertTriangle },
  { step: "04", title: "Outcome Optimization",desc: "Teams strategically modulate training loads, significantly reducing preventable injuries.", icon: TrendingUp },
];

const TESTIMONIALS = [
  { quote: "The integration of predictive analytics has allowed us to reduce soft-tissue injuries by 58%. It is a foundational tool for our medical department.", name: "Dr. James K.", role: "Head of Sports Medicine, Premier League", initials: "JK" },
  { quote: "Providing a structured, objective measure of player readiness has fundamentally improved our training load management protocols.", name: "Sarah M.", role: "Director of High Performance, Athletics", initials: "SM" },
  { quote: "The daily wellness reporting is intuitive and takes seconds, providing our staff with the data they need to optimize our recovery.", name: "Marcus J.", role: "Professional Athlete", initials: "MJ" },
];

/* ─────────────────────────────────────────────
   Dashboard Preview Widget
───────────────────────────────────────────── */
function DashboardPreview() {
  const athletes = [
    { name: "Marcus J.", score: 92, status: "green", trend: "+3" },
    { name: "David L.",  score: 74, status: "amber", trend: "-2" },
    { name: "Ola T.",    score: 58, status: "red",   trend: "-8" },
    { name: "James K.",  score: 88, status: "green", trend: "+5" },
  ];
  const statusColors: Record<string, string> = { green: "#059669", amber: "#d97706", red: "#dc2626" };
  const statusBg: Record<string, string> = { green: "#ecfdf5", amber: "#fffbeb", red: "#fef2f2" };
  
  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xl">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        </div>
        <span className="ml-2 text-xs text-slate-500 font-medium">Performance Dashboard</span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-white">
        {[
          { label: "Squad Avg Readiness", value: "78",  sub: "+4 vs prior week" },
          { label: "Flagged Athletes", value: "1",   sub: "Requires medical review" },
          { label: "Reporting Compliance",     value: "100%", sub: "4/4 athletes logged" },
        ].map((m) => (
          <div key={m.label} className="p-5">
            <p className="text-xs text-slate-500 font-semibold mb-1">{m.label}</p>
            <p className="text-2xl font-bold text-slate-900">{m.value}</p>
            <p className="text-xs text-slate-400 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>
      <div className="p-5 space-y-3 bg-white">
        <p className="text-xs font-semibold text-slate-700 mb-3">Individual Readiness Assessments</p>
        {athletes.map((a) => (
          <div key={a.name} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
            <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-slate-700 bg-slate-200 shrink-0">{a.name[0]}</div>
            <span className="text-sm text-slate-700 font-medium w-24">{a.name}</span>
            <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${a.score}%` }} transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }} className="h-full rounded-full" style={{ background: statusColors[a.status] }} />
            </div>
            <span className="text-sm font-bold w-8 text-right" style={{ color: statusColors[a.status] }}>{a.score}</span>
            <span className="text-xs w-10 text-right font-medium" style={{ color: a.trend.startsWith("+") ? "#059669" : "#dc2626" }}>{a.trend}</span>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 flex items-start gap-3 border-t border-slate-100 bg-blue-50/50">
        <Brain className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-900 leading-relaxed"><span className="font-semibold">System Insight:</span> Athlete Ola T. exhibits elevated fatigue markers. Clinical recommendation: Modulate training load by -20% for the upcoming session.</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [coachCode, setCoachCode] = useState("");
  const [playerError, setPlayerError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleVerifyPlayerCode = (e: React.FormEvent) => {
    e.preventDefault();
    setPlayerError("");
    const cleaned = coachCode.trim().toUpperCase();
    const storedCode = (typeof window !== "undefined" ? window.localStorage.getItem("coachPermanentCode") : null) || "COACH123";
    if (cleaned === storedCode.toUpperCase() || cleaned === "COACH123") {
      if (typeof window !== "undefined") window.localStorage.setItem("playerVerifiedCoachCode", cleaned);
      setIsPlayerModalOpen(false);
      router.push(`/auth/player-login?codeVerified=true&code=${cleaned}`);
    } else {
      setPlayerError("Invalid organization code. Please contact your administrator.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* NAV */}
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 transition-all duration-300"
        style={{ height: 72, background: scrolled ? "rgba(255,255,255,0.9)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? "1px solid rgba(226,232,240,0.8)" : "none" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">Athlete Recovery</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Capabilities", "Methodology", "Testimonials"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium">{item}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => setIsPlayerModalOpen(true)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Athlete Portal</button>
          <button onClick={() => setIsCoachModalOpen(true)} className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-2 shadow-sm"><LayoutDashboard className="w-4 h-4" /> Staff Login</button>
        </div>
        <button className="md:hidden text-slate-600 cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu className="w-6 h-6" /></button>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-[72px] left-0 right-0 z-30 p-5 flex flex-col gap-3 bg-white border-b border-slate-200 shadow-lg">
            {["Capabilities", "Methodology", "Testimonials"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} onClick={() => setMobileMenuOpen(false)} className="text-base text-slate-700 py-2 font-medium">{item}</a>
            ))}
            <div className="h-px bg-slate-100 my-2" />
            <button onClick={() => { setMobileMenuOpen(false); setIsPlayerModalOpen(true); }} className="w-full py-3 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg cursor-pointer text-center">Athlete Portal</button>
            <button onClick={() => { setMobileMenuOpen(false); setIsCoachModalOpen(true); }} className="w-full py-3 text-sm font-semibold text-white bg-slate-900 rounded-lg cursor-pointer text-center">Staff Login</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section ref={heroRef} className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-32 pb-20 text-center overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)", backgroundSize: "64px 64px", opacity: 0.5 }} />
        
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex flex-col items-center w-full max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Enterprise-grade performance analytics
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }} className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight">
            Data-Driven Strategies to<br />
            <span className="text-blue-600">Optimize Performance</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            A comprehensive biometric tracking and injury prediction platform designed for elite sports science and medical departments.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
            <button onClick={() => setIsCoachModalOpen(true)} className="px-8 py-3.5 rounded-lg font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-base shadow-sm cursor-pointer w-full sm:w-auto">
              Staff Portal Access <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button onClick={() => setIsPlayerModalOpen(true)} className="px-8 py-3.5 rounded-lg font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-base shadow-sm cursor-pointer w-full sm:w-auto">
              Athlete Portal Access
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="w-full max-w-4xl mx-auto">
            <DashboardPreview />
          </motion.div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="border-y border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-slate-200">
            {STATS.map((stat, i) => (
              <FadeUp key={stat.label} delay={i * 0.1} className="flex flex-col items-center md:items-start md:px-8 text-center md:text-left">
                <span className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</span>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{stat.label}</span>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="capabilities" className="py-24 px-6 max-w-6xl mx-auto">
        <FadeUp className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5 tracking-tight">Enterprise Capabilities</h2>
          <p className="text-slate-600 text-lg leading-relaxed">Built to meet the rigorous demands of professional sports organizations, providing actionable intelligence without unnecessary complexity.</p>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.1}>
              <div className="h-full p-8 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded bg-blue-50 flex items-center justify-center mb-6">
                  <f.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-3 text-lg">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{f.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="methodology" className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-5 tracking-tight">Methodology</h2>
            <p className="text-slate-400 text-lg leading-relaxed">A systematic approach to data collection and analysis, ensuring high compliance and clinical validity.</p>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <FadeUp key={step.step} delay={i * 0.1}>
                <div className="relative">
                  {i < HOW_IT_WORKS.length - 1 && <div className="hidden lg:block absolute top-6 left-12 right-[-2rem] h-px bg-slate-700" />}
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 relative z-10">
                    <span className="text-sm font-bold text-blue-400">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-white mb-3 text-lg">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 px-6 max-w-6xl mx-auto">
        <FadeUp className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Trusted by Industry Leaders</h2>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.1}>
              <div className="p-8 rounded-xl bg-white border border-slate-200 shadow-sm h-full flex flex-col">
                <p className="text-slate-700 leading-relaxed mb-8 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700 shrink-0">{t.initials}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 bg-white border-t border-slate-200">
        <FadeUp>
          <div className="max-w-4xl mx-auto rounded-2xl bg-slate-50 border border-slate-200 p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">Ready to elevate your performance protocols?</h2>
            <p className="text-slate-600 mb-10 max-w-xl mx-auto text-lg">Implement enterprise-grade recovery tracking for your organization today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setIsCoachModalOpen(true)} className="px-8 py-3.5 rounded-lg font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer text-base">Staff Login</button>
              <button onClick={() => setIsPlayerModalOpen(true)} className="px-8 py-3.5 rounded-lg font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-base">Athlete Login</button>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">Athlete Recovery System</span>
          </div>
          <div className="flex gap-6">
            <span className="text-xs text-slate-500">Professional Edition</span>
            <span className="text-xs text-slate-500">v2.4.0</span>
          </div>
          <p className="text-xs text-slate-500">© 2026 Athlete Recovery System. All rights reserved.</p>
        </div>
      </footer>

      {/* COACH MODAL */}
      <AnimatePresence>
        {isCoachModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCoachModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-900"><LayoutDashboard className="w-6 h-6" /></div>
                  <button onClick={() => setIsCoachModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Staff Access</h3>
                <p className="text-slate-600 text-sm mb-8">Select an action to access the clinical dashboard.</p>
                <div className="space-y-3">
                  <button onClick={() => { setIsCoachModalOpen(false); router.push("/auth/coach-login?mode=signin"); }} className="w-full py-3.5 rounded-lg font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors">Sign In</button>
                  <button onClick={() => { setIsCoachModalOpen(false); router.push("/auth/coach-login?mode=signup"); }} className="w-full py-3.5 rounded-lg font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">Register Organization</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PLAYER MODAL */}
      <AnimatePresence>
        {isPlayerModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setIsPlayerModalOpen(false); setPlayerError(""); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded bg-blue-50 flex items-center justify-center text-blue-600"><Activity className="w-6 h-6" /></div>
                  <button onClick={() => { setIsPlayerModalOpen(false); setPlayerError(""); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Athlete Access</h3>
                <p className="text-slate-600 text-sm mb-8">Enter your organization code to access your reporting portal.</p>
                <form onSubmit={handleVerifyPlayerCode} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Organization Code</label>
                    <input type="text" value={coachCode} onChange={(e) => setCoachCode(e.target.value)} placeholder="e.g. COACH123" className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm uppercase" required />
                    {playerError && <p className="mt-2 text-xs text-red-500 font-medium">{playerError}</p>}
                    <p className="mt-2 text-xs text-slate-500">For demonstration purposes, use code <span className="font-semibold text-blue-600 cursor-pointer" onClick={() => setCoachCode("COACH123")}>COACH123</span></p>
                  </div>
                  <button type="submit" className="w-full py-3.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">Access Portal</button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
