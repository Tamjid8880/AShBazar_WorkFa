import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { roleId } = await req.json();

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) return NextResponse.json({ success: false, error: "Invalid role selected." }, { status: 400 });

    const user = await prisma.user.update({
      where: { id },
      data: { roleId }
    });

    // Audit Log Creation
    await prisma.auditLog.create({
      data: {
        action: `Assigned role [${role.name.toUpperCase()}] to user ${user.email || user.name}`,
        targetType: "USER_ROLE",
        performedBy: "Super Admin" // Needs session mapping natively later
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to update role" }, { status: 500 });
  }
}
