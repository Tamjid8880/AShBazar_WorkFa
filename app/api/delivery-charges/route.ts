import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.deliveryCharge.findMany({ orderBy: { charge: "asc" } });
  return apiSuccess("Delivery charges retrieved.", data);
}

export async function POST(req: Request) {
  const { location, minWeight, maxWeight, charge } = await req.json();
  if (!location || charge === undefined) return apiError("Location and charge are required.", 400);
  const data = await prisma.deliveryCharge.create({
    data: { 
      location, 
      minWeight: Number(minWeight || 0), 
      maxWeight: Number(maxWeight || 9999), 
      charge: Number(charge) 
    }
  });
  return apiSuccess("Delivery charge added.", data);
}
