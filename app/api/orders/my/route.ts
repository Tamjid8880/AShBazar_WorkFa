import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  if (!userId) {
    return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
  }

  try {
    const orders = await prisma.order.findMany({
      where:   { userID: userId },
      include: {
        items:         true,
        statusHistory: { orderBy: { createdAt: "desc" } },
        couponCode:    true,
      },
      orderBy: { orderDate: "desc" },
    });
    return NextResponse.json({ success: true, data: orders });
  } catch (err: any) {
    console.error("[/api/orders/my]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
