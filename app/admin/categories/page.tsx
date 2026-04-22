"use client";

import { FormEvent, useEffect, useState } from "react";

type Category = { id: string; name: string; image: string };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setImage(data.url);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  }

  async function addCategory(e: FormEvent) {
    e.preventDefault();
    if (!name || !image) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, image })
    });
    setName("");
    setImage("");
    load();
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
      <form className="grid gap-4 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3 items-end" onSubmit={addCategory}>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category Name</label>
          <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" placeholder="e.g. Grocery" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category Image</label>
          <label className="flex h-[42px] w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 font-bold text-slate-400 hover:border-orange-500 hover:bg-orange-50 transition-all">
            {uploading ? (
              <span className="text-[10px] animate-pulse text-orange-600">Uploading...</span>
            ) : image ? (
              <div className="flex items-center gap-2">
                 <img src={image} alt="" className="h-6 w-6 rounded flex-shrink-0 object-cover" />
                 <span className="text-[10px] text-emerald-600">Change Photo</span>
              </div>
            ) : (
              <span className="text-[10px]">+ Select Photo</span>
            )}
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
          </label>
        </div>
        <div>
          <button className="h-[42px] w-full rounded-xl bg-slate-900 text-sm font-black text-white shadow-md hover:bg-slate-800 transition-all disabled:opacity-50" type="submit" disabled={uploading || !name || !image}>
            ADD CATEGORY
          </button>
        </div>
      </form>

      <div className="rounded-[24px] border border-slate-200/60 bg-white p-1 shadow-xl shadow-slate-200/40 overflow-hidden mt-6">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Image</th>
                <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Category Name</th>
                <th className="h-12 px-5 py-4 text-right align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 transition-all duration-200 hover:bg-slate-50/80 bg-white group">
                  <td className="p-4 align-middle w-[80px]">
                    <div className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                      {c.image && c.image !== "no_url" ? (
                        <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[8px] text-slate-300 font-bold uppercase">No Img</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="font-bold text-slate-900 text-sm tracking-tight">{c.name}</span>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button title="Edit" className="h-8 w-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white transition shadow-sm border border-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                      <button onClick={async () => {
                        if (confirm('Delete this category?')) {
                          await fetch(`/api/categories/${c.id}`, { method: 'DELETE' });
                          load();
                        }
                      }} title="Delete" className="h-8 w-8 rounded-lg flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-200 ml-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="py-24 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <p className="text-slate-500 font-bold">No categories found.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
