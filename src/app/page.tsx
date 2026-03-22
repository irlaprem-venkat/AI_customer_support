"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ChatInterface from "@/components/ChatInterface";
import UserAccount from "@/components/UserAccount";
import { Sparkles, Shield, Zap, Globe, MessageSquare, Headphones } from "lucide-react";

const features = [
  { icon: Shield, title: "Enterprise Grade", desc: "AES-256 encryption and SOC2 compliance." },
  { icon: Zap, title: "Nano-Latency", desc: "Real-time AI response in under 500ms." },
  { icon: Globe, title: "Global Scale", desc: "Support for 100+ languages natively." },
];

export default function Home() {
  return (
    <div className="container mx-auto px-6 py-12 md:py-24">
      {/* Header / Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-morphism px-8 py-3 rounded-full flex items-center gap-12 border border-white/10"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="text-black w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white">NOVA</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-white/70">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Platform</Link>
          <a href="#" className="hover:text-primary transition-colors">Solutions</a>
          <a href="#" className="hover:text-primary transition-colors">Enterprise</a>
          <a href="#" className="hover:text-primary transition-colors">Pricing</a>
        </div>
        <UserAccount />
      </motion.nav>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mt-12 md:mt-24">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center lg:text-left space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Next Generation AI Interface
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
            Automate <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">Intelligence</span>.
            <br />
            Elevate Support.
          </h1>
          <p className="text-lg text-white/50 max-w-xl leading-relaxed">
            The world's first emotion-aware AI customer support platform. 
            Reduce resolution times by 90% while delivering a premium, 
            personalized experience at scale.
          </p>
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <button className="px-8 py-4 bg-primary text-black font-bold rounded-2xl shadow-[0_0_30px_rgba(0,242,255,0.4)] hover:scale-105 transition-transform">
              Deploy Nova Now
            </button>
            <button className="px-8 py-4 glass-morphism text-white font-bold rounded-2xl hover:bg-white/10 transition-colors">
              Watch Demo
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-12">
            {features.map((f, i) => (
              <div key={i} className="space-y-2">
                <f.icon className="w-6 h-6 text-primary/50" />
                <h4 className="font-bold text-white text-sm">{f.title}</h4>
                <p className="text-xs text-white/30">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <AuthGatedFeature>
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-xl relative group"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[40px] blur-3xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <ChatInterface />
          </motion.div>
        </AuthGatedFeature>
      </div>
    </div>
  );
}

function AuthGatedFeature({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="w-full h-[500px] rounded-[32px] border border-white/10 bg-black/40 backdrop-blur-3xl flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-t-2 border-primary animate-spin" />
      </div>
    );
  }

  if (session) return <>{children}</>;
  return null;
}
