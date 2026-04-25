"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

type Cat   = { id: string; name: string; image?: string | null };
type Brand = { id: string; name: string };

type Props = {
  categories: Cat[];
  brands:     Brand[];
  settings?:  any;
  compact?:   boolean;
  search?:    { q?: string; categoryId?: string; brandId?: string };
};

// ─── Icons (SVG inline, no extra deps) ──────────────────────────
const SearchIcon   = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>;
const CartIcon     = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const UserIcon     = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const PhoneIcon    = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.93a19.5 19.5 0 01-4.92-4.92A19.79 19.79 0 012.12 9.2 2 2 0 014.11 7h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 14.91a16 16 0 005.91 5.91l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>;
const MailIcon     = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const ChevronDown  = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>;
const MenuIcon     = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const XIcon        = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export default function StoreHeader({ categories, brands, settings, compact, search }: Props) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [cartCount,      setCartCount]      = useState(0);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [shopDropOpen,   setShopDropOpen]   = useState(false);
  const [accountDropOpen,setAccountDropOpen]= useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [searchQ,        setSearchQ]        = useState(search?.q ?? "");
  const [scrolled,       setScrolled]       = useState(false);
  const [locationName,   setLocationName]   = useState("");

  const searchRef   = useRef<HTMLInputElement>(null);
  const shopTimeout = useRef<NodeJS.Timeout>();

  // ── Cart count from localStorage ───────────────────────────────
  useEffect(() => {
    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartCount(cart.reduce((s: number, i: any) => s + i.quantity, 0));
      } catch {}
    };
    updateCart();
    const orig = localStorage.setItem.bind(localStorage);
    localStorage.setItem = (key: string, value: string) => {
      orig(key, value);
      if (key === "cart") updateCart();
    };
    window.addEventListener("storage", updateCart);
    return () => { window.removeEventListener("storage", updateCart); localStorage.setItem = orig; };
  }, []);

  // ── Scroll shadow ───────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Location init ───────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("user_loc");
    if (saved) setLocationName(saved);
  }, []);

  function detectLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          const loc = data.address?.city || data.address?.town || data.address?.village || data.address?.state || "Unknown Location";
          setLocationName(loc);
          localStorage.setItem("user_loc", loc);
        } catch {
          const m = prompt("Could not detect exact city. Please enter your location:");
          if (m) { setLocationName(m); localStorage.setItem("user_loc", m); }
        }
      }, () => {
        const m = prompt("Location permission denied. Please enter your location:");
        if (m) { setLocationName(m); localStorage.setItem("user_loc", m); }
      });
    } else {
      const m = prompt("Geolocation not supported. Please enter your location:");
      if (m) { setLocationName(m); localStorage.setItem("user_loc", m); }
    }
  }

  // ── Search focus ────────────────────────────────────────────────
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function openShop()  { clearTimeout(shopTimeout.current); setShopDropOpen(true); }
  function closeShop() { shopTimeout.current = setTimeout(() => setShopDropOpen(false), 200); }

  return (
    <header className={`sticky top-0 z-50 w-full transition-shadow bg-gradient-to-r from-[#173e26] via-[#1a442a] to-[#609966] ${scrolled ? "shadow-md" : ""}`}>

      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div className="bg-black/20 text-white">
        <div className="container-main flex flex-col items-center justify-between gap-1 py-2 text-xs sm:flex-row">
          <span className="hidden font-medium text-white/70 sm:block">
            {session?.user ? (
              <>
                Welcome, <span className="font-bold text-white">{session.user.name || "User"}</span> 
                {" "} | {" "} 
                <span className="text-white/90">{(session.user as any).phone || "+1-4234-653579"}</span>
                {" "} | {" "} 
                {locationName ? (
                  <span className="text-white/90" title="Click to change location" onClick={detectLocation} style={{cursor: "pointer"}}>{locationName}</span>
                ) : (
                  <button onClick={detectLocation} className="underline hover:text-white transition">Detect Location</button>
                )}
              </>
            ) : (
              <>Welcome to <span className="font-bold text-white">AshBazar</span> — Fresh Groceries Delivered!</>
            )}
          </span>
          <div className="flex items-center gap-4 text-white/80">
            {settings?.contactPhone && (
              <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-1.5 hover:text-white transition">
                <PhoneIcon /><span>{settings.contactPhone}</span>
              </a>
            )}
            {settings?.contactPhone && settings?.contactEmail && <span className="text-white/30">|</span>}
            {settings?.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-1.5 hover:text-white transition">
                <MailIcon /><span>{settings.contactEmail}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Navbar ─────────────────────────────────────────── */}
      <nav className="bg-transparent">
        <div className="container-main flex items-center justify-between gap-4 py-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="AshBazar" className="h-10 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow">
                  <span className="text-lg font-black text-[#2e7d32]">A</span>
                </div>
                <div className="hidden sm:block">
                  <p className="font-black text-white text-base leading-tight font-heading">AshBazar</p>
                  <p className="text-white/60 text-[10px] uppercase tracking-widest leading-none">Grocery Store</p>
                </div>
              </div>
            )}
          </Link>

          {/* Search Bar (desktop) */}
          <div className="hidden flex-1 max-w-md md:flex">
            <form action="/shop" method="get" className="flex w-full">
              <input
                name="q"
                defaultValue={search?.q}
                placeholder="Search for items..."
                className="flex-1 rounded-l-md border-0 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-white/30"
              />
              <button
                type="submit"
                className="rounded-r-md bg-[#ff6f00] px-4 py-2.5 text-white hover:bg-[#e65100] transition"
              >
                <SearchIcon />
              </button>
            </form>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1 md:flex">
            <Link href="/" className="nav-link px-3 py-1.5 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded transition">
              Home
            </Link>

            {/* Shop Dropdown */}
            <div
              className="relative"
              onMouseEnter={openShop}
              onMouseLeave={closeShop}
            >
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded transition">
                All Products <ChevronDown />
              </button>
              {shopDropOpen && (
                <div className="absolute top-full left-0 z-50 mt-0 min-w-[200px] rounded-b-lg bg-white py-2 shadow-xl border border-gray-100 animate-slide-down">
                  <Link href="/shop" className="mega-nav-item font-semibold text-[#2e7d32]">
                    All Products
                  </Link>
                  <div className="my-1 border-t border-gray-100" />
                  {categories.slice(0, 8).map(cat => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.id}`}
                      className="mega-nav-item"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/products" className="px-3 py-1.5 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded transition">
              Product
            </Link>
            <Link href="/blog" className="px-3 py-1.5 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded transition">
              Blog
            </Link>
            <Link href="/contact" className="px-3 py-1.5 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded transition">
              Contact
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(v => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition md:hidden"
              aria-label="Search"
            >
              <SearchIcon />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 hover:text-white transition"
              aria-label="Cart"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff6f00] text-[10px] font-black text-white shadow">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Account dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccountDropOpen(v => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 hover:text-white transition"
                aria-label="Account"
              >
                <UserIcon />
              </button>

              {accountDropOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg bg-white py-2 shadow-xl border border-gray-100 animate-slide-down">
                  {session?.user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-800 truncate">{session.user.name || session.user.email}</p>
                        <p className="text-[10px] text-gray-400 truncate">{session.user.email}</p>
                      </div>
                      <Link href="/profile" onClick={() => setAccountDropOpen(false)} className="mega-nav-item">
                        My Profile
                      </Link>
                      <Link href="/profile" onClick={() => setAccountDropOpen(false)} className="mega-nav-item">
                        My Orders
                      </Link>
                      <Link href="/wishlist" onClick={() => setAccountDropOpen(false)} className="mega-nav-item">
                        My Wishlist
                      </Link>
                      {(session.user as any).role === "ADMIN" || (session.user as any).role === "SUPER_ADMIN" ? (
                        <Link href="/admin" onClick={() => setAccountDropOpen(false)} className="mega-nav-item font-bold text-[#2e7d32]">
                          Admin Panel
                        </Link>
                      ) : null}
                      <div className="my-1 border-t border-gray-100" />
                      <button
                        onClick={() => { signOut({ callbackUrl: "/" }); setAccountDropOpen(false); }}
                        className="mega-nav-item w-full text-red-500 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`} onClick={() => setAccountDropOpen(false)} className="mega-nav-item font-semibold">
                        Login
                      </Link>
                      <Link href="/register" onClick={() => setAccountDropOpen(false)} className="mega-nav-item">
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Sign Up button (desktop) */}
            {!session && (
              <Link
                href="/register"
                className="hidden rounded-md bg-[#ff6f00] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#e65100] transition shadow-sm sm:block"
              >
                Sign Up
              </Link>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 transition md:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="border-t border-white/10 bg-[#2e7d32] px-4 py-3 md:hidden animate-slide-down">
            <form action="/shop" method="get" className="flex">
              <input
                ref={searchRef}
                name="q"
                defaultValue={search?.q}
                placeholder="Search for items..."
                className="flex-1 rounded-l-md border-0 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none"
              />
              <button type="submit" className="rounded-r-md bg-[#ff6f00] px-4 text-white">
                <SearchIcon />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-white/10 bg-[#2e7d32] px-4 py-3 md:hidden animate-slide-down">
            <nav className="flex flex-col gap-1">
              {[
                { href: "/",        label: "Home" },
                { href: "/shop",    label: "All Products" },
                { href: "/products",label: "Product" },
                { href: "/blog",    label: "Blog" },
                { href: "/contact", label: "Contact" },
              ].map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition"
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-2 border-t border-white/20" />
              {session ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded-md px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition">
                    My Account
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-md px-4 py-2.5 text-left text-sm font-medium text-red-300 hover:bg-white/10 hover:text-red-200 transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`} onClick={() => setMobileOpen(false)} className="flex-1 rounded-md border border-white/30 py-2 text-center text-sm font-medium text-white hover:bg-white/10 transition">
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 rounded-md bg-[#ff6f00] py-2 text-center text-sm font-semibold text-white hover:bg-[#e65100] transition">
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </nav>

      {/* ── Category Nav Bar (below main nav) ───────────────────── */}
      {!compact && (
        <div className="border-b border-orange-600 bg-[#ff6f00] shadow-sm">
          <div className="container-main flex items-center gap-6 overflow-x-auto py-2 scrollbar-none">
            <Link
              href="/shop"
              className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition whitespace-nowrap"
            >
              All Products
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition whitespace-nowrap"
              >
                {cat.image && (
                  <img src={cat.image} alt="" className="h-5 w-5 rounded-full object-cover" />
                )}
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
