"use client";

import Dashboard from "@/components/Dashboard";
import { motion } from "framer-motion";
import { LayoutDashboard, MessageSquare, Settings, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AgentDashboard() {
  return (
    <div className="flex min-h-screen bg-black overflow-hidden tracking-tight">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 glass-morphism border-r border-white/5 flex flex-col items-center py-8 gap-12 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(0,242,255,0.4)]">
            <LayoutDashboard className="text-black w-6 h-6" />
          </div>
          <span className="hidden md:block font-black text-xl text-white">NOVA <span className="text-primary/50 text-xs">PRO</span></span>
        </Link>

        <nav className="flex-1 flex flex-col gap-4 w-full px-4">
          <NavItem icon={LayoutDashboard} label="Overview" active />
          <NavItem icon={MessageSquare} label="Tickets" />
          <NavItem icon={Users} label="Customers" />
          <NavItem icon={Settings} label="Engine Config" />
        </nav>

        <Link href="/" className="px-4 py-3 flex items-center gap-3 text-white/40 hover:text-white transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden md:block text-sm font-bold">Back to Site</span>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />
        <Dashboard />
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all w-full group ${
      active ? "bg-primary text-black" : "text-white/40 hover:bg-white/5 hover:text-white"
    }`}>
      <Icon className={`w-5 h-5 ${active ? "" : "group-hover:text-primary transition-colors"}`} />
      <span className="hidden md:block text-sm font-bold">{label}</span>
      {active && <motion.div layoutId="active" className="ml-auto w-1 h-4 bg-black rounded-full" />}
    </button>
  );
}
