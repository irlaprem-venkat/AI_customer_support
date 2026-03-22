"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Github, Chrome, ShieldCheck, Sparkles, ArrowLeft, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LiquidIntelligenceBackground from "@/components/LiquidIntelligenceBackground";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) setSuccess(message);
    const errorParam = searchParams.get("error");
    if (errorParam === "CredentialsSignin") setError("Invalid email or password");
  }, [searchParams]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid neural key (credentials)");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Critical connection failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative w-full max-w-md"
    >
      <Link 
        href="/" 
        className="absolute -top-12 left-0 flex items-center gap-2 text-white/40 hover:text-primary transition-colors text-sm group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      {/* Auth Card */}
      <div className="relative p-8 rounded-[32px] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-white/5 to-transparent rotate-45 pointer-events-none" />
        
        <div className="relative space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4 mx-auto">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Access Node</h1>
            <p className="text-white/40 text-sm">Synchronize with the Nova Support Core</p>
          </div>

          {success && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs text-center">
              {success}
            </div>
          )}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nexus.com"
                  className="w-full h-11 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full h-12 mt-2 flex items-center justify-center gap-2 rounded-xl bg-white text-black font-bold hover:bg-white/90 disabled:opacity-50 transition-all shadow-lg"
            >
              {loading ? "Authenticating..." : "Establish Neural Link"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[10px] uppercase tracking-widest text-white/20">or continue with</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="h-12 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-all group"
            >
              <Github className="w-5 h-5 group-hover:text-primary transition-colors" />
              GitHub
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="h-12 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-all group"
            >
              <Chrome className="w-5 h-5 group-hover:text-primary transition-colors" />
              Google
            </motion.button>
          </div>

          <div className="pt-6 border-t border-white/5 text-center">
            <p className="text-white/40 text-sm font-medium">
              New to the system?{" "}
              <Link href="/signup" className="text-primary hover:underline">Create Identity</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-white/20">
        <Sparkles className="w-3 h-3" />
        SSO Enabled Authentication
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-black overflow-hidden">
      <LiquidIntelligenceBackground />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <Suspense fallback={<div className="text-white">Synching Neural Node...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
