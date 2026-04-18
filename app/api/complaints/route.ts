import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, subject, description } = body;

  if (!userId || !subject || !description) {
    return apiError("User ID, Subject and Description are required.", 400);
  }

  const ticketId = `TKT-${nanoid(8).toUpperCase()}`;

  const complaint = await prisma.complaint.create({
    data: {
      userId,
      subject,
      description,
      ticketId,
      status: "open"
    }
  });

  return apiSuccess("Complaint submitted successfully.", complaint);
}

export async function GET() {
  const complaints = await prisma.complaint.findMany({
    include: { user: { select: { name: true, email: true, phone: true } } },
    orderBy: { createdAt: "desc" }
  });
  return apiSuccess("Complaints retrieved.", complaints);
}
export async function PUT(req: Request) {
  const body = await req.json();
  const { id, status, adminReply } = body;

  const complaint = await prisma.complaint.update({
    where: { id },
    data: { status, adminReply }
  });

  return apiSuccess("Complaint updated successfully.", complaint);
}
