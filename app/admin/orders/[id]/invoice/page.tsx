"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";

export default function InvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
        } else {
          setOrder(null);
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

  return (
    <div className="min-h-screen bg-slate-50 p-10 font-sans text-slate-900 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl rounded-[40px] bg-white p-12 shadow-2xl shadow-slate-200/50 print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-12">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-black text-white">S</div>
            <h1 className="mt-4 text-4xl font-black tracking-tight">ShopMart</h1>
            <p className="mt-1 text-sm font-bold text-slate-400">Official Invoice</p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Order ID</h2>
            <p className="mt-1 text-2xl font-black">#{order.id.slice(-8).toUpperCase()}</p>
            <p className="mt-4 text-sm font-bold text-slate-500">{new Date(order.orderDate).toLocaleDateString()} · {new Date(order.orderDate).toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Customer & Shipping */}
        <div className="grid grid-cols-2 gap-12 py-12">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bill To</h3>
            <p className="mt-3 text-lg font-black text-slate-900">{order.user?.name || "Guest Customer"}</p>
            <p className="mt-1 text-sm font-bold text-slate-500">{order.user?.email || "No email provided"}</p>
            <p className="mt-1 text-sm font-bold text-slate-500">{order.phone}</p>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ship To</h3>
            <div className="mt-3 rounded-2xl bg-slate-50 p-4 border border-slate-100 italic">
               <p className="text-sm font-bold leading-relaxed text-slate-700">{order.street}</p>
               <p className="mt-1 text-sm font-bold text-slate-700">{order.city}</p>
               <p className="text-sm font-bold text-slate-700">{order.country || "Bangladesh"}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="py-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="pb-4">Product Details</th>
                <th className="pb-4 text-center">Qty</th>
                <th className="pb-4 text-right">Price</th>
                <th className="pb-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y italic1">
              {order.items.map((it: any) => (
                <tr key={it.id}>
                  <td className="py-6">
                    <p className="font-bold text-slate-900">{it.productName}</p>
                    {it.variant && <p className="text-[10px] font-black uppercase text-orange-600 mt-1">{it.variant}</p>}
                  </td>
                  <td className="py-6 text-center font-bold text-slate-50">{it.quantity}</td>
                  <td className="py-6 text-right font-bold text-slate-500">${Number(it.price).toFixed(2)}</td>
                  <td className="py-6 text-right font-black text-slate-900">${(Number(it.price) * it.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-12 flex justify-end border-t pt-10">
          <div className="w-full max-w-xs space-y-4">
            <div className="flex justify-between text-sm font-bold text-slate-400">
              <span>Subtotal</span>
              <span className="text-slate-900">${Number(order.subtotal || order.totalPrice).toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm font-bold text-emerald-600">
                <span>Discount</span>
                <span>-${Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-400">
              <span>Delivery Fee</span>
              <span className="text-slate-900">${Number(order.deliveryCharge || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-4 text-2xl font-black text-slate-900">
              <span>Total Amount</span>
              <span className="text-orange-600">${Number(order.total || order.totalPrice).toFixed(2)}</span>
            </div>
            <div className="mt-8 rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-[10px] font-black uppercase border-b border-slate-200 pb-2 mb-2 text-slate-400">Payment Mode</p>
              <p className="text-sm font-black text-slate-900 uppercase">{order.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">
          Thank you for shopping with ShopMart. Please keep this invoice for your records.
        </div>
      </div>
      
      <div className="fixed bottom-10 right-10 print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded-full bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-2xl hover:scale-110 active:scale-95 transition-all"
        >
          PRINT INVOICE
        </button>
      </div>
    </div>
  );
}
