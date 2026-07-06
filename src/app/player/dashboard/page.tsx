"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import type { Athlete } from "@/lib/types";
import { HolographicAvatar, BodyPartId, BodyPartStatus } from "@/components/shared/HolographicAvatar";
import { 
  Activity, Brain, Moon, Flame, Wind, Gauge, Sparkles, 
  ShieldAlert, ShieldCheck, Compass, Dumbbell, Zap, AlertTriangle,
  Database, Star, CheckCircle2, XCircle, ChevronRight, Droplets
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function PlayerDashboard() {
  const { user, athletes, datasetSummary, hydrateFromDatasets } = useAppStore();
  
  const fallbackAthlete: Athlete = {
    id: "loading",
    name: "Loading",
    position: "Recovery",
    recoveryScore: 0,
    injuryStatus: "Healthy",
    lastUpdated: "Loading",
    streakDays: 0,
    points: 0,
    biometrics: {
      sleep: 0,
      hydration: 0,
      soreness: 0,
      fatigue: 0,
      stress: 0,
      trainingLoad: 0,
    },
    pastInjuries: [],
  };

  // Find logged-in athlete; default to David Chen (a1) for testing injury views if no user is found
  const athlete = athletes.find(a => a.id === user?.id) || athletes.find(a => a.id === "a1") || athletes[0] || fallbackAthlete;

  useEffect(() => {
    if (hydrateFromDatasets) {
      void hydrateFromDatasets();
    }
  }, [hydrateFromDatasets]);

  const [selectedPartId, setSelectedPartId] = useState<BodyPartId | null>(null);

  const xpLevel = Math.floor((athlete.points || 0) / 100) + 1;
  const xpProgress = ((athlete.points || 0) % 100);

  // Profile metadata map (Ages, Sports, and specific bio-details)
  const PROFILE_META: Record<string, { age: number; sport: string; velocity: string; acceleration: string; stress: string }> = {
    a1: { age: 24, sport: "Soccer (Forward)", velocity: "32.8 km/h", acceleration: "6.9 m/s²", stress: "Moderate" },
    a2: { age: 26, sport: "Soccer (Midfielder)", velocity: "29.4 km/h", acceleration: "5.8 m/s²", stress: "High" },
    a3: { age: 28, sport: "Soccer (Defender)", velocity: "31.2 km/h", acceleration: "6.1 m/s²", stress: "Low" },
    a4: { age: 31, sport: "Soccer (Goalkeeper)", velocity: "24.5 km/h", acceleration: "7.2 m/s²", stress: "Low" },
    a5: { age: 25, sport: "Soccer (Forward)", velocity: "33.1 km/h", acceleration: "7.1 m/s²", stress: "High" },
    a8: { age: 27, sport: "Soccer (Defender)", velocity: "28.9 km/h", acceleration: "5.4 m/s²", stress: "Critical" },
  };

  const currentMeta = PROFILE_META[athlete.id] || { age: 25, sport: "Soccer", velocity: "30.5 km/h", acceleration: "6.2 m/s²", stress: "Normal" };

  // Calculate dynamic body part statuses based on the risk engine
  const hasAclKneeInjury = athlete.currentInjury?.type.toLowerCase().includes("acl") || athlete.currentInjury?.type.toLowerCase().includes("knee");
  const hasHamstringInjury = athlete.currentInjury?.type.toLowerCase().includes("hamstring");
  const hasAnkleInjury = athlete.currentInjury?.type.toLowerCase().includes("ankle");
  const hadAnkleSprain = athlete.pastInjuries.some(i => i.type.toLowerCase().includes("ankle"));

  const bodyPartStates: Record<BodyPartId, BodyPartStatus> = {
    neck: {
      id: "neck",
      name: "Cervical Spine (Neck)",
      status: athlete.biometrics.stress > 80 ? "risk" : "healthy",
      severity: athlete.biometrics.stress > 80 ? "low" : "low",
      riskScore: athlete.biometrics.stress > 80 ? Math.floor(athlete.biometrics.stress * 0.7) : 15,
      recoveryDays: 0,
      exercises: ["Cervical retraction stretch", "Chin tucks", "Neck rotations"],
      recommendation: athlete.biometrics.stress > 80 
        ? "High neurological stress detected. Perform neck mobility drills and deep breathing exercises to reduce tension."
        : "Cervical spine alignment is normal. Maintain standard postural exercises.",
      visibleOn: "both"
    },
    shoulder: {
      id: "shoulder",
      name: "Rotator Cuff (Shoulder)",
      status: athlete.biometrics.trainingLoad > 82 ? "risk" : "healthy",
      severity: athlete.biometrics.trainingLoad > 82 ? "medium" : "low",
      riskScore: athlete.biometrics.trainingLoad > 82 ? Math.floor(athlete.biometrics.trainingLoad * 0.8) : 20,
      recoveryDays: athlete.biometrics.trainingLoad > 82 ? 3 : 0,
      exercises: ["Sleeper stretches", "Y-T-W shoulder raises", "Resistance band external rotations"],
      recommendation: athlete.biometrics.trainingLoad > 82 
        ? "Shoulder joints are showing high load strain. Limit upper body overhead movements and focus on external rotators activation."
        : "Deltoid and Rotator cuff load within safety thresholds.",
      visibleOn: "both"
    },
    elbow: {
      id: "elbow",
      name: "Ulnar Joint (Elbow)",
      status: (athlete.biometrics.soreness < 50 && athlete.biometrics.trainingLoad > 70) ? "risk" : "healthy",
      severity: "low",
      riskScore: (athlete.biometrics.soreness < 50 && athlete.biometrics.trainingLoad > 70) ? 45 : 12,
      recoveryDays: 0,
      exercises: ["Wrist flexor releases", "Elbow extension mobility", "Eccentric wrist extensions"],
      recommendation: "Elbow strain levels are stable. Maintain good forearm flexibility and grip mechanics.",
      visibleOn: "both"
    },
    wrist: {
      id: "wrist",
      name: "Carpal Tunnel (Wrist)",
      status: "healthy",
      severity: "low",
      riskScore: 10,
      recoveryDays: 0,
      exercises: ["Wrist extensor stretch", "Median nerve glides"],
      recommendation: "Wrist flexor mobility is within optimal limits.",
      visibleOn: "both"
    },
    back: {
      id: "back",
      name: "Lumbar Spine (Lower Back)",
      status: (athlete.biometrics.soreness < 55 && athlete.biometrics.fatigue < 50) ? "risk" : "healthy",
      severity: (athlete.biometrics.soreness < 55 && athlete.biometrics.fatigue < 50) ? "medium" : "low",
      riskScore: (athlete.biometrics.soreness < 55 && athlete.biometrics.fatigue < 50) ? 68 : 18,
      recoveryDays: (athlete.biometrics.soreness < 55 && athlete.biometrics.fatigue < 50) ? 4 : 0,
      exercises: ["Cat-Cow stretch", "Bird-Dog activation", "Glute bridges", "Child's pose stretch"],
      recommendation: (athlete.biometrics.soreness < 55 && athlete.biometrics.fatigue < 50)
        ? "Lumbar region shows tightness and elevated stress. Restrict heavy axial loads (squats/deadlifts) and perform core stabilization workouts."
        : "Lumbar and thoracic alignment is stable. Core strength indices are adequate.",
      visibleOn: "back"
    },
    hamstring: {
      id: "hamstring",
      name: "Biceps Femoris (Hamstring)",
      status: hasHamstringInjury ? "injured" : (athlete.biometrics.soreness < 60 ? "risk" : "healthy"),
      severity: hasHamstringInjury ? (athlete.currentInjury?.severity || "high") : (athlete.biometrics.soreness < 60 ? "medium" : "low"),
      riskScore: hasHamstringInjury ? 92 : (athlete.biometrics.soreness < 60 ? 72 : 22),
      recoveryDays: hasHamstringInjury ? 21 : (athlete.biometrics.soreness < 60 ? 5 : 0),
      exercises: ["Foam rolling hamstrings", "Eccentric hamstring sliders", "Active straight leg raises"],
      recommendation: hasHamstringInjury 
        ? `ACUTE INJURY: ${athlete.currentInjury?.rehabPlan || "Apply RICE protocol, light hamstring stretches, avoid running."}`
        : (athlete.biometrics.soreness < 60 
          ? "High micro-tear risk identified in left hamstring. Hydrate, perform dynamic stretches, and limit sprint workloads."
          : "Hamstring muscular elasticity is optimal."),
      visibleOn: "back"
    },
    knee: {
      id: "knee",
      name: "Patellar Tendon & ACL (Knee)",
      status: hasAclKneeInjury ? "injured" : (athlete.biometrics.trainingLoad > 85 ? "risk" : "healthy"),
      severity: hasAclKneeInjury ? (athlete.currentInjury?.severity || "high") : (athlete.biometrics.trainingLoad > 85 ? "medium" : "low"),
      riskScore: hasAclKneeInjury ? 98 : (athlete.biometrics.trainingLoad > 85 ? 78 : 15),
      recoveryDays: hasAclKneeInjury ? 180 : (athlete.biometrics.trainingLoad > 85 ? 4 : 0),
      exercises: ["VMO quad sets", "Single-leg balance training", "Hip abduction exercises"],
      recommendation: hasAclKneeInjury 
        ? `CRITICAL LESION: ${athlete.currentInjury?.rehabPlan || "Surgery post-op rehab, no-weight bearing exercises."}`
        : (athlete.biometrics.trainingLoad > 85 
          ? "High patellofemoral pressure detected due to cumulative load. Wear compression knee sleeve, apply ice, and limit jumping loads."
          : "Knee joint stability and surrounding muscular support is adequate."),
      visibleOn: "front"
    },
    ankle: {
      id: "ankle",
      name: "Ankle Ligament (Ankle)",
      status: hasAnkleInjury ? "injured" : (hadAnkleSprain && athlete.recoveryScore < 65 ? "risk" : "healthy"),
      severity: hasAnkleInjury ? (athlete.currentInjury?.severity || "high") : (hadAnkleSprain && athlete.recoveryScore < 65 ? "medium" : "low"),
      riskScore: hasAnkleInjury ? 88 : (hadAnkleSprain && athlete.recoveryScore < 65 ? 65 : 18),
      recoveryDays: hasAnkleInjury ? 14 : (hadAnkleSprain && athlete.recoveryScore < 65 ? 3 : 0),
      exercises: ["Ankle alphabet drawing", "Balance board work", "Calf raises"],
      recommendation: hasAnkleInjury 
        ? `LIGAMENT SPRAIN: ${athlete.currentInjury?.rehabPlan || "Apply brace, avoid lateral movements, compression wraps."}`
        : (hadAnkleSprain && athlete.recoveryScore < 65 
          ? "Ankle showing signs of instability from previous sprain combined with low recovery score. Focus on balance exercises and wear ankle supports."
          : "Ankle joint mobility and lateral stability is solid."),
      visibleOn: "both"
    }
  };

  const activePart = selectedPartId ? bodyPartStates[selectedPartId] : null;

  // Composite Performance Score Calculation (out of 100)
  const performanceScore = Math.round(
    (athlete.recoveryScore * 0.4) + 
    (athlete.biometrics.sleep * 0.25) + 
    ((100 - athlete.biometrics.stress) * 0.15) + 
    (athlete.biometrics.hydration * 0.2)
  );

  // List of active alerts or orange/red items for summary
  const flaggedInjuries = Object.values(bodyPartStates).filter(p => p.status === "injured");
  const flaggedRisks = Object.values(bodyPartStates).filter(p => p.status === "risk");

  return (
    <div className="min-h-screen bg-[#050811] p-6 space-y-6 text-white max-w-7xl mx-auto">
      {/* 1. Player Profile Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-5 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-purple-500/50 flex items-center justify-center bg-purple-500/10 overflow-hidden">
              <span className="text-xl font-black text-purple-400">
                {athlete.name.split(" ").map(n => n[0]).join("")}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-500 border border-slate-900 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white fill-current" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black">{athlete.name}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                athlete.injuryStatus === "Healthy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                athlete.injuryStatus === "Caution" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}>
                {athlete.injuryStatus}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-xs mt-1 font-medium">
              <span>Age: <strong className="text-slate-300">{currentMeta.age}</strong></span>
              <span>•</span>
              <span>Sport: <strong className="text-slate-300">{currentMeta.sport}</strong></span>
              <span>•</span>
              <span>Rank Points: <strong className="text-purple-400">{athlete.points} XP</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10">
            <Flame className="w-4 h-4 text-amber-400 fill-current" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Compliance Streak</span>
              <span className="text-sm font-black text-amber-300">{athlete.streakDays} Days Active</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-purple-500/30 bg-purple-500/10">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Overall Recovery</span>
              <span className="text-sm font-black text-purple-300">{athlete.recoveryScore}% Score</span>
            </div>
          </div>
        </div>
      </motion.div>

      {datasetSummary && (
        <motion.div variants={item} className="rounded-xl border border-cyan-500/20 p-3 flex items-center gap-4" style={{ background: "rgba(34,211,238,0.06)" }}>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest">Live dataset</span>
          </div>
          <div className="flex-1 text-xs text-slate-400">
            Recovery data from {datasetSummary.recoveryRows} rows and training metrics from {datasetSummary.trainingRows} rows are powering this dashboard.
          </div>
        </motion.div>
      )}

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

      {/* Grid: 2. Body Status Overview (Hero Section) & Diagnosis Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Holographic Body Model Hero */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Body Status Overview</h2>
            </div>
            {selectedPartId && (
              <button 
                onClick={() => setSelectedPartId(null)}
                className="text-[10px] text-cyan-400 hover:text-white transition-colors uppercase font-bold"
              >
                Clear Selection ×
              </button>
            )}
          </div>
          
          <HolographicAvatar 
            partStates={bodyPartStates}
            selectedPartId={selectedPartId}
            onSelectPart={(partId) => setSelectedPartId(partId)}
          />
        </motion.div>

        {/* Diagnosis Side Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-1 flex flex-col h-full"
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-widest">AI Diagnosis Center</h2>
          </div>

          <div className="flex-1 rounded-3xl border border-white/5 bg-slate-900/30 backdrop-blur-xl p-6 flex flex-col shadow-xl min-h-[580px] justify-between relative overflow-hidden">
            
            <AnimatePresence mode="wait">
              {activePart ? (
                <motion.div
                  key={activePart.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 flex flex-col h-full justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          activePart.status === "injured" ? "bg-rose-500 animate-ping" :
                          activePart.status === "risk" ? "bg-orange-500 animate-pulse" : "bg-emerald-500"
                        }`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Selected Segment</span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-0.5">{activePart.name}</h3>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-white/3 border border-white/5 flex flex-col justify-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Injury Status</span>
                        <span className={`text-sm font-black mt-1 uppercase ${
                          activePart.status === "injured" ? "text-rose-500" :
                          activePart.status === "risk" ? "text-orange-500" : "text-emerald-500"
                        }`}>
                          {activePart.status === "injured" ? "Injured" : activePart.status === "risk" ? "High Risk" : "Optimal"}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/3 border border-white/5 flex flex-col justify-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Severity</span>
                        <span className={`text-sm font-black mt-1 capitalize ${
                          activePart.severity === "high" ? "text-rose-400" :
                          activePart.severity === "medium" ? "text-orange-400" : "text-slate-400"
                        }`}>
                          {activePart.severity}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/3 border border-white/5 flex flex-col justify-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Injury Risk Score</span>
                        <span className="text-xl font-black mt-1 text-white">{activePart.riskScore}%</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/3 border border-white/5 flex flex-col justify-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Est. Recovery</span>
                        <span className="text-xl font-black mt-1 text-purple-400">
                          {activePart.recoveryDays > 0 ? `${activePart.recoveryDays} Days` : "Active"}
                        </span>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase text-purple-400 tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Recovery Protocol</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed bg-purple-500/5 border border-purple-500/10 p-3.5 rounded-xl">
                        {activePart.recommendation}
                      </p>
                    </div>

                    {/* Recovery Exercises */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase text-cyan-400 tracking-wider">
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>Prescribed Rehab Exercises</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activePart.exercises.map((ex, idx) => (
                          <span 
                            key={idx} 
                            className="text-[10px] font-semibold bg-cyan-950/40 text-cyan-400 border border-cyan-800/30 px-2.5 py-1 rounded-lg"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 text-[9px] text-slate-500 flex items-center gap-2">
                    <Activity className="w-3 h-3 text-cyan-500 animate-pulse" />
                    <span>Real-time predictive biosensors syncing...</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col justify-center items-center text-center p-4 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full border border-dashed border-cyan-500/30 flex items-center justify-center bg-cyan-500/5 animate-[pulse_3s_infinite]">
                    <Compass className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Interactive Diagnostic</h3>
                    <p className="text-xs text-slate-500 mt-2 max-w-[240px] leading-relaxed">
                      Select any highlighted glowing joint or muscle node on the anatomy hologram to unlock detailed real-time medical diagnostic intelligence.
                    </p>
                  </div>

                  {/* Highlight current anomalies if none selected */}
                  {(flaggedInjuries.length > 0 || flaggedRisks.length > 0) && (
                    <div className="w-full pt-6 space-y-2 text-left">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Detected Anomaly Quicklinks:</span>
                      
                      {flaggedInjuries.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => setSelectedPartId(p.id)}
                          className="flex items-center justify-between p-2 rounded-xl bg-rose-500/5 border border-rose-500/25 hover:bg-rose-500/10 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                            <span className="text-xs font-semibold text-rose-300">{p.name}</span>
                          </div>
                          <span className="text-[9px] font-black bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded uppercase">Injury</span>
                        </div>
                      ))}

                      {flaggedRisks.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => setSelectedPartId(p.id)}
                          className="flex items-center justify-between p-2 rounded-xl bg-orange-500/5 border border-orange-500/25 hover:bg-orange-500/10 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-xs font-semibold text-orange-300">{p.name}</span>
                          </div>
                          <span className="text-[9px] font-black bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded uppercase">High Risk</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* 3. Performance Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* Recovery Score Dial */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl p-5 flex flex-col items-center justify-between text-center relative"
        >
          <div className="w-full flex items-center justify-between border-b border-white/5 pb-2.5 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recovery Index</span>
            <Wind className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="relative w-28 h-28 my-2">
            <svg className="w-full h-full -rotate-90">
              <circle cx="56" cy="56" r="48" strokeWidth="6" fill="none" stroke="rgba(255,255,255,0.03)" />
              <circle 
                cx="56" 
                cy="56" 
                r="48" 
                strokeWidth="6" 
                fill="none" 
                stroke={athlete.recoveryScore >= 80 ? "#10b981" : athlete.recoveryScore >= 60 ? "#f97316" : "#f43f5e"}
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 - (athlete.recoveryScore / 100) * (2 * Math.PI * 48)}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${athlete.recoveryScore >= 80 ? "#10b981" : athlete.recoveryScore >= 60 ? "#f97316" : "#f43f5e"})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{athlete.recoveryScore}%</span>
              <span className="text-[8px] font-black uppercase text-slate-500">Score</span>
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            athlete.recoveryScore >= 80 ? "text-emerald-400" : athlete.recoveryScore >= 60 ? "text-orange-400" : "text-rose-400"
          }`}>
            {athlete.recoveryScore >= 80 ? "Peak Form" : athlete.recoveryScore >= 60 ? "Load Caution" : "Injury Warning"}
          </span>
        </motion.div>

        {/* Performance Score Dial */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl p-5 flex flex-col items-center justify-between text-center"
        >
          <div className="w-full flex items-center justify-between border-b border-white/5 pb-2.5 mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Performance Index</span>
            <Gauge className="w-4 h-4 text-purple-400" />
          </div>
          <div className="relative w-28 h-28 my-2">
            <svg className="w-full h-full -rotate-90">
              <circle cx="56" cy="56" r="48" strokeWidth="6" fill="none" stroke="rgba(255,255,255,0.03)" />
              <circle 
                cx="56" 
                cy="56" 
                r="48" 
                strokeWidth="6" 
                fill="none" 
                stroke="#a855f7"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 - (performanceScore / 100) * (2 * Math.PI * 48)}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 4px #a855f7)" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{performanceScore}%</span>
              <span className="text-[8px] font-black uppercase text-slate-500">Output</span>
            </div>
          </div>
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">AI Calculated</span>
        </motion.div>

        {/* Training Load Gauge */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Training Load</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="space-y-2 my-2">
            <div className="flex justify-between items-end">
              <span className="text-2xl font-black text-white">{athlete.biometrics.trainingLoad}%</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Load Threshold</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                style={{ 
                  width: `${athlete.biometrics.trainingLoad}%`,
                  boxShadow: "0 0 6px rgba(249,115,22,0.5)" 
                }}
              />
            </div>
          </div>
          <span className="text-[9px] text-slate-500 leading-normal">
            {athlete.biometrics.trainingLoad > 80 ? "Overtraining risk - threshold exceeded" : "Load balance is optimized"}
          </span>
        </motion.div>

        {/* Sleep Score Gauge */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sleep Quality</span>
            <Moon className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="space-y-2 my-2">
            <div className="flex justify-between items-end">
              <span className="text-2xl font-black text-white">{athlete.biometrics.sleep}%</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Anabolic recovery</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                style={{ 
                  width: `${athlete.biometrics.sleep}%`,
                  boxShadow: "0 0 6px rgba(34,211,238,0.5)" 
                }}
              />
            </div>
          </div>
          <span className="text-[9px] text-slate-500 leading-normal">
            {athlete.biometrics.sleep >= 80 ? "Excellent sleep depth & recovery" : "Sleep extension recommended"}
          </span>
        </motion.div>

        {/* Fatigue Level Gauge */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fatigue Index</span>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-2 my-2">
            <div className="flex justify-between items-end">
              <span className="text-2xl font-black text-white">{100 - athlete.biometrics.fatigue}%</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">CNS exhaustion</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                style={{ 
                  width: `${100 - athlete.biometrics.fatigue}%`,
                  boxShadow: "0 0 6px rgba(16,185,129,0.5)" 
                }}
              />
            </div>
          </div>
          <span className="text-[9px] text-slate-500 leading-normal">
            {100 - athlete.biometrics.fatigue > 60 ? "Central fatigue is high - rest needed" : "Muscle glycolysis levels are normal"}
          </span>
        </motion.div>

      </div>

      {/* Grid: 4. Injury Summary & 5. Recovery Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Injury Summary */}
        <motion.div 
          whileHover={{ scale: 1.005 }}
          className="rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Injury & Risk Logs</h3>
          </div>

          <div className="space-y-3.5">
            {/* Active Injuries */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Current Active Diagnoses</span>
              {athlete.currentInjury ? (
                <div className="p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-black text-rose-400">{athlete.currentInjury.type}</span>
                    <p className="text-[11px] text-slate-400 mt-1">Rehab: {athlete.currentInjury.rehabPlan}</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-[10px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">
                      {athlete.currentInjury.severity} Severity
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 mt-1">{athlete.currentInjury.timeline} left</span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl border border-white/5 bg-white/3 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-400">No active physical lesions. Recovery compliance is normal.</span>
                </div>
              )}
            </div>

            {/* High Risk Areas */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">High Risk Areas (Preventative Action Required)</span>
              {flaggedRisks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {flaggedRisks.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => setSelectedPartId(r.id)}
                      className="p-3 rounded-2xl border border-orange-500/20 bg-orange-500/5 flex items-center justify-between hover:bg-orange-500/10 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs font-bold text-orange-300">{r.name.split(" ")[0]}</span>
                      </div>
                      <span className="text-[10px] font-black text-orange-400">{r.riskScore}% risk</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl border border-white/5 bg-white/3 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-400">No high-risk warnings detected. Muscle fatigue within safety limits.</span>
                </div>
              )}
            </div>

            {/* Recovery Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>Muscle Recovery compliance</span>
                <span className="text-cyan-400 font-black">{Math.round((athlete.biometrics.sleep + athlete.biometrics.hydration + athlete.biometrics.soreness)/3)}% Complete</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" 
                  style={{ width: `${(athlete.biometrics.sleep + athlete.biometrics.hydration + athlete.biometrics.soreness)/3}%` }} 
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recovery Recommendations */}
        <motion.div 
          whileHover={{ scale: 1.005 }}
          className="rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Dumbbell className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">AI Recovery Protocols</h3>
          </div>

          <div className="space-y-3.5">
            {/* Stretching Exercises */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Compass className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Dynamic Stretching Protocol</span>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {selectedPartId ? `Perform ${bodyPartStates[selectedPartId].exercises.join(", ")} before training.` : "Focus on hamstring eccentric releases and dynamic hip flexor mobility drills to unlock lateral movement capacity."}
                </p>
              </div>
            </div>

            {/* Rest Suggestions */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Moon className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Biometric Rest & Loading</span>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {athlete.recoveryScore < 60 
                    ? "Acute fatigue detected. Perform a 20-min contrast bath protocol (ice/heat) and ensure 8.5+ hours of restorative sleep."
                    : "Standard sleep target is 8.0 hours. Limit active loading to light technical drills to consolidate cellular repair cycles."}
                </p>
              </div>
            </div>

            {/* Physiotherapy & Load Reduction Plan */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                <Flame className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">Workload Modulation Plan</span>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {athlete.biometrics.trainingLoad > 80 
                    ? "CRITICAL: Reduce training load by 25% for the next 48 hours. Limit high-velocity accelerations and lateral cornering loads."
                    : "Maintain active recovery loads. Focus on lower extremity stability and foam rolling."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
