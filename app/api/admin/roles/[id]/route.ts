import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const roleId = params.id;
    const { permissionIds } = await req.json(); // array of permission IDs

    // Delete all existing permissions for this role
    await prisma.rolePermission.deleteMany({ where: { roleId } });

    // Re-create with new set
    if (Array.isArray(permissionIds) && permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((pid: string) => ({ roleId, permissionId: pid }))
      });
    }

    // Audit
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    await prisma.auditLog.create({
      data: {
        action: `Updated permissions for role [${role?.name?.toUpperCase()}] — ${permissionIds.length} permissions assigned.`,
        targetType: "ROLE_PERMISSION",
        performedBy: "Super Admin"
      }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to update permissions" }, { status: 500 });
  }
}
