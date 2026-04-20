"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const error = searchParams.get("error");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (res?.ok) {
      setMessage("Login successful. Redirecting...");
      // Also store minimal info in localStorage for legacy compatibility
      localStorage.setItem("auth_user", JSON.stringify({ email }));
      setTimeout(() => {
        router.push("/shop");
        router.refresh();
      }, 500);
    } else {
      setMessage("Invalid email or password.");
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

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-orange-500/30 focus:ring-2"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-orange-500/30 focus:ring-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">{message}</p>
        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{" "}
          <Link href="/register" className="font-semibold text-orange-600 hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-4 text-center">
          <Link href="/shop" className="text-sm text-slate-500 hover:text-orange-600">
            ← Continue as guest
          </Link>
        </p>
      </section>
    </div>
  );
}
