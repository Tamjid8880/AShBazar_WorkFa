import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreNavData } from "@/lib/store-nav";
import StoreHeader from "@/components/store-header";
import ProductPurchaseClient from "@/components/product-purchase-client";

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

  if (!product) notFound();

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

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <StoreHeader categories={nav.categories} brands={nav.brands} compact />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
          <ProductPurchaseClient
            productId={product.id}
            name={product.name}
            description={product.description}
            basePrice={product.price}
            baseOfferPrice={product.offerPrice}
            baseStock={product.quantity}
            imagesJson={product.images}
            productVariants={product.variants as any}
          />
        </div>
      </div>
    </div>
  );
}
