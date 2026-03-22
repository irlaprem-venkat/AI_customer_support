import { NextResponse } from "next/server";
import { findUserByEmail, saveUser, hashPassword } from "@/lib/user-db";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

import { logSecurityEvent, SecurityEvent } from "@/lib/audit-log";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const { success, limit, remaining, reset } = rateLimit(ip, 5, 60000);

    if (!success) {
      logSecurityEvent(SecurityEvent.RATE_LIMIT_EXCEEDED, { ip });
      return NextResponse.json(
        { error: "Too many requests. Please harmonize your neural frequency (wait a minute)." },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          }
        }
      );
    }

    const body = await req.json();
    logSecurityEvent(SecurityEvent.SIGNUP_ATTEMPT, { email: body.email });
    
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { name, email, password } = result.data;

    if (findUserByEmail(email)) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
    };

    saveUser(newUser);

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
