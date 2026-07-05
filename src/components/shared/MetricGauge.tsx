import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MetricGaugeProps {
  value: number;
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MetricGauge({ value, label, size = "md", className }: MetricGaugeProps) {
  const sizeMap = {
    sm: { wrapper: "w-16 h-16", text: "text-sm", strokeWidth: 5, radius: 28, cx: 32 },
    md: { wrapper: "w-24 h-24", text: "text-xl", strokeWidth: 6, radius: 42, cx: 48 },
    lg: { wrapper: "w-32 h-32", text: "text-3xl", strokeWidth: 8, radius: 56, cx: 64 },
  };

  const { wrapper, text, strokeWidth, radius, cx } = sizeMap[size];
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const color = value >= 80 ? "#4ade80" : value >= 60 ? "#fbbf24" : "#f43f5e";
  const glow = value >= 80 ? "rgba(74,222,128,0.6)" : value >= 60 ? "rgba(251,191,36,0.6)" : "rgba(244,63,94,0.6)";

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className={cn("relative", wrapper)}>
        <svg className="w-full h-full transform -rotate-90">
          <circle cx={cx} cy={cx} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="transparent" />
          <motion.circle
            cx={cx} cy={cx} r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className={cn("font-black text-white", text)}
          >
            {value}%
          </motion.span>
        </div>
      </div>
      {label && <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>}
    </div>
  );
}
