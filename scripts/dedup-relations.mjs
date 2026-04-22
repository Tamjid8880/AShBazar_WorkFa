import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function dedup() {
  // Dedup Category by name - keep first created, delete rest
  const cats = await prisma.category.findMany({ orderBy: { createdAt: 'asc' } });
  const seenCats = new Map();
  for (const c of cats) {
    const key = c.name.toLowerCase().trim();
    if (seenCats.has(key)) {
      const keepId = seenCats.get(key);
      console.log(`Duplicate category: "${c.name}" (${c.id}) -> merging into ${keepId}`);
      await prisma.product.updateMany({ where: { proCategoryId: c.id }, data: { proCategoryId: keepId } });
      await prisma.subCategory.updateMany({ where: { categoryId: c.id }, data: { categoryId: keepId } });
      await prisma.category.delete({ where: { id: c.id } });
    } else {
      seenCats.set(key, c.id);
    }
  }
  console.log(`Categories: ${seenCats.size} unique kept.`);

  // Dedup Brand by name
  const brands = await prisma.brand.findMany({ orderBy: { createdAt: 'asc' } });
  const seenBrands = new Map();
  for (const b of brands) {
    const key = b.name.toLowerCase().trim();
    if (seenBrands.has(key)) {
      const keepId = seenBrands.get(key);
      console.log(`Duplicate brand: "${b.name}" (${b.id}) -> merging into ${keepId}`);
      await prisma.product.updateMany({ where: { proBrandId: b.id }, data: { proBrandId: keepId } });
      await prisma.brand.delete({ where: { id: b.id } });
    } else {
      seenBrands.set(key, b.id);
    }
  }
  console.log(`Brands: ${seenBrands.size} unique kept.`);

  // Dedup SubCategory by name+categoryId
  const subs = await prisma.subCategory.findMany({ orderBy: { createdAt: 'asc' } });
  const seenSubs = new Map();
  for (const s of subs) {
    const key = `${s.name.toLowerCase().trim()}::${s.categoryId}`;
    if (seenSubs.has(key)) {
      const keepId = seenSubs.get(key);
      console.log(`Duplicate subcat: "${s.name}" (${s.id}) -> merging into ${keepId}`);
      await prisma.product.updateMany({ where: { proSubCategoryId: s.id }, data: { proSubCategoryId: keepId } });
      await prisma.brand.updateMany({ where: { subcategoryId: s.id }, data: { subcategoryId: keepId } });
      await prisma.subCategory.delete({ where: { id: s.id } });
    } else {
      seenSubs.set(key, s.id);
    }
  }
  console.log(`SubCategories: ${seenSubs.size} unique kept.`);

  console.log('✅ Deduplication complete. Ready to apply unique constraints.');
  await prisma.$disconnect();
}

dedup().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
