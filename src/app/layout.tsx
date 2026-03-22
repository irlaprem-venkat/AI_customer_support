import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LiquidIntelligenceBackground from "@/components/LiquidIntelligenceBackground";
import VoiceAssistant from "@/components/VoiceAssistant";
import AuthGatedVoice from "@/components/AuthGatedVoice";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nova Support AI | Next-Gen Customer Service",
  description: "Automated, intelligent customer support powered by advanced AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased selection:bg-primary selection:text-black`}>
        <Providers>
          <LiquidIntelligenceBackground />
          <main className="relative z-10 min-h-screen">
            {children}
          </main>
          <AuthGatedVoice />
        </Providers>
      </body>
    </html>
  );
}
