import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { hasServerPermission } from "@/lib/permissions";

/** Normalize a string: trim + capitalize first letter of each word */
function normalize(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      subCategory: true,
      brand: true,
      variantType: true,
      variants: { include: { variant: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return apiSuccess("Products retrieved successfully.", products);
}

export async function POST(req: Request) {
  if (!(await hasServerPermission("create_products"))) {
    return apiError("Unauthorized: Missing 'create_products' permission.", 403);
  }

  const body = await req.json();

  const {
    name,
    description,
    quantity,
    price,
    offerPrice,
    weight,
    // Name-based inputs (preferred new approach)
    category: categoryName,
    subcategory: subcategoryName,
    brand: brandName,
    // Legacy ID-based inputs (backward compatible)
    proCategoryId: legacyCategoryId,
    proSubCategoryId: legacySubCategoryId,
    proBrandId: legacyBrandId,
    // Other fields
    proVariantTypeId,
    images,
    variants,
    isHotDeal,
    isSpecialOffer,
  } = body;

  if (!name || name.trim() === "") {
    return apiError("Product name is required.", 400);
  }
  if (price === undefined || price === null || price === "") {
    return apiError("Product price is required.", 400);
  }
  if (quantity === undefined || quantity === null || quantity === "") {
    return apiError("Product quantity is required.", 400);
  }

  // ── Validate images ─────────────────────────────────────────────────────────
  if (!Array.isArray(images) || images.length === 0) {
    return apiError("At least one product image is required.", 400);
  }

  // ── Resolve Category ────────────────────────────────────────────────────────
  let proCategoryId: string;

  if (legacyCategoryId) {
    // Backward compat: ID was sent directly
    proCategoryId = legacyCategoryId;
  } else if (categoryName && categoryName.trim() !== "") {
    const normalizedCat = normalize(categoryName);
    const cat = await prisma.category.upsert({
      where: { name: normalizedCat },
      update: {},
      create: { name: normalizedCat, image: "no_url" },
    });
    proCategoryId = cat.id;
  } else {
    return apiError("Category is required (provide 'category' name or 'proCategoryId').", 400);
  }

  // ── Resolve SubCategory ─────────────────────────────────────────────────────
  let proSubCategoryId: string;

  if (legacySubCategoryId) {
    proSubCategoryId = legacySubCategoryId;
  } else if (subcategoryName && subcategoryName.trim() !== "") {
    const normalizedSub = normalize(subcategoryName);
    const sub = await prisma.subCategory.upsert({
      where: { name_categoryId: { name: normalizedSub, categoryId: proCategoryId } },
      update: {},
      create: { name: normalizedSub, categoryId: proCategoryId },
    });
    proSubCategoryId = sub.id;
  } else {
    return apiError("Subcategory is required (provide 'subcategory' name or 'proSubCategoryId').", 400);
  }

  // ── Resolve Brand (optional) ────────────────────────────────────────────────
  let proBrandId: string | null = null;

  if (legacyBrandId) {
    proBrandId = legacyBrandId;
  } else if (brandName && brandName.trim() !== "") {
    const normalizedBrand = normalize(brandName);
    const brand = await prisma.brand.upsert({
      where: { name: normalizedBrand },
      update: {},
      create: { name: normalizedBrand },
    });
    proBrandId = brand.id;
  }
  // If neither provided → null (brand is optional)

  // ── Create Product ──────────────────────────────────────────────────────────
  await prisma.product.create({
    data: {
      name: name.trim(),
      description: description ?? null,
      quantity: Number(quantity),
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : null,
      weight: weight ? Number(weight) : 0,
      proCategoryId,
      proSubCategoryId,
      proBrandId,
      proVariantTypeId: proVariantTypeId ?? null,
      isHotDeal: !!isHotDeal,
      isSpecialOffer: !!isSpecialOffer,
      images: Array.isArray(images) ? images : [],
      variants: {
        create: (variants || []).map((v: any) => ({
          variantId: v.variantId,
          price: Number(v.price),
          offerPrice: v.offerPrice ? Number(v.offerPrice) : null,
          stock: Number(v.stock || 0),
        })),
      },
    },
  });

  return apiSuccess("Product created successfully.", null);
}
