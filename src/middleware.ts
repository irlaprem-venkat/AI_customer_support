import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const auth = NextAuth(authConfig).auth;

export default auth((req) => {
  const { nextUrl } = req;
  const hostname = req.headers.get("host") || "";

  // Canonical production URL
  const canonicalHost = "ai-customer-support-xr4n.vercel.app";

  // If the user visits a Vercel preview URL, redirect them to the main production URL
  // This solves the Google "Error 400: redirect_uri_mismatch" caused by dynamic preview branch URLs
  if (hostname.includes("vercel.app") && hostname !== canonicalHost) {
    const url = nextUrl.clone();
    url.host = canonicalHost;
    url.port = "";
    url.protocol = "https:";
    return NextResponse.redirect(url);
  }

  // Protected routes gating is handled via the authorized callback in auth.config.ts
  // This middleware wrapper ensures the session is available.
  
  return NextResponse.next();
});

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
