import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStoreNavData } from "@/lib/store-nav";
import StoreHeader from "@/components/store-header";
import StoreFooter from "@/components/store-footer";
import EcoProductCard from "@/components/eco-product-card";
import ShopFiltersClient from "@/components/shop-filters-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop — AshBazar Grocery Store",
  description: "Browse our complete selection of fresh vegetables, fruits, meat, dairy and pantry items.",
};

type Search = {
  q?:        string;
  category?: string;
  brand?:    string;
  sub?:      string;
  minPrice?: string;
  maxPrice?: string;
  sort?:     string;
};

const ChevronRight = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default async function ShopPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp          = await searchParams;
  const q           = (sp.q ?? "").trim();
  const categoryId  = sp.category ?? "";
  const brandId     = sp.brand ?? "";
  const subId       = sp.sub ?? "";
  const minPrice    = sp.minPrice ? parseFloat(sp.minPrice) : undefined;
  const maxPrice    = sp.maxPrice ? parseFloat(sp.maxPrice) : undefined;
  const sort        = sp.sort ?? "newest";

  const { categories, brands, settings } = await getStoreNavData();

  // Fetch sub-categories
  const subCategories = await prisma.subCategory.findMany({ orderBy: { name: "asc" } });

  // Build orderBy
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc")  orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "popular")    orderBy = { createdAt: "desc" }; // best proxy without a view-count field

  const products = await prisma.product.findMany({
    where: {
      isHidden: false,
      AND: [
        q          ? { name: { contains: q, mode: "insensitive" as const } } : {},
        categoryId ? { proCategoryId: categoryId }    : {},
        brandId    ? { proBrandId:    brandId }        : {},
        subId      ? { proSubCategoryId: subId }       : {},
        minPrice != null ? { price: { gte: minPrice } } : {},
        maxPrice != null ? { price: { lte: maxPrice } } : {},
      ],
    },
    orderBy,
    include: { category: true, brand: true, subCategory: true, variants: true },
    take: 96,
  });

  const activeCat = categories.find(c => c.id === categoryId);

  return (
    <div className="min-h-screen bg-[#f5f7f5]">
      <StoreHeader categories={categories} brands={brands} settings={settings} compact />

      {/* ── Page Header Banner (centered like Figma) ──────── */}
      <div className="bg-[#1c3a1c] py-12">
        <div className="container-main text-center">
          <h1 className="font-heading text-3xl font-bold text-white">
            {activeCat ? activeCat.name : q ? `Results for "${q}"` : "Shop"}
          </h1>
          <nav className="breadcrumb mt-2 justify-center">
            <Link href="/">Home</Link>
            <ChevronRight />
            <span className="text-white/70">
              {activeCat ? activeCat.name : "Shop"}
            </span>
          </nav>
        </div>
      </div>


      <div className="container-main py-8">
        {/* ── Category Pills ─────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/shop"
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              !categoryId
                ? "border-[#4caf50] bg-[#4caf50] text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-[#4caf50] hover:text-[#4caf50]"
            }`}
          >
            All
          </Link>
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.id}${sort !== "newest" ? `&sort=${sort}` : ""}`}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                categoryId === cat.id
                  ? "border-[#4caf50] bg-[#4caf50] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#4caf50] hover:text-[#4caf50]"
              }`}
            >
              {(cat as any).image && (
                <img src={(cat as any).image} alt="" className="h-4 w-4 rounded-full object-cover" />
              )}
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="flex gap-6 lg:items-start">
          {/* ── Sidebar Filters (client component) ─────────── */}
          <ShopFiltersClient
            categories={categories}
            brands={brands}
            subCategories={subCategories}
            currentCategory={categoryId}
            currentBrand={brandId}
            currentSub={subId}
            currentMin={minPrice}
            currentMax={maxPrice}
            currentSort={sort}
            currentQ={q}
          />

          {/* ── Products Grid ───────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Results bar */}
            <div className="mb-4 flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-card border border-gray-100">
              <p className="text-sm font-medium text-gray-600">
                <span className="font-bold text-gray-900">{products.length}</span> products found
                {q && <span className="ml-1 text-gray-400">for &quot;{q}&quot;</span>}
              </p>
              {/* Sort select (inline form) */}
              <form method="get" action="/shop" className="flex items-center gap-2">
                {categoryId && <input type="hidden" name="category" value={categoryId} />}
                {brandId    && <input type="hidden" name="brand"    value={brandId} />}
                {subId      && <input type="hidden" name="sub"      value={subId} />}
                {q          && <input type="hidden" name="q"        value={q} />}
                <label className="text-xs font-medium text-gray-500">Sort by:</label>
                <select
                  name="sort"
                  defaultValue={sort}
                  className="rounded border border-gray-200 bg-white py-1 pl-2 pr-6 text-xs font-medium text-gray-700 outline-none focus:border-[#4caf50] focus:ring-1 focus:ring-[#4caf50]/20 cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="popular">Popular</option>
                </select>
                <button type="submit" className="rounded bg-[#4caf50] px-2 py-1 text-[11px] font-bold text-white hover:bg-[#2e7d32] transition">
                  Go
                </button>
              </form>
            </div>

            {products.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-lg font-bold text-gray-800">No products found</p>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search terms.</p>
                <Link
                  href="/shop"
                  className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#4caf50] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2e7d32] transition"
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {products.map(p => (
                  <EcoProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    price={p.price}
                    offerPrice={p.offerPrice}
                    categoryName={p.category.name}
                    images={p.images}
                    quantity={p.quantity}
                    variants={p.variants}
                    isHotDeal={p.isHotDeal}
                    isSpecialOffer={p.isSpecialOffer}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <StoreFooter settings={settings} />
    </div>
  );
}
