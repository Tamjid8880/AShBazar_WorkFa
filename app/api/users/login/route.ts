import { apiError, apiSuccess } from "@/lib/api-response";
import { verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, password } = await req.json();
  if (!name || !password) return apiError("Name and password are required.", 400);

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ name }, { email: name }]
    },
    include: { role: true }
  });
  if (!user) {
    return apiError("Invalid name or password.", 401);
  }

  const ok = await verifyPassword(password, user.password);
  if (!ok) {
    return apiError("Invalid name or password.", 401);
  }

  // Return user info. Actual JWT is managed by NextAuth session now.
  return apiSuccess("Login successful.", { 
    id: user.id, 
    name: user.name, 
    email: user.email,
    role: user.role?.name || "customer"
  });
}
