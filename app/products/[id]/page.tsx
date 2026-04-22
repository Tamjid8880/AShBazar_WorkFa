import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreNavData } from "@/lib/store-nav";
import StoreHeader from "@/components/store-header";
import ProductPurchaseClient from "@/components/product-purchase-client";
import ReviewComplaintSection from "@/components/review-complaint-section";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, nav] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subCategory: true,
        brand: true,
        variantType: true,
        variants: { include: { variant: true } }
      }
    }),
    getStoreNavData()
  ]);

  if (!product || product.isHidden) notFound();

  const variantIds = Array.isArray(product.proVariantId) ? product.proVariantId : [];
  const variantRows =
    variantIds.length > 0
      ? await prisma.variant.findMany({
          where: { id: { in: variantIds } },
          include: { variantType: true }
        })
      : [];

  const variants = variantRows.map((v) => ({
    id: v.id,
    name: v.name,
    typeName: v.variantType.name,
    typeValue: v.variantType.type
  }));

  const totalVariantStock = product.variants.reduce((acc, pv) => acc + pv.stock, 0);
  const isOutOfStock = product.variants.length > 0 ? totalVariantStock <= 0 : product.quantity <= 0;
  const isLowStock = product.variants.length > 0 ? (totalVariantStock > 0 && totalVariantStock <= 5) : (product.quantity > 0 && product.quantity <= 5);

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <StoreHeader categories={nav.categories} brands={nav.brands} logoUrl={nav.logoUrl} compact />
      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* OUT OF STOCK BANNER */}
        {isOutOfStock ? (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-6 py-4 flex items-center gap-3 w-max">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-black text-red-700 text-sm">Out of Stock</p>
            </div>
          </div>
        ) : isLowStock ? (
          <div className="mb-6 rounded-2xl bg-orange-50 border border-orange-200 px-4 py-2 flex items-center gap-2 w-max">
            <span className="text-lg">⚡</span>
            <p className="text-xs font-black text-orange-700 uppercase tracking-widest">Low Stock — Order Quick!</p>
          </div>
        ) : null}

        {/* PROMOTIONAL BADGES */}
        {(product.isHotDeal || product.isSpecialOffer) && (
          <div className="mb-4 flex gap-3">
            {product.isHotDeal && (
              <span className="bg-orange-600 text-white text-xs font-black px-4 py-1.5 rounded-full">🔥 HOT DEAL</span>
            )}
            {product.isSpecialOffer && (
              <span className="bg-blue-600 text-white text-xs font-black px-4 py-1.5 rounded-full">🌟 SPECIAL OFFER</span>
            )}
          </div>
        )}

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
          <ProductPurchaseClient
            productId={product.id}
            name={product.name}
            description={product.description}
            basePrice={product.price}
            baseOfferPrice={product.offerPrice}
            baseStock={product.quantity}
            weight={product.weight}
            imagesJson={product.images}
            productVariants={product.variants as any}
          />
        </div>

        {/* REVIEWS & COMPLAINT SECTION */}
        <div className="mt-8">
          <ReviewComplaintSection productId={product.id} productName={product.name} />
        </div>
      </div>
    </div>
  );
}
