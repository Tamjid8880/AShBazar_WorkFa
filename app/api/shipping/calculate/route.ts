import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalize(s: string): string {
  if (!s) return "";
  const str = s.toLowerCase().trim();
  // Map BD location name variants to canonical form
  const map: Record<string, string> = {
    "chattogram": "chittagong",
    "cumilla": "comilla",
  };
  return map[str] ?? str;
}

function calcCharge(method: any, weight: number, subtotal: number): number {
  if (method.calculationType === "flat_rate" && method.flatRate) {
    return method.flatRate.cost;
  }
  if (method.calculationType === "weight_based" && method.rates?.length) {
    const sorted = [...method.rates].sort((a: any, b: any) => b.minValue - a.minValue);
    const match = sorted.find((r: any) => weight >= r.minValue);
    return match ? match.cost : sorted[sorted.length - 1].cost;
  }
  if (method.calculationType === "price_based" && method.rates?.length) {
    const sorted = [...method.rates].sort((a: any, b: any) => b.minValue - a.minValue);
    const match = sorted.find((r: any) => subtotal >= r.minValue);
    return match ? match.cost : sorted[sorted.length - 1].cost;
  }
  return 0;
}

/**
 * POST /api/shipping/calculate
 * Body: { country, district, division, subtotal, weight }
 *
 * Matching priority:
 * 1. Zone whose NAME matches the selected district
 * 2. Zone whose NAME matches the selected division
 * 3. Zone that has the selected country in its country list (fallback to any Bangladesh zone)
 * 4. Legacy DeliveryCharge table
 * 5. Default ৳50
 */
export async function POST(req: Request) {
  try {
    const {
      country = "Bangladesh",
      district = "",
      division = "",
      subtotal = 0,
      weight = 0,
    } = await req.json();

    const normDistrict = normalize(district);
    const normDivision = normalize(division);

    // Load all active zones with enabled methods
    const zones = await prisma.shippingZone.findMany({
      where: { status: "active" },
      include: {
        countries: true,
        methods: {
          where: { status: "enabled" },
          include: { flatRate: true, rates: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const enabledZones = zones.filter((z) => z.methods.length > 0);

    // --- Priority 1: Zone name matches district ---
    let matchedZone = enabledZones.find(
      (z) => normalize(z.name) === normDistrict
    );

    // --- Priority 2: Zone name matches division ---
    if (!matchedZone) {
      matchedZone = enabledZones.find(
        (z) => normalize(z.name) === normDivision
      );
    }

    // --- Priority 3: Single-zone country match (only safe if there's one zone per country) ---
    if (!matchedZone) {
      const countryZones = enabledZones.filter((z) =>
        z.countries.some(
          (c) => c.country.toLowerCase() === country.toLowerCase()
        )
      );
      // Only use country match if there's a single zone for this country — avoids
      // Chattogram being applied to Sylhet just because both are Bangladesh.
      if (countryZones.length === 1) {
        matchedZone = countryZones[0];
      }
    }

    // --- Pick primary method from a zone ---
    // Admins order methods by priority. We pick the first method that returns a non-zero charge.
    // If all methods return 0 (free shipping), use the first method.
    function primaryMethod(zone: typeof matchedZone): { charge: number; method: any } {
      for (const m of zone!.methods) {
        const c = calcCharge(m, weight, subtotal);
        if (c > 0) return { charge: c, method: m };
      }
      // All are zero → free shipping, return first method with charge 0
      return { charge: 0, method: zone!.methods[0] ?? null };
    }

    if (matchedZone) {
      const { charge, method } = primaryMethod(matchedZone);
      return NextResponse.json({
        success: true,
        charge,
        source: "zone",
        zone: matchedZone.name,
        method: method?.name ?? "—",
        calculationType: method?.calculationType,
      });
    }

    // --- Priority 5: Legacy DeliveryCharge table ---
    const legacyCharges = await prisma.deliveryCharge.findMany();
    if (legacyCharges.length > 0) {
      const matched = legacyCharges.filter((d) => {
        const dbLoc = normalize(d.location);
        return (
          dbLoc === normDistrict ||
          dbLoc === normDivision ||
          dbLoc === "all" ||
          dbLoc === "default"
        );
      });

      if (matched.length > 0) {
        // Sort by specificity: district > division > wildcard
        matched.sort((a, b) => {
          const la = normalize(a.location);
          const lb = normalize(b.location);
          if (la === normDistrict && lb !== normDistrict) return -1;
          if (lb === normDistrict && la !== normDistrict) return 1;
          if (la === normDivision && lb !== normDivision) return -1;
          if (lb === normDivision && la !== normDivision) return 1;
          return 0;
        });
        const byWeight = matched.find(
          (d) =>
            weight >= (d.minWeight ?? 0) && weight <= (d.maxWeight ?? 9999)
        );
        const charge = byWeight ? byWeight.charge : matched[0].charge;
        return NextResponse.json({
          success: true,
          charge,
          source: "legacy",
          zone: null,
        });
      }
    }

    // --- Default fallback ---
    return NextResponse.json({
      success: true,
      charge: 50,
      source: "default_fallback",
      zone: null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, charge: 50, error: err.message },
      { status: 500 }
    );
  }
}
