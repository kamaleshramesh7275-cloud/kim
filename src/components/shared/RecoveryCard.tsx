import { MetricGauge } from "./MetricGauge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RecoveryCardProps {
  score: number;
  trend?: "up" | "down" | "flat";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RecoveryCard({ score, trend, size = "lg", className }: RecoveryCardProps) {
  const color = score >= 80 ? "#4ade80" : score >= 60 ? "#fbbf24" : "#f43f5e";
  const glow = score >= 80 ? "rgba(74,222,128,0.15)" : score >= 60 ? "rgba(251,191,36,0.15)" : "rgba(244,63,94,0.15)";

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${glow}` }}
      className={cn("p-6 rounded-2xl border flex flex-col items-center justify-center transition-all", className)}
      style={{
        borderColor: `${color}25`,
        background: `radial-gradient(ellipse at top, ${glow} 0%, transparent 70%), rgba(15,23,42,0.6)`
      }}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Overall Recovery</p>
      <div className="relative">
        <MetricGauge value={score} label="" size={size} />
        {trend && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 1 }}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-black border border-white/10"
            style={{
              background: trend === "up" ? "#4ade80" : trend === "down" ? "#f43f5e" : "#64748b",
              boxShadow: `0 0 10px ${trend === "up" ? "rgba(74,222,128,0.5)" : trend === "down" ? "rgba(244,63,94,0.5)" : "transparent"}`
            }}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "−"}
          </motion.div>
        )}
      </div>
      <p className="mt-4 text-xs text-slate-500 text-center">
        {score >= 80 ? "Optimal readiness for peak performance." : score >= 60 ? "Adequate recovery. Monitor load." : "High risk. Prioritize rest & rehab."}
      </p>
    </motion.div>
  );
}
