import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return apiSuccess("Testimonials retrieved successfully.", data);
}

export async function POST(req: Request) {
  const { id, name, review, rating, imageUrl } = await req.json();
  if (!name || !review || rating === undefined) return apiError("Name, review, and rating are required.", 400);

  try {
    let data;
    if (id) {
      data = await prisma.testimonial.update({
        where: { id },
        data: { name, review, rating: Number(rating), imageUrl }
      });
    } else {
      data = await prisma.testimonial.create({
        data: { name, review, rating: Number(rating), imageUrl }
      });
    }
    return apiSuccess("Testimonial saved successfully.", data);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
