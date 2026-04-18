"use client";

import { useEffect, useState } from "react";

export default function AdminShippingPage() {
  const [charges, setCharges] = useState<any[]>([]);
  const [location, setLocation] = useState("");
  const [minW, setMinW] = useState("0");
  const [maxW, setMaxW] = useState("999");
  const [charge, setCharge] = useState("");

  async function load() {
    const res = await fetch("/api/delivery-charges");
    const data = await res.json();
    setCharges(data.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: any) {
    e.preventDefault();
    await fetch("/api/delivery-charges", {
      method: "POST",
      body: JSON.stringify({ location, minWeight: minW, maxWeight: maxW, charge }),
    });
    setLocation("");
    setCharge("");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/delivery-charges/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Delivery Charges</h1>
        <p className="text-slate-500 font-medium">Configure shipping rates based on location and parcel weight.</p>
      </div>

      <form onSubmit={add} className="grid gap-4 rounded-3xl bg-white p-6 border border-slate-200 shadow-sm md:grid-cols-5 items-end">
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location / Zone</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
            placeholder="e.g. Inside Dhaka"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Min Weight (kg)</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
            type="number"
            value={minW}
            onChange={(e) => setMinW(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Charge Amount ($)</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
            type="number"
            value={charge}
            onChange={(e) => setCharge(e.target.value)}
            required
          />
        </div>
        <button className="bg-slate-900 text-white rounded-xl py-2.5 text-xs font-black shadow-lg hover:bg-slate-800 transition">ADD RATE</button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {charges.map((c) => (
          <div key={c.id} className="relative rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm hover:border-orange-200 transition">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest">{c.location}</p>
                   <p className="mt-1 text-2xl font-black text-slate-900">${c.charge}</p>
                </div>
                <button onClick={() => remove(c.id)} className="text-slate-200 hover:text-red-500 transition">✕</button>
             </div>
             <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-tight">Weight: {c.minWeight}kg - {c.maxWeight}kg</p>
          </div>
        ))}
      </div>
    </div>
  );
}
