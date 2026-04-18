import { prisma } from "@/lib/prisma";

export async function getStoreNavData() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, include: { subCategory: true } })
  ]);
  return { categories, brands };
}
