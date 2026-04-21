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
      <form className="grid gap-6 rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm md:grid-cols-4 items-end" onSubmit={addCategory}>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category Name</label>
          <input className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10" placeholder="e.g. Grocery" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category Image</label>
          <label className="flex h-[52px] w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 px-5 font-bold text-slate-400 hover:border-orange-500 hover:bg-orange-50 transition-all">
            {uploading ? (
              <span className="text-xs animate-pulse text-orange-600">Uploading...</span>
            ) : image ? (
              <div className="flex items-center gap-2">
                 <img src={image} alt="" className="h-8 w-8 rounded-lg object-cover" />
                 <span className="text-xs text-emerald-600">Change Photo</span>
              </div>
            ) : (
              <span className="text-xs">+ Select Photo</span>
            )}
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
          </label>
        </div>
        <div>
          <button className="h-[52px] w-full rounded-2xl bg-slate-900 font-black text-white shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50" type="submit" disabled={uploading || !name || !image}>
            ADD CATEGORY
          </button>
        </div>
      </form>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((c) => (
          <article key={c.id} className="group overflow-hidden rounded-[32px] border border-slate-100 bg-white p-2 shadow-sm transition-all hover:shadow-xl hover:border-orange-200">
            <div className="aspect-[4/3] relative rounded-[24px] overflow-hidden bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {c.image && c.image !== "no_url" ? (
                <img src={c.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-bold text-slate-300">NO IMAGE</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-orange-600 mb-0.5">Category</p>
                <h3 className="text-lg font-black text-slate-900">{c.name}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <span className="font-bold">→</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      {categories.length === 0 && (
        <div className="rounded-[40px] border-2 border-dashed border-slate-100 bg-slate-50 p-20 text-center">
          <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">No categories found</p>
        </div>
      )}
    </section>
  );
}
