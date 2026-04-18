import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.variantType.findMany({
    include: { variants: true },
    orderBy: { createdAt: "desc" }
  });
  return apiSuccess("VariantTypes retrieved successfully.", data);
}

export async function POST(req: Request) {
  const { name, type } = await req.json();
  if (!name) return apiError("Name is required.", 400);
  await prisma.variantType.create({ data: { name, type: type ?? "" } });
  return apiSuccess("VariantType created successfully.", null);
}
