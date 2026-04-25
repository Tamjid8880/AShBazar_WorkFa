import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const section = url.searchParams.get("section");
  
  const data = await prisma.widget.findMany({
    where: section ? { section } : undefined,
    orderBy: { createdAt: "desc" }
  });
  return apiSuccess("Widgets retrieved successfully.", data);
}

export async function POST(req: Request) {
  const { id, section, title, description, imageUrl, meta } = await req.json();
  if (!section) return apiError("Section is required.", 400);

  try {
    let data;
    if (id) {
      data = await prisma.widget.update({
        where: { id },
        data: { section, title, description, imageUrl, meta }
      });
    } else {
      data = await prisma.widget.create({
        data: { section, title, description, imageUrl, meta }
      });
    }
    return apiSuccess("Widget saved successfully.", data);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
