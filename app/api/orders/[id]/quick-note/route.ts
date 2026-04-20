import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasServerPermission } from "@/lib/permissions";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await hasServerPermission("edit_orders"))) {
    return NextResponse.json({ success: false, message: "Unauthorized. Missing 'edit_orders' permission." }, { status: 403 });
  }

  try {
    const { id } = params;
    const { note } = await req.json();

    await prisma.order.update({
      where: { id },
      data: { adminNotes: note }
    });

    await prisma.auditLog.create({
      data: {
        action: `Added/Updated Note: ${note}`,
        targetId: id,
        targetType: "ORDER_NOTE",
        performedBy: "Admin" // TODO: dynamically pull from session
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Quick Note Save Error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
