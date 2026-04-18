import { apiError, apiSuccess } from "@/lib/api-response";
import fs from "node:fs/promises";
import path from "node:path";

const allowedTypes = new Set(["category", "products", "posters"]);
const allowedExt = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export async function POST(req: Request, context: { params: Promise<{ type: string }> }) {
  const { type } = await context.params;
  if (!allowedTypes.has(type)) return apiError("Invalid upload type.", 400);

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return apiError("File is required.", 400);

  const ext = path.extname(file.name).toLowerCase();
  if (!allowedExt.has(ext)) return apiError("Only jpg, jpeg, png, webp are allowed.", 400);
  if (file.size > 5 * 1024 * 1024) return apiError("Max file size is 5MB.", 400);

  const targetDir = path.join(process.cwd(), "public", type);
  await fs.mkdir(targetDir, { recursive: true });
  const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
  const fullPath = path.join(targetDir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  const url = `/` + type + `/${fileName}`;
  return apiSuccess("File uploaded successfully.", { fileName, url });
}
