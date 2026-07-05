import { cn } from "@/lib/utils";
import { InjuryStatus } from "@/lib/types";

interface InjuryBadgeProps {
  status: InjuryStatus;
  className?: string;
}

export function InjuryBadge({ status, className }: InjuryBadgeProps) {
  const map: Record<InjuryStatus, { style: React.CSSProperties; dot: string; label: string }> = {
    Healthy: {
      style: { background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" },
      dot: "#4ade80",
      label: "Healthy"
    },
    Caution: {
      style: { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" },
      dot: "#fbbf24",
      label: "Caution"
    },
    Injured: {
      style: { background: "rgba(244,63,94,0.1)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.25)" },
      dot: "#f43f5e",
      label: "Injured"
    },
  };

  const current = map[status];

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider", className)}
      style={current.style}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: current.dot, boxShadow: `0 0 4px ${current.dot}` }} />
      {current.label}
    </span>
  );
}
