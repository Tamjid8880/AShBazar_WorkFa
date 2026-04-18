import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.poster.findMany({ orderBy: { createdAt: "desc" } });
  return apiSuccess("Posters retrieved successfully.", data);
}

export async function POST(req: Request) {
  const { posterName, imageUrl } = await req.json();
  if (!posterName || !imageUrl) return apiError("Name and image URL are required.", 400);
  await prisma.poster.create({ data: { posterName, imageUrl } });
  return apiSuccess("Poster added successfully.", null);
}
