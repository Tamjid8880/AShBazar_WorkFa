import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { name, countries, status } = await req.json();
  if (!name?.trim()) return apiError("Zone name is required.", 400);

  // Delete old countries and recreate
  await prisma.shippingZoneCountry.deleteMany({ where: { zoneId: params.id } });

  const zone = await prisma.shippingZone.update({
    where: { id: params.id },
    data: {
      name: name.trim(),
      status: status || "active",
      countries: {
        create: (countries || []).map((c: string) => ({ country: c.trim() }))
      }
    },
    include: { countries: true, methods: true }
  });

  return apiSuccess("Shipping zone updated.", zone);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.shippingZone.delete({ where: { id: params.id } });
  return apiSuccess("Shipping zone deleted.", null);
}
