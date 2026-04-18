import { apiError, apiSuccess } from "@/lib/api-response";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, phone, address, password } = await req.json();
  if (!name || !password) return apiError("Name and password are required.", 400);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ name }, { email: email || undefined }]
    }
  });
  if (existing) return apiError("User with this name or email already exists.", 409);

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      address,
      password: passwordHash
    }
  });
  return apiSuccess("User created successfully.", null);
}
