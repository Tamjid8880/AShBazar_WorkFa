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

  const { 
    name, description, quantity, price, offerPrice, weight, 
    proCategoryId, proSubCategoryId, proBrandId, proVariantTypeId, images, variants,
    isHotDeal, isSpecialOffer
  } = body;

  await prisma.product.create({
    data: {
      name,
      description,
      quantity: Number(quantity),
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : null,
      weight: weight ? Number(weight) : 0,
      proCategoryId,
      proSubCategoryId,
      proBrandId,
      proVariantTypeId,
      isHotDeal: !!isHotDeal,
      isSpecialOffer: !!isSpecialOffer,
      images: Array.isArray(images) ? images : [],
      variants: {
        create: (variants || []).map((v: any) => ({
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
