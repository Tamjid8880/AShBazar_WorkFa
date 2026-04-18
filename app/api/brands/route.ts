import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.brand.findMany({ include: { subCategory: true }, orderBy: { createdAt: "desc" } });
  return apiSuccess("Brands retrieved successfully.", data);
}

export async function POST(req: Request) {
  const { name, subcategoryId } = await req.json();
  if (!name || !subcategoryId) return apiError("Name and subcategory ID are required.", 400);
  await prisma.brand.create({ data: { name, subcategoryId } });
  return apiSuccess("Brand created successfully.", null);
}
