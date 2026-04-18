import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { title, description, imageUrl } = await req.json();
  if (!title || !description) return apiError("Title and description are required.", 400);

  await prisma.notification.create({
    data: { notificationId: `local_${Date.now()}`, title, description, imageUrl }
  });

  return apiSuccess("Notification sent successfully", null);
}
