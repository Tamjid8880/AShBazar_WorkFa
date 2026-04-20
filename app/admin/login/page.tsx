"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
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
      // Check if user actually has admin role by trying to fetch admin data
      const checkRes = await fetch("/api/admin/check-access");
      const checkData = await checkRes.json();

      if (checkData.allowed) {
        router.push("/admin");
        router.refresh();
      } else {
        setMessage("Access Denied. This account does not have admin privileges.");
      }
    } else {
      setMessage("Invalid credentials.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Admin Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30">
            <span className="text-2xl font-black text-white">A</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Panel</h1>
          <p className="mt-1 text-sm text-slate-400">AshBazar Management System</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          {(error === "AccessDenied") && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-bold text-red-400 text-center">
              You must sign in with an Admin account.
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</label>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="admin@ashbazar.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to Admin"}
            </button>
          </form>

          {message && (
            <div className="mt-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-bold text-red-400 text-center">
              {message}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Not an admin? <a href="/login" className="text-orange-500 hover:underline font-bold">Customer Login →</a>
        </p>
      </div>
    </div>
  );
}
