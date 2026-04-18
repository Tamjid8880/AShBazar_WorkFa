import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.couponCode.findMany({
    include: { applicableCategory: true, applicableSubCategory: true, applicableProduct: true },
    orderBy: { createdAt: "desc" }
  });
  return apiSuccess("Coupons retrieved successfully.", data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { couponCode, discountType, discountAmount, minimumPurchaseAmount, endDate, status, applicableCategory, applicableSubCategory, applicableProduct } = body;
  if (!couponCode || !discountType || !discountAmount || !endDate || !status) {
    return apiError("Code, discountType, discountAmount, endDate, and status are required.", 400);
  }

  await prisma.couponCode.create({
    data: {
      couponCode,
      discountType,
      discountAmount: Number(discountAmount),
      minimumPurchaseAmount: Number(minimumPurchaseAmount ?? 0),
      endDate: new Date(endDate),
      status,
      applicableCategoryId: applicableCategory,
      applicableSubCatId: applicableSubCategory,
      applicableProductId: applicableProduct
    }
  });

  return apiSuccess("Coupon created successfully.", null);
}
