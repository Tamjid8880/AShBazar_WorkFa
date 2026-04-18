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
      <h1 className="text-2xl font-bold text-slate-900">Coupon codes</h1>
      <form onSubmit={add} className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:grid-cols-3 lg:grid-cols-6">
        <input className="rounded-xl border px-3 py-2 text-sm" placeholder="CODE" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} required />
        <select className="rounded-xl border px-3 py-2 text-sm" value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
          <option value="percentage">%</option>
          <option value="fixed">Fixed</option>
        </select>
        <input className="rounded-xl border px-3 py-2 text-sm" type="number" placeholder="Amount" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
        <input className="rounded-xl border px-3 py-2 text-sm" type="number" placeholder="Min purchase" value={minimumPurchaseAmount} onChange={(e) => setMinimumPurchaseAmount(e.target.value)} />
        <input className="rounded-xl border px-3 py-2 text-sm" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <select className="rounded-xl border px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
        <button type="submit" className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white md:col-span-3 lg:col-span-6">
          Add coupon
        </button>
      </form>
      <div className="grid gap-3 md:grid-cols-2">
        {coupons.map((c) => (
          <div key={c.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="font-mono font-bold text-orange-600">{c.couponCode}</p>
            <p className="text-sm text-slate-600">
              {c.discountType} {c.discountAmount} · {c.status}
            </p>
            <p className="text-xs text-slate-400">{new Date(c.endDate).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
