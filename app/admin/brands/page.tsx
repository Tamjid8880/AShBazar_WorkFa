"use client";

import { FormEvent, useEffect, useState } from "react";
import PermissionGuard from "@/components/permission-guard";

type Brand = { id: string; name: string; subcategoryId: string; subCategory?: { name: string } };

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [subs, setSubs] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add state
  const [name, setName] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  // Edit state
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [editName, setEditName] = useState("");
  const [editSubCategory, setEditSubCategory] = useState("");

  // Search state
  const [search, setSearch] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([
        fetch("/api/subCategories").then((r) => r.json()),
        fetch("/api/brands").then((r) => r.json())
      ]);
      const sList = s.data ?? [];
      setSubs(sList);
      if (sList.length > 0 && !subcategoryId) setSubcategoryId(sList[0].id);
      setBrands(b.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!name || !subcategoryId) return;
    await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subcategoryId })
    });
    setName("");
    loadData();
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editBrand) return;
    await fetch(`/api/brands/${editBrand.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, subcategoryId: editSubCategory })
    });
    setEditBrand(null);
    loadData();
  }

  async function deleteBrand(id: string) {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    await fetch(`/api/brands/${id}`, { method: "DELETE" });
    loadData();
  }

  function startEdit(b: Brand) {
    setEditBrand(b);
    setEditName(b.name);
    setEditSubCategory(b.subcategoryId || "");
  }

  const filteredBrands = brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <PermissionGuard permission="view_products">
      <div className="space-y-8 max-w-5xl pb-20">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Brand Management</h1>
          <p className="text-slate-500 font-medium tracking-tight">Create, search, edit and remove brands.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <form onSubmit={add} className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Add New Brand</h2>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Brand Name</label>
                <input className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-2 font-bold focus:ring-2 focus:ring-orange-500/20 outline-none text-sm" placeholder="e.g. Pusti" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">Sub Category</label>
                <select className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-2 font-bold focus:ring-2 focus:ring-orange-500/20 outline-none text-sm" value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)} required>
                  {subs.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={!name || !subcategoryId} className="w-full rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white hover:bg-orange-700 disabled:opacity-50">
                ADD BRAND
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm min-h-[400px]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-black text-slate-900">All Brands</h2>
                <input 
                  type="text" 
                  placeholder="Search brand name..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold w-full sm:max-w-xs focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              {loading ? (
                <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Loading brands...</div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredBrands.map((b) => (
                    <div key={b.id} className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-md hover:border-slate-200 flex flex-col justify-between">
                      <div>
                        <p className="font-black text-slate-900 text-lg">{b.name}</p>
                        <p className="text-xs font-bold text-orange-600 bg-orange-100 inline-block px-2 py-0.5 rounded uppercase">{b.subCategory?.name || "Unknown"}</p>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <button onClick={() => startEdit(b)} className="bg-slate-200 text-slate-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg hover:bg-slate-300">Edit</button>
                        <button onClick={() => deleteBrand(b.id)} className="bg-red-100 text-red-600 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg hover:bg-red-200">Delete</button>
                      </div>
                    </div>
                  ))}
                  {filteredBrands.length === 0 && (
                    <div className="col-span-2 py-10 text-center font-bold text-slate-400">
                      No brands found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editBrand && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-[32px] bg-white p-8 shadow-2xl">
              <h2 className="text-xl font-black text-slate-900 mb-6">Edit Brand</h2>
              <form onSubmit={saveEdit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Brand Name</label>
                  <input className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-2 font-bold focus:ring-2 focus:ring-orange-500/20 outline-none text-sm" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Sub Category</label>
                  <select className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-2 font-bold focus:ring-2 focus:ring-orange-500/20 outline-none text-sm" value={editSubCategory} onChange={(e) => setEditSubCategory(e.target.value)} required>
                    {subs.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button type="button" onClick={() => setEditBrand(null)} className="rounded-xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-600 hover:bg-slate-200">CANCEL</button>
                  <button type="submit" className="rounded-xl bg-slate-900 px-4 py-3 text-xs font-black text-white hover:bg-slate-800">SAVE</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
