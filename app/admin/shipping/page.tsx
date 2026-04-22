"use client";
import { useEffect, useState, Fragment } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type RateRow = { minValue: string; cost: string };
type FlatRate = { id: string; cost: number };
type ShippingRate = { id: string; minValue: number; cost: number };
type ShippingMethod = {
  id: string; name: string; zoneId: string;
  status: string; calculationType: string;
  flatRate: FlatRate | null; rates: ShippingRate[];
};
type ZoneCountry = { id: string; country: string };
type Zone = {
  id: string; name: string; status: string;
  countries: ZoneCountry[]; methods: ShippingMethod[];
};

const CALC_TYPES = [
  { value: "flat_rate", label: "Flat Rate" },
  { value: "price_based", label: "Price Based" },
  { value: "weight_based", label: "Weight Based" },
  { value: "api_based", label: "API Based" },
];

const COUNTRIES = [
  "Bangladesh","India","Pakistan","Nepal","Sri Lanka",
  "United States","United Kingdom","Canada","Australia","Germany",
  "France","Japan","China","Singapore","Malaysia","UAE","Saudi Arabia","Qatar",
];

const inputCls = "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-orange-400/30 bg-white";
const labelCls = "block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1";

// ─── Method Modal ─────────────────────────────────────────────────────────────
function MethodModal({
  zoneId, method, onClose, onSaved,
}: {
  zoneId: string;
  method: ShippingMethod | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(method?.name ?? "");
  const [status, setStatus] = useState(method?.status ?? "enabled");
  const [calcType, setCalcType] = useState(method?.calculationType ?? "flat_rate");
  const [flatCost, setFlatCost] = useState(String(method?.flatRate?.cost ?? ""));
  const [rows, setRows] = useState<RateRow[]>(
    method?.rates?.length
      ? method.rates.map((r) => ({ minValue: String(r.minValue), cost: String(r.cost) }))
      : [{ minValue: "0", cost: "" }]
  );
  const [saving, setSaving] = useState(false);

  function addRow() { setRows([...rows, { minValue: "", cost: "" }]); }
  function removeRow(i: number) { setRows(rows.filter((_, idx) => idx !== i)); }
  function updateRow(i: number, field: keyof RateRow, val: string) {
    setRows(rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  }

  async function save() {
    if (!name.trim()) return alert("Method name is required.");
    if (calcType === "flat_rate" && !flatCost) return alert("Flat cost is required.");
    setSaving(true);
    const body = { name, zoneId, status, calculationType: calcType, flatCost, rates: rows };
    const url = method ? `/api/shipping/methods/${method.id}` : "/api/shipping/methods";
    await fetch(url, {
      method: method ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">{method ? "Edit Method" : "Add Shipping Method"}</h2>
            <button onClick={onClose} className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 font-bold">✕</button>
          </div>

          {/* Name */}
          <div>
            <label className={labelCls}>Method Name</label>
            <input className={inputCls} placeholder="e.g. Standard Delivery" value={name} onChange={e => setName(e.target.value)} />
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <span className={labelCls + " mb-0"}>Status</span>
            <button
              type="button"
              onClick={() => setStatus(s => s === "enabled" ? "disabled" : "enabled")}
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${status === "enabled" ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${status === "enabled" ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className={`text-xs font-black uppercase ${status === "enabled" ? "text-emerald-600" : "text-slate-400"}`}>{status}</span>
          </div>

          {/* Calc Type */}
          <div>
            <label className={labelCls}>Calculation Type</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {CALC_TYPES.map(t => (
                <label key={t.value} className={`flex items-center gap-2 rounded-xl border px-4 py-3 cursor-pointer transition ${calcType === t.value ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <input type="radio" name="calcType" value={t.value} checked={calcType === t.value} onChange={() => setCalcType(t.value)} className="accent-orange-500" />
                  <span className="text-sm font-bold text-slate-700">{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Flat Rate */}
          {calcType === "flat_rate" && (
            <div>
              <label className={labelCls}>Flat Cost (৳)</label>
              <input type="number" className={inputCls} placeholder="e.g. 60" min="0" value={flatCost} onChange={e => setFlatCost(e.target.value)} />
            </div>
          )}

          {/* Tiered Rates */}
          {(calcType === "price_based" || calcType === "weight_based") && (
            <div>
              <label className={labelCls}>
                {calcType === "price_based" ? "Price Tiers (৳)" : "Weight Tiers (kg)"}
              </label>
              <div className="space-y-2 mt-1">
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-[10px] font-black uppercase text-slate-400 px-1">
                  <span>Min {calcType === "price_based" ? "Price" : "Weight"}</span>
                  <span>Shipping Cost</span>
                  <span />
                </div>
                {rows.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input type="number" className={inputCls} placeholder="0" min="0" value={row.minValue} onChange={e => updateRow(i, "minValue", e.target.value)} />
                    <input type="number" className={inputCls} placeholder="Cost" min="0" value={row.cost} onChange={e => updateRow(i, "cost", e.target.value)} />
                    <button onClick={() => removeRow(i)} className="h-9 w-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center text-sm font-black transition">✕</button>
                  </div>
                ))}
                <button onClick={addRow} className="flex items-center gap-2 text-xs font-black text-orange-600 hover:text-orange-700 mt-1">
                  <span className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center">+</span> Add Row
                </button>
              </div>
            </div>
          )}

          {calcType === "api_based" && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-400 font-semibold">
              🔗 API-based shipping will be configured via courier integration settings.
            </div>
          )}

          <button onClick={save} disabled={saving} className="w-full rounded-2xl bg-slate-900 text-white py-4 font-black hover:bg-slate-800 transition disabled:opacity-50">
            {saving ? "SAVING..." : method ? "UPDATE METHOD" : "ADD METHOD"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Zone Modal ───────────────────────────────────────────────────────────────
function ZoneModal({ zone, onClose, onSaved }: { zone: Zone | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(zone?.name ?? "");
  const [status, setStatus] = useState(zone?.status ?? "active");
  const [selected, setSelected] = useState<string[]>(zone?.countries.map(c => c.country) ?? []);
  const [custom, setCustom] = useState("");
  const [saving, setSaving] = useState(false);

  function toggle(c: string) {
    setSelected(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c]);
  }
  function addCustom() {
    const v = custom.trim();
    if (v && !selected.includes(v)) setSelected(s => [...s, v]);
    setCustom("");
  }

  async function save() {
    if (!name.trim()) return alert("Zone name is required.");
    if (selected.length === 0) return alert("Add at least one country.");
    setSaving(true);
    const body = { name: name.trim(), countries: selected, status };
    const url = zone ? `/api/shipping/zones/${zone.id}` : "/api/shipping/zones";
    await fetch(url, { method: zone ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh] p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">{zone ? "Edit Zone" : "Create Shipping Zone"}</h2>
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 font-bold">✕</button>
        </div>
        <div>
          <label className={labelCls}>Zone Name</label>
          <input className={inputCls} placeholder="e.g. Inside Dhaka" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <span className={labelCls + " mb-0"}>Status</span>
          <button type="button" onClick={() => setStatus(s => s === "active" ? "inactive" : "active")}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${status === "active" ? "bg-emerald-500" : "bg-slate-300"}`}>
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${status === "active" ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-xs font-black uppercase ${status === "active" ? "text-emerald-600" : "text-slate-400"}`}>{status}</span>
        </div>
        <div>
          <label className={labelCls}>Countries / Regions</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {selected.map(c => (
              <span key={c} className="flex items-center gap-1 bg-orange-100 text-orange-700 rounded-full px-3 py-1 text-xs font-black">
                {c}
                <button onClick={() => toggle(c)} className="text-orange-400 hover:text-orange-700 font-black ml-1">✕</button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto border border-slate-100 rounded-xl p-3">
            {COUNTRIES.map(c => (
              <button key={c} type="button" onClick={() => toggle(c)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${selected.includes(c) ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200 hover:border-orange-400"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input className={inputCls} placeholder="Custom country/region..." value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustom())} />
            <button onClick={addCustom} type="button" className="bg-slate-900 text-white px-4 rounded-xl text-xs font-black hover:bg-slate-800 transition">Add</button>
          </div>
        </div>
        <button onClick={save} disabled={saving} className="w-full rounded-2xl bg-slate-900 text-white py-4 font-black hover:bg-slate-800 transition disabled:opacity-50">
          {saving ? "SAVING..." : zone ? "UPDATE ZONE" : "CREATE ZONE"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminShippingPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editZone, setEditZone] = useState<Zone | null>(null);
  const [showMethodModal, setShowMethodModal] = useState<{ zoneId: string; method: ShippingMethod | null } | null>(null);
  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/shipping/zones");
    const data = await res.json();
    setZones(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function deleteZone(id: string) {
    if (!confirm("Delete this shipping zone and all its methods?")) return;
    await fetch(`/api/shipping/zones/${id}`, { method: "DELETE" });
    load();
  }

  async function deleteMethod(id: string) {
    if (!confirm("Delete this shipping method?")) return;
    await fetch(`/api/shipping/methods/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleMethodStatus(m: ShippingMethod) {
    await fetch(`/api/shipping/methods/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: m.status === "enabled" ? "disabled" : "enabled" }),
    });
    load();
  }

  const calcLabel = (t: string) => CALC_TYPES.find(c => c.value === t)?.label ?? t;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Shipping Settings</h1>
          <p className="text-slate-500 font-medium mt-0.5">Configure zones, methods, and pricing rules.</p>
        </div>
        <button
          onClick={() => { setEditZone(null); setShowZoneModal(true); }}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-800 transition shadow-lg"
        >
          + New Zone
        </button>
      </div>

      {/* Zone List */}
      {loading ? (
        <div className="rounded-[32px] border border-slate-100 bg-white p-16 text-center text-slate-400 font-bold animate-pulse">Loading shipping zones...</div>
      ) : zones.length === 0 ? (
        <div className="rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50 p-20 text-center">
          <p className="text-4xl mb-3">🚚</p>
          <p className="font-black text-slate-700 text-lg">No shipping zones yet</p>
          <p className="text-slate-400 text-sm mt-1 font-medium">Create your first zone to get started.</p>
          <button onClick={() => { setEditZone(null); setShowZoneModal(true); }} className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-slate-800 transition">
            + Create First Zone
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {zones.map(zone => (
            <div key={zone.id} className="rounded-[28px] border border-slate-100 bg-white shadow-sm overflow-hidden">
              {/* Zone Header */}
              <div className="flex items-center justify-between px-7 py-5 cursor-pointer hover:bg-slate-50 transition" onClick={() => setExpandedZone(expandedZone === zone.id ? null : zone.id)}>
                <div className="flex items-center gap-4">
                  <div className={`h-2.5 w-2.5 rounded-full ${zone.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <div>
                    <p className="font-black text-slate-900 text-base">{zone.name}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      {zone.countries.map(c => c.country).join(", ") || "No countries"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {zone.methods.length} method{zone.methods.length !== 1 ? "s" : ""}
                  </span>
                  <button onClick={e => { e.stopPropagation(); setEditZone(zone); setShowZoneModal(true); }}
                    className="text-xs font-black text-slate-500 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition">Edit</button>
                  <button onClick={e => { e.stopPropagation(); deleteZone(zone.id); }}
                    className="text-xs font-black text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">Delete</button>
                  <span className="text-slate-300 font-black">{expandedZone === zone.id ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Methods */}
              {expandedZone === zone.id && (
                <div className="border-t border-slate-100 px-7 py-5 space-y-4 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Shipping Methods</p>
                    <button
                      onClick={() => setShowMethodModal({ zoneId: zone.id, method: null })}
                      className="text-xs font-black text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100 transition"
                    >
                      + Add Method
                    </button>
                  </div>

                  {zone.methods.length === 0 ? (
                    <p className="text-sm text-slate-400 font-semibold py-4 text-center">No methods yet. Add one above.</p>
                  ) : (
                    <div className="space-y-3">
                      {zone.methods.map(m => (
                        <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <p className="font-black text-slate-900">{m.name}</p>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${m.status === "enabled" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                {m.status}
                              </span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                {calcLabel(m.calculationType)}
                              </span>
                            </div>
                            {/* Rate preview */}
                            {m.calculationType === "flat_rate" && m.flatRate && (
                              <p className="text-sm text-slate-600 font-semibold">Fixed: <span className="font-black text-slate-900">৳{m.flatRate.cost}</span></p>
                            )}
                            {["price_based", "weight_based"].includes(m.calculationType) && m.rates.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {m.rates.map((r, i) => (
                                  <span key={r.id} className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
                                    From {m.calculationType === "weight_based" ? `${r.minValue}kg` : `৳${r.minValue}`} → ৳{r.cost}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => toggleMethodStatus(m)}
                              className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition ${m.status === "enabled" ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}>
                              {m.status === "enabled" ? "Disable" : "Enable"}
                            </button>
                            <button onClick={() => setShowMethodModal({ zoneId: zone.id, method: m })}
                              className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition">Edit</button>
                            <button onClick={() => deleteMethod(m.id)}
                              className="text-[10px] font-black uppercase bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Zone Modal */}
      {showZoneModal && (
        <ZoneModal
          zone={editZone}
          onClose={() => { setShowZoneModal(false); setEditZone(null); }}
          onSaved={load}
        />
      )}

      {/* Method Modal */}
      {showMethodModal && (
        <MethodModal
          zoneId={showMethodModal.zoneId}
          method={showMethodModal.method}
          onClose={() => setShowMethodModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
