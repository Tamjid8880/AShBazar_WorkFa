"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type WishlistItem = {
  id:     string;
  name:   string;
  price:  number;
  imgUrl: string;
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setItems(saved);
    } catch {}
  }, []);

  function remove(id: string) {
    const next = items.filter(i => i.id !== id);
    setItems(next);
    localStorage.setItem("wishlist", JSON.stringify(next));
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5] py-12">
      <div className="container-main max-w-4xl">
        <h1 className="mb-6 font-heading text-3xl font-bold text-gray-900">My Wishlist</h1>

        {items.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <svg className="mx-auto mb-4 h-16 w-16 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            <h2 className="text-xl font-bold text-gray-800">Your wishlist is empty</h2>
            <p className="mt-2 text-gray-500">Save your favorite items here to buy them later.</p>
            <Link href="/shop" className="mt-6 inline-block rounded-md bg-[#ff6f00] px-6 py-2.5 font-semibold text-white transition hover:bg-[#e65100]">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {items.map(item => (
              <div key={item.id} className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md">
                <Link href={`/products/${item.id}`} className="block aspect-[4/3] overflow-hidden bg-[#f7f8f3] p-3">
                  {item.imgUrl ? (
                    <img src={item.imgUrl} alt={item.name} className="h-full w-full rounded-xl object-cover transition group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-300">No image</div>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <Link href={`/products/${item.id}`} className="line-clamp-2 text-sm font-bold text-gray-800 transition group-hover:text-[#2e7d32]">
                    {item.name}
                  </Link>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-[#ff6f00]">৳{item.price.toFixed(2)}</span>
                    <button
                      onClick={() => remove(item.id)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
