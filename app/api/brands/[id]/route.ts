import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, context: any) {
  const params = await context.params;
  const id = params.id;
  try {
    const body = await req.json();
    const data: any = {};
    if (body.name) data.name = body.name;
    if (body.subcategoryId) data.subcategoryId = body.subcategoryId;
    await prisma.brand.update({ where: { id }, data });
    return apiSuccess("Brand updated successfully.", null);
  } catch (err) {
    return apiError("Failed to update brand.", 500);
  }
}

export async function DELETE(req: Request, context: any) {
  const params = await context.params;
  const id = params.id;
  try {
    await prisma.brand.delete({ where: { id } });
    return apiSuccess("Brand deleted successfully.", null);
  } catch (err) {
    return apiError("Failed to delete brand.", 500);
  }
}
