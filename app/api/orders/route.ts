import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { user: true, couponCode: true, items: true },
    orderBy: { orderDate: "desc" }
  });
  return apiSuccess("Orders retrieved successfully.", orders);
}

export async function POST(req: Request) {
  // STRICT SECURITY GATE: Verify JWT
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return apiError("Unauthorized. Please log in to place an order.", 401);
  }

  const userID = (session.user as any).id;
  const body = await req.json();
  const { items, totalPrice, shippingAddress, paymentMethod, couponCodeId, orderTotal, orderStatus, trackingUrl } = body;

  if (!Array.isArray(items) || !totalPrice || !shippingAddress || !paymentMethod || !orderTotal) {
    return apiError("Items, totalPrice, shippingAddress, paymentMethod, and orderTotal are required.", 400);
  }

  // Enforce profile completeness for address fields
  if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.division || !shippingAddress.district || !shippingAddress.upazila || !shippingAddress.union) {
    return apiError("Incomplete shipping profile. Please provide name, phone, and full address including division, district, upazila, and union.", 400);
  }

  // Check stock before creating order
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productID },
      include: { variants: { include: { variant: true } } }
    });
    
    if (!product) {
      return apiError(`Product ${item.productName} not found.`, 404);
    }

    if (item.variant) {
      const existingPv = product.variants.find(v => v.variant.name === item.variant);
      if (!existingPv) {
        return apiError(`Variant ${item.variant} not found for ${item.productName}.`, 404);
      }
      if (existingPv.stock < Number(item.quantity)) {
        return apiError(`${item.productName} (${item.variant}) is out of stock. Available: ${existingPv.stock}.`, 400);
      }
    } else {
      if (product.quantity < Number(item.quantity)) {
        return apiError(`${item.productName} is out of stock. Available: ${product.quantity}.`, 400);
      }
    }
  }

  // Also update the user's profile with these fields if they are missing
  await prisma.user.update({
    where: { id: userID },
    data: {
      name: shippingAddress.name,
      phone: shippingAddress.phone,
      address: shippingAddress.street,
      division: shippingAddress.division,
      district: shippingAddress.district,
      upazila: shippingAddress.upazila,
      union: shippingAddress.union,
    }
  });

  const order = await prisma.order.create({
    data: {
      userID,
      orderStatus: orderStatus ?? "pending",
      stockDeducted: true,
      totalPrice: Number(totalPrice),
      phone: shippingAddress.phone,
      street: shippingAddress.street,
      division: shippingAddress.division,
      district: shippingAddress.district,
      upazila: shippingAddress.upazila,
      union: shippingAddress.union,
      country: shippingAddress.country || "Bangladesh",
      paymentMethod,
      couponCodeId,
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
      },
      statusHistory: {
        create: {
          status: orderStatus ?? "pending",
          message: "Parcel information has been inserted.",
        }
      }
    }
  });

  // Deduct stock for each ordered item
  for (const item of items) {
    if (item.variant) {
      // Find the specific ProductVariant
      const existingPv = await prisma.productVariant.findFirst({
        where: {
          productId: item.productID,
          variant: { name: item.variant }
        }
      });
      if (existingPv) {
        await prisma.productVariant.update({
          where: { id: existingPv.id },
          data: { stock: { decrement: Number(item.quantity) } }
        });
      }
    }
    await prisma.product.update({
      where: { id: item.productID },
      data: { quantity: { decrement: Number(item.quantity) } }
    });
  }

  return apiSuccess("Order created successfully.", { orderId: order.id });
}
