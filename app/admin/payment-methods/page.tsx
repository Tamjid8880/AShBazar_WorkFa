"use client";

import { useEffect, useState } from "react";

export default function AdminPaymentMethodsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", accountDetails: "", instructions: "", isActive: true });

  async function load() {
    const res = await fetch("/api/payment-methods");
    const data = await res.json();
    setItems(data.data || []);
  }

  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/payment-methods", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setForm({ name: "", accountDetails: "", instructions: "", isActive: true });
      load();
    } catch (err: any) {
      alert("Error saving payment method");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this payment option?")) return;
    await fetch(`/api/payment-methods/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleStatus(item: any) {
    await fetch("/api/payment-methods", {
      method: "POST",
      body: JSON.stringify({ ...item, isActive: !item.isActive }),
    });
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Payment Methods</h1>
        <p className="text-slate-500 font-medium">Manage available payment options for checkout.</p>
      </div>

      <form onSubmit={save} className="grid md:grid-cols-2 gap-6 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Method Name</label>
          <input
            className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. bKash, Bank Transfer"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Details</label>
          <input
            className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold"
            value={form.accountDetails} onChange={e => setForm({ ...form, accountDetails: e.target.value })}
            placeholder="e.g. 017XXXXX (Personal)"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Instructions for Customer</label>
          <textarea
            className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium"
            value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })}
            rows={3}
            placeholder="e.g. Please send money and provide Transaction ID..."
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <input 
            type="checkbox" id="isActive"
            checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}
          />
          <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Active (Visible at checkout)</label>
        </div>
        <div className="md:col-span-2 mt-2">
          <button 
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 font-black text-white shadow-xl hover:opacity-95 transition disabled:opacity-50"
          >
            {loading ? "SAVING..." : "ADD PAYMENT METHOD"}
          </button>
        </div>
      </form>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <div key={p.id} className="relative overflow-hidden rounded-[32px] bg-white border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-900">{p.name}</h3>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                  {p.isActive ? "Active" : "Disabled"}
                </span>
              </div>
              {p.accountDetails && (
                <div className="mb-2">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Account Details</p>
                  <p className="font-medium text-slate-700">{p.accountDetails}</p>
                </div>
              )}
              {p.instructions && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Instructions</p>
                  <p className="text-sm text-slate-600 line-clamp-3">{p.instructions}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-100">
              <button 
                onClick={() => toggleStatus(p)}
                className="flex-1 rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                {p.isActive ? "Disable" : "Enable"}
              </button>
              <button 
                onClick={() => remove(p.id)}
                className="flex-1 rounded-xl bg-red-50 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
