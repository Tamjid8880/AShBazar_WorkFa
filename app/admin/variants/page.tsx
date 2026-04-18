"use client";

import { FormEvent, useEffect, useState } from "react";

type VT = { id: string; name: string; type: string };
type V = { id: string; name: string; variantType?: { name: string } };

export default function AdminVariantsPage() {
  const [types, setTypes] = useState<VT[]>([]);
  const [variants, setVariants] = useState<V[]>([]);
  const [typeName, setTypeName] = useState("");
  const [typeUnit, setTypeUnit] = useState("kg");
  const [vName, setVName] = useState("");
  const [variantTypeId, setVariantTypeId] = useState("");

  useEffect(() => {
    void (async () => {
      const t = await fetch("/api/variantTypes").then((r) => r.json());
      const list = t.data ?? [];
      setTypes(list);
      setVariantTypeId((prev) => prev || list[0]?.id || "");
      const v = await fetch("/api/variants").then((r) => r.json());
      setVariants(v.data ?? []);
    })();
  }, []);

  async function addType(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/variantTypes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: typeName, type: typeUnit })
    });
    setTypeName("");
    const t = await fetch("/api/variantTypes").then((r) => r.json());
    const list = t.data ?? [];
    setTypes(list);
    setVariantTypeId((prev) => prev || list[0]?.id || "");
  }

  async function addVariant(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: vName, variantTypeId })
    });
    setVName("");
    const v = await fetch("/api/variants").then((r) => r.json());
    setVariants(v.data ?? []);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Variant types</h2>
        <p className="text-xs text-slate-500">e.g. name &quot;Weight&quot;, unit &quot;kg&quot; or &quot;L&quot;.</p>
        <form onSubmit={addType} className="flex flex-col gap-2 sm:flex-row">
          <input className="flex-1 rounded-xl border px-3 py-2 text-sm" placeholder="Name (Weight)" value={typeName} onChange={(e) => setTypeName(e.target.value)} required />
          <input className="w-24 rounded-xl border px-3 py-2 text-sm" placeholder="kg" value={typeUnit} onChange={(e) => setTypeUnit(e.target.value)} required />
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Add type
          </button>
        </form>
        <ul className="space-y-1 text-sm text-slate-600">
          {types.map((t) => (
            <li key={t.id}>
              {t.name} — <span className="text-orange-600">{t.type}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Variants</h2>
        <form onSubmit={addVariant} className="flex flex-col gap-2">
          <select className="rounded-xl border px-3 py-2 text-sm" value={variantTypeId} onChange={(e) => setVariantTypeId(e.target.value)}>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.type})
              </option>
            ))}
          </select>
          <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Variant label (e.g. 1 L)" value={vName} onChange={(e) => setVName(e.target.value)} required />
          <button type="submit" className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white">
            Add variant
          </button>
        </form>
        <ul className="max-h-64 space-y-1 overflow-auto text-sm text-slate-600">
          {variants.map((v) => (
            <li key={v.id}>
              {v.name} <span className="text-slate-400">({v.variantType?.name})</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
