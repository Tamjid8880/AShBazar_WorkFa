import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Rate limiting: Check if an OTP was requested recently (e.g., within 60 seconds)
    const existingOtp = await prisma.otpCode.findUnique({ where: { phone } });
    if (existingOtp) {
      const timeDiff = Date.now() - new Date(existingOtp.createdAt).getTime();
      if (timeDiff < 60 * 1000) {
        return NextResponse.json({ error: "Please wait 60 seconds before requesting another OTP" }, { status: 429 });
      }
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store in DB
    await prisma.otpCode.upsert({
      where: { phone },
      update: {
        code: otp,
        expiresAt,
        attempts: 0
      },
      create: {
        phone,
        code: otp,
        expiresAt
      }
    });

    // TODO: Integrate actual SMS provider here
    console.log(`[SMS MOCK] Sending OTP ${otp} to ${phone}`);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
