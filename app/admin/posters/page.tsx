"use client";

import { useEffect, useState } from "react";

export default function AdminPostersPage() {
  const [posters, setPosters] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/posters");
    const data = await res.json();
    setPosters(data.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    try {
      // 1. Upload image
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      
      if (!uploadData.success) throw new Error("Upload failed");

      // 2. Save poster
      await fetch("/api/posters", {
        method: "POST",
        body: JSON.stringify({ posterName: name, imageUrl: uploadData.url }),
      });

      setName("");
      setFile(null);
      load();
    } catch (err) {
      alert("Error adding poster");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/posters/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Homepage Posters</h1>
        <p className="text-slate-500 font-medium">Manage the carousel banners for your storefront hero section.</p>
      </div>

      <form onSubmit={add} className="grid md:grid-cols-2 gap-6 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Poster Name / Title</label>
          <input
            className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold"
            placeholder="e.g. Summer Collection"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Banner Image</label>
          <input
            type="file"
            className="w-full text-xs font-bold text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-slate-900 file:text-white file:uppercase hover:file:bg-slate-800"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept="image/*"
            required
          />
        </div>
        <div className="md:col-span-2">
          <button 
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 font-black text-white shadow-xl hover:opacity-95 transition disabled:opacity-50"
          >
            {loading ? "UPLOADING..." : "CREATE POSTER"}
          </button>
        </div>
      </form>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posters.map((p) => (
          <div key={p.id} className="group relative overflow-hidden rounded-[32px] bg-white border border-slate-100 shadow-sm transition hover:shadow-xl">
            <div className="aspect-[16/9] bg-slate-50">
              <img src={p.imageUrl} alt={p.posterName} className="h-full w-full object-cover" />
            </div>
            <div className="p-5 flex justify-between items-center bg-white">
              <p className="font-bold text-slate-900">{p.posterName}</p>
              <button 
                onClick={() => remove(p.id)}
                className="h-8 w-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
