"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";

export default function InvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const [res, settingsRes] = await Promise.all([
           fetch(`/api/orders/${id}`),
           fetch(`/api/settings`)
        ]);
        const data = await res.json();
        const settingsData = await settingsRes.json();
        if (data.success) {
          setOrder(data.data);
        } else {
          setOrder(null);
        }
        if (settingsData.success) {
          setLogoUrl(settingsData.logoUrl);
        }
      } catch (err) {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse">GENERATING INVOICE...</div>;
  if (!order) return <div className="p-20 text-center font-black text-red-500">ORDER NOT FOUND</div>;

  const InvoiceCopy = ({ type }: { type: "Office Copy" | "Customer Copy" }) => (
    <div className={`mx-auto max-w-3xl bg-white p-6 md:p-8 shadow-2xl shadow-slate-200/50 print:shadow-none ${type === 'Customer Copy' ? 'mt-8 print:mt-0 print:break-before-page' : ''}`}>
      
      {/* Top Header Row */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-200">
         {/* Left Side Branding */}
         <div className="flex flex-col items-start gap-2">
           {logoUrl ? (
              <img src={logoUrl} alt="Ash Bazar" className="h-10 object-contain" />
           ) : (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-lg font-black text-white">A</div>
                <h1 className="text-xl font-black text-orange-600">Ash Bazar</h1>
              </div>
           )}
           <h2 className="text-base font-bold">Invoice - ASHB-{order.id.slice(-4).toUpperCase()}</h2>
           <span className="inline-block font-black uppercase text-[10px] border-2 border-slate-900 px-2 py-0.5 bg-slate-900 text-white rounded-md tracking-widest">
               {type}
           </span>
         </div>

         {/* Right Side Unique Fields */}
         {type === "Office Copy" && (
           <div className="flex flex-col sm:flex-row gap-4 items-start">
             
             {/* Delivery Method Box */}
             <div className="border-2 border-slate-900 p-2 min-w-[140px] shrink-0">
               <p className="font-black text-[9px] uppercase tracking-widest border-b border-slate-900 pb-1 mb-2 text-slate-800">Delivery</p>
               <div className="flex flex-col gap-2 text-xs font-bold text-slate-700">
                 <label className="flex items-center gap-2"><span className="h-3 w-3 border-2 border-slate-400 inline-block rounded-sm"></span> External</label>
                 <label className="flex items-center gap-2"><span className="h-3 w-3 border-2 border-slate-400 inline-block rounded-sm"></span> Internal</label>
               </div>
             </div>

             {/* Signatures Table Box */}
             <table className="border-collapse border-2 border-purple-800 text-purple-900 min-w-[260px] shrink-0">
               <thead>
                  <tr>
                    <th colSpan={2} className="border-b-2 border-purple-800 p-1 text-center text-sm font-black tracking-widest uppercase text-purple-800 bg-purple-50/20">
                       ASH BAZAR
                    </th>
                  </tr>
               </thead>
               <tbody className="text-[10px] font-bold whitespace-nowrap">
                 <tr>
                   <td className="border-b border-r-2 border-purple-800 p-1 w-[55%]">Order Accepted</td>
                   <td className="border-b border-purple-800 p-2 w-[45%]"></td>
                 </tr>
                 <tr>
                   <td className="border-b border-r-2 border-purple-800 p-1">Delivery</td>
                   <td className="border-b border-purple-800 p-2"></td>
                 </tr>
                 <tr>
                   <td className="border-b border-r-2 border-purple-800 p-1 h-[32px] align-middle">
                     <div className="flex flex-col text-[7px] uppercase font-black text-purple-500 leading-tight">Signed by</div>
                     Cash / Online
                   </td>
                   <td className="border-b border-purple-800 p-1 relative align-top">
                     <div className="flex gap-2 text-[8px] uppercase tracking-wider text-purple-700 font-black justify-between mt-1">
                       <span>[ ] Cash</span>
                       <span>[ ] Online</span>
                     </div>
                   </td>
                 </tr>
                 <tr>
                   <td className="border-r-2 border-purple-800 p-1">Invoice</td>
                   <td className="p-1 relative h-6">
                     <span className="absolute bottom-1 right-2 text-[7px] font-black uppercase text-purple-400">ERP No.</span>
                   </td>
                 </tr>
               </tbody>
             </table>

           </div>
         )}
      </div>

      {/* Info Section */}
      <div className="py-4 space-y-1 text-xs font-semibold">
         <p><span className="font-bold">Customer Name:</span> {order.user?.name || "Guest Customer"}</p>
         <p><span className="font-bold">Order Date:</span> {new Date(order.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
         <p><span className="font-bold">Shipping Address:</span> {order.street}, {order.city}, {order.country || "Bangladesh"}</p>
         <p><span className="font-bold">Contact:</span> {order.phone}</p>
      </div>

      {/* Items Table */}
      <table className="w-full text-left text-xs font-semibold mt-2 border border-slate-300">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-300">
            <th className="p-2 border-r border-slate-300">Product</th>
            <th className="p-2 border-r border-slate-300">Unit Price</th>
            <th className="p-2 border-r border-slate-300">Qty</th>
            <th className="p-2">Total Price</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((it: any) => (
            <tr key={it.id} className="border-b border-slate-300">
              <td className="p-2 border-r border-slate-300">
                {it.productName}
                {it.variant && <span className="ml-2 text-[10px] text-orange-600">({it.variant})</span>}
              </td>
              <td className="p-2 border-r border-slate-300">{Number(it.price).toFixed(1)}</td>
              <td className="p-2 border-r border-slate-300">{it.quantity}</td>
              <td className="p-2">{(Number(it.price) * it.quantity).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div className="mt-4 flex flex-col items-end gap-1 text-xs font-bold">
         <p>Transaction Mode: {order.paymentMethod.toUpperCase()}</p>
         {order.discount > 0 && <p className="text-emerald-600">Discount: -{Number(order.discount).toFixed(1)} Tk.</p>}
         <p>Shipping Charge: {Number(order.deliveryCharge || 0).toFixed(1)} Tk.</p>
         <p className="mt-2 text-sm font-black">Grand Total: {Number(order.total || order.totalPrice).toFixed(1)} Tk.</p>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-[8px] font-black uppercase tracking-widest text-slate-300 print:mt-4">
        Thank you for shopping with Ash Bazar. Please keep this invoice for your records.
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-10 font-sans text-slate-900 print:bg-white print:p-0">
      
      <InvoiceCopy type="Office Copy" />
      <InvoiceCopy type="Customer Copy" />
      
      <div className="fixed bottom-10 right-10 print:hidden z-50">
        <button
          onClick={() => window.print()}
          className="rounded-full bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-2xl hover:scale-110 active:scale-95 transition-all"
        >
          PRINT INVOICES
        </button>
      </div>
    </div>
  );
}
