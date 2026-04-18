import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { createdAt: "desc" } });
  return apiSuccess("Categories retrieved successfully.", categories);
}

export async function POST(req: Request) {
  const { name, image } = await req.json();
  if (!name) return apiError("Name is required.", 400);

  await prisma.category.create({
    data: { name, image: image ?? "no_url" }
  });

  return apiSuccess("Category created successfully.", null);
}
