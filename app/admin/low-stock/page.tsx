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
      <div className="rounded-[24px] border border-slate-200/60 bg-white p-1 shadow-xl shadow-slate-200/40 overflow-hidden mt-6">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Thumbnail</th>
                <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Product Name</th>
                <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Category</th>
                <th className="h-12 px-5 py-4 text-right align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Stock Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((p) => {
                const img = firstProductImageUrl(p.images);
                return (
                  <tr key={p.id} className="border-b border-slate-100 transition-all duration-200 hover:bg-amber-50/50 bg-white group">
                    <td className="p-4 align-middle w-[80px]">
                      <div className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[8px] text-slate-300 font-bold uppercase">No Img</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="font-bold text-slate-900 text-sm tracking-tight">{p.name}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">{p.category.name}</span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset bg-amber-50 text-amber-700 ring-amber-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {p.quantity} Units
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="py-24 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 2 20 20"/><path d="M6.71 6.71q.28-.27.57-.5L12 3l10 9-3 2.72"/><path d="M13.73 13.73a3 3 0 0 0-4.46-4.46"/><path d="M2.5 12a19.11 19.11 0 0 0 3 2.73l5.52 4.97 3-2.73"/></svg>
              </div>
              <p className="text-slate-500 font-bold">No low-stock items. Great job.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
