import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStoreNavData } from "@/lib/store-nav";
import StoreHeader from "@/components/store-header";
import StoreFooter from "@/components/store-footer";
import ProductDetailClient from "@/components/product-detail-client";
import EcoProductCard from "@/components/eco-product-card";

export const dynamic = "force-dynamic";

const ChevronRight = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, nav] = await Promise.all([
    prisma.product.findUnique({
      where:   { id },
      include: {
        category:    true,
        subCategory: true,
        brand:       true,
        variantType: true,
        variants:    { include: { variant: true } },
      },
    }),
    getStoreNavData(),
  ]);

  if (!product || product.isHidden) notFound();

  // Related products
  const related = await prisma.product.findMany({
    where:   { proCategoryId: product.proCategoryId, id: { not: id }, isHidden: false },
    include: { category: true, variants: true },
    take:    4,
  });

  // Reviews
  const reviews = await prisma.review.findMany({
    where:   { productId: id },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take:    10,
  });

  const avgRating = reviews.length
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : 0;

  const totalVariantStock = product.variants.reduce((a, v) => a + v.stock, 0);
  const isOutOfStock = product.variants.length > 0 ? totalVariantStock <= 0 : product.quantity <= 0;

  return (
    <div className="min-h-screen bg-[#f5f7f5]">
      <StoreHeader categories={nav.categories} brands={nav.brands} settings={nav.settings} compact />

      {/* ── Breadcrumb Banner (centered like Figma) ──────────── */}
      <div className="bg-[#1c3a1c] py-12">
        <div className="container-main text-center">
          <h1 className="font-heading text-3xl font-bold text-white">Product</h1>
          <nav className="breadcrumb mt-2 justify-center">
            <Link href="/">Shop</Link>
            <ChevronRight />
            <Link href={`/shop?category=${product.proCategoryId}`}>{product.category.name}</Link>
            <ChevronRight />
            <span className="text-white/60 line-clamp-1 max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>


      <div className="container-main py-8">
        {/* ── Out of stock / low stock warnings ─────────── */}
        {isOutOfStock && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-3">
            <span className="text-lg">⚠️</span>
            <p className="text-sm font-bold text-red-700">Currently Out of Stock</p>
          </div>
        )}

        {/* ── Product badges ─────────────────────────────── */}
        {(product.isHotDeal || product.isSpecialOffer) && (
          <div className="mb-4 flex gap-2">
            {product.isHotDeal      && <span className="badge badge-sale">🔥 Hot Deal</span>}
            {product.isSpecialOffer && <span className="badge badge-hot">⭐ Special Offer</span>}
          </div>
        )}

        {/* ── Main Product Detail ─────────────────────── */}
        <div className="rounded-xl bg-white p-6 shadow-card border border-gray-100 sm:p-10">
          <ProductDetailClient
            productId={product.id}
            name={product.name}
            description={product.description}
            basePrice={product.price}
            baseOfferPrice={product.offerPrice}
            baseStock={product.quantity}
            weight={product.weight}
            imagesJson={product.images}
            productVariants={product.variants as any}
            categoryName={product.category.name}
            categoryId={product.proCategoryId}
            subCategoryName={product.subCategory?.name}
            brandName={product.brand?.name}
            avgRating={avgRating}
            reviewCount={reviews.length}
          />
        </div>

        {/* ── Description & Reviews Tabs ─────────────── */}
        <div className="mt-8 rounded-xl bg-white shadow-card border border-gray-100">
          {/* Tab nav */}
          <div className="flex gap-0 border-b border-gray-100">
            <div className="border-b-2 border-[#4caf50] px-6 py-4 text-sm font-bold text-[#2e7d32]">
              Description
            </div>
            <div className="px-6 py-4 text-sm font-medium text-gray-500">
              Reviews ({reviews.length})
            </div>
          </div>

          <div className="p-6">
            {/* Description */}
            <div className="prose prose-sm max-w-none text-gray-600">
              <h4 className="font-bold text-gray-800 mb-2">About</h4>
              <p className="leading-relaxed">
                {product.description || "This is a premium quality product sourced from the best farms and suppliers. Experience the freshness and quality that AshBazar is known for."}
              </p>

              {product.weight && (
                <div className="mt-4">
                  <h4 className="font-bold text-gray-800 mb-2">Product Details</h4>
                  <ul className="space-y-1 text-sm">
                    <li><span className="font-medium text-gray-700">Weight:</span> {product.weight} kg</li>
                    {product.brand && <li><span className="font-medium text-gray-700">Brand:</span> {product.brand.name}</li>}
                    {product.category && <li><span className="font-medium text-gray-700">Category:</span> {product.category.name}</li>}
                    {product.subCategory && <li><span className="font-medium text-gray-700">Sub-Category:</span> {product.subCategory.name}</li>}
                  </ul>
                </div>
              )}
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h4 className="mb-4 font-bold text-gray-800">Customer Reviews</h4>
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="rounded-lg bg-[#f5f7f5] p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4caf50] text-sm font-bold text-white">
                            {(r.user?.name || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{r.user?.name || "Anonymous"}</p>
                            <div className="flex">
                              {[1,2,3,4,5].map(i => (
                                <svg key={i} width="11" height="11" fill={i <= r.rating ? "#ff6f00" : "#e5e7eb"} viewBox="0 0 24 24">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      {r.comment && (
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ───────────────────────── */}
        {related.length > 0 && (
          <div className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="section-label mb-1">YOU MAY ALSO LIKE</p>
                <h2 className="section-title">Related Products</h2>
              </div>
              <Link href={`/shop?category=${product.proCategoryId}`} className="text-sm font-semibold text-[#ff6f00] hover:text-[#e65100] transition flex items-center gap-1">
                View All <ChevronRight />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {related.map(p => (
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
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <StoreFooter settings={nav.settings} />
    </div>
  );
}
