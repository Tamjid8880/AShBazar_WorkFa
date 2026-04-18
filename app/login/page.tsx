"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem("auth_user", JSON.stringify(data.data));
      setMessage("Login successful. Redirecting...");
      setTimeout(() => {
        router.push("/shop");
      }, 1000);
    } else {
      setMessage(data.message ?? "Login failed.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to place orders and track purchases.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-orange-500/30 focus:ring-2"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <button type="submit" className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Login
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
