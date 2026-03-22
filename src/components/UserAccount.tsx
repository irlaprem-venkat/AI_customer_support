"use client";

import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { User, LogOut, LayoutDashboard, Settings, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function UserAccount() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (status === "loading") return <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />;

  if (!session) {
    return (
      <Link href="/login">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-black transition-all"
        >
          Sign In
        </motion.button>
      </Link>
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all pl-2"
      >
        <div className="flex flex-col items-end mr-1">
          <span className="text-xs font-semibold text-white truncate max-w-[100px]">{session.user?.name}</span>
          <span className="text-[10px] text-white/40">Neural Link Active</span>
        </div>
        <div className="relative w-8 h-8 rounded-full border border-primary/30 overflow-hidden bg-primary/10 flex items-center justify-center">
          {session.user?.image ? (
            <Image src={session.user.image} alt={session.user.name || "User"} fill className="object-cover" />
          ) : (
            <User className="w-4 h-4 text-primary" />
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-white/20 mr-2 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-3xl shadow-2xl p-2 z-[110]"
          >
            <div className="space-y-1">
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
              </Link>
              <button disabled className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/20 cursor-not-allowed">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <div className="h-px bg-white/5 my-2" />
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Interrupt Link
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
