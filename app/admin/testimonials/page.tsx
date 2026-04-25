"use client";

import { useEffect, useState } from "react";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", review: "", rating: 5 });
  const [file, setFile] = useState<File | null>(null);

  async function load() {
    const res = await fetch("/api/testimonials");
    const data = await res.json();
    setItems(data.data || []);
  }

  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) throw new Error("Upload failed");
        imageUrl = uploadData.url;
      }

      await fetch("/api/testimonials", {
        method: "POST",
        body: JSON.stringify({ 
          name: form.name, 
          review: form.review, 
          rating: form.rating,
          imageUrl 
        }),
      });

      setForm({ name: "", review: "", rating: 5 });
      setFile(null);
      load();
    } catch (err: any) {
      alert("Error saving testimonial");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Testimonials</h1>
        <p className="text-slate-500 font-medium">Manage customer reviews shown on the storefront.</p>
      </div>

      <form onSubmit={save} className="grid md:grid-cols-2 gap-6 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Name</label>
          <input
            className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating (1-5)</label>
          <input
            type="number"
            min="1" max="5"
            className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold"
            value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Avatar (Optional)</label>
          <input
            type="file"
            className="w-full text-xs font-bold text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-slate-900 file:text-white file:uppercase hover:file:bg-slate-800"
            onChange={e => setFile(e.target.files?.[0] || null)}
            accept="image/*"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Review Text</label>
          <textarea
            className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium"
            value={form.review} onChange={e => setForm({ ...form, review: e.target.value })}
            rows={3}
            required
            placeholder="What did they say?"
          />
        </div>
        <div className="md:col-span-2 mt-2">
          <button 
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 font-black text-white shadow-xl hover:opacity-95 transition disabled:opacity-50"
          >
            {loading ? "SAVING..." : "ADD TESTIMONIAL"}
          </button>
        </div>
      </form>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <div key={t.id} className="relative overflow-hidden rounded-[32px] bg-white border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {t.imageUrl ? (
                  <img src={t.imageUrl} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900 leading-tight">{t.name}</p>
                  <p className="text-xs text-orange-500">{"★".repeat(t.rating)}{"☆".repeat(5-t.rating)}</p>
                </div>
              </div>
              <button 
                onClick={() => remove(t.id)}
                className="h-8 w-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-600 italic">"{t.review}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}
