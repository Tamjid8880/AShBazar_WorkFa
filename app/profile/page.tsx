"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rawUser = localStorage.getItem("auth_user");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      setUser(u);
      fetchOrders(u.id);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchOrders(userId: string) {
    try {
      const res = await fetch(`/api/orders/orderByUserId/${userId}`);
      const data = await res.json();
      setOrders(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-300">LOADING PROFILE...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
         <h1 className="text-2xl font-black text-slate-900">Please Login</h1>
         <Link href="/login" className="mt-4 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold">Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
            {/* USER INFO */}
            <div className="lg:col-span-1">
                <div className="rounded-[40px] bg-white p-8 border border-slate-100 shadow-sm sticky top-24">
                   <div className="h-20 w-20 rounded-full bg-slate-900 flex items-center justify-center text-3xl font-black text-white">
                      {user.name[0].toUpperCase()}
                   </div>
                   <h2 className="mt-6 text-2xl font-black text-slate-900">{user.name}</h2>
                   <p className="text-sm font-bold text-slate-400">{user.email}</p>
                   <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                      <div>
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone</p>
                         <p className="font-bold text-slate-700">{user.phone || "Not set"}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Address</p>
                         <p className="font-bold text-slate-700 leading-relaxed">{user.address || "Not set"}</p>
                      </div>
                   </div>
                </div>

                {/* COMPLAINT FORM */}
                <div className="mt-8 rounded-[40px] bg-slate-900 p-8 text-white shadow-xl">
                  <h3 className="text-xl font-bold">Need Help?</h3>
                  <p className="text-slate-400 text-xs mt-1 mb-4">Report an issue or file a complaint.</p>
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as any;
                      const res = await fetch("/api/complaints", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId: user.id,
                          subject: form.subject.value,
                          description: form.description.value
                        })
                      });
                      if (res.ok) {
                        alert("Complaint submitted successfully! Ticket ID generated.");
                        form.reset();
                      }
                    }}
                    className="space-y-4"
                  >
                    <input name="subject" placeholder="Subject" className="w-full bg-slate-800 border-none rounded-2xl px-5 py-3 text-sm" required />
                    <textarea name="description" placeholder="Describe your issue..." className="w-full bg-slate-800 border-none rounded-2xl px-5 py-3 text-sm" rows={3} required />
                    <button type="submit" className="w-full bg-orange-600 py-3 rounded-2xl font-black text-sm hover:bg-orange-700 transition">FILE COMPLAINT</button>
                  </form>
                </div>
            </div>

            {/* ORDERS & TIMELINE */}
            <div className="lg:col-span-2 space-y-8">
               <h1 className="text-3xl font-black text-slate-900">Your Orders</h1>
               {orders.length === 0 ? (
                  <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">No orders yet.</p>
                  </div>
               ) : (
                  orders.map(order => (
                    <div key={order.id} className="rounded-[40px] bg-white border border-slate-100 shadow-sm overflow-hidden">
                       <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-100">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</p>
                             <p className="font-black text-slate-900 text-lg">#{order.id.slice(-8).toUpperCase()}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ordered On</p>
                             <p className="font-bold text-slate-600 italic text-sm">{new Date(order.orderDate).toLocaleDateString()}</p>
                          </div>
                       </div>
                       
                       <div className="p-8">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Tracking Timeline</h3>
                          <div className="space-y-0 relative">
                             {/* VERTICAL LINE */}
                             <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-100"></div>

                             {order.statusHistory?.map((h: any, i: number) => {
                                const isLatest = i === 0;
                                return (
                                    <div key={h.id} className="relative flex gap-10 pb-10 last:pb-0">
                                        {/* DOT */}
                                        <div className={`z-10 h-12 w-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${isLatest ? 'bg-emerald-500 scale-110' : 'bg-slate-200'}`}>
                                            {isLatest ? (
                                                <span className="text-white text-xs">✓</span>
                                            ) : (
                                                <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                                            )}
                                        </div>
                                        {/* CONTENT */}
                                        <div className="flex-1 pt-1">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <p className={`font-black text-sm uppercase tracking-tight ${isLatest ? 'text-emerald-600' : 'text-slate-500'}`}>{h.message}</p>
                                                    {h.dispatchId && <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Dispatch ID: {h.dispatchId}</p>}
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[10px] font-black text-slate-900 uppercase">{new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                             })}
                          </div>

                          <div className="mt-12 pt-8 border-t border-slate-50 flex justify-between items-center">
                             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Items: {order.items?.length}</p>
                             <div className="flex items-center gap-6">
                                <p className="text-2xl font-black text-slate-900">${order.total?.toFixed(2)}</p>
                                <button 
                                  onClick={() => {
                                    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
                                    const newItems = order.items.map((it: any) => ({
                                      lineId: Math.random().toString(36).slice(2),
                                      productId: it.productID,
                                      name: it.productName,
                                      price: Number(it.price),
                                      quantity: it.quantity,
                                      variantLabel: it.variant,
                                      image: "" // Image link lost in order history, but cart usually handles it or fetches it
                                    }));
                                    localStorage.setItem("cart", JSON.stringify([...currentCart, ...newItems]));
                                    alert("Items added to cart!");
                                    window.location.href = "/cart";
                                  }}
                                  className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black hover:bg-slate-800 transition"
                                >
                                  RE-ORDER
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))
               )}
            </div>
        </div>
      </div>
    </div>
  );
}
