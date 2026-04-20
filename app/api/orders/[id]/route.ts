import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";
import { hasServerPermission } from "@/lib/permissions";

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
  if (!(await hasServerPermission("manage_orders"))) {
    return apiError("Unauthorized: Missing 'manage_orders' permission.", 403);
  }

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

      // Add to status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: orderStatus,
          message: `Status has been updated as ${orderStatus}`,
          dispatchId: trackingUrl || null
        }
      });

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

      if (orderStatus === "cancelled" && order.stockDeducted) {
        // Restock
        for (const line of order.items) {
          // Add to main product
          await tx.product.update({
            where: { id: line.productID },
            data: { quantity: { increment: line.quantity } }
          });
          // Add to variant if available
          if (line.variant) {
            const existingPv = await tx.productVariant.findFirst({
              where: {
                productId: line.productID,
                variant: { name: line.variant }
              }
            });
            if (existingPv) {
              await tx.productVariant.update({
                where: { id: existingPv.id },
                data: { stock: { increment: line.quantity } }
              });
            }
          }
        }
        await tx.order.update({
          where: { id },
          data: { orderStatus, trackingUrl, stockDeducted: false }
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
  
  // Log the deletion attempt before throwing error
  try {
    await prisma.auditLog.create({
      data: {
        action: `Attempted to delete order ${id}. Access Denied.`,
        targetId: id,
        targetType: "ORDER_DELETE",
        performedBy: "Admin" // TODO: Connect to secure session
      }
    });
  } catch (e) {
    console.error("Audit log failed", e);
  }

  return apiError("Action Denied: No one is authorized to delete invoices.", 403);
}
