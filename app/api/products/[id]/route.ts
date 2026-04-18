import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const item = await prisma.product.findUnique({ where: { id }, include: { category: true, subCategory: true, brand: true, variantType: true } });
  if (!item) return apiError("Product not found.", 404);
  return apiSuccess("Product retrieved successfully.", item);
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();

  await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      quantity: Number(body.quantity),
      price: Number(body.price),
      offerPrice: body.offerPrice ? Number(body.offerPrice) : null,
      proCategoryId: body.proCategoryId,
      proSubCategoryId: body.proSubCategoryId,
      proBrandId: body.proBrandId,
      proVariantTypeId: body.proVariantTypeId,
      proVariantId: Array.isArray(body.proVariantId) ? body.proVariantId : [],
      images: Array.isArray(body.images) ? body.images : []
    }
  });

  return apiSuccess("Product updated successfully.", null);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.product.delete({ where: { id } });
  return apiSuccess("Product deleted successfully.", null);
}
