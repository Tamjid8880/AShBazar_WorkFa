"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/cart-types";

function readCart(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem("cart") ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export default function CheckoutPage() {
  const [items, setItems] = useState<CartLine[]>([]);
  const [user, setUser] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Form fields
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Coupon handling on checkout
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    setItems(readCart());
    const rawUser = localStorage.getItem("auth_user");
    if (rawUser) {
        const u = JSON.parse(rawUser);
        setUser(u);
        if (u.phone) setPhone(u.phone);
        if (u.address) setAddress(u.address);
    }
    const rawSum = sessionStorage.getItem("checkout_summary");
    if (rawSum) {
      const s = JSON.parse(rawSum);
      setSummary(s);
      if (s.couponCode) setCouponCode(s.couponCode); // Pre-fill if coming from cart
    }
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  
  const deliveryCharge = summary?.deliveryCharge ?? 50;

  async function applyCoupon() {
    setCouponError("");
    if (!couponCode) return;
    try {
      const res = await fetch(`/api/coupons/validate?code=${couponCode}`);
      const data = await res.json();
      if (data.success) {
        if (subtotal < data.data.minimumPurchaseAmount) {
          setCouponError(`Min purchase $${data.data.minimumPurchaseAmount} required.`);
        } else {
          setAppliedCoupon(data.data);
        }
      } else {
        setCouponError("Invalid coupon.");
      }
    } catch (err) {
      setCouponError("Error validating coupon.");
    }
  }

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return summary?.discount ?? 0;
    if (appliedCoupon.discountType === "percentage") {
      return (subtotal * appliedCoupon.discountAmount) / 100;
    }
    return appliedCoupon.discountAmount;
  }, [subtotal, appliedCoupon, summary]);

  const finalTotal = subtotal - discountAmount + deliveryCharge;

  async function placeOrder(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      userID: user?.id || "anonymous",
      items: items.map((i) => ({
        productID: i.productId,
        productName: i.name,
        quantity: i.quantity,
        price: i.price,
        variant: i.variantLabel
      })),
      totalPrice: finalTotal,
      shippingAddress: { 
        phone, 
        street: address, 
        city, 
        state: "", 
        postalCode: "", 
        country: "Bangladesh" 
      },
      paymentMethod,
      couponCode: appliedCoupon?.couponCode || summary?.couponCode,
      orderTotal: { 
        subtotal: subtotal, 
        discount: discountAmount, 
        deliveryCharge: deliveryCharge,
        total: finalTotal 
      }
    };

    try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          localStorage.removeItem("cart");
          sessionStorage.removeItem("checkout_summary");
          setItems([]);
          setStatus("SUCCESS");
        } else {
          setStatus(data.message ?? "Order failed.");
        }
    } catch (err) {
        setStatus("Network error. Try again.");
    } finally {
        setLoading(false);
    }
  }

  if (status === "SUCCESS") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="h-24 w-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-5xl mb-6">✓</div>
        <h1 className="text-3xl font-black text-slate-900">Order Placed!</h1>
        <p className="mt-2 text-slate-500 font-medium tracking-tight">Thank you for your purchase. Your items will arrive soon.</p>
        <Link href="/shop" className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold shadow-xl">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-4xl font-black text-slate-900 mb-8">Checkout</h1>
        
        <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-2">
          {/* SHIPPING FORM */}
          <div className="space-y-6">
            <div className="rounded-[40px] bg-white p-10 shadow-sm border border-slate-100 space-y-6">
              <h2 className="text-xl font-black text-slate-900 mb-4">Shipping Info</h2>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Phone</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 font-bold outline-none focus:ring-4 focus:ring-orange-500/10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Street Address</label>
                <textarea
                  className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 font-bold outline-none focus:ring-4 focus:ring-orange-500/10"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">City</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 font-bold outline-none focus:ring-4 focus:ring-orange-500/10"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-[40px] bg-white p-10 shadow-sm border border-slate-100">
                <h2 className="text-xl font-black text-slate-900 mb-6">Promo Code</h2>
                <div className="flex gap-2">
                    <input
                        className="flex-1 rounded-2xl border border-slate-200 px-5 py-3.5 font-bold uppercase outline-none focus:ring-4 focus:ring-orange-500/10"
                        placeholder="COUPON"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button type="button" onClick={applyCoupon} className="bg-slate-900 text-white px-6 rounded-2xl font-black text-xs hover:bg-slate-800">APPLY</button>
                </div>
                {couponError && <p className="mt-2 text-[10px] text-red-500 font-bold">{couponError}</p>}
                {appliedCoupon && <p className="mt-2 text-[10px] text-emerald-600 font-bold tracking-widest uppercase">Discount Applied!</p>}
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="rounded-[40px] bg-white p-10 shadow-2xl border border-slate-100 self-start">
            <h2 className="text-xl font-black text-slate-900 mb-8">Summary</h2>
            <div className="space-y-5 mb-10">
              {items.map((i) => (
                <div key={i.lineId} className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{i.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Qty: {i.quantity} {i.variantLabel ? `· ${i.variantLabel}` : ""}</p>
                  </div>
                  <p className="text-sm font-black text-slate-900">${(i.price * i.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-slate-100 font-bold text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Applied Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Delivery</span>
                <span className="text-slate-900">${deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-3xl font-black pt-6">
                <span>Total</span>
                <span className="text-orange-600">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full mt-10 rounded-3xl bg-slate-900 py-5 font-black text-white shadow-2xl hover:bg-slate-800 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "PROCESSING..." : "PLACE ORDER"}
            </button>
            {status && status !== "SUCCESS" && <p className="mt-4 text-center text-xs font-bold text-red-500">{status}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
