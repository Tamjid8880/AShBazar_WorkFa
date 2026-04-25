"use client";

import { useEffect, useState } from "react";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [file, setFile] = useState<File | null>(null);

  async function load() {
    const res = await fetch("/api/blogs");
    const data = await res.json();
    setBlogs(data.data || []);
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

      await fetch("/api/blogs", {
        method: "POST",
        body: JSON.stringify({ 
          title: form.title, 
          description: form.description, 
          imageUrl 
        }),
      });

      setForm({ title: "", description: "" });
      setFile(null);
      load();
    } catch (err: any) {
      alert("Error adding blog");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this blog post?")) return;
    await fetch(`/api/blogs/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Blog Posts</h1>
        <p className="text-slate-500 font-medium">Create and manage content for your blog section.</p>
      </div>

      <form onSubmit={save} className="grid md:grid-cols-2 gap-6 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Post Title</label>
          <input
            className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Amazing recipe for Summer..."
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cover Image</label>
          <input
            type="file"
            className="w-full text-xs font-bold text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-slate-900 file:text-white file:uppercase hover:file:bg-slate-800"
            onChange={e => setFile(e.target.files?.[0] || null)}
            accept="image/*"
            required
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content / Description</label>
          <textarea
            className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium"
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            rows={5}
            required
            placeholder="Write your blog post content here..."
          />
        </div>
        <div className="md:col-span-2 mt-2">
          <button 
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 font-black text-white shadow-xl hover:opacity-95 transition disabled:opacity-50"
          >
            {loading ? "PUBLISHING..." : "PUBLISH BLOG POST"}
          </button>
        </div>
      </form>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((b) => (
          <div key={b.id} className="group relative overflow-hidden rounded-[32px] bg-white border border-slate-100 shadow-sm transition hover:shadow-xl">
            {b.imageUrl && (
              <div className="aspect-video bg-slate-50">
                <img src={b.imageUrl} alt={b.title} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-5">
              <div className="flex justify-between items-start gap-4">
                <p className="font-bold text-slate-900 line-clamp-2">{b.title}</p>
                <button 
                  onClick={() => remove(b.id)}
                  className="shrink-0 h-8 w-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-500 line-clamp-3">{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
