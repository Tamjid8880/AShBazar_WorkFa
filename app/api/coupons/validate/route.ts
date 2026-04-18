import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return apiError("Code is required.", 400);

  const coupon = await prisma.couponCode.findUnique({
    where: { couponCode: code },
    include: { applicableCategory: true }
  });

  if (!coupon || coupon.status !== "active") {
    return apiError("Invalid or expired coupon.", 404);
  }

  // Check date
  if (new Date() > new Date(coupon.endDate)) {
    return apiError("Coupon has expired.", 400);
  }

  return apiSuccess("Coupon valid.", coupon);
}
