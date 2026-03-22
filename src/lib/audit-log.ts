import fs from "fs";
import path from "path";

const LOG_PATH = path.join(process.cwd(), "security-audit.log");

export enum SecurityEvent {
  SIGNUP_ATTEMPT = "SIGNUP_ATTEMPT",
  SIGNUP_SUCCESS = "SIGNUP_SUCCESS",
  LOGIN_ATTEMPT = "LOGIN_ATTEMPT",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

export function logSecurityEvent(event: SecurityEvent, details: any) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${event}: ${JSON.stringify(details)}\n`;
  
  try {
    fs.appendFileSync(LOG_PATH, logEntry);
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}
