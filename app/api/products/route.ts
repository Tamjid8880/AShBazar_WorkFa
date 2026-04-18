import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true, subCategory: true, brand: true, variantType: true, variants: { include: { variant: true } } },
    orderBy: { createdAt: "desc" }
  });
  return apiSuccess("Products retrieved successfully.", products);
}

export async function POST(req: Request) {
  const body = await req.json();
  const required = ["name", "quantity", "price", "proCategoryId", "proSubCategoryId"];
  if (required.some((key) => body[key] === undefined || body[key] === null || body[key] === "")) {
    return apiError("Required fields are missing.", 400);
  }

  await prisma.product.create({
    data: {
      name: body.name,
      description: body.description,
      quantity: Number(body.quantity),
      price: Number(body.price),
      offerPrice: body.offerPrice ? Number(body.offerPrice) : null,
      weight: body.weight ? Number(body.weight) : 0,
      proCategoryId: body.proCategoryId,
      proSubCategoryId: body.proSubCategoryId,
      proBrandId: body.proBrandId,
      proVariantTypeId: body.proVariantTypeId,
      proVariantId: Array.isArray(body.proVariantId) ? body.proVariantId : [],
      images: Array.isArray(body.images) ? body.images : [],
      variants: {
        create: (body.variants || []).map((v: any) => ({
          variantId: v.variantId,
          price: Number(v.price),
          offerPrice: v.offerPrice ? Number(v.offerPrice) : null,
          stock: Number(v.stock || 0)
        }))
      }
    }
  });

  return apiSuccess("Product created successfully.", null);
}
