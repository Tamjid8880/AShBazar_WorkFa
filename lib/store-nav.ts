import { prisma } from "@/lib/prisma";

export async function getStoreNavData() {
  const [categories, brands, storeSetting] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, include: { subCategory: true } }),
    (prisma as any).storeSetting.findUnique({ where: { id: "default" } }).catch(() => null)
  ]);
  return { categories, brands, logoUrl: storeSetting?.logoUrl || null };
}
