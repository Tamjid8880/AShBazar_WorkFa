import { apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;

  const orders = await prisma.order.findMany({
    where: { userID: userId },
    include: { user: true, couponCode: true, items: true },
    orderBy: { orderDate: "desc" }
  });

  return apiSuccess("Orders retrieved successfully.", orders);
}
