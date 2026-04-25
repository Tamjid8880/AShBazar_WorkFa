import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.paymentOption.findMany({ orderBy: { createdAt: "desc" } });
  return apiSuccess("Payment options retrieved successfully.", data);
}

export async function POST(req: Request) {
  const { id, name, accountDetails, instructions, isActive } = await req.json();
  if (!name) return apiError("Name is required.", 400);

  try {
    let data;
    if (id) {
      data = await prisma.paymentOption.update({
        where: { id },
        data: { name, accountDetails, instructions, isActive }
      });
    } else {
      data = await prisma.paymentOption.create({
        data: { name, accountDetails, instructions, isActive }
      });
    }
    return apiSuccess("Payment option saved successfully.", data);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
