import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export async function analyzeSentiment(text: string) {
  // Enhanced sentiment analysis with more weight and keywords
  const angryWords = ["angry", "bad", "terrible", "hate", "worst", "broken", "annoyed", "frustrated", "awful", "horrible", "stupid", "garbage"];
  const happyWords = ["great", "thanks", "love", "awesome", "good", "excellent", "amazing", "wonderful", "perfect", "help", "cool"];
  
  const lowerText = text.toLowerCase();
  
  const angryCount = angryWords.filter(w => lowerText.includes(w)).length;
  const happyCount = happyWords.filter(w => lowerText.includes(w)).length;

  if (angryCount > happyCount) return "angry";
  if (happyCount > angryCount) return "happy";
  return "neutral";
}

export async function detectIntent(text: string) {
  const lowerText = text.toLowerCase();
  
  // Account & Security
  if (lowerText.includes("password") || lowerText.includes("login") || lowerText.includes("sign in") || lowerText.includes("auth") || lowerText.includes("security")) {
    return "account_support";
  }
  
  // Order & Shipping
  if (lowerText.includes("order") || lowerText.includes("track") || lowerText.includes("shipping") || lowerText.includes("delivery") || lowerText.includes("package")) {
    return "order_support";
  }
  
  // Technical Issues
  if (lowerText.includes("bug") || lowerText.includes("error") || lowerText.includes("broken") || lowerText.includes("fail") || lowerText.includes("crash") || lowerText.includes("not working")) {
    return "technical_support";
  }

  // Billing & Pricing
  if (lowerText.includes("price") || lowerText.includes("cost") || lowerText.includes("billing") || lowerText.includes("payment") || lowerText.includes("invoice") || lowerText.includes("subscription")) {
    return "billing_support";
  }

  return "general_query";
}

export function generateUUID() {
  return Math.random().toString(36).substring(2, 15);
}
