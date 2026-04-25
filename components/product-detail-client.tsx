"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { firstProductImageUrl, parseProductImages } from "@/lib/product-images";

type ProductVariant = {
  id:         string;
  variantId:  string;
  price:      number;
  offerPrice: number | null;
  stock:      number;
  variant:    { name: string };
};

type Props = {
  productId:       string;
  name:            string;
  description:     string | null;
  basePrice:       number;
  baseOfferPrice:  number | null;
  baseStock:       number;
  weight:          number | null;
  imagesJson:      unknown;
  productVariants: ProductVariant[];
  categoryName?:   string;
  categoryId?:     string;
  subCategoryName?: string;
  brandName?:      string;
  avgRating?:      number;
  reviewCount?:    number;
};

const CartIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const HeartIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const ShareIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

function lineId(productId: string, variantRecordId: string | null) {
  return `${productId}::${variantRecordId ?? "default"}`;
}

export default function ProductDetailClient({
  productId, name, description, basePrice, baseOfferPrice,
  baseStock, weight, imagesJson, productVariants,
  categoryName, categoryId, subCategoryName, brandName,
  avgRating = 0, reviewCount = 0,
}: Props) {
  const { data: session } = useSession();

  const allImages = parseProductImages(imagesJson);
  const [selectedImgIdx,       setSelectedImgIdx]       = useState(0);
  const [selectedVariantId,    setSelectedVariantId]    = useState<string | null>(productVariants[0]?.id ?? null);
  const [qty,                  setQty]                  = useState(1);
  const [msg,                  setMsg]                  = useState("");
  const [wishlist,             setWishlist]             = useState(false);
  const [reviewFormOpen,       setReviewFormOpen]       = useState(false);
  const [reviewRating,         setReviewRating]         = useState(5);
  const [reviewComment,        setReviewComment]        = useState("");
  const [reviewSubmitting,     setReviewSubmitting]     = useState(false);
  const [reviewSuccess,        setReviewSuccess]        = useState(false);

  const heroUrl = allImages[selectedImgIdx]?.url || firstProductImageUrl(imagesJson);

  const activeVariant = useMemo(
    () => productVariants.find(pv => pv.id === selectedVariantId),
    [selectedVariantId, productVariants]
  );

  const displayPrice     = activeVariant ? activeVariant.price      : basePrice;
  const displayOffer     = activeVariant ? activeVariant.offerPrice : baseOfferPrice;
  const effectivePrice   = displayOffer ?? displayPrice;
  const maxStock         = activeVariant ? activeVariant.stock       : baseStock;
  const hasDiscount      = displayOffer != null && displayOffer < displayPrice;
  const discountPct      = hasDiscount ? Math.round(((displayPrice - displayOffer!) / displayPrice) * 100) : 0;
  const variantLabel     = activeVariant?.variant.name;
  const isOutOfStock     = maxStock <= 0;

  useEffect(() => { setMsg(""); }, [selectedVariantId]);

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlist(items.some((i: any) => i.id === productId));
    } catch {}
  }, [productId]);

  function toggleWishlist() {
    try {
      let items = JSON.parse(localStorage.getItem("wishlist") || "[]");
      if (wishlist) {
        items = items.filter((i: any) => i.id !== productId);
        setWishlist(false);
      } else {
        items.push({ id: productId, name, price: effectivePrice, imgUrl: heroUrl });
        setWishlist(true);
      }
      localStorage.setItem("wishlist", JSON.stringify(items));
    } catch {}
  }

  function persistCart(next: any[]) { localStorage.setItem("cart", JSON.stringify(next)); }
  function readCart():   any[]      {
    try { return JSON.parse(localStorage.getItem("cart") ?? "[]"); } catch { return []; }
  }

  function addToCart(goCheckout: boolean) {
    if (productVariants.length > 0 && !selectedVariantId) { setMsg("Please select a variant."); return; }
    if (maxStock <= 0) { setMsg("Out of stock."); return; }
    const take = Math.min(qty, maxStock);
    const lid  = lineId(productId, selectedVariantId);
    const cart = readCart();
    const idx  = cart.findIndex((r: any) => r.lineId === lid);
    if (idx < 0) {
      cart.push({ lineId: lid, productId, name, price: effectivePrice, quantity: take, variantId: selectedVariantId, variantLabel, imageUrl: heroUrl, maxStock, weight: weight || 0 });
    } else {
      if (cart[idx].quantity + take > maxStock) { setMsg(`Max ${maxStock} in stock.`); return; }
      cart[idx].quantity += take;
    }
    persistCart(cart);
    setMsg(goCheckout ? "Added — going to checkout…" : "Added to cart! ✓");
    if (goCheckout) setTimeout(() => { window.location.href = "/checkout"; }, 400);
  }

  async function submitReview() {
    if (!session?.user) { setMsg("Please login to review."); return; }
    setReviewSubmitting(true);
    const res = await fetch("/api/reviews", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ productId, userId: (session.user as any).id, rating: reviewRating, comment: reviewComment }),
    });
    setReviewSubmitting(false);
    if (res.ok) {
      setReviewSuccess(true);
      setReviewFormOpen(false);
      setReviewComment("");
    } else {
      setMsg("Review submission failed.");
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* ── Image Gallery ─────────────────────────────── */}
      <div className="flex gap-4">
        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex flex-col gap-2">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImgIdx(i)}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  selectedImgIdx === i ? "border-[#4caf50]" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="flex-1 aspect-square overflow-hidden rounded-xl border border-gray-100 bg-[#f5f7f5]">
          {heroUrl ? (
            <img src={heroUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300 text-sm">No image</div>
          )}
        </div>
      </div>

      {/* ── Product Info ──────────────────────────────── */}
      <div className="flex flex-col gap-5 py-2">
        {/* Name */}
        <h1 className="font-heading text-3xl font-bold text-gray-900 leading-snug">
          {name}
        </h1>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-2xl font-bold text-[#ff6f00]">
            ৳{effectivePrice.toFixed(2)}
          </span>
          {weight && (
            <span className="text-xl font-bold text-[#ff6f00]">/ {weight}kg</span>
          )}
          {hasDiscount && (
            <span className="ml-2 text-lg text-gray-400 line-through font-medium">৳{displayPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
            {description}
          </p>
        )}

        {/* Variants (Quantity / Size) */}
        {productVariants.length > 0 && (
          <div className="mt-2 flex items-center gap-4">
            <span className="text-sm font-bold text-gray-900">Quantity</span>
            <div className="flex flex-wrap gap-2">
              {productVariants.map(pv => pv.variant && (
                <button
                  key={pv.id}
                  onClick={() => setSelectedVariantId(pv.id)}
                  className={`rounded border px-4 py-1.5 text-sm font-medium transition ${
                    selectedVariantId === pv.id
                      ? "border-[#ff6f00] text-[#ff6f00]"
                      : "border-gray-300 bg-white text-gray-600 hover:border-[#ff6f00] hover:text-[#ff6f00]"
                  } ${pv.stock <= 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                  disabled={pv.stock <= 0}
                  title={pv.stock <= 0 ? "Out of stock" : ""}
                >
                  {pv.variant.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="qty-control h-11 border-gray-300 rounded-md">
            <button
              className="qty-btn h-full w-10 text-lg hover:text-[#ff6f00]"
              onClick={() => setQty(q => Math.max(1, q - 1))}
              disabled={qty <= 1}
            >−</button>
            <span className="qty-value w-10 h-full flex items-center justify-center">{Math.min(qty, maxStock)}</span>
            <button
              className="qty-btn h-full w-10 text-lg hover:text-[#ff6f00]"
              onClick={() => setQty(q => Math.min(maxStock, q + 1))}
              disabled={qty >= maxStock}
            >+</button>
          </div>

          <button
            onClick={() => addToCart(false)}
            disabled={isOutOfStock}
            className="flex items-center justify-center gap-2 rounded-md bg-[#2e7d32] px-8 h-11 text-sm font-bold text-white hover:bg-[#1b5e20] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CartIcon />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
          <button
            onClick={() => addToCart(true)}
            disabled={isOutOfStock}
            className="flex items-center justify-center gap-2 rounded-md bg-[#ff6f00] px-8 h-11 text-sm font-bold text-white shadow-orange hover:bg-[#e65100] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Buy Now
          </button>
          <button
            onClick={toggleWishlist}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition ${
              wishlist
                ? "border-[#4caf50] bg-[#e8f5e9] text-[#4caf50]"
                : "border-gray-300 bg-white text-gray-400 hover:border-[#4caf50] hover:text-[#4caf50]"
            }`}
            title="Add to Wishlist"
          >
            <HeartIcon />
          </button>
        </div>

        {/* Feedback message */}
        {msg && (
          <div className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
            msg.includes("✓") || msg.includes("checkout") || msg.includes("cart")
              ? "bg-[#e8f5e9] text-[#2e7d32]"
              : "bg-red-50 text-red-600"
          }`}>
            {msg}
          </div>
        )}

        {/* Product meta */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          {categoryName && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 w-24 shrink-0">Category:</span>
              <Link href={`/shop?category=${categoryId}`} className="font-semibold text-[#4caf50] hover:text-[#2e7d32] transition">
                {categoryName}
              </Link>
            </div>
          )}
          {subCategoryName && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 w-24 shrink-0">Sub-Category:</span>
              <span className="font-semibold text-gray-700">{subCategoryName}</span>
            </div>
          )}
          {brandName && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 w-24 shrink-0">Brand:</span>
              <span className="font-semibold text-gray-700">{brandName}</span>
            </div>
          )}
          {/* Share icons */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs text-gray-400 font-medium">Share:</span>
            {[
              { icon: "f", bg: "#1877f2", href: "#" },
              { icon: "in", bg: "#e1306c", href: "#" },
              { icon: "Li", bg: "#0077b5", href: "#" },
              { icon: "P",  bg: "#e60023", href: "#" },
            ].map(s => (
              <a
                key={s.icon}
                href={s.href}
                style={{ backgroundColor: s.bg }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white hover:opacity-80 transition"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Review form */}
        {reviewFormOpen && session && (
          <div className="rounded-xl border border-[#e8f5e9] bg-[#f5f7f5] p-5">
            <h4 className="mb-3 font-bold text-gray-800 text-sm">Leave a Review</h4>
            {reviewSuccess ? (
              <p className="text-sm font-semibold text-[#4caf50]">✓ Review submitted! Thank you.</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewRating(i)}
                        className="transition hover:scale-110"
                      >
                        <svg width="20" height="20" fill={i <= reviewRating ? "#ff6f00" : "#e5e7eb"} viewBox="0 0 24 24">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                  className="input resize-none"
                />
                <button
                  onClick={submitReview}
                  disabled={reviewSubmitting}
                  className="w-full rounded-md bg-[#4caf50] py-2.5 text-sm font-bold text-white hover:bg-[#2e7d32] transition disabled:opacity-60"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            )}
          </div>
        )}

        {!session && reviewFormOpen && (
          <div className="rounded-lg bg-[#e8f5e9] p-4 text-sm text-[#2e7d32]">
            <Link href="/login" className="font-bold underline">Login</Link> to write a review.
          </div>
        )}
      </div>
    </div>
  );
}
