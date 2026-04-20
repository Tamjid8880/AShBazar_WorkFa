import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DashboardCharts from "@/components/dashboard-chart";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalOrders, lowStock, products, groupBy, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { quantity: { lt: 10, gt: 0 } } }),
    prisma.product.count(),
    prisma.order.groupBy({
      by: ["orderStatus"],
      _count: { _all: true }
    }),
    prisma.order.findMany({
      where: {
        orderDate: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)) // last 7 days
        }
      },
      select: { orderDate: true, total: true, totalPrice: true }
    })
  ]);

  const counts = Object.fromEntries(groupBy.map((g) => [g.orderStatus, g._count._all])) as Record<string, number>;

  // Format data for Recharts PieChart (Status Distribution)
  const statusData = groupBy.map(g => ({
    name: g.orderStatus.toUpperCase().replace("_", " "),
    value: g._count._all
  }));

  // Format data for Recharts AreaChart (Revenue Last 7 Days)
  const revenueMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = d.toLocaleDateString("en-US", { weekday: "short" });
    revenueMap[day] = 0;
  }
  
  recentOrders.forEach(o => {
    const day = new Date(o.orderDate).toLocaleDateString("en-US", { weekday: "short" });
    if (revenueMap[day] !== undefined) {
      revenueMap[day] += (o.total || o.totalPrice || 0);
    }
  });

  const revenueData = Object.keys(revenueMap).map(day => ({
    name: day,
    revenue: revenueMap[day]
  }));

  const stat = (label: string, key: string, accent?: string) => (
    <div
      key={key}
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ${accent ?? ""}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{counts[key] ?? 0}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-slate-600">Overview of orders, inventory, and revenue analytics.</p>
        </div>
        <Link
          href="/admin/low-stock"
          className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-amber-600"
        >
          Low stock alert ({lowStock})
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total orders</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalOrders}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">SKU count</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">{products}</p>
        </div>
        {stat("Pending", "pending")}
        {stat("Accepted", "accepted")}
        {stat("Packed", "packed")}
        {stat("On the way", "on_the_way")}
        {stat("Shipped", "shipped")}
        {stat("Delivered", "delivered", "bg-emerald-50")}
        {stat("Cancelled", "cancelled")}
      </div>

      <DashboardCharts revenueData={revenueData} statusData={statusData} />
    </div>
  );
}
