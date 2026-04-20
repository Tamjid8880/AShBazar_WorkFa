import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ permissions: [] });

    const role = (session.user as any)?.role;

    // Super admin gets everything
    if (role === "super_admin") {
      const all = await prisma.permission.findMany();
      return NextResponse.json({ permissions: all.map(p => p.name) });
    }

    // Find user's role and its permissions
    const user = await prisma.user.findFirst({
      where: { email: (session.user as any)?.email },
      include: { role: { include: { permissions: { include: { permission: true } } } } }
    });

    if (!user?.role) return NextResponse.json({ permissions: [] });

    const perms = user.role.permissions.map(rp => rp.permission.name);
    return NextResponse.json({ permissions: perms });
  } catch (e) {
    return NextResponse.json({ permissions: [] });
  }
}
