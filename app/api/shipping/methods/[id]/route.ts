import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, status, calculationType, flatCost, rates } = body;

  // If only toggling status (no calculationType change), just update the field
  if (status && !calculationType && !name && flatCost === undefined && !rates) {
    await prisma.shippingMethod.update({
      where: { id: params.id },
      data: { status },
    });
    return apiSuccess("Shipping method status updated.", null);
  }

  // Full update — rebuild rates
  if (calculationType) {
    await prisma.flatRate.deleteMany({ where: { methodId: params.id } });
    await prisma.shippingRate.deleteMany({ where: { methodId: params.id } });
  }

  const method = await prisma.shippingMethod.update({
    where: { id: params.id },
    data: {
      ...(name ? { name: name.trim() } : {}),
      ...(status ? { status } : {}),
      ...(calculationType ? { calculationType } : {}),
      ...(calculationType === "flat_rate" && flatCost !== undefined
        ? { flatRate: { create: { cost: Number(flatCost) } } }
        : {}),
      ...(["price_based", "weight_based"].includes(calculationType) && Array.isArray(rates)
        ? {
            rates: {
              create: rates.map((r: any) => ({
                minValue: Number(r.minValue),
                cost: Number(r.cost),
              })),
            },
          }
        : {}),
    },
    include: { flatRate: true, rates: true },
  });

  return apiSuccess("Shipping method updated.", method);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.shippingMethod.delete({ where: { id: params.id } });
  return apiSuccess("Shipping method deleted.", null);
}
