"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [address,  setAddress]  = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [message,  setMessage]  = useState("");
  const [success,  setSuccess]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setMessage("Passwords do not match."); return; }
    setLoading(true); setMessage("");
    const res  = await fetch("/api/users/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, phone, address, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setSuccess(true);
      setName(""); setEmail(""); setPhone(""); setAddress(""); setPassword(""); setConfirm("");
    } else {
      setMessage(data.message ?? "Registration failed.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7f5] px-4 py-12">
      {/* Decorative panel */}
      <div className="hidden flex-col justify-between rounded-l-2xl bg-[#2e7d32] p-10 md:flex md:h-auto md:min-h-[600px] md:w-80">
        <div>
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <span className="text-lg font-black text-[#2e7d32]">A</span>
            </div>
            <div>
              <p className="font-heading font-bold text-white">AshBazar</p>
              <p className="text-[10px] uppercase tracking-widest text-white/60">Grocery Store</p>
            </div>
          </div>
          <h2 className="font-heading text-2xl font-bold leading-snug text-white">
            Join the AshBazar<br />Community!
          </h2>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            Create your free account to enjoy exclusive deals, faster checkout, and order tracking.
          </p>
        </div>
        <div className="space-y-4">
          {[
            { icon: "🎉", text: "Exclusive member discounts" },
            { icon: "📦", text: "Real-time order tracking" },
            { icon: "❤️", text: "Save your favourite products" },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm">{f.icon}</span>
              <p className="text-sm text-white/80">{f.text}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} AshBazar</p>
      </div>

      {/* Form */}
      <section className="w-full max-w-md rounded-r-2xl rounded-l-2xl border border-gray-100 bg-white p-8 shadow-card-lg md:rounded-l-none">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="mt-1 text-sm text-gray-500">Join AshBazar to track orders and checkout faster.</p>

        {success ? (
          <div className="mt-6 rounded-xl bg-[#e8f5e9] border border-[#a5d6a7] p-6 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="font-bold text-[#2e7d32]">Account Created!</h3>
            <p className="mt-1 text-sm text-gray-600">You can now log in and start shopping.</p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-md bg-[#4caf50] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#2e7d32] transition"
            >
              Login Now
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Full Name <span className="text-red-500">*</span></label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Phone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  placeholder="017xxxxxxxx"
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Delivery Address <span className="text-red-500">*</span></label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
                rows={2}
                placeholder="Your full delivery address…"
                className="input resize-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    {showPass
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Confirm Password <span className="text-red-500">*</span></label>
              <input
                type={showPass ? "text" : "password"}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="Repeat your password"
                className={`input ${confirm && confirm !== password ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""}`}
              />
              {confirm && confirm !== password && (
                <p className="mt-1 text-xs text-red-500">Passwords don&apos;t match</p>
              )}
            </div>

            {message && (
              <p className="text-sm font-medium text-red-500">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading || (!!confirm && confirm !== password)}
              className="w-full rounded-md bg-[#ff6f00] py-3 text-sm font-bold text-white shadow-orange hover:bg-[#e65100] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0110 10"/>
                  </svg>
                  Creating account…
                </>
              ) : "Register"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#2e7d32] hover:text-[#1b5e20] transition">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
}
