import { apiError, apiSuccess } from "@/lib/api-response";
import { signUserToken, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, password } = await req.json();
  if (!name || !password) return apiError("Name and password are required.", 400);

  const user = await prisma.user.findUnique({ where: { name } });
  if (!user) {
    return apiError("Invalid name or password.", 401);
  }

  const ok = await verifyPassword(password, user.password);
  if (!ok) {
    return apiError("Invalid name or password.", 401);
  }

  const token = signUserToken({ id: user.id, name: user.name });
  return apiSuccess("Login successful.", { id: user.id, name: user.name, token });
}
