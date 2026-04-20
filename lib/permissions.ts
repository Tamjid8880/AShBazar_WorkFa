import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function hasServerPermission(requiredPermission: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;

  const roleName = (session.user as any)?.role;
  if (!roleName) return false;
  if (roleName === "super_admin") return true;

  const user = await prisma.user.findFirst({
    where: { email: (session.user as any)?.email },
    include: { role: { include: { permissions: { include: { permission: true } } } } }
  });

  if (!user?.role) return false;

  const perms = user.role.permissions.map(rp => rp.permission.name);
  return perms.includes(requiredPermission);
}
