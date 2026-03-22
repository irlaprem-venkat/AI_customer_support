"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sentiment?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am Nova, your AI assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await response.json();

      const assistantMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.content,
        sentiment: data.sentiment,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto glass-morphism rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.5)]">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              Nova AI <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            </h3>
            <p className="text-xs text-primary font-medium uppercase tracking-wider">Online & Intelligent</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-primary text-black font-medium rounded-tr-none shadow-[0_0_20px_rgba(0,242,255,0.3)]"
                    : "glass-morphism text-white rounded-tl-none border-white/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  {msg.role === "user" ? (
                    <User className="w-3 h-3 opacity-70" />
                  ) : (
                    <Bot className="w-3 h-3 text-primary" />
                  )}
                  <span className="text-[10px] uppercase tracking-tighter opacity-50 font-bold">
                    {msg.role === "user" ? "You" : "Nova"}
                  </span>
                  {msg.sentiment && (
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                      msg.sentiment === "angry" ? "bg-red-500/20 text-red-500" : "bg-primary/20 text-primary"
                    }`}>
                      {msg.sentiment}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="glass-morphism p-4 rounded-2xl rounded-tl-none flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 bg-white/5 border-t border-white/10">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-12 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 p-2 rounded-lg bg-primary text-black hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        <p className="text-[10px] text-center text-white/30 mt-3 font-medium uppercase tracking-[0.2em]">
          Powered by Nova Core Intelligence
        </p>
      </div>
    </div>
  );
}
