import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStoreNavData } from "@/lib/store-nav";
import { firstProductImageUrl } from "@/lib/product-images";
import StoreHeader from "@/components/store-header";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { categories, brands } = await getStoreNavData();
  const posters = await prisma.poster.findMany({ orderBy: { createdAt: "desc" } });
  const hotDeals = await prisma.product.findMany({
    where: { isHotDeal: true },
    include: { category: true },
    take: 4
  });
  const specialOffers = await prisma.product.findMany({
    where: { isSpecialOffer: true },
    include: { category: true },
    take: 4
  });
  const products = await prisma.product.findMany({
    take: 8,
    where: { isHotDeal: false, isSpecialOffer: false },
    orderBy: { createdAt: "desc" },
    include: { category: true, brand: true },
  });

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <StoreHeader categories={categories} brands={brands} />

      {/* HERO CAROUSEL */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden rounded-[32px] shadow-xl">
          {posters.length > 0 ? (
            <div className="flex h-full animate-fade-in">
              <img src={posters[0].imageUrl} alt={posters[0].posterName} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center p-12">
                <div className="max-w-md text-white">
                  <h2 className="text-4xl md:text-6xl font-black">{posters[0].posterName}</h2>
                  <Link href="/shop" className="mt-6 inline-block bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition">
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-200 text-slate-400">
              No posters added. Add some in Admin Dashboard.
            </div>
          )}
        </div>
      </section>

      {/* CATEGORY LOGOS */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-xl font-bold text-slate-900 mb-6 px-2">Browse by Category</h2>
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/shop?category=${cat.id}`} className="group flex flex-col items-center gap-3">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center p-4 group-hover:border-orange-200 group-hover:shadow-md transition">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-2xl font-bold text-slate-300">{cat.name[0]}</span>
                )}
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-orange-600">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOT DEALS */}
      {hotDeals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 text-white opacity-20 text-9xl font-black">HOT</div>
             <h2 className="text-3xl md:text-5xl font-black text-white mb-8 relative z-10">🔥 Hot Deals!</h2>
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
                {hotDeals.map(p => (
                  <Link key={p.id} href={`/products/${p.id}`} className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/20 hover:bg-white transition flex flex-col group">
                     <div className="aspect-square rounded-2xl bg-white overflow-hidden">
                        <img src={firstProductImageUrl(p.images)} className="h-full w-full object-cover group-hover:scale-110 transition duration-500" />
                     </div>
                     <h3 className="mt-4 font-bold text-white group-hover:text-slate-900 line-clamp-1">{p.name}</h3>
                     <p className="mt-1 text-2xl font-black text-white group-hover:text-orange-600">${p.offerPrice ?? p.price}</p>
                  </Link>
                ))}
             </div>
          </div>
        </section>
      )}

      {/* SPECIAL OFFERS */}
      {specialOffers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 px-2">🌟 Special Offers</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {specialOffers.map(p => (
                   <Link key={p.id} href={`/products/${p.id}`} className="flex flex-col gap-4 bg-white rounded-3xl p-5 border border-slate-100 hover:shadow-xl transition group">
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50">
                        <img src={firstProductImageUrl(p.images)} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest">{p.category.name}</p>
                        <h3 className="font-bold text-slate-900 line-clamp-1">{p.name}</h3>
                        <div className="mt-4 bg-orange-100 text-orange-700 rounded-full py-1 text-center text-[10px] font-black uppercase tracking-widest">
                            SAVE BIG NOW
                        </div>
                      </div>
                   </Link>
                ))}
            </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
          <Link href="/shop" className="text-sm font-bold text-orange-600 hover:underline">View All</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const img = firstProductImageUrl(product.images);
            const price = product.offerPrice ?? product.price;
            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group bg-white rounded-3xl border border-slate-100 p-4 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all duration-300"
              >
                <div className="aspect-square rounded-2xl bg-slate-50 overflow-hidden relative">
                  {img ? (
                    <img src={img} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-300">No image</div>
                  )}
                  {product.offerPrice && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase">Sale</div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{product.category.name}</p>
                  <h3 className="mt-1 font-bold text-slate-900 line-clamp-1 group-hover:text-orange-600">{product.name}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-900">${price.toFixed(2)}</span>
                      {product.offerPrice && (
                        <span className="text-xs text-slate-400 line-through">${product.price.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white group-hover:bg-orange-600 transition">+</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm font-bold text-slate-900">ShopMart &copy; 2026</p>
          <p className="mt-1 text-xs text-slate-500">Premium E-commerce Experience</p>
        </div>
      </footer>
    </div>
  );
}
