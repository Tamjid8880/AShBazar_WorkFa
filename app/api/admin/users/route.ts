import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [users, roles] = await Promise.all([
      prisma.user.findMany({
        include: { role: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.role.findMany()
    ]);

    return NextResponse.json({ success: true, users, roles });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Failed to load users" }, { status: 500 });
  }
}
