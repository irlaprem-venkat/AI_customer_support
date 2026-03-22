"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Voice Recognition Setup (Web Speech API) ---
const useSpeechRecognition = (onResult: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return { isListening, startListening, stopListening };
};

// --- Voice Synthesis Setup ---
const speak = (text: string) => {
  const synth = window.speechSynthesis;
  if (synth) {
    const utterance = new SpeechSynthesisUtterance(text);
    // Find a premium-sounding voice if possible
    const voices = synth.getVoices();
    utterance.voice = voices.find(v => v.name.includes("Google") || v.name.includes("Enhanced")) || voices[0];
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    synth.speak(utterance);
  }
};

import { useSession } from "next-auth/react";

export default function VoiceAssistant() {
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const router = useRouter();

  const handleAIResponse = async (text: string) => {
    setIsProcessing(true);
    setTranscript(text);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const responseText = data.content;
      setAiResponse(responseText);

      // Intent Handling (Mock Logic)
      if (text.toLowerCase().includes("dashboard") || text.toLowerCase().includes("platform")) {
        speak("Navigating to the command center now.");
        router.push("/dashboard");
      } else if (text.toLowerCase().includes("home") || text.toLowerCase().includes("landing")) {
        speak("Taking you back home.");
        router.push("/");
      } else {
        speak(responseText);
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
      speak("I encountered a neural link error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const { isListening, startListening } = useSpeechRecognition(handleAIResponse);

  // Monitor speaking state
  useEffect(() => {
    const checkSpeaking = setInterval(() => {
      setIsSpeaking(window.speechSynthesis.speaking);
    }, 100);
    return () => clearInterval(checkSpeaking);
  }, []);

  if (!session) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      {/* Transcript/Response Popup */}
      <AnimatePresence>
        {(transcript || aiResponse) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-72 p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-primary/20 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-primary/60 font-medium">Neural Assistant</span>
            </div>
            {transcript && (
              <p className="text-sm text-white/80 italic mb-2">"{transcript}"</p>
            )}
            {aiResponse && (
              <p className="text-sm text-primary font-medium leading-relaxed">{aiResponse}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Central Voice Orb */}
      <motion.button
        onClick={isListening ? () => {} : startListening}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-20 h-20 group"
      >
        {/* Glow Layers */}
        <div className={`absolute inset-0 rounded-full transition-all duration-700 blur-2xl opacity-40 ${
          isListening ? "bg-red-500 scale-125" : 
          isProcessing ? "bg-yellow-400 scale-110 rotate-180" : 
          isSpeaking ? "bg-primary scale-125" : "bg-primary/50 group-hover:bg-primary"
        }`} />
        
        {/* Main Orb Body */}
        <div className="relative w-full h-full rounded-full border border-white/20 bg-gradient-to-br from-white/10 to-black/40 backdrop-blur-2xl flex items-center justify-center overflow-hidden shadow-inner">
          {/* Animated Waveform/Rings */}
          <AnimatePresence>
            {(isListening || isProcessing || isSpeaking) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center gap-1"
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [10, 40, 10],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8 + i * 0.1,
                      ease: "easeInOut",
                    }}
                    className={`w-1 rounded-full ${
                      isListening ? "bg-red-500" : 
                      isProcessing ? "bg-yellow-400" : "bg-primary"
                    }`}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!isListening && !isProcessing && !isSpeaking ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Mic className="w-8 h-8 text-white/80 group-hover:text-primary transition-colors" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Pulse Ring */}
        {isListening && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 rounded-full border-2 border-red-500"
          />
        )}
      </motion.button>
    </div>
  );
}
