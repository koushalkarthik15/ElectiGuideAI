"use server";

import { sendOtp, verifyOtp } from "@/lib/auth";
import { cookies } from "next/headers";

export async function dispatchOtpAction(contact: string) {
  if (!process.env.NEXTAUTH_SECRET) {
    return { success: false, error: "System Configuration Error: NEXTAUTH_SECRET missing." };
  }
  return sendOtp(contact);
}

export async function verifyOtpAction(contact: string, code: string) {
  const result = await verifyOtp(contact, code);
  if (result.valid) {
    const cookieStore = await cookies();
    cookieStore.set("authjs.session-token", "authenticated", {
      path: "/",
      maxAge: 3600,
      sameSite: "lax",
    });
  }
  return result;
}
