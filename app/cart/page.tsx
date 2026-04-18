"use client";

import Image from "next/image";
import Link from "next/link";
import type { CartLine } from "@/lib/cart-types";
import { useCallback, useEffect, useMemo, useState } from "react";

function readCart(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem("cart") ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeCart(lines: CartLine[]) {
  localStorage.setItem("cart", JSON.stringify(lines));
}

export default function CartPage() {
  const [items, setItems] = useState<CartLine[]>([]);
  const [user, setUser] = useState<any>(null);
  const [coupon, setCoupon] = useState("");
  const [couponInfo, setCouponInfo] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  const refresh = useCallback(() => setItems(readCart()), []);

  useEffect(() => {
    refresh();
    const rawUser = localStorage.getItem("auth_user");
    if (rawUser) setUser(JSON.parse(rawUser));
    
    // Simulate fetching delivery charge logic or set a default
    setDeliveryCharge(50); // Default charge
  }, [refresh]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const discount = useMemo(() => {
    if (!couponInfo) return 0;
    if (subtotal < couponInfo.minimumPurchaseAmount) return 0;
    if (couponInfo.discountType === "percentage") {
      return (subtotal * couponInfo.discountAmount) / 100;
    }
    return couponInfo.discountAmount;
  }, [subtotal, couponInfo]);

  const total = subtotal - discount + deliveryCharge;

  async function applyCoupon() {
    setCouponError("");
    setCouponInfo(null);
    if (!coupon) return;
    
    // Fetch coupon from API (assuming it exists or I'll create it)
    const res = await fetch(`/api/coupons/validate?code=${coupon}`);
    const data = await res.json();
    if (data.success) {
      if (subtotal < data.data.minimumPurchaseAmount) {
        setCouponError(`Min purchase $${data.data.minimumPurchaseAmount} required.`);
      } else {
        setCouponInfo(data.data);
      }
    } else {
      setCouponError("Invalid coupon code.");
    }
  }

  function updateQty(lineId: string, delta: number) {
    const next = readCart()
      .map((line) => {
        if (line.lineId !== lineId) return line;
        return { ...line, quantity: Math.max(1, line.quantity + delta) };
      });
    writeCart(next);
    refresh();
  }

  function removeLine(lineId: string) {
    writeCart(readCart().filter((l) => l.lineId !== lineId));
    refresh();
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Shopping Bag</h1>
        
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.length === 0 ? (
              <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-xl">Your bag is empty.</p>
                <Link href="/shop" className="mt-4 inline-block text-orange-600 font-black underline">Start Shopping</Link>
              </div>
            ) : (
              items.map((item) => (
                <article key={item.lineId} className="flex gap-6 rounded-[28px] bg-white p-6 shadow-sm border border-slate-100">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-50">
                    {item.imageUrl && <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{item.name}</h3>
                    {item.variantLabel && <p className="text-xs font-bold text-orange-600 mt-1 uppercase">{item.variantLabel}</p>}
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center rounded-xl border border-slate-100 bg-slate-50">
                        <button className="px-3 py-1 text-lg font-bold text-slate-400" onClick={() => updateQty(item.lineId, -1)}>−</button>
                        <span className="min-w-[2rem] text-center font-bold text-slate-900 text-sm">{item.quantity}</span>
                        <button className="px-3 py-1 text-lg font-bold text-slate-400" onClick={() => updateQty(item.lineId, 1)}>+</button>
                      </div>
                      <button className="text-xs font-bold text-slate-300 hover:text-red-500 transition" onClick={() => removeLine(item.lineId)}>REMOVE</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-xl">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">${item.price.toFixed(2)} / unit</p>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* SUMMARY */}
          <div className="space-y-6">
            <div className="rounded-[32px] bg-white p-8 shadow-xl border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm font-bold">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Fee</span>
                  <span className="text-slate-900">${deliveryCharge.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between text-xl font-black">
                  <span>Total</span>
                  <span className="text-orange-600">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-8 space-y-3">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Promo Code</p>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="ENTER CODE"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  <button onClick={applyCoupon} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-slate-800 transition">APPLY</button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
                {couponInfo && <p className="text-[10px] text-emerald-600 font-bold">Code applied!</p>}
              </div>

              {/* Shipping Info */}
              {user && (
                <div className="mt-8 pt-6 border-t border-slate-100 space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Shipping To</p>
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{user.address || "No address saved. Add in profile."}</p>
                </div>
              )}

              <button
                disabled={items.length === 0}
                onClick={() => {
                    // Save summary to sessionStorage for checkout
                    sessionStorage.setItem("checkout_summary", JSON.stringify({ 
                      subtotal, 
                      discount, 
                      deliveryCharge, 
                      total, 
                      couponCode: couponInfo?.couponCode, 
                      couponId: couponInfo?.id 
                    }));
                    window.location.href = "/checkout";
                }}
                className="w-full mt-8 rounded-2xl bg-orange-600 py-4 font-black text-white shadow-xl shadow-orange-500/30 hover:bg-orange-700 hover:scale-[1.02] transition-all disabled:opacity-40"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
