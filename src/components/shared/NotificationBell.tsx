import { Bell } from "lucide-react";
import { motion } from "framer-motion";

export function NotificationBell({ count }: { count: number }) {
  const isRinging = count > 0;
  return (
    <div className="relative p-2 text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
      <motion.div
        animate={isRinging ? { rotate: [0, -12, 12, -12, 12, 0] } : {}}
        transition={isRinging ? { duration: 0.8, repeat: Infinity, repeatDelay: 4 } : {}}
      >
        <Bell className="w-5 h-5" />
      </motion.div>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-black text-white bg-rose-500 rounded-full"
          style={{ boxShadow: "0 0 8px rgba(244,63,94,0.6)" }}
        >
          {count > 9 ? "9+" : count}
        </motion.span>
      )}
    </div>
  );
}
