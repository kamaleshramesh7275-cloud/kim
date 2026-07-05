"use client";

import { useAppStore } from "@/lib/store";
import { NotificationBell } from "./NotificationBell";
import { LogOut, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function Header() {
  const { user, logout, alerts } = useAppStore();
  const router = useRouter();
  const unreadAlerts = alerts.filter((a) => !a.isResolved).length;

  const handleLogout = () => {
    logout();
    document.cookie = "authRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/auth/landing");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between px-6 py-3 sticky top-0 z-50 border-b border-white/5"
      style={{ background: "rgba(5, 8, 17, 0.85)", backdropFilter: "blur(20px)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center glow-purple">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">SMART RECOVERY</h1>
          <p className="text-[10px] text-purple-400 tracking-widest uppercase">Injury Intelligence</p>
        </div>
        {user?.role && (
          <span className="ml-2 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase text-purple-300 border border-purple-500/40 rounded-full bg-purple-500/10">
            {user.role}
          </span>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <NotificationBell count={unreadAlerts} />
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-white">{user.name}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.header>
  );
}
