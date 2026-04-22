"use client";

import { FormEvent, useEffect, useState } from "react";

type Coupon = { id: string; couponCode: string; discountType: string; discountAmount: number; status: string; endDate: string };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountAmount, setDiscountAmount] = useState("10");
  const [minimumPurchaseAmount, setMinimumPurchaseAmount] = useState("0");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");

  async function load() {
    const res = await fetch("/api/couponCodes");
    const data = await res.json();
    setCoupons(data.data ?? []);
  }

  useEffect(() => {
    load();
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    setEndDate(d.toISOString().slice(0, 10));
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/couponCodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        couponCode,
        discountType,
        discountAmount: Number(discountAmount),
        minimumPurchaseAmount: Number(minimumPurchaseAmount),
        endDate: new Date(endDate).toISOString(),
        status
      })
    });
    setCouponCode("");
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Coupon Codes</h1>
      <form onSubmit={add} className="grid gap-4 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3 lg:grid-cols-6 items-end">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Code</label>
          <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" placeholder="e.g. SUMMER10" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</label>
          <select className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
            <option value="percentage">% Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount</label>
          <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" type="number" placeholder="Amount" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Min Purchase</label>
          <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" type="number" placeholder="৳" value={minimumPurchaseAmount} onChange={(e) => setMinimumPurchaseAmount(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expires</label>
          <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
          <select className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white shadow-md hover:bg-slate-800 md:col-span-3 lg:col-span-6 transition-all">
          ADD COUPON
        </button>
      </form>

      <div className="rounded-[24px] border border-slate-200/60 bg-white p-1 shadow-xl shadow-slate-200/40 overflow-hidden mt-6">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Coupon Code</th>
                <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Discount</th>
                <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Expiry</th>
                <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Status</th>
                <th className="h-12 px-5 py-4 text-right align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 transition-all duration-200 hover:bg-slate-50/80 bg-white group">
                  <td className="p-4 align-middle">
                    <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">{c.couponCode}</span>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="font-bold text-slate-900 tracking-tight text-sm">
                      {c.discountType === 'percentage' ? `${c.discountAmount}%` : `৳${c.discountAmount}`}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="text-xs font-bold text-slate-500">{new Date(c.endDate).toLocaleDateString()}</span>
                  </td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-50 text-slate-700 ring-slate-200'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${c.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <button onClick={async () => {
                      if (confirm("Delete this coupon?")) {
                        await fetch(`/api/couponCodes/${c.id}`, { method: 'DELETE' });
                        load();
                      }
                    }} title="Delete" className="h-8 w-8 rounded-lg inline-flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && (
            <div className="py-24 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.3-4.3"/><path d="M6 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M18 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M22 9v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2Z"/></svg>
              </div>
              <p className="text-slate-500 font-bold">No coupons found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
