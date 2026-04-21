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
  if (!name || !subcategoryId) return apiError("Name and SubCategory are required.", 400);
  
  const brand = await prisma.brand.create({
    data: {
      name,
      subcategoryId
    }
  });
  return apiSuccess("Brand created successfully.", brand);
}
