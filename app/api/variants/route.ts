import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.variant.findMany({ include: { variantType: true }, orderBy: { createdAt: "desc" } });
  return apiSuccess("Variants retrieved successfully.", data);
}

export async function POST(req: Request) {
  const { name, variantTypeId } = await req.json();
  if (!name || !variantTypeId) return apiError("Name and VariantType ID are required.", 400);
  await prisma.variant.create({ data: { name, variantTypeId } });
  return apiSuccess("Variant created successfully.", null);
}
