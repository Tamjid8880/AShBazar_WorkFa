import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return apiError("User ID is required", 400);
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userID: id },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { orderDate: "desc" }
    });

    return apiSuccess("Orders retrieved", orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return apiError("Failed to fetch orders", 500);
  }
}
