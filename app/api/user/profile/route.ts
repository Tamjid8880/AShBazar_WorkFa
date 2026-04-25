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
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: {
        id:       true,
        name:     true,
        email:    true,
        phone:    true,
        address:  true,
        division: true,
        district: true,
        upazila:  true,
        union:    true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error("[/api/user/profile]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
