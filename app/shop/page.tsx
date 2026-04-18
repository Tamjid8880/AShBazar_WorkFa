import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStoreNavData } from "@/lib/store-nav";
import { firstProductImageUrl } from "@/lib/product-images";
import StoreHeader from "@/components/store-header";

export const dynamic = "force-dynamic";

type Search = { q?: string; category?: string; brand?: string };

export default async function ShopPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const categoryId = sp.category ?? "";
  const brandId = sp.brand ?? "";

  const { categories, brands } = await getStoreNavData();

  const products = await prisma.product.findMany({
    where: {
      AND: [
        q ? { name: { contains: q, mode: "insensitive" } } : {},
        categoryId ? { proCategoryId: categoryId } : {},
        brandId ? { proBrandId: brandId } : {}
      ]
    },
    orderBy: { createdAt: "desc" },
    include: { category: true, brand: true },
    take: 48
  });

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <StoreHeader
        categories={categories}
        brands={brands}
        search={{ q, categoryId, brandId }}
      />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900">Shop Catalog</h1>
            <p className="mt-2 text-slate-500 font-medium">
              {q ? `Results for "${q}"` : "Discover our premium selection of products."}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 border border-slate-100 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{products.length} Items Found</span>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const img = firstProductImageUrl(product.images);
            const price = product.offerPrice ?? product.price;
            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group flex flex-col rounded-[32px] border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-orange-100"
              >
                <div className="relative aspect-square overflow-hidden rounded-[24px] bg-slate-50">
                  {img ? (
                    <img src={img} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-300">No image</div>
                  )}
                  {product.quantity <= 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Sold Out</span>
                    </div>
                  )}
                  {product.offerPrice && (
                    <div className="absolute top-3 left-3 bg-orange-600 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter">Sale</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-2 pt-5">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                        {product.category.name}
                    </p>
                  </div>
                  <h2 className="mt-1 line-clamp-2 text-base font-bold text-slate-900 group-hover:text-orange-700 leading-snug">
                    {product.name}
                  </h2>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-900">${price.toFixed(2)}</span>
                      {product.offerPrice && (
                        <span className="text-xs text-slate-400 line-through">${product.price.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="h-9 w-9 rounded-2xl bg-slate-900 flex items-center justify-center text-white group-hover:bg-orange-600 transition-all duration-300 group-hover:rotate-90">+</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="rounded-[40px] border-2 border-dashed border-slate-200 bg-white py-24 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-xl font-black text-slate-900">No matches found</p>
            <p className="mt-2 text-slate-500 font-medium">Try adjusting your filters or search terms.</p>
            <Link href="/shop" className="mt-6 inline-block text-orange-600 font-bold underline decoration-2 underline-offset-4">Reset all filters</Link>
          </div>
        )}
      </div>
    </div>
  );
}
