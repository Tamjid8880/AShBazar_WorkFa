import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "accepted",
  "packed",
  "on_the_way",
  "processing",
  "shipped",
  "delivered",
  "cancelled"
];

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && ORDER_STATUSES.includes(value as OrderStatus);
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const order = await prisma.order.findUnique({ where: { id }, include: { user: true, couponCode: true, items: true } });
  if (!order) return apiError("Order not found.", 404);
  return apiSuccess("Order retrieved successfully.", order);
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();
  const { orderStatus, trackingUrl } = body;

  if (!isOrderStatus(orderStatus)) {
    return apiError(`Invalid order status. Allowed: ${ORDER_STATUSES.join(", ")}`, 400);
  }

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true }
      });
      if (!order) throw new Error("NOT_FOUND");

      const becameDelivered = orderStatus === "delivered" && order.orderStatus !== "delivered";
      const shouldDeduct = becameDelivered && !order.stockDeducted;

      if (shouldDeduct) {
        for (const line of order.items) {
          const product = await tx.product.findUnique({ where: { id: line.productID } });
          if (!product) continue;
          const nextQty = Math.max(0, product.quantity - line.quantity);
          await tx.product.update({
            where: { id: line.productID },
            data: { quantity: nextQty }
          });
        }
        await tx.order.update({
          where: { id },
          data: { orderStatus, trackingUrl, stockDeducted: true }
        });
        return;
      }

      await tx.order.update({
        where: { id },
        data: { orderStatus, trackingUrl }
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return apiError("Order not found.", 404);
    }
    return apiError(e instanceof Error ? e.message : "Update failed", 500);
  }

  return apiSuccess("Order updated successfully.", null);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.order.delete({ where: { id } });
  return apiSuccess("Order deleted successfully.", null);
}
