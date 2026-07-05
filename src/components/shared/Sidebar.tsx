"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, UserSquare2, Activity,
  HeartPulse, AlertTriangle, Flame, FileText, Calendar, Trophy,
  Sparkles,
} from "lucide-react";

const COACH_LINKS = [
  { href: "/coach/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/coach/team-overview", label: "Team Overview", icon: Users },
  { href: "/coach/athletes", label: "All Athletes", icon: UserSquare2 },
  { href: "/coach/recovery-score", label: "Recovery Scores", icon: Activity },
  { href: "/coach/match-readiness", label: "Match Readiness", icon: HeartPulse },
  { href: "/coach/injury-alerts", label: "Injury Alerts", icon: AlertTriangle },
  { href: "/coach/workload-alerts", label: "Workload Alerts", icon: Flame },
  { href: "/coach/reports", label: "Reports & Analytics", icon: FileText },
  { href: "/coach/profile", label: "Coach Profile", icon: UserSquare2 },
];

const PLAYER_LINKS = [
  { href: "/player/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/player/recovery-streaks", label: "Recovery Streaks", icon: Flame },
  { href: "/player/injury-calendar", label: "Injury Calendar", icon: Calendar },
  { href: "/player/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/player/ai-chat", label: "AI Advisor", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppStore();
  const links = user?.role === "coach" ? COACH_LINKS : PLAYER_LINKS;

  return (
    <aside
      className="w-60 min-h-[calc(100vh-57px)] sticky top-[57px] border-r border-white/5 flex-shrink-0"
      style={{ background: "rgba(5, 8, 17, 0.6)", backdropFilter: "blur(20px)" }}
    >
      <nav className="flex flex-col p-3 space-y-1 pt-6">
        {links.map((link, i) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={link.href} className="block">
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
                    isActive
                      ? "text-white bg-gradient-to-r from-purple-500/20 to-cyan-500/10 border border-purple-500/30"
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={cn("w-4 h-4", isActive ? "text-purple-400" : "text-slate-600")} />
                  <span>{link.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </aside>
  );
}
