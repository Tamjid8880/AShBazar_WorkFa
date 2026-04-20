import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { hasServerPermission } from "@/lib/permissions";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const item = await prisma.product.findUnique({
    where: { id },
    include: { category: true, subCategory: true, brand: true, variantType: true, variants: { include: { variant: true } } }
  });
  if (!item) return apiError("Product not found.", 404);
  return apiSuccess("Product retrieved successfully.", item);
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await hasServerPermission("edit_products"))) {
    return apiError("Unauthorized: Missing 'edit_products' permission.", 403);
  }

  const { id } = await context.params;
  const body = await req.json();

  await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
      price: body.price !== undefined ? Number(body.price) : undefined,
      offerPrice: body.offerPrice !== undefined ? (body.offerPrice ? Number(body.offerPrice) : null) : undefined,
      proCategoryId: body.proCategoryId,
      proSubCategoryId: body.proSubCategoryId,
      proBrandId: body.proBrandId,
      proVariantTypeId: body.proVariantTypeId,
      proVariantId: Array.isArray(body.proVariantId) ? body.proVariantId : undefined,
      images: Array.isArray(body.images) ? body.images : undefined,
      isHotDeal: body.isHotDeal !== undefined ? !!body.isHotDeal : undefined,
      isSpecialOffer: body.isSpecialOffer !== undefined ? !!body.isSpecialOffer : undefined,
      isHidden: body.isHidden !== undefined ? !!body.isHidden : undefined,
    }
  });

  if (body.quantity !== undefined) {
    await prisma.productVariant.updateMany({
      where: { productId: id },
      data: { stock: Number(body.quantity) }
    });
  }

  return apiSuccess("Product updated successfully.", null);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await hasServerPermission("edit_products"))) {
    return apiError("Unauthorized: Missing 'edit_products' permission.", 403);
  }
  
  const { id } = await context.params;
  await prisma.product.delete({ where: { id } });
  return apiSuccess("Product deleted successfully.", null);
}
