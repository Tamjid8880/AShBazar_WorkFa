import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    // 1. Ensure Roles exist
    const roles = ["customer", "admin", "super_admin"];
    for (const roleName of roles) {
      await prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName }
      });
    }

    const superAdminRole = await prisma.role.findUnique({ where: { name: "super_admin" } });
    if (!superAdminRole) throw new Error("Failed to initialize roles.");

    // 2. Security Check: Is there already a super_admin?
    const existingSuperAdmins = await prisma.user.count({
      where: { roleId: superAdminRole.id }
    });

    if (existingSuperAdmins > 0) {
      return NextResponse.json({ error: "Access Denied: A Super Admin already exists in this system. Direct bootstrapping is disabled." }, { status: 403 });
    }

    // 3. Elevate the target user
    const userToElevate = await prisma.user.findFirst({ where: { email } });
    if (!userToElevate) {
       return NextResponse.json({ error: "User not found. They must register an account first." }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userToElevate.id },
      data: { roleId: superAdminRole.id }
    });

    // 4. Log Audit
    await prisma.auditLog.create({
      data: {
        action: `System Bootstrap: Elevated ${email} to Super Admin`,
        targetType: "SYSTEM",
        performedBy: "SYSTEM_BOOTSTRAP"
      }
    });

    return NextResponse.json({ success: true, message: `Successfully elevated ${email} to Super Admin.` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Bootstrap failed" }, { status: 500 });
  }
}
