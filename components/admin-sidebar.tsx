import Link from "next/link";

const links = [
  { href: "/admin", label: "Dashboard", icon: "▣" },
  { href: "/admin/orders", label: "Orders", icon: "◎" },
  { href: "/admin/products", label: "Products", icon: "◇" },
  { href: "/admin/categories", label: "Categories", icon: "▤" },
  { href: "/admin/brands", label: "Brands", icon: "◆" },
  { href: "/admin/variants", label: "Variants", icon: "○" },
  { href: "/admin/coupons", label: "Coupons", icon: "%" },
  { href: "/admin/posters", label: "Posters", icon: "▨" },
  { href: "/admin/low-stock", label: "Low stock", icon: "!" },
  { href: "/admin/shipping", label: "Shipping", icon: "✈" }
];

export default function AdminSidebar() {
  return (
    <aside className="border-b border-slate-200/80 bg-white lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex h-14 items-center gap-2 border-b border-slate-100 px-4 lg:h-16 lg:px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-black text-white">
          A
        </span>
        <div>
          <p className="text-sm font-bold text-slate-900">Admin</p>
          <p className="hidden text-[10px] uppercase tracking-wide text-slate-400 lg:block">ShopMart</p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible lg:p-3">
        {links.map((l) => (
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
      <div className="hidden border-t border-slate-100 p-4 lg:block">
        <Link href="/shop" className="text-xs font-medium text-slate-500 hover:text-orange-600">
          ← Storefront
        </Link>
      </div>
    </aside>
  );
}
