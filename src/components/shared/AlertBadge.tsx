import { cn } from "@/lib/utils";

interface AlertBadgeProps {
  severity: "high" | "medium" | "low";
  type?: "injury" | "workload" | "recovery";
  className?: string;
}

export function AlertBadge({ severity, type, className }: AlertBadgeProps) {
  const styleMap = {
    high: { background: "rgba(244,63,94,0.1)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.25)", dot: "#f43f5e" },
    medium: { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)", dot: "#fbbf24" },
    low: { background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)", dot: "#4ade80" },
  };

  const labelMap = {
    high: "High Risk",
    medium: "Caution",
    low: "Good",
  };

  const s = styleMap[severity];

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider", className)}
      style={{ background: s.background, color: s.color, border: s.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot, boxShadow: `0 0 4px ${s.dot}` }} />
      {type ? `${type} · ${labelMap[severity]}` : labelMap[severity]}
    </span>
  );
}
