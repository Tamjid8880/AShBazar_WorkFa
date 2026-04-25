"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [phone,       setPhone]       = useState("");
  const [otp,         setOtp]         = useState("");
  const [otpSent,     setOtpSent]     = useState(false);
  const [message,     setMessage]     = useState("");
  const [loading,     setLoading]     = useState(false);
  const [showPass,    setShowPass]    = useState(false);

  const error       = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  async function requestOtp() {
    if (!phone) { setMessage("Please enter your phone number."); return; }
    setLoading(true); setMessage("");
    try {
      const res  = await fetch("/api/auth/otp/request", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) { setOtpSent(true); setMessage("OTP sent to your phone."); }
      else         setMessage(data.error || "Failed to send OTP.");
    } catch { setMessage("Error requesting OTP."); }
    setLoading(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setMessage("");

    let res;
    if (loginMethod === "email") {
      res = await signIn("credentials", { email, password, loginType: "email", redirect: false });
    } else {
      res = await signIn("credentials", { phone, otp, loginType: "phone", redirect: false });
    }

    if (res?.ok) {
      setMessage("Login successful. Redirecting…");
      setTimeout(() => { window.location.href = callbackUrl; }, 500);
    } else {
      setMessage(res?.error || "Invalid credentials.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7f5] px-4">
      {/* Left decorative panel (hidden on mobile) */}
      <div className="hidden flex-col justify-between rounded-l-2xl bg-[#2e7d32] p-10 md:flex md:h-[620px] md:w-80">
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
            Welcome Back to AshBazar!
          </h2>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            Sign in to access your orders, wishlist, and exclusive deals.
          </p>
        </div>
        <div className="space-y-4">
          {[
            { icon: "🛒", text: "Track your orders easily" },
            { icon: "⚡", text: "Faster checkout experience" },
            { icon: "🎁", text: "Access exclusive offers" },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm">
                {f.icon}
              </span>
              <p className="text-sm text-white/80">{f.text}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} AshBazar</p>
      </div>

      {/* Right — form */}
      <section className="w-full max-w-md rounded-r-2xl rounded-l-2xl border border-gray-100 bg-white p-8 shadow-card-lg md:rounded-l-none">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Sign In</h1>
        <p className="mt-1 text-sm text-gray-500">Access your account and track your orders.</p>

        {error === "AccessDenied" && (
          <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            Access Denied: Admin or Super Admin account required.
          </div>
        )}

        {/* Method toggle */}
        <div className="mt-6 flex rounded-lg bg-[#f5f7f5] p-1 gap-1">
          <button
            onClick={() => setLoginMethod("email")}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
              loginMethod === "email"
                ? "bg-white text-[#2e7d32] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setLoginMethod("phone")}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
              loginMethod === "phone"
                ? "bg-white text-[#2e7d32] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Phone Number
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          {loginMethod === "email" ? (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Email Address
                </label>
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
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPass ? (
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Phone Number</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    disabled={otpSent}
                    required
                    placeholder="017xxxxxxxx"
                    className="input flex-1 disabled:opacity-60"
                  />
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={requestOtp}
                      disabled={loading || !phone}
                      className="shrink-0 rounded-md border border-[#4caf50] px-4 py-2.5 text-sm font-semibold text-[#4caf50] hover:bg-[#e8f5e9] transition disabled:opacity-50"
                    >
                      Send OTP
                    </button>
                  )}
                </div>
              </div>
              {otpSent && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                    placeholder="Enter 6-digit OTP"
                    className="input tracking-widest"
                    maxLength={6}
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading || (loginMethod === "phone" && !otpSent)}
            className="w-full rounded-md bg-[#2e7d32] py-3 text-sm font-bold text-white shadow-green hover:bg-[#1b5e20] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0110 10"/>
                </svg>
                Signing in…
              </>
            ) : "Login"}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-sm font-medium ${
            message.includes("successful") || message.includes("OTP sent")
              ? "text-[#4caf50]"
              : "text-red-500"
          }`}>
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          New here?{" "}
          <Link href="/register" className="font-semibold text-[#ff6f00] hover:text-[#e65100] transition">
            Create an account
          </Link>
        </p>
        <p className="mt-3 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-[#4caf50] transition">
            ← Back to Store
          </Link>
        </p>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
