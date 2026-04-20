import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;
    const body = await req.json();
    const { action, appendNote, deliveryCharge, addItem, removeItemId } = body;

    const adminName = "Admin"; // Hardcoded now, dynamically tracked later

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!currentOrder) return NextResponse.json({ success: false, error: "Order not found" });

    // 1. Process specific action payload
    if (appendNote) {
      const newNote = currentOrder.adminNotes 
        ? `${currentOrder.adminNotes}\n- ${appendNote} [${new Date().toLocaleDateString()}]`
        : `- ${appendNote} [${new Date().toLocaleDateString()}]`;
      await prisma.order.update({
        where: { id: orderId },
        data: { adminNotes: newNote }
      });
    }

    if (deliveryCharge !== undefined) {
      await prisma.order.update({
        where: { id: orderId },
        data: { deliveryCharge: deliveryCharge }
      });
    }

    if (addItem) {
      if (!addItem.productId) throw new Error("Product ID is required.");

      await prisma.orderItem.create({
        data: {
          orderId: orderId,
          productID: addItem.productId,
          productName: addItem.productName,
          quantity: addItem.quantity,
          price: addItem.price
        }
      });
    }

    if (removeItemId) {
       await prisma.orderItem.delete({
          where: { id: removeItemId }
       });
    }

    // 2. Recalculate totals
    const updatedItems = await prisma.orderItem.findMany({ where: { orderId } });
    const subtotal = updatedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const finalDeliveryCharge = deliveryCharge !== undefined ? deliveryCharge : (currentOrder.deliveryCharge || 0);
    const discount = currentOrder.discount || 0;
    const grandTotal = subtotal - discount + finalDeliveryCharge;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        subtotal: subtotal,
        total: grandTotal,
        totalPrice: grandTotal
      }
    });

    // 3. Log Audit Trail
    await prisma.auditLog.create({
      data: {
        action: action,
        targetId: orderId,
        targetType: "ORDER_EDIT",
        performedBy: adminName
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order edit error:", error);
    return NextResponse.json({ success: false, error: "Failed to apply edit" }, { status: 500 });
  }
}
