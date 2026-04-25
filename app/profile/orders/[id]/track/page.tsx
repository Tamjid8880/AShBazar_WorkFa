import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StoreHeader from "@/components/store-header";
import StoreFooter from "@/components/store-footer";
import { getStoreNavData } from "@/lib/store-nav";

// AshBazar Order Tracking Steps
const STEPS = [
  { key: "pending",    label: "Order Placed", icon: "📝" },
  { key: "accepted",   label: "Confirmed",    icon: "✅" },
  { key: "packed",     label: "Packed",       icon: "📦" },
  { key: "on_the_way", label: "On the Way",   icon: "🚚" },
  { key: "shipped",    label: "On the Way",   icon: "🚚" },
  { key: "delivered",  label: "Delivered",    icon: "🎉" },
];

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=/profile/orders/" + id + "/track");
  }

  const nav = await getStoreNavData();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
      user: true,
    },
  });

  if (!order || order.userId !== (session.user as any).id) {
    return (
      <div className="min-h-screen bg-[#f5f7f5] text-center pt-20">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <Link href="/profile" className="mt-4 inline-block text-[#4caf50] underline">Back to Profile</Link>
      </div>
    );
  }

  const latestStatus = order.orderStatus; // e.g. "pending", "accepted", "packed", "shipped", "delivered"

  const currentIndex = STEPS.findIndex(s => s.key === latestStatus);
  const activeIndex = currentIndex >= 0 ? currentIndex : (latestStatus === "cancelled" ? -1 : 0);

  const getBannerMsg = () => {
    if (latestStatus === "cancelled") return "Order has been cancelled.";
    if (latestStatus === "pending") return "Waiting for confirmation...";
    if (latestStatus === "accepted") return "Order is confirmed and being prepared.";
    if (latestStatus === "packed") return "Order is packed and ready for shipping.";
    if (latestStatus === "shipped" || latestStatus === "on_the_way") return "Order is on the way to your address!";
    if (latestStatus === "delivered") return "Order delivered successfully.";
    return "Processing order...";
  };

  const getBannerColor = () => {
    if (latestStatus === "cancelled") return "bg-red-500";
    if (latestStatus === "delivered") return "bg-[#4caf50]";
    return "bg-[#ff6f00]"; // orange/yellow for in progress
  };

  return (
    <div className="min-h-screen bg-[#f5f7f5] flex flex-col">
      <StoreHeader categories={nav.categories} brands={nav.brands} settings={nav.settings} compact />

      <main className="flex-1 py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* ── Header Card ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 font-heading">Order Tracking</h1>
              <Link href="/profile" className="text-sm font-medium text-gray-500 hover:text-gray-800 transition">
                &larr; Back to Profile
              </Link>
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-gray-500">Order ID:</span>
              <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono font-bold tracking-wider flex items-center gap-2">
                {order.id.slice(-8).toUpperCase()}
                <button
                  className="text-gray-400 hover:text-gray-600 transition"
                  title="Copy ID"
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Status Banner */}
            <div className={`${getBannerColor()} text-white rounded-xl p-4 font-bold text-lg shadow-sm`}>
              {getBannerMsg()}
            </div>
          </div>

          {/* ── Order Progress ───────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 font-heading">Order Progress</h2>
            
            {latestStatus === "cancelled" ? (
              <div className="text-center text-red-500 font-bold py-4">This order was cancelled.</div>
            ) : (
              <div className="relative">
                {/* Progress line background */}
                <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full hidden sm:block" />
                {/* Active Progress line */}
                <div 
                  className="absolute top-1/2 left-8 h-1 bg-[#4caf50] -translate-y-1/2 z-0 rounded-full hidden sm:block transition-all duration-500" 
                  style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
                />

                <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
                  {STEPS.map((step, i) => {
                    const isCompleted = i <= activeIndex;
                    const isActive = i === activeIndex;

                    return (
                      <div key={step.key} className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 text-center">
                        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-4 text-lg transition-colors ${
                          isCompleted 
                            ? "bg-[#4caf50] border-white text-white shadow-md scale-110" 
                            : "bg-gray-100 border-white text-gray-400"
                        }`}>
                          {isCompleted && !isActive ? (
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            step.icon
                          )}
                        </div>
                        <span className={`text-xs sm:text-sm font-bold ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Order Details ────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 font-heading">Order Details</h2>
            
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-bold">{item.quantity}x</span>
                    <span className="text-gray-800 font-medium">{item.productName}</span>
                  </div>
                  <span className="text-gray-900 font-bold">৳{(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>৳{Number(order.subtotal || order.totalPrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee</span>
                <span>৳{Number(order.deliveryCharge || 0).toFixed(2)}</span>
              </div>
              {order.couponCode && (
                <div className="flex justify-between text-[#4caf50]">
                  <span>Discount ({order.couponCode})</span>
                  <span>- ৳{Number(order.discount).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-[#ff6f00]">৳{Number(order.totalPrice).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ── Delivery Information ─────────────────────────────── */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4 font-heading">Delivery Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">Customer Name</p>
                <p className="text-gray-800 font-medium">{order.user?.name || "Customer"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">Contact Number</p>
                <p className="text-gray-800 font-medium">{order.phone || order.user?.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">Delivery Address</p>
                <p className="text-gray-800 font-medium">{[order.street, order.upazila, order.district, order.city, order.division].filter(Boolean).join(", ")}</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <StoreFooter settings={nav.settings} />
    </div>
  );
}
