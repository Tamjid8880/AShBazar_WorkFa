"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/cart-types";

function readCart():  CartLine[] {
  try { const raw = JSON.parse(localStorage.getItem("cart") ?? "[]"); return Array.isArray(raw) ? raw : []; } catch { return []; }
}
function writeCart(lines: CartLine[]) {
  localStorage.setItem("cart", JSON.stringify(lines));
}

const TrashIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);
const ShoppingBagIcon = () => (
  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default function CartPage() {
  const [items,       setItems]       = useState<CartLine[]>([]);
  const [coupon,      setCoupon]      = useState("");
  const [couponInfo,  setCouponInfo]  = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const refresh = useCallback(() => setItems(readCart()), []);
  useEffect(() => { refresh(); }, [refresh]);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);

  const discount = useMemo(() => {
    if (!couponInfo) return 0;
    if (subtotal < couponInfo.minimumPurchaseAmount) return 0;
    return couponInfo.discountType === "percentage"
      ? (subtotal * couponInfo.discountAmount) / 100
      : couponInfo.discountAmount;
  }, [subtotal, couponInfo]);

  // Delivery charge shown on cart is estimate only — actual calculated on checkout
  const estimatedDelivery = items.length > 0 ? 50 : 0;
  const total = subtotal - discount + estimatedDelivery;

  async function applyCoupon() {
    if (!coupon) return;
    setCouponLoading(true); setCouponError(""); setCouponInfo(null);
    const res  = await fetch(`/api/coupons/validate?code=${coupon}`);
    const data = await res.json();
    setCouponLoading(false);
    if (data.success) {
      if (subtotal < data.data.minimumPurchaseAmount) {
        setCouponError(`Minimum purchase ৳${data.data.minimumPurchaseAmount} required.`);
      } else {
        setCouponInfo(data.data);
      }
    } else {
      setCouponError("Invalid coupon code.");
    }
  }

  function updateQty(lineId: string, delta: number) {
    const next = readCart().map(line => {
      if (line.lineId !== lineId) return line;
      const max = line.maxStock ?? Infinity;
      const nq  = line.quantity + delta;
      if (nq > max) { alert(`Only ${max} items available.`); return line; }
      return { ...line, quantity: Math.max(1, nq) };
    });
    writeCart(next); refresh();
  }

  function removeLine(lineId: string) {
    writeCart(readCart().filter(l => l.lineId !== lineId)); refresh();
  }

  function proceedToCheckout() {
    sessionStorage.setItem("checkout_summary", JSON.stringify({
      subtotal, discount, deliveryCharge: estimatedDelivery, total,
      couponCode: couponInfo?.couponCode, couponId: couponInfo?.id,
    }));
    window.location.href = "/checkout";
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5]">
      {/* Top bar */}
      <div className="bg-[#2e7d32] py-6">
        <div className="container-main flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Shopping Bag</h1>
            <nav className="breadcrumb mt-1">
              <Link href="/">Home</Link>
              <ChevronRight />
              <span className="text-white/60">Cart</span>
            </nav>
          </div>
          <Link href="/shop" className="rounded-md border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition">
            Continue Shopping
          </Link>
        </div>
      </div>

      <div className="container-main py-8">
        {items.length === 0 ? (
          /* ── Empty state ──────────────────────────────────── */
          <div className="flex flex-col items-center justify-center rounded-xl bg-white py-24 text-center shadow-card border border-gray-100">
            <div className="mb-4 text-gray-200">
              <ShoppingBagIcon />
            </div>
            <h2 className="font-heading text-xl font-bold text-gray-800">Your bag is empty</h2>
            <p className="mt-2 text-sm text-gray-500">Looks like you haven&apos;t added any items yet.</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#ff6f00] px-6 py-3 text-sm font-bold text-white shadow-orange hover:bg-[#e65100] transition"
            >
              Start Shopping <ChevronRight />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* ── Cart Items ──────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header row */}
              <div className="hidden md:grid grid-cols-12 gap-4 rounded-lg bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 shadow-card border border-gray-100">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {items.map(item => (
                <article key={item.lineId} className="grid grid-cols-12 gap-4 items-center rounded-xl bg-white p-4 shadow-card border border-gray-100">
                  {/* Image + name */}
                  <div className="col-span-12 md:col-span-6 flex items-center gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#f5f7f5] border border-gray-100">
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        : <div className="flex h-full items-center justify-center text-gray-300 text-xs">No img</div>
                      }
                    </div>
                    <div className="min-w-0">
                      <Link href={`/products/${item.productId}`} className="font-semibold text-gray-800 text-sm hover:text-[#2e7d32] transition line-clamp-2">
                        {item.name}
                      </Link>
                      {item.variantLabel && (
                        <p className="mt-0.5 text-xs text-[#4caf50] font-medium">{item.variantLabel}</p>
                      )}
                      <button
                        onClick={() => removeLine(item.lineId)}
                        className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition"
                      >
                        <TrashIcon /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Unit price */}
                  <div className="col-span-4 md:col-span-2 text-sm font-bold text-gray-700 md:text-center">
                    <span className="md:hidden text-[10px] text-gray-400 block">Price</span>
                    ৳{item.price.toFixed(2)}
                  </div>

                  {/* Quantity */}
                  <div className="col-span-4 md:col-span-2 flex justify-center">
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateQty(item.lineId, -1)}>−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.lineId, 1)}>+</button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="col-span-4 md:col-span-2 text-sm font-bold text-[#2e7d32] md:text-right">
                    <span className="md:hidden text-[10px] text-gray-400 block">Total</span>
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </div>
                </article>
              ))}

              {/* Clear Cart */}
              <button
                onClick={() => { writeCart([]); refresh(); }}
                className="text-xs font-semibold text-gray-400 hover:text-red-500 transition flex items-center gap-1"
              >
                <TrashIcon /> Clear Cart
              </button>
            </div>

            {/* ── Order Summary ───────────────────────────────── */}
            <div className="space-y-5 self-start">
              {/* Coupon */}
              <div className="rounded-xl bg-white p-5 shadow-card border border-gray-100">
                <h3 className="mb-3 font-heading text-sm font-bold text-gray-800 uppercase tracking-wide">Promo Code</h3>
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={e => setCoupon(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="input flex-1 font-mono text-sm tracking-wider"
                    onKeyDown={e => e.key === "Enter" && applyCoupon()}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="rounded-md bg-[#2e7d32] px-4 text-sm font-bold text-white hover:bg-[#1b5e20] transition disabled:opacity-60"
                  >
                    {couponLoading ? "…" : "Apply"}
                  </button>
                </div>
                {couponError && <p className="mt-1.5 text-xs font-medium text-red-500">{couponError}</p>}
                {couponInfo  && <p className="mt-1.5 text-xs font-medium text-[#4caf50]">✓ Coupon applied! -{couponInfo.discountAmount}{couponInfo.discountType === "percentage" ? "%" : "৳"} off</p>}
              </div>

              {/* Summary card */}
              <div className="rounded-xl bg-white p-5 shadow-card border border-gray-100">
                <h3 className="mb-4 font-heading text-base font-bold text-gray-900">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="font-semibold text-gray-800">৳{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#4caf50]">
                      <span>Discount</span>
                      <span className="font-semibold">-৳{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Est. Delivery</span>
                    <span className="font-semibold text-gray-800">৳{estimatedDelivery.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">* Final delivery calculated at checkout based on address</p>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4 flex justify-between">
                  <span className="font-heading font-bold text-gray-900">Total</span>
                  <span className="font-heading text-xl font-bold text-[#2e7d32]">৳{total.toFixed(2)}</span>
                </div>

                <button
                  disabled={items.length === 0}
                  onClick={proceedToCheckout}
                  className="mt-5 w-full rounded-md bg-[#ff6f00] py-3 text-sm font-bold text-white shadow-orange hover:bg-[#e65100] transition disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ChevronRight />
                </button>
                <Link
                  href="/shop"
                  className="mt-3 block text-center text-sm font-medium text-gray-500 hover:text-[#4caf50] transition"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
