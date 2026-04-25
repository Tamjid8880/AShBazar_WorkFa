"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import StoreFooter from "@/components/store-footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data.success) setSettings(data.data);
    });
  }, []);

  const ChevronRight = () => (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    // No backend contact endpoint — simulate submit
    await new Promise(r => setTimeout(r, 800));
    setStatus("success");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5]">
      {/* Inline minimal header since StoreHeader needs async nav data */}
      <div className="bg-[#2e7d32] py-8">
        <div className="container-main">
          <div className="mb-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                <span className="text-base font-black text-[#2e7d32]">A</span>
              </div>
              <span className="font-heading font-bold text-white text-lg">AshBazar</span>
            </Link>
            <nav className="hidden items-center gap-4 text-sm font-medium text-white/80 md:flex">
              {[["Home", "/"], ["Shop", "/shop"], ["Product", "/products"], ["Blog", "/blog"], ["Contact", "/contact"]].map(([l, h]) => (
                <Link key={l} href={h} className="hover:text-white transition">{l}</Link>
              ))}
            </nav>
          </div>
          <h1 className="font-heading text-3xl font-bold text-white">Contact</h1>
          <nav className="breadcrumb mt-1">
            <Link href="/" className="text-white/70 hover:text-white transition text-sm">Home</Link>
            <ChevronRight />
            <span className="text-white/60 text-sm">Contact</span>
          </nav>
        </div>
      </div>

      <div className="container-main py-12">
        {/* Need Help */}
        <div className="mb-10 text-center">
          <p className="section-label mb-1">NEED HELP?</p>
          <h2 className="font-heading text-3xl font-bold text-gray-900 leading-snug">
            {settings?.contactTitle || "Haven't Found What You're\nLooking For? Contact Us"}
          </h2>
        </div>

        {/* Map */}
        <div className="mb-10 overflow-hidden rounded-xl shadow-card border border-gray-100">
          {settings?.contactMapUrl ? (
            <iframe 
              src={settings.contactMapUrl}
              width="100%" height="300" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-64 items-center justify-center bg-[#e8f5e9]">
              <div className="text-center">
                <div className="text-5xl mb-3">📍</div>
                <p className="font-bold text-[#2e7d32]">{settings?.contactAddress || "No: 58 A, East Madison Street"}</p>
                <p className="text-gray-500 text-sm">Add a Google Map Embed URL in Admin Settings</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Left — contact info */}
          <div className="space-y-8">
            {/* Address */}
            <div>
              <h3 className="mb-3 font-heading text-lg font-bold text-gray-900">Address</h3>
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <span className="text-xl">📍</span>
                <p className="whitespace-pre-wrap">{settings?.contactAddress || "No: 58 A, East Madison Street,\nBaltimore, MD"}</p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-3 font-heading text-lg font-bold text-gray-900">Contact</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>✉️</span>
                  <a href={`mailto:${settings?.contactEmail || "random@email.com"}`} className="hover:text-[#4caf50] transition">
                    {settings?.contactEmail || "random@email.com"}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>📞</span>
                  <a href={`tel:${settings?.contactPhone || "+14234653579"}`} className="hover:text-[#4caf50] transition">
                    {settings?.contactPhone || "+1 423-845-3579"}
                  </a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div>
              <h3 className="mb-3 font-heading text-lg font-bold text-gray-900">Hour Of Operation</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Mon – Fri: 08:30 – 20:00</p>
                <p>Sat &amp; Sun: 09:30 – 21:30</p>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { label: "f",  bg: "#1877f2", href: "#" },
                { label: "ig", bg: "#e1306c", href: "#" },
                { label: "in", bg: "#0077b5", href: "#" },
                { label: "P",  bg: "#e60023", href: "#" },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  style={{ backgroundColor: s.bg }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white hover:opacity-80 transition"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right — contact form */}
          <div>
            <h3 className="mb-1 font-heading text-xl font-bold text-gray-900">Get In Touch</h3>
            <p className="mb-6 text-sm text-gray-500">
              Your Email Address Will Not Be Published. Required Fields Are Marked *
            </p>

            {status === "success" ? (
              <div className="rounded-lg bg-[#e8f5e9] border border-[#a5d6a7] p-6 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="font-bold text-[#2e7d32]">Message sent successfully!</p>
                <p className="mt-1 text-sm text-gray-500">We&apos;ll get back to you within 24 hours.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-4 rounded-md bg-[#4caf50] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2e7d32] transition"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="input"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="input"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="input"
                      placeholder="+1 000-000-0000"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Subject</label>
                    <select
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="select"
                    >
                      <option value="">Select subject…</option>
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Issue</option>
                      <option value="return">Return / Refund</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Type your message…
                  </label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={5}
                    className="input resize-none"
                    placeholder="Write your message here…"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="rounded-md bg-[#ff6f00] px-8 py-3 text-sm font-bold text-white shadow-orange hover:bg-[#e65100] transition disabled:opacity-60 flex items-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0110 10"/>
                      </svg>
                      Sending…
                    </>
                  ) : "Send Now"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <StoreFooter settings={settings} />
    </div>
  );
}
