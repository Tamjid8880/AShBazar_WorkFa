import { apiSuccess } from "@/lib/api-response";

export async function POST() {
  return apiSuccess("success", { key: process.env.RAZORPAY_KEY_TEST ?? "" });
}
