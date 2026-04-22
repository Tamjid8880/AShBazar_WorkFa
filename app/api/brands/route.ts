import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { subCategory: true }
  });
  return apiSuccess("Brands fetched successfully.", brands);
}

export async function POST(req: Request) {
  const { name, subcategoryId } = await req.json();
  // subcategoryId is now optional — brand can exist independently
  if (!name || !name.trim()) return apiError("Brand name is required.", 400);

  const brand = await prisma.brand.create({
    data: {
      name: name.trim(),
      subcategoryId: subcategoryId || null
    }
  });
  return apiSuccess("Brand created successfully.", brand);
}
