"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending:    "status-pending",
  accepted:   "status-processing",
  packed:     "status-processing",
  processing: "status-processing",
  shipped:    "status-shipped",
  on_the_way: "status-shipped",
  delivered:  "status-delivered",
  cancelled:  "status-cancelled",
};

const ChevronRight = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const [orders,     setOrders]     = useState<any[]>([]);
  const [profile,    setProfile]    = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState<"orders" | "profile" | "complaint">("orders");
  const [complaint,  setComplaint]  = useState({ subject: "", description: "" });
  const [cStatus,    setCStatus]    = useState<"idle" | "loading" | "success">("idle");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      window.location.href = "/login?callbackUrl=/profile";
      return;
    }
    if (authStatus === "authenticated") {
      loadData();
    }
  }, [authStatus]);

  async function loadData() {
    setLoading(true);
    try {
      const [profileRes, ordersRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/orders/my"),
      ]);
      if (profileRes.ok) {
        const pd = await profileRes.json();
        setProfile(pd.user);
      }
      if (ordersRes.ok) {
        const od = await ordersRes.json();
        setOrders(od.data || od.orders || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function submitComplaint(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) return;
    setCStatus("loading");
    const res = await fetch("/api/complaints", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        userId:      (session.user as any).id,
        subject:     complaint.subject,
        description: complaint.description,
      }),
    });
    setCStatus(res.ok ? "success" : "idle");
    if (res.ok) setComplaint({ subject: "", description: "" });
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#4caf50] border-t-transparent mx-auto" />
          <p className="text-sm font-medium text-gray-500">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") return null;

  const user = profile || session?.user;
  const initials = (user?.name || "U").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f5f7f5]">
      {/* Header */}
      <div className="bg-[#2e7d32] py-8">
        <div className="container-main flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">My Account</h1>
            <nav className="breadcrumb mt-1">
              <Link href="/">Home</Link>
              <ChevronRight />
              <span className="text-white/60">Profile</span>
            </nav>
          </div>
          <Link href="/shop" className="rounded-md border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition">
            Continue Shopping
          </Link>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* ── Sidebar ──────────────────────────────────────── */}
          <aside className="lg:col-span-1">
            <div className="rounded-xl bg-white shadow-card border border-gray-100 overflow-hidden">
              {/* Avatar */}
              <div className="bg-[#2e7d32] p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-black text-[#2e7d32]">
                  {initials}
                </div>
                <h2 className="mt-3 font-heading font-bold text-white">{user?.name || "User"}</h2>
                <p className="text-xs text-white/70">{user?.email || user?.phone || ""}</p>
              </div>

              {/* Nav tabs */}
              <nav className="p-3 space-y-1">
                {[
                  { key: "orders",    label: "My Orders",        icon: "📦" },
                  { key: "profile",   label: "Profile Settings", icon: "⚙️" },
                  { key: "complaint", label: "File Complaint",   icon: "💬" },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      activeTab === tab.key
                        ? "bg-[#e8f5e9] text-[#2e7d32] font-semibold"
                        : "text-gray-600 hover:bg-[#f5f7f5] hover:text-[#2e7d32]"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
                <div className="border-t border-gray-100 pt-1 mt-1">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* ── Main Content ──────────────────────────────────── */}
          <main className="lg:col-span-3">

            {/* ── ORDERS TAB ───────────────────────────────── */}
            {activeTab === "orders" && (
              <div>
                <h2 className="mb-4 font-heading text-xl font-bold text-gray-900">My Orders</h2>
                {orders.length === 0 ? (
                  <div className="rounded-xl bg-white py-16 text-center shadow-card border border-gray-100">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="font-bold text-gray-700">No orders yet</p>
                    <p className="mt-1 text-sm text-gray-400">Your orders will appear here after checkout.</p>
                    <Link href="/shop" className="mt-5 inline-flex items-center gap-1 rounded-md bg-[#ff6f00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e65100] transition">
                      Start Shopping <ChevronRight />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => {
                      const latestStatus = order.statusHistory?.[0]?.status || order.orderStatus;
                      const statusCls = ORDER_STATUS_COLORS[latestStatus] || "bg-gray-100 text-gray-600";
                      return (
                        <div key={order.id} className="rounded-xl bg-white shadow-card border border-gray-100 overflow-hidden">
                          {/* Order header */}
                          <div className="flex items-center justify-between bg-[#f5f7f5] px-5 py-3 border-b border-gray-100">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order</p>
                              <p className="font-bold text-gray-800">#{order.id.slice(-8).toUpperCase()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${statusCls}`}>
                                {latestStatus?.replace(/_/g, " ")}
                              </span>
                              <span className="text-xs font-medium text-gray-500">
                                {new Date(order.orderDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            </div>
                          </div>

                          {/* Items preview */}
                          <div className="px-5 py-4">
                            <div className="space-y-2">
                              {order.items?.slice(0, 3).map((it: any) => (
                                <div key={it.id} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-700">{it.productName}</span>
                                  <span className="text-gray-400">×{it.quantity} — ৳{Number(it.price).toFixed(2)}</span>
                                </div>
                              ))}
                              {order.items?.length > 3 && (
                                <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>
                              )}
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
                            <div>
                              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Total</p>
                              <p className="font-heading font-bold text-[#2e7d32]">৳{Number(order.total || order.totalPrice).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                                  const newItems = order.items.map((it: any) => ({
                                    lineId: `${it.productID}::default-reorder`,
                                    productId: it.productID,
                                    name: it.productName,
                                    price: Number(it.price),
                                    quantity: it.quantity,
                                    variantLabel: it.variant || undefined,
                                    imageUrl: "",
                                    maxStock: 999,
                                  }));
                                  localStorage.setItem("cart", JSON.stringify([...cart, ...newItems]));
                                  window.location.href = "/cart";
                                }}
                                className="rounded-md border border-[#4caf50] px-4 py-1.5 text-xs font-bold text-[#4caf50] hover:bg-[#e8f5e9] transition"
                              >
                                Re-order
                              </button>
                            </div>
                          </div>

                          {/* Tracking Action */}
                          <div className="border-t border-gray-100 px-5 py-3 bg-[#f5f7f5]">
                            <Link href={`/profile/orders/${order.id}/track`} className="flex w-full items-center justify-center gap-2 rounded-md bg-white border border-[#4caf50] py-2 text-sm font-bold text-[#2e7d32] hover:bg-[#e8f5e9] transition">
                              Track Order
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <polyline points="9 18 15 12 9 6"/>
                              </svg>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── PROFILE TAB ──────────────────────────────── */}
            {activeTab === "profile" && (
              <div>
                <h2 className="mb-4 font-heading text-xl font-bold text-gray-900">Profile Settings</h2>
                <div className="rounded-xl bg-white p-6 shadow-card border border-gray-100">
                  <div className="grid gap-5 sm:grid-cols-2">
                    {[
                      { label: "Full Name",   val: user?.name    || "—" },
                      { label: "Email",       val: user?.email   || "—" },
                      { label: "Phone",       val: user?.phone   || "Not set" },
                      { label: "Address",     val: user?.address || "Not set" },
                      { label: "Division",    val: user?.division  || "Not set" },
                      { label: "District",    val: user?.district  || "Not set" },
                      { label: "Upazila",     val: user?.upazila   || "Not set" },
                      { label: "Union",       val: user?.union     || "Not set" },
                    ].map(f => (
                      <div key={f.label} className="rounded-lg bg-[#f5f7f5] p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{f.label}</p>
                        <p className="mt-1 text-sm font-semibold text-gray-800">{f.val}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-xs text-gray-400">
                    To update your profile details, please contact support or update them at checkout.
                  </p>
                </div>
              </div>
            )}

            {/* ── COMPLAINT TAB ────────────────────────────── */}
            {activeTab === "complaint" && (
              <div>
                <h2 className="mb-4 font-heading text-xl font-bold text-gray-900">File a Complaint</h2>
                <div className="rounded-xl bg-white p-6 shadow-card border border-gray-100">
                  <p className="mb-6 text-sm text-gray-500">
                    Have an issue? Submit a complaint and our support team will respond within 24 hours.
                  </p>

                  {cStatus === "success" ? (
                    <div className="rounded-lg bg-[#e8f5e9] border border-[#a5d6a7] p-6 text-center">
                      <div className="text-3xl mb-2">✅</div>
                      <h3 className="font-bold text-[#2e7d32]">Complaint Submitted!</h3>
                      <p className="mt-1 text-sm text-gray-600">Your ticket has been created. We&apos;ll get back to you soon.</p>
                      <button
                        onClick={() => { setCStatus("idle"); setComplaint({ subject: "", description: "" }); }}
                        className="mt-4 rounded-md bg-[#4caf50] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2e7d32] transition"
                      >
                        Submit Another
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={submitComplaint} className="space-y-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Subject <span className="text-red-500">*</span></label>
                        <input
                          required
                          value={complaint.subject}
                          onChange={e => setComplaint(c => ({ ...c, subject: e.target.value }))}
                          className="input"
                          placeholder="Brief subject of your complaint"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Description <span className="text-red-500">*</span></label>
                        <textarea
                          required
                          value={complaint.description}
                          onChange={e => setComplaint(c => ({ ...c, description: e.target.value }))}
                          rows={5}
                          className="input resize-none"
                          placeholder="Please describe your issue in detail…"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={cStatus === "loading"}
                        className="rounded-md bg-[#ff6f00] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#e65100] transition disabled:opacity-60"
                      >
                        {cStatus === "loading" ? "Submitting…" : "File Complaint"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
