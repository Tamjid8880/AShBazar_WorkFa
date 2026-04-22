"use client";

import { FormEvent, useEffect, useState } from "react";
import PermissionGuard from "@/components/permission-guard";

type Brand = { id: string; name: string; subcategoryId: string | null; subCategory?: { name: string } };

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
      setSubs(s.data ?? []);
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
    if (!name.trim()) return;
    await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), subcategoryId: subcategoryId || null })
    });
    setName("");
    setSubcategoryId("");
    loadData();
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editBrand) return;
    await fetch(`/api/brands/${editBrand.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, subcategoryId: editSubCategory || null })
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
                <label className="text-[10px] font-black uppercase text-slate-400">Brand Name <span className="text-red-500">*</span></label>
                <input
                  className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-2 font-bold focus:ring-2 focus:ring-orange-500/20 outline-none text-sm"
                  placeholder="e.g. Pusti"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Sub Category <span className="normal-case text-slate-300">(optional)</span>
                </label>
                <select
                  className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-2 font-bold focus:ring-2 focus:ring-orange-500/20 outline-none text-sm"
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                >
                  <option value="">— No subcategory —</option>
                  {subs.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white hover:bg-orange-700 disabled:opacity-50"
              >
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
                <div className="rounded-[24px] border border-slate-200/60 bg-white p-1 shadow-xl shadow-slate-200/40 overflow-hidden">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                          <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Brand Name</th>
                          <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Sub Category</th>
                          <th className="h-12 px-5 py-4 text-right align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBrands.map((b) => (
                          <tr key={b.id} className="border-b border-slate-100 transition-all duration-200 hover:bg-slate-50/80 bg-white group">
                            <td className="p-4 align-middle">
                              <span className="font-bold text-slate-900 text-sm tracking-tight">{b.name}</span>
                            </td>
                            <td className="p-4 align-middle">
                              {b.subCategory ? (
                                <span className="text-[10px] font-bold text-orange-600 bg-orange-100 inline-block px-2 py-0.5 rounded uppercase">{b.subCategory.name}</span>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 inline-block px-2 py-0.5 rounded uppercase">Independent</span>
                              )}
                            </td>
                            <td className="p-4 align-middle text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button onClick={() => startEdit(b)} title="Edit" className="h-8 w-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white transition shadow-sm border border-slate-200">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                                </button>
                                <button onClick={() => deleteBrand(b.id)} title="Delete" className="h-8 w-8 rounded-lg flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-200 ml-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredBrands.length === 0 && (
                      <div className="py-24 text-center">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        </div>
                        <p className="text-slate-500 font-bold">No brands found.</p>
                      </div>
                    )}
                  </div>
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
                  <input
                    className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-2 font-bold focus:ring-2 focus:ring-orange-500/20 outline-none text-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    Sub Category <span className="normal-case text-slate-300">(optional)</span>
                  </label>
                  <select
                    className="w-full mt-1 rounded-xl border border-slate-200 px-4 py-2 font-bold focus:ring-2 focus:ring-orange-500/20 outline-none text-sm"
                    value={editSubCategory}
                    onChange={(e) => setEditSubCategory(e.target.value)}
                  >
                    <option value="">— No subcategory —</option>
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
