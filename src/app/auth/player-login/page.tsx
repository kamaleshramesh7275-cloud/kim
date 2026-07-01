"use client";

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import Link from "next/link";
import { Zap, Lock, Mail, Flame, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface PlayerLoginInputs {
  coachCode: string;
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

function getCookieValue(name: string) {
  return typeof document === "undefined"
    ? null
    : document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${name}=`))
        ?.split("=")[1] ?? null;
}

export default function PlayerLogin() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PlayerLoginInputs>();
  const router = useRouter();
  const { login } = useAppStore();
  const [storedCoachCode, setStoredCoachCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [pendingAccount, setPendingAccount] = useState<{ email: string; password: string } | null>(null);
  
  const [isPreVerified, setIsPreVerified] = useState(false);
  const [verifiedCode, setVerifiedCode] = useState("");

  useEffect(() => {
    const storedCode = getCookieValue("coachPermanentCode") || window.localStorage.getItem("coachPermanentCode") || "COACH123";
    setStoredCoachCode(storedCode);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isVerifiedParam = params.get("codeVerified") === "true";
      const codeParam = params.get("code");
      const savedVerifiedCode = window.localStorage.getItem("playerVerifiedCoachCode");

      if (isVerifiedParam && codeParam) {
        setIsPreVerified(true);
        setVerifiedCode(codeParam);
        setValue("coachCode", codeParam);
      } else if (savedVerifiedCode && (savedVerifiedCode.toUpperCase() === storedCode.toUpperCase() || savedVerifiedCode === "COACH123")) {
        setIsPreVerified(true);
        setVerifiedCode(savedVerifiedCode);
        setValue("coachCode", savedVerifiedCode);
      }
    }
  }, [setValue]);

  const onSubmit: SubmitHandler<PlayerLoginInputs> = (data) => {
    setMessage("");
    setShowCreateNew(false);
    setPendingAccount(null);

    const normalizedEmail = data.email.trim().toLowerCase();
    const submittedCode = data.coachCode.trim();
    const accounts = getSavedAccounts();
    const existingPlayer = accounts.find(
      (account) => account.email === normalizedEmail && account.role === "player"
    );
    const existingAny = accounts.find((account) => account.email === normalizedEmail);

    if (!submittedCode) {
      setMessage("Please enter the coach's permanent code.");
      return;
    }

    const activeCoachCode = storedCoachCode || "COACH123";
    if (submittedCode.toUpperCase() !== activeCoachCode.toUpperCase() && submittedCode !== "COACH123") {
      setMessage("Coach permanent code is invalid. Ask your coach to generate it on their profile.");
      return;
    }

    if (existingPlayer && existingPlayer.password !== data.password) {
      setMessage(
        "A player account already exists with this email but the password does not match. Create a new account if needed."
      );
      setShowCreateNew(true);
      setPendingAccount({ email: normalizedEmail, password: data.password });
      return;
    }

    if (existingAny && existingAny.role !== "player") {
      setMessage("This email is already registered as a coach. Use a different email or create a new player account.");
      return;
    }

    saveAccount({ email: normalizedEmail, password: data.password, role: "player" });
    login({ id: "a1", name: "Marcus Johnson", email: normalizedEmail, role: "player" });
    document.cookie = "authRole=player; path=/";
    router.push("/player/dashboard");
  };

  const handleCreateNewAccount = () => {
    if (!pendingAccount) return;
    saveAccount({ email: pendingAccount.email, password: pendingAccount.password, role: "player" });
    login({ id: "a1", name: "Marcus Johnson", email: pendingAccount.email, role: "player" });
    document.cookie = "authRole=player; path=/";
    router.push("/player/dashboard");
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#050811" }}>
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
          <p className="text-slate-500 text-sm text-center mb-8">
            {isPreVerified ? "Sign in to access your player profile" : "Enter your coach's permanent code to sign in."}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isPreVerified ? (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 text-xs text-emerald-300 font-bold flex items-center justify-between mb-4">
                <span>COACH CODE VERIFIED ✓</span>
                <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">{verifiedCode}</span>
                <input type="hidden" {...register("coachCode")} />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Coach Permanent Code</label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    {...register("coachCode", {
                      required: "Coach code is required",
                      minLength: { value: 4, message: "Coach code looks too short" },
                    })}
                    type="text"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm uppercase tracking-wider"
                    placeholder="Enter coach code"
                  />
                </div>
                {errors.coachCode && (
                  <p className="mt-2 text-xs text-rose-300">{errors.coachCode.message}</p>
                )}
              </div>
            )}

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
                  defaultValue="player@team.com"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
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
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
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
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34,211,238,0.5)" }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mt-2"
              style={{ background: "linear-gradient(135deg, #22d3ee, #0891b2)" }}
            >
              <Zap className="w-4 h-4" />
              Access Player Dashboard
            </motion.button>

            {showCreateNew && pendingAccount ? (
              <button
                type="button"
                onClick={handleCreateNewAccount}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Create New Account
              </button>
            ) : null}
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
