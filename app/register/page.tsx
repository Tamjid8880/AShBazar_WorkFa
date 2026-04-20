"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, address, password })
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Account created. You can log in now.");
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setPassword("");
    } else {
      setMessage(data.message ?? "Registration failed.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-600">Join AshBazar to track orders and checkout faster.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Username</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-orange-500/30 focus:ring-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Email Address</label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-orange-500/30 focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Phone Number</label>
            <input
              type="tel"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-orange-500/30 focus:ring-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Delivery Address</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-orange-500/30 focus:ring-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={2}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-orange-500/30 focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-semibold text-white shadow hover:opacity-95"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">{message}</p>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-orange-600 hover:underline">
            Log in
          </Link>
        </p>
      </section>
    </div>
  );
}
