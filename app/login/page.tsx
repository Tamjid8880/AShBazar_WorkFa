"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/shop";

  async function requestOtp() {
    if (!phone) {
      setMessage("Please enter your phone number.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setMessage("OTP sent to your phone (Check console for mock).");
      } else {
        setMessage(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      setMessage("Error requesting OTP.");
    }
    setLoading(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    let res;

    if (loginMethod === "email") {
      res = await signIn("credentials", {
        email,
        password,
        loginType: "email",
        redirect: false,
      });
    } else {
      res = await signIn("credentials", {
        phone,
        otp,
        loginType: "phone",
        redirect: false,
      });
    }

    if (res?.ok) {
      setMessage("Login successful. Redirecting...");
      if (loginMethod === "email") {
        localStorage.setItem("auth_user", JSON.stringify({ email }));
      } else {
        localStorage.setItem("auth_user", JSON.stringify({ phone }));
      }
      setTimeout(() => {
        router.push(callbackUrl);
        router.refresh();
      }, 500);
    } else {
      setMessage(res?.error || "Invalid credentials.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to place orders and track purchases.</p>

        {error === "AccessDenied" && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-600">
            Access Denied: You need an Admin or Super Admin account to access the admin panel.
          </div>
        )}

        <div className="mt-6 flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setLoginMethod("email")}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${loginMethod === "email" ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-700"}`}
          >
            Email
          </button>
          <button
            onClick={() => setLoginMethod("phone")}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${loginMethod === "phone" ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-700"}`}
          >
            Phone Number
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {loginMethod === "email" ? (
            <>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-orange-500/30 focus:ring-2 focus:border-orange-500 transition-all"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-orange-500/30 focus:ring-2 focus:border-orange-500 transition-all"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-orange-500/30 focus:ring-2 focus:border-orange-500 transition-all disabled:opacity-50"
                  type="tel"
                  placeholder="Phone Number (e.g. 017...)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={otpSent}
                  required
                />
                {!otpSent && (
                  <button
                    type="button"
                    onClick={requestOtp}
                    disabled={loading || !phone}
                    className="shrink-0 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                  >
                    Send OTP
                  </button>
                )}
              </div>
              {otpSent && (
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-orange-500/30 focus:ring-2 focus:border-orange-500 transition-all"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              )}
            </>
          )}

          <button 
            type="submit" 
            disabled={loading || (loginMethod === "phone" && !otpSent)}
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-all"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-sm font-medium ${message.includes("successful") || message.includes("OTP sent") ? "text-emerald-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{" "}
          <Link href="/register" className="font-semibold text-orange-600 hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-4 text-center">
          <Link href="/shop" className="text-sm text-slate-500 hover:text-orange-600">
            ← Back to Store
          </Link>
        </p>
      </section>
    </div>
  );
}
