"use client";

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import Link from "next/link";
import { Shield, Lock, Mail, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface CoachLoginInputs {
  email: string;
  password: string;
}

type StoredAccount = {
  email: string;
  password: string;
  role: "coach" | "player";
};

const STORAGE_KEY = "kimAccounts";

const getSavedAccounts = (): StoredAccount[] => {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(STORAGE_KEY);
  try {
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveAccounts = (accounts: StoredAccount[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};

const saveAccount = (account: StoredAccount) => {
  const existing = getSavedAccounts();
  const filtered = existing.filter(
    (item) => !(item.email === account.email && item.role === account.role)
  );
  filtered.push(account);
  saveAccounts(filtered);
};

export default function CoachLogin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CoachLoginInputs>();
  const router = useRouter();
  const { login } = useAppStore();
  
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const m = params.get("mode");
      if (m === "signup" || m === "signin") {
        setMode(m);
      }
    }
  }, []);

  const onSubmit: SubmitHandler<CoachLoginInputs> = (data) => {
    setMessage("");

    const normalizedEmail = data.email.trim().toLowerCase();
    const accounts = getSavedAccounts();
    
    const existingCoach = accounts.find(
      (account) => account.email === normalizedEmail && account.role === "coach"
    );
    const existingAny = accounts.find((account) => account.email === normalizedEmail);

    if (mode === "signin") {
      if (!existingCoach) {
        setMessage("No coach account found with this email. Switch to Create Account or enter a registered email.");
        return;
      }
      if (existingCoach.password !== data.password) {
        setMessage("Incorrect password. Please try again.");
        return;
      }

      // Successful login
      login({ id: "c1", name: "Coach Carter", email: normalizedEmail, role: "coach" });
      document.cookie = "authRole=coach; path=/";
      router.push("/coach/dashboard");
    } else {
      // Create Account mode
      if (existingCoach) {
        setMessage("A coach account with this email already exists. Please switch to Sign In.");
        return;
      }
      if (existingAny && existingAny.role !== "coach") {
        setMessage("This email is already registered as a player. Use a different email to create a coach account.");
        return;
      }

      // Successful registration
      saveAccount({ email: normalizedEmail, password: data.password, role: "coach" });
      login({ id: "c1", name: "Coach Carter", email: normalizedEmail, role: "coach" });
      document.cookie = "authRole=coach; path=/";
      router.push("/coach/dashboard");
    }
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#050811" }}>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-purple-500/20 p-8"
          style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(20px)" }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.4)", boxShadow: "0 0 30px rgba(168,85,247,0.3)" }}
          >
            <Shield className="w-7 h-7 text-purple-400" />
          </motion.div>

          {/* Tabs for Sign In vs Create Account */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6 border border-white/5">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setMessage("");
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setMessage("");
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create Account
            </button>
          </div>

          <h1 className="text-2xl font-black text-white text-center mb-1">
            {mode === "signin" ? "Coach Sign In" : "Create Coach Account"}
          </h1>
          <p className="text-slate-500 text-sm text-center mb-8">
            {mode === "signin" ? "Access the team command center" : "Register a new coach command center"}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                  type="email"
                  defaultValue="coach@team.com"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-xs text-rose-300">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  type="password"
                  defaultValue="password"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-xs text-rose-300">{errors.password.message}</p>
              )}
            </div>

            {message ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-100">
                {message}
              </div>
            ) : null}

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(168,85,247,0.5)" }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
            >
              <Zap className="w-4 h-4" />
              {mode === "signin" ? "Access Coach Dashboard" : "Register & Enter Dashboard"}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/landing">
              <motion.span
                whileHover={{ x: -3 }}
                className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-purple-400 transition-colors font-medium"
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
