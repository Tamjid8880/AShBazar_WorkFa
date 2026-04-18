import { apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { couponCode, productIds, purchaseAmount } = await req.json();
  const coupon = await prisma.couponCode.findUnique({ where: { couponCode } });

  if (!coupon) return apiSuccess("Coupon not found.", null);
  if (coupon.endDate < new Date()) return apiSuccess("Coupon is expired.", null);
  if (coupon.status !== "active") return apiSuccess("Coupon is inactive.", null);
  if (coupon.minimumPurchaseAmount && Number(purchaseAmount) < coupon.minimumPurchaseAmount) {
    return apiSuccess("Minimum purchase amount not met.", null);
  }

  if (!coupon.applicableCategoryId && !coupon.applicableSubCatId && !coupon.applicableProductId) {
    return apiSuccess("Coupon is applicable for all orders.", coupon);
  }

  const products = await prisma.product.findMany({ where: { id: { in: Array.isArray(productIds) ? productIds : [] } } });
  const isValid = products.every((product) => {
    if (coupon.applicableCategoryId && coupon.applicableCategoryId !== product.proCategoryId) return false;
    if (coupon.applicableSubCatId && coupon.applicableSubCatId !== product.proSubCategoryId) return false;
    if (coupon.applicableProductId && coupon.applicableProductId !== product.id) return false;
    return true;
  });

  if (isValid) return apiSuccess("Coupon is applicable for the provided products.", coupon);
  return apiSuccess("Coupon is not applicable for the provided products.", null);
}
