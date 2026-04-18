import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { user: true, couponCode: true, items: true },
    orderBy: { orderDate: "desc" }
  });
  return apiSuccess("Orders retrieved successfully.", orders);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { userID, items, totalPrice, shippingAddress, paymentMethod, couponCode, orderTotal, orderStatus, trackingUrl } = body;

  if (!userID || !Array.isArray(items) || !totalPrice || !shippingAddress || !paymentMethod || !orderTotal) {
    return apiError("User ID, items, totalPrice, shippingAddress, paymentMethod, and orderTotal are required.", 400);
  }

  await prisma.order.create({
    data: {
      userID,
      orderStatus: orderStatus ?? "pending",
      stockDeducted: false,
      totalPrice: Number(totalPrice),
      phone: shippingAddress.phone,
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
      paymentMethod,
      couponCodeId: couponCode,
      subtotal: orderTotal.subtotal,
      discount: orderTotal.discount,
      deliveryCharge: orderTotal.deliveryCharge,
      total: orderTotal.total,
      trackingUrl,
      items: {
        create: items.map((item: any) => ({
          productID: item.productID,
          productName: item.productName,
          quantity: Number(item.quantity),
          price: Number(item.price),
          variant: item.variant
        }))
      }
    }
  });

  return apiSuccess("Order created successfully.", null);
}
