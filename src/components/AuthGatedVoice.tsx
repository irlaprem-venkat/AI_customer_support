"use client";

import { useSession } from "next-auth/react";
import VoiceAssistant from "./VoiceAssistant";

export default function AuthGatedVoice() {
  const { data: session } = useSession();
  
  if (!session) return null;
  
  return <VoiceAssistant />;
}
