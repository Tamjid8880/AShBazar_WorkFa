import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return apiError("Category not found.", 404);
  return apiSuccess("Category retrieved successfully.", category);
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { name, image } = await req.json();
  if (!name || !image) return apiError("Name and image are required.", 400);

  await prisma.category.update({ where: { id }, data: { name, image } });
  return apiSuccess("Category updated successfully.", null);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const subCount = await prisma.subCategory.count({ where: { categoryId: id } });
  const productCount = await prisma.product.count({ where: { proCategoryId: id } });

  if (subCount > 0) return apiError("Cannot delete category. Subcategories are referencing it.", 400);
  if (productCount > 0) return apiError("Cannot delete category. Products are referencing it.", 400);

  await prisma.category.delete({ where: { id } });
  return apiSuccess("Category deleted successfully.", null);
}
