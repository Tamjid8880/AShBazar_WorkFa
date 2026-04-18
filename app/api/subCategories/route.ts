import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.subCategory.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });
  return apiSuccess("Sub-categories retrieved successfully.", data);
}

export async function POST(req: Request) {
  const { name, categoryId } = await req.json();
  if (!name || !categoryId) return apiError("Name and category ID are required.", 400);
  await prisma.subCategory.create({ data: { name, categoryId } });
  return apiSuccess("Sub-category created successfully.", null);
}
