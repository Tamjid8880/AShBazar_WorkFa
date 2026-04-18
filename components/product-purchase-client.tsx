"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { firstProductImageUrl, parseProductImages } from "@/lib/product-images";

type ProductVariant = {
  id: string;
  variantId: string;
  price: number;
  offerPrice: number | null;
  stock: number;
  variant: { name: string };
};

type Props = {
  productId: string;
  name: string;
  description: string | null;
  basePrice: number;
  baseOfferPrice: number | null;
  baseStock: number;
  imagesJson: unknown;
  productVariants: ProductVariant[];
};

function lineId(productId: string, variantRecordId: string | null) {
  return `${productId}::${variantRecordId ?? "default"}`;
}

export default function ProductPurchaseClient({
  productId,
  name,
  description,
  basePrice,
  baseOfferPrice,
  baseStock,
  imagesJson,
  productVariants,
}: Props) {
  const allImages = parseProductImages(imagesJson);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const heroUrl = allImages[selectedImgIdx]?.url || firstProductImageUrl(imagesJson);

  const [selectedVariantRecordId, setSelectedVariantRecordId] = useState<string | null>(
    productVariants[0]?.id ?? null
  );
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");

  const activeVariant = useMemo(
    () => productVariants.find((pv) => pv.id === selectedVariantRecordId),
    [selectedVariantRecordId, productVariants]
  );

  const displayPrice = activeVariant ? activeVariant.price : basePrice;
  const displayOfferPrice = activeVariant ? activeVariant.offerPrice : baseOfferPrice;
  const effectivePrice = displayOfferPrice ?? displayPrice;
  const maxStock = activeVariant ? activeVariant.stock : baseStock;

  const variantLabel = activeVariant ? activeVariant.variant.name : undefined;

  function persistCart(next: any[]) {
    localStorage.setItem("cart", JSON.stringify(next));
  }

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem("cart") ?? "[]");
    } catch {
      return [];
    }
  }

  function addToCart(goCheckout: boolean) {
    if (productVariants.length > 0 && !selectedVariantRecordId) {
      setMsg("Please select an option.");
      return;
    }
    if (maxStock <= 0) {
      setMsg("Out of stock.");
      return;
    }
    const take = Math.min(qty, maxStock);
    const lid = lineId(productId, selectedVariantRecordId);
    const cart = readCart();
    const idx = cart.findIndex((r: any) => r.lineId === lid);
    if (idx >= 0) cart[idx].quantity += take;
    else {
      cart.push({
        lineId: lid,
        productId,
        name,
        price: effectivePrice,
        quantity: take,
        variantId: selectedVariantRecordId,
        variantLabel,
        imageUrl: heroUrl,
      });
    }
    persistCart(cart);
    setMsg(goCheckout ? "Added — opening checkout…" : "Added to cart.");
    if (goCheckout) window.location.href = "/checkout";
  }

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      {/* IMAGES */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-[32px] border border-slate-100 bg-slate-50 shadow-sm">
          {heroUrl ? (
            <img src={heroUrl} alt={name} className="h-full w-full object-cover animate-fade-in" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">No image</div>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImgIdx(idx)}
              className={`h-20 w-20 flex-shrink-0 rounded-2xl border-2 transition-all ${
                selectedImgIdx === idx ? "border-orange-500 scale-105" : "border-transparent opacity-60"
              }`}
            >
              <img src={img.url} alt="" className="h-full w-full rounded-[14px] object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* INFO */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{name}</h1>
          <p className="mt-4 text-slate-600 leading-relaxed">{description || "Premium quality guaranteed. Experience the best."}</p>
        </div>

        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-black text-orange-600">${effectivePrice.toFixed(2)}</span>
          {displayOfferPrice != null && displayOfferPrice < displayPrice && (
            <span className="text-xl text-slate-400 line-through font-bold">${displayPrice.toFixed(2)}</span>
          )}
        </div>

        {productVariants.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-500">Choice of Style / Weight</label>
            <div className="flex flex-wrap gap-3">
              {productVariants.map((pv) => (pv.variant && 
                <button
                  key={pv.id}
                  onClick={() => setSelectedVariantRecordId(pv.id)}
                  className={`rounded-2xl border px-6 py-3 text-sm font-bold transition-all ${
                    selectedVariantRecordId === pv.id
                      ? "border-orange-600 bg-orange-50 text-orange-600 ring-2 ring-orange-500/10"
                      : "border-slate-200 bg-white text-slate-700 hover:border-orange-300"
                  }`}
                >
                  {pv.variant.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-6">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              className="px-5 py-3 text-xl font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span className="min-w-[2rem] text-center font-bold text-slate-900">{qty}</span>
            <button
              type="button"
              className="px-5 py-3 text-xl font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition"
              onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
            >
              +
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400">
            Stock: <span className={maxStock < 10 ? "text-red-500" : "text-slate-900"}>{maxStock}</span> units
          </p>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            disabled={maxStock <= 0}
            onClick={() => addToCart(false)}
            className="flex-1 rounded-[20px] bg-slate-900 py-4 font-black text-white shadow-xl hover:bg-slate-800 transition-all disabled:opacity-40"
          >
            Add to Bag
          </button>
          <button
            type="button"
            disabled={maxStock <= 0}
            onClick={() => addToCart(true)}
            className="flex-1 rounded-[20px] bg-gradient-to-r from-orange-500 to-amber-500 py-4 font-black text-white shadow-xl hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-40"
          >
            Express Checkout
          </button>
        </div>
        
        {msg && (
          <div className="rounded-xl bg-orange-50 p-3 text-center text-sm font-bold text-orange-700 animate-fade-in">
            {msg}
          </div>
        )}

        <div className="mt-6 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> Fast Shipping</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> Verified Quality</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> 24/7 Support</span>
          </div>
        </div>

        {/* REVIEW FORM */}
        <div className="mt-8 rounded-[32px] bg-slate-50 p-6 border border-slate-100">
           <h3 className="font-black text-slate-900 mb-4">Leave a Review</h3>
           <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as any;
                const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
                if(!user.id) { alert("Please login to review."); return; }
                const res = await fetch("/api/reviews", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    productId,
                    userId: user.id,
                    rating: form.rating.value,
                    comment: form.comment.value
                  })
                });
                if (res.ok) {
                  alert("Review submitted! Thank you.");
                  form.reset();
                }
              }}
              className="space-y-4"
           >
              <div className="flex gap-4 items-center">
                 <label className="text-xs font-bold text-slate-500 uppercase">Rating</label>
                 <select name="rating" className="bg-white border-slate-200 rounded-lg text-sm font-bold">
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                 </select>
              </div>
              <textarea name="comment" placeholder="Tell us what you think..." className="w-full bg-white border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-orange-500/10 outline-none" rows={3} required></textarea>
              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-2xl font-black text-xs hover:bg-slate-800 transition">POST REVIEW</button>
           </form>
        </div>
      </div>
    </div>
  );
}
