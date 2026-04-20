import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ allowed: false });

  const role = (session.user as any)?.role;
  if (role === "admin" || role === "super_admin") {
    return NextResponse.json({ allowed: true, role });
  }
  return NextResponse.json({ allowed: false });
}
