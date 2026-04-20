"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

// Map sidebar items to required permissions
const allLinks = [
  { href: "/admin", label: "Dashboard", icon: "▣", perm: "view_dashboard" },
  { href: "/admin/orders", label: "Orders", icon: "◎", perm: "view_orders" },
  { href: "/admin/products", label: "Products", icon: "◇", perm: "view_products" },
  { href: "/admin/categories", label: "Categories", icon: "▤", perm: "view_categories" },
  { href: "/admin/brands", label: "Brands", icon: "◆", perm: "view_products" },
  { href: "/admin/variants", label: "Variants", icon: "○", perm: "view_products" },
  { href: "/admin/coupons", label: "Coupons", icon: "%", perm: "manage_coupons" },
  { href: "/admin/posters", label: "Posters", icon: "▨", perm: "manage_posters" },
  { href: "/admin/complaints", label: "Complaints", icon: "☏", perm: "manage_complaints" },
  { href: "/admin/low-stock", label: "Low stock", icon: "!", perm: "view_products" },
  { href: "/admin/shipping", label: "Shipping", icon: "✈", perm: "manage_shipping" },
  { href: "/admin/users", label: "Users & Roles", icon: "👤", perm: "view_users" },
  { href: "/admin/roles", label: "Permissions", icon: "🔑", perm: "assign_roles" },
  { href: "/admin/audit-logs", label: "History", icon: "📋", perm: "view_audit_logs" },
  { href: "/admin/settings", label: "Settings", icon: "⚙", perm: "manage_settings" }
];

export default function AdminSidebar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "unknown";
  const isSuperAdmin = role === "super_admin";

  const [userPerms, setUserPerms] = useState<string[]>([]);

  useEffect(() => {
    // Fetch the logged-in user's permissions
    fetch("/api/admin/my-permissions")
      .then(r => r.json())
      .then(data => {
        if (data.permissions) setUserPerms(data.permissions);
      })
      .catch(() => {});
  }, []);

  // Super admin sees everything. Others see only permitted links.
  const visibleLinks = isSuperAdmin
    ? allLinks
    : allLinks.filter(l => userPerms.includes(l.perm));

  return (
    <aside className="border-b border-slate-200/80 bg-white lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex h-14 items-center gap-2 border-b border-slate-100 px-4 lg:h-16 lg:px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-black text-white">
          A
        </span>
        <div>
          <p className="text-sm font-bold text-slate-900">{session?.user?.name || "Admin"}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-400 lg:block">
            {role === "super_admin" ? "🔴 SUPER ADMIN" : role === "admin" ? "🟠 ADMIN" : role}
          </p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible lg:p-3">
        {visibleLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-800 lg:gap-3 lg:py-2.5"
          >
            <span className="hidden w-5 text-center text-orange-500 sm:inline">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="hidden border-t border-slate-100 p-4 lg:block space-y-2">
        <Link href="/shop" className="block text-xs font-medium text-slate-500 hover:text-orange-600">
          ← Storefront
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
