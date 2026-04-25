"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Cat  = { id: string; name: string };
type Brand = { id: string; name: string };
type Sub   = { id: string; name: string };

type Props = {
  categories:      Cat[];
  brands:          Brand[];
  subCategories:   Sub[];
  currentCategory: string;
  currentBrand:    string;
  currentSub:      string;
  currentMin?:     number;
  currentMax?:     number;
  currentSort:     string;
  currentQ:        string;
};

const FilterIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between py-3 text-sm font-bold text-gray-800 hover:text-[#2e7d32] transition"
      >
        {title}
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <ChevronDown />
        </span>
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}

export default function ShopFiltersClient({
  categories, brands, subCategories,
  currentCategory, currentBrand, currentSub,
  currentMin, currentMax, currentSort, currentQ,
}: Props) {
  const router = useRouter();

  const [selectedCat,   setSelectedCat]   = useState(currentCategory);
  const [selectedBrand, setSelectedBrand] = useState(currentBrand);
  const [selectedSub,   setSelectedSub]   = useState(currentSub);
  const [minPrice,      setMinPrice]       = useState(currentMin?.toString() ?? "");
  const [maxPrice,      setMaxPrice]       = useState(currentMax?.toString() ?? "");
  const [mobileOpen,    setMobileOpen]     = useState(false);

  function buildUrl(overrides: Record<string, string> = {}) {
    const params = new URLSearchParams();
    const cat   = overrides.category   ?? selectedCat;
    const brand = overrides.brand      ?? selectedBrand;
    const sub   = overrides.sub        ?? selectedSub;
    const min   = overrides.minPrice   ?? minPrice;
    const max   = overrides.maxPrice   ?? maxPrice;
    const sort  = overrides.sort       ?? currentSort;
    const q     = overrides.q          ?? currentQ;

    if (q)     params.set("q",        q);
    if (cat)   params.set("category", cat);
    if (brand) params.set("brand",    brand);
    if (sub)   params.set("sub",      sub);
    if (min)   params.set("minPrice", min);
    if (max)   params.set("maxPrice", max);
    if (sort && sort !== "newest") params.set("sort", sort);

    return `/shop${params.toString() ? `?${params.toString()}` : ""}`;
  }

  function applyFilters() {
    router.push(buildUrl());
    setMobileOpen(false);
  }

  function clearAll() {
    setSelectedCat("");
    setSelectedBrand("");
    setSelectedSub("");
    setMinPrice("");
    setMaxPrice("");
    router.push("/shop");
    setMobileOpen(false);
  }

  const hasActiveFilters = selectedCat || selectedBrand || selectedSub || minPrice || maxPrice;

  const filtersContent = (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
          <FilterIcon />
          Filters
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-600 transition"
          >
            <XIcon /> Clear All
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => { setSelectedCat(""); setSelectedSub(""); }}
              className={`w-full text-left px-2 py-1.5 text-sm rounded transition ${
                !selectedCat ? "text-[#4caf50] font-semibold" : "text-gray-600 hover:text-[#4caf50]"
              }`}
            >
              All Categories
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat.id}>
              <button
                onClick={() => { setSelectedCat(cat.id); setSelectedSub(""); }}
                className={`w-full text-left px-2 py-1.5 text-sm rounded transition flex items-center justify-between ${
                  selectedCat === cat.id ? "text-[#4caf50] font-semibold bg-[#e8f5e9]" : "text-gray-600 hover:text-[#4caf50] hover:bg-[#f5f7f5]"
                }`}
              >
                {cat.name}
                {selectedCat === cat.id && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4caf50]" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Sub Category */}
      {subCategories.length > 0 && (
        <FilterSection title="Sub Category" defaultOpen={false}>
          <ul className="space-y-1">
            {subCategories.map(sub => (
              <li key={sub.id}>
                <label className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-[#f5f7f5] transition">
                  <input
                    type="checkbox"
                    checked={selectedSub === sub.id}
                    onChange={() => setSelectedSub(selectedSub === sub.id ? "" : sub.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">{sub.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Brand */}
      {brands.length > 0 && (
        <FilterSection title="Brand" defaultOpen={false}>
          <ul className="space-y-1">
            {brands.map(brand => (
              <li key={brand.id}>
                <label className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-[#f5f7f5] transition">
                  <input
                    type="checkbox"
                    checked={selectedBrand === brand.id}
                    onChange={() => setSelectedBrand(selectedBrand === brand.id ? "" : brand.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">{brand.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range" defaultOpen={true}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-400">Min ৳</label>
              <input
                type="number"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder="0"
                min={0}
                className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4caf50] focus:ring-1 focus:ring-[#4caf50]/20"
              />
            </div>
            <span className="mt-5 text-gray-300 font-bold">—</span>
            <div className="flex-1">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-400">Max ৳</label>
              <input
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="5000"
                min={0}
                className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4caf50] focus:ring-1 focus:ring-[#4caf50]/20"
              />
            </div>
          </div>
          {(minPrice || maxPrice) && (
            <p className="text-[10px] text-[#4caf50] font-semibold">
              ৳{minPrice || "0"} — ৳{maxPrice || "∞"}
            </p>
          )}
        </div>
      </FilterSection>

      {/* Sort (mobile only) */}
      <FilterSection title="Sort By" defaultOpen={false}>
        <div className="space-y-1">
          {[
            { val: "newest",     lbl: "Newest" },
            { val: "price_asc",  lbl: "Price: Low → High" },
            { val: "price_desc", lbl: "Price: High → Low" },
            { val: "popular",    lbl: "Popular" },
          ].map(s => (
            <button
              key={s.val}
              onClick={() => router.push(buildUrl({ sort: s.val }))}
              className={`w-full text-left px-2 py-1.5 text-sm rounded transition ${
                currentSort === s.val
                  ? "text-[#4caf50] font-semibold bg-[#e8f5e9]"
                  : "text-gray-600 hover:text-[#4caf50] hover:bg-[#f5f7f5]"
              }`}
            >
              {s.lbl}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Apply button */}
      <div className="pt-4">
        <button
          onClick={applyFilters}
          className="w-full rounded-md bg-[#4caf50] py-2.5 text-sm font-bold text-white hover:bg-[#2e7d32] transition shadow-green"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-md border border-[#4caf50] bg-white px-4 py-2 text-sm font-semibold text-[#4caf50] hover:bg-[#e8f5e9] transition"
        >
          <FilterIcon /> Filters {hasActiveFilters && <span className="rounded-full bg-[#ff6f00] px-1.5 py-0.5 text-[10px] text-white font-black">!</span>}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto h-full w-72 overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Filters</h2>
              <button onClick={() => setMobileOpen(false)} className="rounded-full p-1 hover:bg-gray-100 transition">
                <XIcon />
              </button>
            </div>
            {filtersContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 self-start sticky top-24">
        <div className="rounded-lg bg-white p-5 shadow-card border border-gray-100">
          {filtersContent}
        </div>
      </aside>
    </>
  );
}
