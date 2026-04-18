"use client";

import { FormEvent, useEffect, useState } from "react";

type Brand = { id: string; name: string; subCategory?: { name: string } };

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [subs, setSubs] = useState<{ id: string; name: string }[]>([]);
  const [name, setName] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  useEffect(() => {
    void (async () => {
      const s = await fetch("/api/subCategories").then((r) => r.json());
      const list = s.data ?? [];
      setSubs(list);
      setSubcategoryId((prev) => prev || list[0]?.id || "");
      const b = await fetch("/api/brands").then((r) => r.json());
      setBrands(b.data ?? []);
    })();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!subcategoryId) return;
    await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subcategoryId })
    });
    setName("");
    const b = await fetch("/api/brands").then((r) => r.json());
    setBrands(b.data ?? []);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Brands</h1>
      <form onSubmit={add} className="flex flex-wrap gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <input className="min-w-[12rem] flex-1 rounded-xl border px-3 py-2 text-sm" placeholder="Brand name" value={name} onChange={(e) => setName(e.target.value)} required />
        <select className="rounded-xl border px-3 py-2 text-sm" value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)}>
          {subs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white">
          Add
        </button>
      </form>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <div key={b.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="font-semibold text-slate-900">{b.name}</p>
            <p className="text-xs text-slate-500">{b.subCategory?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
