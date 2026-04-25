"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { firstProductImageUrl } from "@/lib/product-images";

type Props = {
  id:             string;
  name:           string;
  price:          number;
  offerPrice?:    number | null;
  categoryName?:  string;
  images:         unknown;
  quantity:       number;
  variants?:      { stock: number }[];
  isHotDeal?:     boolean;
  isSpecialOffer?: boolean;
};

/* ── Basket icon exactly like Figma ─────────────────────────── */
const BasketIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

export default function EcoProductCard({
  id, name, price, offerPrice, categoryName, images, quantity, variants = [], isHotDeal, isSpecialOffer,
}: Props) {
  const imgUrl      = firstProductImageUrl(images);
  const totalStock  = variants.length > 0 ? variants.reduce((s, v) => s + v.stock, 0) : quantity;
  const isOutOfStock = totalStock <= 0;
  const effectivePrice = offerPrice ?? price;
  const hasDiscount    = offerPrice != null && offerPrice < price;
  const discountPct    = hasDiscount ? Math.round(((price - offerPrice!) / price) * 100) : 0;

  const [qty,     setQty]     = useState(1);
  const [added,   setAdded]   = useState(false);
  const [wishlist,setWishlist]= useState(false);

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlist(items.some((i: any) => i.id === id));
    } catch {}
  }, [id]);

  function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      let items = JSON.parse(localStorage.getItem("wishlist") || "[]");
      if (wishlist) {
        items = items.filter((i: any) => i.id !== id);
        setWishlist(false);
      } else {
        items.push({ id, name, price: effectivePrice, imgUrl });
        setWishlist(true);
      }
      localStorage.setItem("wishlist", JSON.stringify(items));
    } catch {}
  }

  function addToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const lid  = `${id}::default`;
      const idx  = cart.findIndex((r: any) => r.lineId === lid);
      if (idx < 0) {
        cart.push({ lineId: lid, productId: id, name, price: effectivePrice, quantity: qty, imageUrl: imgUrl, maxStock: totalStock });
      } else {
        cart[idx].quantity = Math.min(cart[idx].quantity + qty, totalStock);
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {}
  }

  function changeQty(e: React.MouseEvent, delta: number) {
    e.preventDefault();
    e.stopPropagation();
    setQty(q => Math.max(1, Math.min(totalStock || 1, q + delta)));
  }

  return (
    <Link
      href={`/products/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.13)] transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* ── Image ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl mx-3 mt-3 aspect-[4/3] bg-[#f7f8f3]">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300 text-sm">No image</div>
        )}

        {/* ── Sale badge top-left ──────────────────────────── */}
        {(isHotDeal || hasDiscount || isSpecialOffer) && (
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {isHotDeal && (
              <span className="rounded bg-[#ff6f00] px-2 py-0.5 text-[10px] font-black uppercase text-white leading-tight">Sale</span>
            )}
            {hasDiscount && !isHotDeal && (
              <span className="rounded bg-[#ff6f00] px-2 py-0.5 text-[10px] font-black uppercase text-white leading-tight">-{discountPct}%</span>
            )}
            {isSpecialOffer && !isHotDeal && (
              <span className="rounded bg-[#4caf50] px-2 py-0.5 text-[10px] font-black uppercase text-white leading-tight">Hot</span>
            )}
          </div>
        )}

        {/* ── Out of stock ─────────────────────────────────── */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl">
            <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-bold text-white">Sold Out</span>
          </div>
        )}

        {/* ── Wishlist heart ───────────────────────────────── */}
        <button
          onClick={toggleWishlist}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-110"
          aria-label="Wishlist"
        >
          <svg width="13" height="13" fill={wishlist ? "#4caf50" : "none"} stroke={wishlist ? "#4caf50" : "#9ca3af"} strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
      </div>

      {/* ── Info ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-4 pt-3 pb-4 gap-1">

        {/* Category */}
        {categoryName && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#4caf50]">
            {categoryName}
          </p>
        )}

        {/* Name */}
        <h3 className="line-clamp-2 text-sm font-bold text-gray-800 leading-snug group-hover:text-[#2e7d32] transition">
          {name}
        </h3>

        {/* Price */}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-bold text-[#ff6f00]">
            ৳{effectivePrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">৳{price.toFixed(2)}</span>
          )}
        </div>

        {/* ── Qty control + basket ─────────────────────────── */}
        <div className="mt-3 flex items-center justify-between">
          {/* Qty stepper — exactly like Figma */}
          <div className="flex items-center rounded-sm border border-gray-200 overflow-hidden h-7">
            <button
              onClick={e => changeQty(e, -1)}
              disabled={qty <= 1 || isOutOfStock}
              className="flex h-full w-7 items-center justify-center bg-white text-gray-800 hover:text-[#ff6f00] disabled:opacity-30 transition text-sm font-bold"
            >
              −
            </button>
            <span className="flex h-full w-7 items-center justify-center bg-gray-200 text-sm font-bold text-gray-800 select-none">
              {qty}
            </span>
            <button
              onClick={e => changeQty(e, 1)}
              disabled={qty >= totalStock || isOutOfStock}
              className="flex h-full w-7 items-center justify-center bg-white text-gray-800 hover:text-[#ff6f00] disabled:opacity-30 transition text-sm font-bold"
            >
              +
            </button>
          </div>

          {/* Basket button */}
          <button
            onClick={addToCart}
            disabled={isOutOfStock}
            aria-label="Add to cart"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
              added
                ? "bg-[#4caf50] text-white scale-90"
                : isOutOfStock
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#ffe0b2] text-[#ff6f00] hover:bg-[#ffcc80] hover:scale-110"
            }`}
          >
            {added ? (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <BasketIcon />
            )}
          </button>
        </div>

      </div>
    </Link>
  );
}
