"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { CartLine } from "@/lib/cart-types";

function readCart(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem("cart") ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

const ChevronRight = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [items,    setItems]   = useState<CartLine[]>([]);
  const [summary,  setSummary] = useState<any>(null);
  const [status,   setStatus]  = useState("");
  const [loading,  setLoading] = useState(false);

  // Form fields
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [address, setAddress] = useState("");

  // Geo fields
  const [divisions,       setDivisions]       = useState<any[]>([]);
  const [districts,       setDistricts]       = useState<any[]>([]);
  const [upazilas,        setUpazilas]        = useState<any[]>([]);
  const [unions,          setUnions]          = useState<any[]>([]);
  const [selectedDivision,setSelectedDivision]= useState("");
  const [selectedDistrict,setSelectedDistrict]= useState("");
  const [selectedUpazila, setSelectedUpazila] = useState("");
  const [selectedUnion,   setSelectedUnion]   = useState("");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentOptions, setPaymentOptions] = useState<any[]>([]);

  // Coupon
  const [couponCode,    setCouponCode]    = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError,   setCouponError]   = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Shipping
  const [deliveryCharge,  setDeliveryCharge]  = useState(50);
  const [shippingSource,  setShippingSource]  = useState("");
  const [shippingLoading, setShippingLoading] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
    }
  }, [authStatus, router]);

  useEffect(() => {
    fetch('/api/payment-methods').then(res => res.json()).then(data => {
      if (data.success && data.data) {
        const active = data.data.filter((p: any) => p.isActive);
        setPaymentOptions(active);
        if (active.length > 0) setPaymentMethod(active[0].name);
      }
    });
  }, []);

  useEffect(() => {
    setItems(readCart());
    const rawSum = sessionStorage.getItem("checkout_summary");
    if (rawSum) {
      const s = JSON.parse(rawSum);
      setSummary(s);
      if (s.couponCode) setCouponCode(s.couponCode);
    }
    if (session?.user) {
      fetch("/api/user/profile")
        .then(r => r.json())
        .then(data => {
          if (data.user) {
            setName(data.user.name || "");
            setPhone(data.user.phone || "");
            setAddress(data.user.address || "");
            setSelectedDivision(data.user.division || "");
            setSelectedDistrict(data.user.district || "");
            setSelectedUpazila(data.user.upazila || "");
            setSelectedUnion(data.user.union || "");
          }
        });
    }
    fetch("https://bdapis.com/api/v1.1/divisions")
      .then(r => r.json())
      .then(res => { if (res.data) setDivisions(res.data); })
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    if (selectedDivision) {
      fetch(`https://bdapis.com/api/v1.1/division/${selectedDivision.toLowerCase()}`)
        .then(r => r.json())
        .then(res => { setDistricts(res.data || []); })
        .catch(() => setDistricts([]));
    } else {
      setDistricts([]);
    }
    setSelectedDistrict("");
    setSelectedUpazila("");
    setSelectedUnion("");
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`/geo/v2.0/upazilas/${selectedDistrict}`).then(async r => {
        if (r.ok) { const res = await r.json(); setUpazilas(res.data || []); }
        else       setUpazilas([{ id: "1", name: "Upazila 1" }, { id: "2", name: "Upazila 2" }]);
      }).catch(() => setUpazilas([{ id: "1", name: "Upazila 1" }, { id: "2", name: "Upazila 2" }]));
    } else {
      setUpazilas([]);
    }
    setSelectedUpazila("");
    setSelectedUnion("");
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedUpazila) {
      fetch(`/geo/v2.0/unions/${selectedUpazila}`).then(async r => {
        if (r.ok) { const res = await r.json(); setUnions(res.data || []); }
        else       setUnions([{ id: "1", name: "Union 1" }, { id: "2", name: "Union 2" }]);
      }).catch(() => setUnions([{ id: "1", name: "Union 1" }, { id: "2", name: "Union 2" }]));
    } else {
      setUnions([]);
    }
    setSelectedUnion("");
  }, [selectedUpazila]);

  const subtotal    = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const totalWeight = useMemo(() => items.reduce((s, i) => s + ((i as any).weight || 0) * i.quantity, 0), [items]);

  useEffect(() => {
    if (!selectedDivision) { setDeliveryCharge(50); setShippingSource(""); return; }
    const ctrl = new AbortController();
    setShippingLoading(true);
    fetch("/api/shipping/calculate", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ country: "Bangladesh", district: selectedDistrict, division: selectedDivision, subtotal, weight: totalWeight }),
      signal:  ctrl.signal,
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setDeliveryCharge(res.charge);
          setShippingSource(`${res.source}${res.zone ? ` → ${res.zone}` : ""}${res.method ? ` / ${res.method}` : ""}`);
        }
        setShippingLoading(false);
      })
      .catch(err => { if (err.name !== "AbortError") setShippingLoading(false); });
    return () => ctrl.abort();
  }, [selectedDivision, selectedDistrict, subtotal, totalWeight]);

  async function applyCoupon() {
    if (!couponCode) return;
    setCouponLoading(true); setCouponError(""); setAppliedCoupon(null);
    try {
      const res  = await fetch(`/api/coupons/validate?code=${couponCode}`);
      const data = await res.json();
      if (data.success) {
        if (subtotal < data.data.minimumPurchaseAmount) setCouponError(`Min ৳${data.data.minimumPurchaseAmount} required.`);
        else setAppliedCoupon(data.data);
      } else {
        setCouponError("Invalid coupon.");
      }
    } catch { setCouponError("Error validating coupon."); }
    setCouponLoading(false);
  }

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return summary?.discount ?? 0;
    return appliedCoupon.discountType === "percentage"
      ? (subtotal * appliedCoupon.discountAmount) / 100
      : appliedCoupon.discountAmount;
  }, [subtotal, appliedCoupon, summary]);

  const finalTotal = subtotal - discountAmount + deliveryCharge;

  async function placeOrder(e: FormEvent) {
    e.preventDefault();
    if (!name || !phone || !address || !selectedDivision || !selectedDistrict || !selectedUpazila || !selectedUnion) {
      setStatus("Please complete all address fields before placing your order.");
      return;
    }
    setLoading(true);
    const payload = {
      items: items.map(i => ({
        productID:   i.productId,
        productName: i.name,
        quantity:    i.quantity,
        price:       i.price,
        variant:     i.variantLabel,
      })),
      totalPrice:      finalTotal,
      shippingAddress: { name, phone, street: address, division: selectedDivision, district: selectedDistrict, upazila: selectedUpazila, union: selectedUnion, country: "Bangladesh" },
      paymentMethod,
      couponCodeId:    appliedCoupon?.id || summary?.couponId,
      orderTotal:      { subtotal, discount: discountAmount, deliveryCharge, total: finalTotal },
    };
    try {
      const res  = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem("cart");
        sessionStorage.removeItem("checkout_summary");
        setItems([]);
        setStatus("SUCCESS");
      } else {
        setStatus(data.message || data.error || "Order failed. Please try again.");
      }
    } catch { setStatus("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  /* ── Auth loading ─────────────────────────────────────────────── */
  if (authStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#4caf50] border-t-transparent mx-auto" />
          <p className="text-sm text-gray-500">Verifying session…</p>
        </div>
      </div>
    );
  }

  /* ── Success ──────────────────────────────────────────────────── */
  if (status === "SUCCESS") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7f5] p-8 text-center">
        <div className="rounded-xl bg-white p-12 shadow-card-lg border border-gray-100 max-w-md w-full">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f5e9]">
            <svg width="36" height="36" fill="none" stroke="#4caf50" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Order Placed!</h1>
          <p className="mt-2 text-sm text-gray-500">Thank you for your purchase. Your items will be delivered soon.</p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/profile" className="rounded-md bg-[#2e7d32] py-3 text-sm font-bold text-white hover:bg-[#1b5e20] transition">
              View My Orders
            </Link>
            <Link href="/shop" className="rounded-md border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:border-[#4caf50] hover:text-[#4caf50] transition">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main Checkout ────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f5f7f5]">
      {/* Header */}
      <div className="bg-[#2e7d32] py-6">
        <div className="container-main">
          <h1 className="font-heading text-2xl font-bold text-white">Checkout</h1>
          <nav className="breadcrumb mt-1">
            <Link href="/">Home</Link>
            <ChevronRight />
            <Link href="/cart">Cart</Link>
            <ChevronRight />
            <span className="text-white/60">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="container-main py-8">
        <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-3">

          {/* ── LEFT COLUMN — Shipping Form ───────────────────── */}
          <div className="space-y-6 lg:col-span-2">

            {/* Contact & Shipping */}
            <div className="rounded-xl bg-white p-6 shadow-card border border-gray-100">
              <h2 className="mb-5 font-heading text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                📋 Billing &amp; Delivery Details
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" className="input" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} required type="tel" placeholder="017xxxxxxxx" className="input" />
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Division <span className="text-red-500">*</span>
                  </label>
                  <select value={selectedDivision} onChange={e => setSelectedDivision(e.target.value)} required className="select">
                    <option value="">Select Division…</option>
                    {divisions.map((d: any) => (
                      <option key={d._id || d.division} value={d.division}>{d.division}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)} required disabled={!selectedDivision} className="select disabled:opacity-50">
                    <option value="">Select District…</option>
                    {districts.map((d: any) => (
                      <option key={d._id || d.district} value={d.district}>{d.district}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Upazila <span className="text-red-500">*</span>
                  </label>
                  <select value={selectedUpazila} onChange={e => setSelectedUpazila(e.target.value)} required disabled={!selectedDistrict} className="select disabled:opacity-50">
                    <option value="">Select Upazila…</option>
                    {upazilas.map((u: any) => <option key={u.id || u.name} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Union <span className="text-red-500">*</span>
                  </label>
                  <select value={selectedUnion} onChange={e => setSelectedUnion(e.target.value)} required disabled={!selectedUpazila} className="select disabled:opacity-50">
                    <option value="">Select Union…</option>
                    {unions.map((u: any) => <option key={u.id || u.name} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Detailed Address (House, Road, etc.) <span className="text-red-500">*</span>
                </label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} required rows={3} placeholder="House #, Road #, Area…" className="input resize-none" />
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-xl bg-white p-6 shadow-card border border-gray-100">
              <h2 className="mb-4 font-heading text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                💳 Payment Method
              </h2>
              <div className="flex flex-col gap-3">
                {paymentOptions.length === 0 ? (
                  <p className="text-sm text-gray-500">Loading payment methods...</p>
                ) : paymentOptions.map(pm => (
                  <div key={pm.id} className="flex flex-col gap-2">
                    <label
                      className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition ${
                        paymentMethod === pm.name
                          ? "border-[#4caf50] bg-[#e8f5e9]"
                          : "border-gray-200 hover:border-[#4caf50]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.name}
                        checked={paymentMethod === pm.name}
                        onChange={() => setPaymentMethod(pm.name)}
                        className="accent-[#4caf50]"
                      />
                      <span className="text-xl">💳</span>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{pm.name}</p>
                        {pm.accountDetails && <p className="text-xs text-gray-500 font-mono mt-0.5">{pm.accountDetails}</p>}
                      </div>
                    </label>
                    {paymentMethod === pm.name && pm.instructions && (
                      <div className="ml-8 text-xs text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100 leading-relaxed whitespace-pre-wrap">
                        {pm.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="rounded-xl bg-white p-6 shadow-card border border-gray-100">
              <h2 className="mb-4 font-heading text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                🎟️ Promo Code
              </h2>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="ENTER PROMO CODE"
                  className="input flex-1 font-mono tracking-wider"
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  className="rounded-md bg-[#2e7d32] px-5 text-sm font-bold text-white hover:bg-[#1b5e20] transition disabled:opacity-60"
                >
                  {couponLoading ? "…" : "Apply"}
                </button>
              </div>
              {couponError   && <p className="mt-2 text-xs font-semibold text-red-500">{couponError}</p>}
              {appliedCoupon && <p className="mt-2 text-xs font-semibold text-[#4caf50]">✓ Coupon applied! Saving ৳{discountAmount.toFixed(2)}</p>}
            </div>
          </div>

          {/* ── RIGHT COLUMN — Order Summary ──────────────────── */}
          <div className="self-start">
            <div className="rounded-xl bg-white p-6 shadow-card-lg border border-gray-100 sticky top-24">
              <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="font-heading text-lg font-bold text-gray-900">Order Summary</h2>
                <Link href="/cart" className="text-xs font-semibold text-[#ff6f00] hover:text-[#e65100] transition">
                  Edit Cart
                </Link>
              </div>

              {/* Items */}
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {items.map(i => (
                  <div key={i.lineId} className="flex items-start justify-between gap-3 text-sm">
                    <div className="flex items-start gap-2 min-w-0">
                      {i.imageUrl && (
                        <img src={i.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 line-clamp-1">{i.name}</p>
                        {i.variantLabel && <p className="text-[10px] text-[#4caf50]">{i.variantLabel}</p>}
                        <p className="text-[10px] text-gray-400">×{i.quantity}</p>
                      </div>
                    </div>
                    <p className="shrink-0 font-bold text-gray-800">৳{(i.price * i.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-4 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">৳{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#4caf50]">
                    <span>Discount</span>
                    <span className="font-semibold">-৳{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  {shippingLoading ? (
                    <span className="animate-pulse text-xs text-gray-400 font-medium">Calculating…</span>
                  ) : (
                    <span className="font-semibold text-gray-800">৳{deliveryCharge.toFixed(2)}</span>
                  )}
                </div>

                {shippingSource && !shippingLoading && (
                  <p className="rounded-md bg-[#e8f5e9] px-3 py-1.5 text-[10px] font-semibold text-[#2e7d32]">
                    📦 {shippingSource}{totalWeight > 0 ? ` · ${totalWeight.toFixed(2)} kg` : ""}
                  </p>
                )}

                {!selectedDivision && (
                  <p className="rounded-md bg-[#f5f7f5] px-3 py-1.5 text-[10px] text-gray-400">
                    Select division to calculate delivery
                  </p>
                )}
              </div>

              {/* Grand total */}
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="font-heading text-base font-bold text-gray-900">Total</span>
                <span className="font-heading text-2xl font-bold text-[#2e7d32]">৳{finalTotal.toFixed(2)}</span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="mt-5 w-full rounded-md bg-[#ff6f00] py-3.5 text-sm font-bold text-white shadow-orange hover:bg-[#e65100] transition hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0110 10"/>
                    </svg>
                    Processing…
                  </>
                ) : (
                  <>Place Order <ChevronRight /></>
                )}
              </button>

              {status && status !== "SUCCESS" && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-500 border border-red-100">
                  {status}
                </p>
              )}

              <p className="mt-4 text-center text-[10px] text-gray-400">
                🔒 Secure checkout. Your data is protected.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
