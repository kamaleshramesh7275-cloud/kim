"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import Link from "next/link";
import { Zap, Lock, Mail, Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function PlayerLogin() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const { login } = useAppStore();

  const onSubmit = (data: any) => {
    login({ id: "a1", name: "Marcus Johnson", email: data.email, role: "player" });
    document.cookie = "authRole=player; path=/";
    router.push("/player/dashboard");
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#050811" }}>
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #22d3ee, transparent)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-cyan-500/20 p-8"
          style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(20px)" }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(34,211,238,0.2)", border: "1px solid rgba(34,211,238,0.4)", boxShadow: "0 0 30px rgba(34,211,238,0.3)" }}
          >
            <Flame className="w-7 h-7 text-cyan-400" />
          </motion.div>

          <h1 className="text-2xl font-black text-white text-center mb-1">Player Portal</h1>
          <p className="text-slate-500 text-sm text-center mb-8">Access your recovery intelligence hub</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  {...register("email", { required: true })}
                  type="email"
                  defaultValue="player@team.com"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  {...register("password", { required: true })}
                  type="password"
                  defaultValue="password"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34,211,238,0.5)" }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mt-2"
              style={{ background: "linear-gradient(135deg, #22d3ee, #0891b2)" }}
            >
              <Zap className="w-4 h-4" />
              Access Player Dashboard
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/landing">
              <motion.span
                whileHover={{ x: -3 }}
                className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-cyan-400 transition-colors font-medium"
              >
                ← Back to Portal Selection
              </motion.span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
