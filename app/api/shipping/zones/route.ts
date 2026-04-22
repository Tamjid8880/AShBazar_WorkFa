import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const zones = await prisma.shippingZone.findMany({
    include: {
      countries: true,
      methods: {
        include: { flatRate: true, rates: true }
      }
    },
    orderBy: { createdAt: "asc" }
  });
  return apiSuccess("Shipping zones retrieved.", zones);
}

export async function POST(req: Request) {
  const { name, countries, status } = await req.json();
  if (!name?.trim()) return apiError("Zone name is required.", 400);

  const zone = await prisma.shippingZone.create({
    data: {
      name: name.trim(),
      status: status || "active",
      countries: {
        create: (countries || []).map((c: string) => ({ country: c.trim() }))
      }
    },
    include: { countries: true, methods: true }
  });

  return apiSuccess("Shipping zone created.", zone);
}
