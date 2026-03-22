"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from "recharts";
import { 
  Ticket, Users, CheckCircle, Clock, 
  TrendingUp, AlertCircle, Filter, Search,
  ChevronRight, Activity
} from "lucide-react";

const initialData = [
  { name: "Mon", tickets: 42, resolved: 28 },
  { name: "Tue", tickets: 35, resolved: 18 },
  { name: "Wed", tickets: 25, resolved: 95 },
  { name: "Thu", tickets: 32, resolved: 42 },
  { name: "Fri", tickets: 22, resolved: 52 },
  { name: "Sat", tickets: 28, resolved: 45 },
  { name: "Sun", tickets: 38, resolved: 48 },
];

const initialStats = [
  { id: "active", label: "Active Tickets", value: 128, icon: Ticket, trend: "+12%", color: "text-primary" },
  { id: "resolved", label: "Resolved Today", value: 42, icon: CheckCircle, trend: "+5%", color: "text-green-500" },
  { id: "avg", label: "Avg Response", value: 1.2, icon: Clock, trend: "-18%", color: "text-secondary", unit: "m" },
  { id: "sat", label: "Customer Sat", value: 98, icon: TrendingUp, trend: "+2%", color: "text-accent", unit: "%" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(initialStats);
  const [chartData, setChartData] = useState(initialData);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live updates for stats
      setStats(prev => prev.map(stat => {
        if (stat.label === "Active Tickets") {
          const change = Math.floor(Math.random() * 5) - 2;
          const newValue = Math.max(0, stat.value + change);
          if (change > 1) {
             setNotifications(n => [...n.slice(-2), `New ticket received: #${Math.floor(Math.random() * 1000) + 5000}`]);
          }
          return { ...stat, value: newValue };
        }
        if (stat.label === "Resolved Today") {
          const change = Math.random() > 0.8 ? 1 : 0;
          return { ...stat, value: stat.value + change };
        }
        return stat;
      }));

      // Simulate live updates for chart (last day)
      setChartData(prev => {
        const newData = [...prev];
        const lastIndex = newData.length - 1;
        newData[lastIndex] = { 
          ...newData[lastIndex], 
          tickets: Math.max(0, newData[lastIndex].tickets + (Math.floor(Math.random() * 3) - 1)) 
        };
        return newData;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-black">Live Intelligence</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Center</span></h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Query neural database..." 
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all w-72 backdrop-blur-xl"
            />
          </div>
          <button className="p-3 rounded-2xl glass-morphism border-white/10 text-white hover:text-primary hover:border-primary/30 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-morphism p-6 rounded-[32px] border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={80} />
            </div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={`p-4 rounded-2xl bg-white/5 ${stat.color} shadow-inner`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-white/5 border border-white/5 ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                <Activity className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            
            <div className="relative z-10">
              <h4 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</h4>
              <div className="flex items-baseline gap-1 mt-2">
                <motion.p 
                  key={stat.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-black text-white tracking-tighter"
                >
                  {stat.value}
                </motion.p>
                {stat.unit && <span className="text-lg font-bold text-white/20">{stat.unit}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass-morphism p-8 rounded-[48px] border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Neural Traffic</h3>
              <p className="text-white/30 text-xs">Prophetic analysis of incoming support requests.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-xl bg-white/5 text-[10px] font-bold text-white/50 hover:text-white transition-colors">7D</button>
              <button className="px-4 py-2 rounded-xl bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">30D</button>
            </div>
          </div>

          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="10 10" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff20" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ stroke: '#00f2ff', strokeWidth: 1 }}
                  contentStyle={{ 
                    backgroundColor: "rgba(10, 10, 10, 0.8)", 
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)", 
                    borderRadius: "20px", 
                    color: "#fff",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
                   }}
                  itemStyle={{ color: "#00f2ff", fontWeight: "bold" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tickets" 
                  stroke="#00f2ff" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorTickets)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-morphism p-8 rounded-[48px] border border-white/5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white tracking-tight">Active Pulse</h3>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-[8px] font-black text-green-400 uppercase tracking-widest border border-green-500/20">
              Optimal
            </div>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {notifications.map((notif, i) => (
                <motion.div 
                  key={notif}
                  layout
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="flex items-start gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary group-hover:rotate-6 transition-transform">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">{notif}</h5>
                    <p className="text-[10px] text-white/30 mt-1">Status: Initializing Analysis</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-primary transition-colors mt-1" />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Seed data for when notifications are empty */}
            {notifications.length === 0 && [1, 2, 3].map((id) => (
              <div key={id} className="flex items-start gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 opacity-50 grayscale">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white/20" />
                </div>
                <div className="flex-1">
                  <div className="h-3 w-2/3 bg-white/10 rounded-full mb-2" />
                  <div className="h-2 w-1/3 bg-white/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
          
          <button className="mt-8 w-full py-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
            Open Control Buffer
          </button>
        </motion.div>
      </div>
    </div>
  );
}
