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

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ success: false, error: "Invalid name" }, { status: 400 });
    }
    
    let sanitizedName = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    if (!sanitizedName) {
      return NextResponse.json({ success: false, error: "Invalid role name" }, { status: 400 });
    }

    const existing = await prisma.role.findUnique({ where: { name: sanitizedName } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Role already exists" }, { status: 400 });
    }

    const role = await prisma.role.create({
      data: { name: sanitizedName }
    });

    return NextResponse.json({ success: true, role });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Error creating role" }, { status: 500 });
  }
}
