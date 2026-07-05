"use client";

import { useState } from "react";
import { X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(5,8,17,0.85)", backdropFilter: "blur(8px)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="w-full max-w-md rounded-2xl border border-purple-500/20 p-6"
          style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(20px)", boxShadow: "0 0 60px rgba(168,85,247,0.15)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.4)" }}>
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="text-lg font-black text-white">{title}</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setIsOpen(false); onCancel(); }}
              className="text-slate-600 hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <p className="text-sm text-slate-400 mb-6 leading-relaxed pl-11">{description}</p>

          <div className="flex justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setIsOpen(false); onCancel(); }}
              className="px-4 py-2 text-sm font-semibold text-slate-400 rounded-xl border border-white/10 hover:border-white/20 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              {cancelText}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(168,85,247,0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setIsOpen(false); onConfirm(); }}
              className="px-4 py-2 text-sm font-bold text-white rounded-xl"
              style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
            >
              {confirmText}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
