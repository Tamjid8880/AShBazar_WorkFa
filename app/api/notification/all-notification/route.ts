import { apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const notifications = await prisma.notification.findMany({ orderBy: { createdAt: "desc" } });
  return apiSuccess("Notifications retrieved successfully.", notifications);
}
