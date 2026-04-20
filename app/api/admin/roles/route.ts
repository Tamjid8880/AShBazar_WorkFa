import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    const permissions = await prisma.permission.findMany({
      orderBy: { group: "asc" }
    });

    return NextResponse.json({ success: true, roles, permissions });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
