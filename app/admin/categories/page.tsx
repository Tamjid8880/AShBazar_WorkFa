"use client";

import { FormEvent, useEffect, useState } from "react";

type Category = { id: string; name: string; image: string };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  async function load() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addCategory(e: FormEvent) {
    e.preventDefault();
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
      <form className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:grid-cols-3" onSubmit={addCategory}>
        <input className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />
        <button className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white" type="submit">
          Add
        </button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <article key={c.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="aspect-video bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {c.image && c.image !== "no_url" ? <img src={c.image} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="p-4">
              <p className="font-semibold text-slate-900">{c.name}</p>
              <p className="truncate text-xs text-slate-500">{c.image}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
