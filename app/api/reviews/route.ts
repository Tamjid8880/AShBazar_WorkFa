import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { productId, userId, rating, comment } = body;

  if (!productId || !userId || !rating) {
    return apiError("Product ID, User ID and Rating are required.", 400);
  }

  const review = await prisma.review.create({
    data: {
      productId,
      userId,
      rating: Number(rating),
      comment
    }
  });

  return apiSuccess("Review submitted.", review);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (productId) {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    });
    return apiSuccess("Reviews retrieved.", reviews);
  }

  const reviews = await prisma.review.findMany({
    include: { user: { select: { name: true } }, product: { select: { name: true } } },
    orderBy: { createdAt: "desc" }
  });
  return apiSuccess("All reviews retrieved.", reviews);
}
