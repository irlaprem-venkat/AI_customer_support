import { NextResponse } from "next/server";
import { analyzeSentiment, detectIntent } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    const sentiment = await analyzeSentiment(lastMessage);
    const intent = await detectIntent(lastMessage);

    // Simulated AI response based on intent/sentiment
    let response = "";
    if (sentiment === "angry") {
      response = "I'm truly sorry to hear you're feeling this way. I've prioritized your request and am looking into it immediately. ";
    }

    switch (intent) {
      case "account_support":
        response += "For account security, I can help you with a password reset or multi-factor authentication setup. Which would you like to start with?";
        break;
      case "order_support":
        response += "I can help you track your recent orders. Could you please provide your order ID or the email associated with the account?";
        break;
      case "technical_support":
        response += "I'm sorry you're experiencing technical difficulties. Let's start by identifying if this is a platform-wide issue or specific to your environment. Can you describe the error?";
        break;
      case "billing_support":
        response += "I've accessed your billing records. I can help with invoice copies, subscription changes, or payment method updates. What do you need help with?";
        break;
      default:
        response += "That's an interesting question! I'm scanning our knowledge base to give you the most accurate answer. One moment please...";
    }

    return NextResponse.json({
      role: "assistant",
      content: response,
      sentiment,
      intent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
