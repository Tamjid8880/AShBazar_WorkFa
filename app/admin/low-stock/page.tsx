import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { firstProductImageUrl } from "@/lib/product-images";

export const dynamic = "force-dynamic";

export default async function LowStockPage() {
  const items = await prisma.product.findMany({
    where: { quantity: { lt: 10, gt: 0 } },
    orderBy: { quantity: "asc" },
    include: { category: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Low stock</h1>
          <p className="text-sm text-slate-600">Products below 10 units (excluding sold out).</p>
        </div>
        <Link href="/admin" className="text-sm font-medium text-orange-600 hover:underline">
          ← Dashboard
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => {
          const img = firstProductImageUrl(p.images);
          return (
            <article key={p.id} className="overflow-hidden rounded-2xl border border-amber-200/80 bg-white shadow-sm">
              <div className="flex gap-4 p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-orange-600">{p.category.name}</p>
                  <h2 className="font-semibold text-slate-900">{p.name}</h2>
                  <p className="mt-1 text-2xl font-bold text-amber-600">{p.quantity} left</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {items.length === 0 && <p className="text-center text-slate-500">No low-stock items. Great job.</p>}
    </div>
  );
}
