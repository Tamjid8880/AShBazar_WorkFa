"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "packed", label: "Packed" },
  { value: "on_the_way", label: "On the way" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" }
];

type Order = {
  id: string;
  orderStatus: string;
  total: number | null;
  totalPrice: number;
  subtotal: number | null;
  discount: number | null;
  deliveryCharge: number | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  paymentMethod: string;
  orderDate: string;
  user: { name: string; email: string | null };
  items: { productName: string; quantity: number; price: number; variant: string | null }[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  async function load() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, orderStatus: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus })
    });
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Order Management</h1>
        <p className="text-slate-500 font-medium">Manage fulfillment and generate customer invoices.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 italic1">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-5">
                  <p className="font-black text-slate-900">#{o.id.slice(-6).toUpperCase()}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{new Date(o.orderDate).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-800">{o.user?.name}</p>
                  <p className="text-xs text-slate-500">{o.phone}</p>
                </td>
                <td className="px-6 py-5 font-black text-slate-900">
                   ${(o.total ?? o.totalPrice).toFixed(2)}
                </td>
                <td className="px-6 py-5">
                  <select
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold outline-none ring-orange-500/20 focus:ring-4 ${
                      o.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      o.orderStatus === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                    value={o.orderStatus}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded-md text-slate-500">{o.paymentMethod}</span>
                </td>
                <td className="px-6 py-5">
                  <button 
                    onClick={() => window.open(`/admin/orders/${o.id}/invoice`, '_blank')}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-slate-800 transition"
                  >
                    INVOICE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="py-20 text-center text-slate-400 font-bold">No orders found.</div>
        )}
      </div>
    </div>
  );
}
