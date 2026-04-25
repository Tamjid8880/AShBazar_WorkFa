"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const FacebookIcon  = () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>;
const InstagramIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const LinkedinIcon  = () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>;
const PinterestIcon = () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>;
const PhoneIcon     = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.93a19.5 19.5 0 01-4.92-4.92A19.79 19.79 0 012.12 9.2 2 2 0 014.11 7h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 14.91a16 16 0 005.91 5.91l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>;
const MapPinIcon    = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const MailIcon      = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const ArrowRightIcon= () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

const quickLinks = [
  { label: "Home",    href: "/" },
  { label: "Shop",    href: "/shop" },
  { label: "Product", href: "/products" },
  { label: "About",   href: "/contact" },
  { label: "Contact", href: "/contact" },
];

const usefulLinks = [
  { label: "Privacy Policy",       href: "#" },
  { label: "Returns",              href: "#" },
  { label: "Terms & Conditions",   href: "#" },
  { label: "Latest News",          href: "/blog" },
  { label: "Our Sitemap",          href: "#" },
];

const paymentIcons = [
  { label: "Visa",       color: "#1a1f71" },
  { label: "Mastercard", color: "#eb001b" },
  { label: "PayPal",     color: "#003087" },
  { label: "AmEx",       color: "#2e77bc" },
  { label: "Discover",   color: "#f76f20" },
  { label: "Stripe",     color: "#6772e5" },
];

export default function StoreFooter({ settings }: { settings?: any }) {
  const [email, setEmail]   = useState("");
  const [subMsg, setSubMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setSubMsg("");
    try {
      const res  = await fetch("/api/newsletter", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      setSubMsg(data.message || data.error || "Done!");
      if (res.ok) setEmail("");
    } catch {
      setSubMsg("Error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <footer className="bg-gradient-to-r from-[#173e26] via-[#1a442a] to-[#609966] text-gray-300">

      {/* ── Newsletter Banner ──────────────────────────────────── */}
      <div className="bg-transparent border-b border-white/10">
        <div className="container-main flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
          <div>
            <h3 className="font-heading text-xl font-bold text-white">Subscribe to Our Newsletter</h3>
            <p className="mt-1 text-sm text-white/70">Get fresh deals, recipes and grocery tips straight to your inbox.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 rounded-l-md border-0 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-white/20"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-r-md bg-[#ff6f00] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e65100] transition disabled:opacity-60"
            >
              {loading ? "..." : "Subscribe"}
            </button>
          </form>
        </div>
        {subMsg && (
          <p className="pb-3 text-center text-xs font-medium text-white/80">{subMsg}</p>
        )}
      </div>

      {/* ── Main Footer ────────────────────────────────────────── */}
      <div className="container-main py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="AshBazar" className="h-10 object-contain brightness-200" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4caf50]">
                    <span className="text-lg font-black text-white">A</span>
                  </div>
                  <div>
                    <p className="font-heading font-bold text-white">AshBazar</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Grocery Store</p>
                  </div>
                </div>
              )}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              {settings?.footerDescription || "This book is a treatise on the theory of ethics, very popular during the Rana Issence latum."}
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[
                { icon: <FacebookIcon />,  href: settings?.socialLinks?.facebook  || "#" },
                { icon: <InstagramIcon />, href: settings?.socialLinks?.instagram || "#" },
                { icon: <LinkedinIcon />,  href: settings?.socialLinks?.linkedin  || "#" },
                { icon: <PinterestIcon />, href: settings?.socialLinks?.pinterest || "#" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target={s.href !== "#" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-600 text-gray-400 hover:border-[#4caf50] hover:bg-[#4caf50] hover:text-white transition"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-5 font-heading text-sm font-bold uppercase tracking-widest text-white">
              Quick Link
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="footer-link flex items-center gap-2 text-sm text-gray-400 hover:text-[#4caf50] transition">
                    <ArrowRightIcon />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="mb-5 font-heading text-sm font-bold uppercase tracking-widest text-white">
              Useful Links
            </h4>
            <ul className="space-y-2.5">
              {usefulLinks.map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#4caf50] transition">
                    <ArrowRightIcon />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-5 font-heading text-sm font-bold uppercase tracking-widest text-white">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <MailIcon />
                <a href={`mailto:${settings?.contactEmail || "random@email.com"}`} className="hover:text-[#4caf50] transition">
                  {settings?.contactEmail || "random@email.com"}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <PhoneIcon />
                <a href={`tel:${settings?.contactPhone || "+14234653579"}`} className="hover:text-[#4caf50] transition">
                  {settings?.contactPhone || "+1 423-465-3579"}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <MapPinIcon />
                <span>{settings?.contactAddress || "No: 58 A, East Madison Street, Baltimore, MD."}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ─────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="container-main flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} <span className="text-gray-400 font-medium">ECO MART GROCERY STORE</span>. All rights reserved.
          </p>
          {/* Payment method icons */}
          <div className="flex items-center gap-2">
            {paymentIcons.map(p => (
              <div
                key={p.label}
                className="flex h-6 w-10 items-center justify-center rounded border border-white/10 bg-white/5 px-1"
                title={p.label}
              >
                <span className="text-[8px] font-black text-gray-400 tracking-tight truncate">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
