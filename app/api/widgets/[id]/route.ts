import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await prisma.widget.delete({ where: { id: params.id } });
    return apiSuccess("Widget deleted successfully.", null);
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
