import { apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [products, categories, orders, users, pendingOrders] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.count({ where: { orderStatus: "pending" } })
  ]);

  return apiSuccess("Dashboard summary retrieved successfully.", {
    products,
    categories,
    orders,
    users,
    pendingOrders
  });
}
