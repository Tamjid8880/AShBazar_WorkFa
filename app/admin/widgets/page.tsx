"use client";

import { useEffect, useState } from "react";

// ─── section definitions ──────────────────────────────────────────
const SECTIONS = [
  { id: "hero_carousel",    label: "🖼 Hero Carousel",           multi: true  },
  { id: "hot_deals",        label: "🔥 Hot Deals Banner",        multi: false },
  { id: "secondary_banner", label: "📌 Secondary Promo Banners", multi: true, maxItems: 2 },
  { id: "special_offer",    label: "⭐ Special Offer Banner",     multi: false },
  { id: "why_choose_us",    label: "✅ Why Choose Us",           multi: false },
];

// ─── helpers ──────────────────────────────────────────────────────
async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res  = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!data.success) throw new Error("Upload failed");
  return data.url;
}

// ─── Why Choose Us sub-form ───────────────────────────────────────
function WhyChooseUsForm({ existing, onSaved }: { existing: any | null; onSaved: () => void }) {
  const [form, setForm] = useState({
    title:         existing?.title       || "",
    description:   existing?.description || "",
    bullet1:       existing?.meta?.bullet1 || "100% Fresh & Natural Products",
    bullet2:       existing?.meta?.bullet2 || "Direct from Farmers",
    bullet3:       existing?.meta?.bullet3 || "Fast & Safe Delivery",
    bullet4:       existing?.meta?.bullet4 || "Certified Organic Range",
    totalProducts: existing?.meta?.totalProducts  || "500+",
    totalCategories: existing?.meta?.totalCategories || "50+",
    happyCustomers:  existing?.meta?.happyCustomers  || "10K+",
    satisfactionRate: existing?.meta?.satisfactionRate || "99",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        id:          existing?.id,
        section:     "why_choose_us",
        title:       form.title,
        description: form.description,
        meta: {
          bullet1:          form.bullet1,
          bullet2:          form.bullet2,
          bullet3:          form.bullet3,
          bullet4:          form.bullet4,
          totalProducts:    form.totalProducts,
          totalCategories:  form.totalCategories,
          happyCustomers:   form.happyCustomers,
          satisfactionRate: form.satisfactionRate,
        },
      };
      await fetch("/api/widgets", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      setMsg("✓ Saved!");
      onSaved();
    } catch (err: any) {
      setMsg("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const field = (label: string, key: keyof typeof form, placeholder = "") => (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <input
        className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-medium text-sm"
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <form onSubmit={save} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section Heading</label>
          <input
            className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. We Provide the Freshest & Best Quality Groceries"
          />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtitle / Description</label>
          <textarea
            className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium"
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            rows={2} placeholder="Short paragraph below the heading..."
          />
        </div>

        <div className="md:col-span-2">
          <p className="text-[11px] font-black uppercase tracking-widest text-orange-500 mb-3">✓ Bullet Points (4 check-items)</p>
          <div className="grid md:grid-cols-2 gap-4">
            {field("Bullet 1", "bullet1", "100% Fresh & Natural Products")}
            {field("Bullet 2", "bullet2", "Direct from Farmers")}
            {field("Bullet 3", "bullet3", "Fast & Safe Delivery")}
            {field("Bullet 4", "bullet4", "Certified Organic Range")}
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="text-[11px] font-black uppercase tracking-widest text-orange-500 mb-3">📊 Stats Cards (4 numbers on right side)</p>
          <div className="grid md:grid-cols-4 gap-4">
            {field("Total Products", "totalProducts", "500+")}
            {field("Product Categories", "totalCategories", "50+")}
            {field("Happy Customers", "happyCustomers", "10K+")}
            {field("Satisfaction Rate (%)", "satisfactionRate", "99")}
          </div>
          <p className="mt-2 text-xs text-slate-400">Satisfaction rate will show as "{form.satisfactionRate}%" on the storefront.</p>
        </div>
      </div>

      {msg && <p className={`text-sm font-bold ${msg.startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>{msg}</p>}
      <button
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 font-black text-white shadow-xl hover:opacity-95 transition disabled:opacity-50"
      >
        {loading ? "SAVING..." : "SAVE WHY CHOOSE US"}
      </button>
    </form>
  );
}

// ─── Standard image widget form ───────────────────────────────────
function WidgetForm({
  section, label, onSaved, showDiscount = false, slotLabel,
}: {
  section: string; label: string; onSaved: () => void; showDiscount?: boolean; slotLabel?: string;
}) {
  const [form, setForm]   = useState({ title: "", description: "", discount: "" });
  const [file, setFile]   = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl: string | null = null;
      if (file) imageUrl = await uploadFile(file);

      const meta: any = {};
      if (showDiscount && form.discount) meta.discount = Number(form.discount);

      await fetch("/api/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, title: form.title, description: form.description, imageUrl, meta: Object.keys(meta).length ? meta : null }),
      });
      setForm({ title: "", description: "", discount: "" });
      setFile(null);
      onSaved();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={save} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-4">
      {slotLabel && (
        <p className="text-[11px] font-black uppercase tracking-widest text-orange-500">{slotLabel}</p>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</label>
          <input className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold text-sm"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Banner headline…" />
        </div>
        {showDiscount && (
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount % (optional)</label>
            <input type="number" min="0" max="100"
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold text-sm"
              value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} placeholder="e.g. 30" />
          </div>
        )}
        <div className={`space-y-1 ${!showDiscount ? "md:col-span-1" : "md:col-span-2"}`}>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Image</label>
          <input type="file" accept="image/*"
            className="w-full text-xs font-bold text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-slate-900 file:text-white file:uppercase hover:file:bg-slate-800"
            onChange={e => setFile(e.target.files?.[0] || null)} required />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description (optional)</label>
          <textarea className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium"
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            rows={2} placeholder="Short subtitle text…" />
        </div>
      </div>
      <button disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 font-black text-white shadow-xl hover:opacity-95 transition disabled:opacity-50">
        {loading ? "UPLOADING…" : `ADD ${label.toUpperCase()}`}
      </button>
    </form>
  );
}

// ─── Widget card ──────────────────────────────────────────────────
function WidgetCard({ w, onDelete }: { w: any; onDelete: () => void }) {
  return (
    <div className="group relative overflow-hidden rounded-[32px] bg-white border border-slate-100 shadow-sm transition hover:shadow-xl">
      {w.imageUrl && (
        <div className="aspect-[16/9] bg-slate-50">
          <img src={w.imageUrl} alt={w.title || "Widget"} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-5 flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 truncate">{w.title || "(No Title)"}</p>
          {w.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{w.description}</p>}
          {w.meta && <p className="text-[10px] font-mono text-orange-500 mt-2 break-all line-clamp-2">{JSON.stringify(w.meta)}</p>}
        </div>
        <button
          onClick={onDelete}
          className="shrink-0 h-8 w-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition text-sm font-bold"
        >✕</button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────
export default function AdminWidgetsPage() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [widgets, setWidgets] = useState<any[]>([]);

  const secDef = SECTIONS.find(s => s.id === activeSection)!;

  async function load() {
    const res  = await fetch(`/api/widgets?section=${activeSection}`);
    const data = await res.json();
    setWidgets(data.data || []);
  }

  useEffect(() => { load(); }, [activeSection]);

  async function remove(id: string) {
    if (!confirm("Delete this widget?")) return;
    await fetch(`/api/widgets/${id}`, { method: "DELETE" });
    load();
  }

  // ── secondary banners — show two named slots ──────────────────
  const secondary = activeSection === "secondary_banner";
  const banner1 = widgets[0] || null;
  const banner2 = widgets[1] || null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Frontend Widgets</h1>
        <p className="text-slate-500 font-medium mt-1">Manage dynamic content sections shown on the storefront.</p>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 flex-wrap">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${
              activeSection === s.id
                ? "bg-orange-500 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-orange-50"
            }`}
          >{s.label}</button>
        ))}
      </div>

      {/* ── WHY CHOOSE US — special form ── */}
      {activeSection === "why_choose_us" && (
        <>
          <WhyChooseUsForm existing={widgets[0] || null} onSaved={load} />
          {widgets.length > 0 && (
            <div className="grid gap-6">
              {widgets.map(w => <WidgetCard key={w.id} w={w} onDelete={() => remove(w.id)} />)}
            </div>
          )}
        </>
      )}

      {/* ── SECONDARY BANNER — two named slots ── */}
      {secondary && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 text-sm text-amber-800 font-medium">
            📐 <strong>Secondary Promo Banners</strong> — The storefront shows exactly <strong>2 side-by-side banners</strong>.
            Add Banner&nbsp;1 first (left, light green), then Banner&nbsp;2 (right, dark green).
          </div>

          {/* Banner 1 slot */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-[#e8f5e9] text-[#2e7d32] font-black text-sm flex items-center justify-center">1</span>
              <h3 className="font-bold text-slate-900">Left Banner (Light Green)</h3>
              {banner1 && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Set</span>}
            </div>
            {banner1
              ? <WidgetCard w={banner1} onDelete={() => remove(banner1.id)} />
              : <WidgetForm section="secondary_banner" label="Left Banner" onSaved={load} showDiscount slotLabel="Upload image for LEFT (light green) banner" />
            }
          </div>

          {/* Banner 2 slot */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-[#1c3a1c] text-white font-black text-sm flex items-center justify-center">2</span>
              <h3 className="font-bold text-slate-900">Right Banner (Dark Green)</h3>
              {banner2 && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Set</span>}
            </div>
            {banner2
              ? <WidgetCard w={banner2} onDelete={() => remove(banner2.id)} />
              : <WidgetForm section="secondary_banner" label="Right Banner" onSaved={load} showDiscount slotLabel="Upload image for RIGHT (dark green) banner" />
            }
          </div>
        </div>
      )}

      {/* ── ALL OTHER SECTIONS ── */}
      {!secondary && activeSection !== "why_choose_us" && (
        <div className="space-y-6">
          {/* Only show add-form if multi OR no items yet */}
          {(secDef.multi || widgets.length === 0) && (
            <WidgetForm
              section={activeSection}
              label={secDef.label}
              onSaved={load}
              showDiscount={["hot_deals", "special_offer"].includes(activeSection)}
            />
          )}
          {!secDef.multi && widgets.length > 0 && (
            <div className="text-sm text-slate-500 bg-slate-50 rounded-2xl px-5 py-3 border border-slate-100">
              ℹ️ This section supports <strong>1 widget</strong>. Delete the current one to replace it.
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {widgets.map(w => <WidgetCard key={w.id} w={w} onDelete={() => remove(w.id)} />)}
          </div>
        </div>
      )}
    </div>
  );
}
