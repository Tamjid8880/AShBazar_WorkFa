import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zoneId = searchParams.get("zoneId");
  const methods = await prisma.shippingMethod.findMany({
    where: zoneId ? { zoneId } : undefined,
    include: { flatRate: true, rates: { orderBy: { minValue: "asc" } } },
    orderBy: { createdAt: "asc" }
  });
  return apiSuccess("Shipping methods retrieved.", methods);
}

export async function POST(req: Request) {
  const { name, zoneId, status, calculationType, flatCost, rates } = await req.json();
  if (!name?.trim()) return apiError("Method name is required.", 400);
  if (!zoneId) return apiError("Zone ID is required.", 400);
  if (!calculationType) return apiError("Calculation type is required.", 400);

  const method = await prisma.shippingMethod.create({
    data: {
      name: name.trim(),
      zoneId,
      status: status || "enabled",
      calculationType,
      flatRate: calculationType === "flat_rate" && flatCost !== undefined
        ? { create: { cost: Number(flatCost) } }
        : undefined,
      rates: ["price_based", "weight_based"].includes(calculationType) && Array.isArray(rates)
        ? { create: rates.map((r: any) => ({ minValue: Number(r.minValue), cost: Number(r.cost) })) }
        : undefined
    },
    include: { flatRate: true, rates: true }
  });

  return apiSuccess("Shipping method created.", method);
}
