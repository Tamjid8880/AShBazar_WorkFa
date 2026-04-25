import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.blog.findMany({ orderBy: { createdAt: "desc" } });
  return apiSuccess("Blogs retrieved successfully.", data);
}

export async function POST(req: Request) {
  const { id, title, description, imageUrl } = await req.json();
  if (!title || !description) return apiError("Title and description are required.", 400);

  try {
    let data;
    if (id) {
      data = await prisma.blog.update({
        where: { id },
        data: { title, description, imageUrl }
      });
    } else {
      data = await prisma.blog.create({
        data: { title, description, imageUrl }
      });
    }
    return apiSuccess("Blog saved successfully.", data);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
