"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Cat = { id: string; name: string };
type Brand = { id: string; name: string };

type Props = {
  categories: Cat[];
  brands: Brand[];
  logoUrl?: string | null;
  compact?: boolean;
  search?: { q?: string; categoryId?: string; brandId?: string };
};

export default function StoreHeader({ categories, brands, logoUrl, compact, search }: Props) {
  const q = search?.q ?? "";
  const categoryId = search?.categoryId ?? "";
  const brandId = search?.brandId ?? "";

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
      } catch {}
    };
    
    updateCart();
    
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        // @ts-ignore
        originalSetItem.apply(this, arguments);
        if (key === "cart") updateCart();
    };

    window.addEventListener("storage", updateCart);
    return () => {
        window.removeEventListener("storage", updateCart);
        localStorage.setItem = originalSetItem;
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          <Link href="/shop" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            {logoUrl ? (
               <img src={logoUrl} alt="AshBazar" className="h-10 object-contain" />
            ) : (
               <>
                 <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-black text-white">
                   A
                 </span>
                 AshBazar
               </>
            )}
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium text-slate-600 md:flex">
            <Link href="/shop" className="hover:text-orange-600">
              Catalog
            </Link>
            <Link href="/admin" className="font-bold text-slate-900 border-x border-slate-200 px-4 hover:text-orange-600">
               ADMIN DASHBOARD
            </Link>
            <Link href="/cart" className="hover:text-orange-600">
              Cart
            </Link>
            <Link href="/checkout" className="hover:text-orange-600">
              Checkout
            </Link>
            <Link href="/profile" className="font-bold text-orange-600 border-l border-slate-200 pl-4 hover:text-orange-700">
               PROFILE
            </Link>
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-black text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-orange-300 hover:text-orange-700"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            Register
          </Link>
        </div>
      </div>
      {!compact && (
        <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3">
          <form action="/shop" method="get" className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Search</label>
              <input
                name="q"
                defaultValue={q}
                placeholder="Search by product name…"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-orange-500/30 focus:ring-2"
              />
            </div>
            <div className="w-full md:w-48">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Category</label>
              <select
                name="category"
                defaultValue={categoryId}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-orange-500/30 focus:ring-2"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-48">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Brand</label>
              <select
                name="brand"
                defaultValue={brandId}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-orange-500/30 focus:ring-2"
              >
                <option value="">All brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 md:mb-0"
            >
              Apply
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
