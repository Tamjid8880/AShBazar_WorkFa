"use client";
import { useState } from "react";

export default function SuperAdminSetup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"input" | "done">("input");

  async function handleSetup() {
    setLoading(true);
    setMessage("");

    if (!email) {
      setMessage("Enter the email of the account that will become Super Admin.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Seed permissions & roles
      await fetch("/api/admin/seed-permissions", { method: "POST" });

      // Step 2: Elevate the user
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (data.success) {
        setStep("done");
        setMessage(data.message);
      } else {
        setMessage(data.error);
      }
    } catch (e) {
      setMessage("Bootstrap failed. Check server logs.");
    }
    setLoading(false);
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
            <span className="text-2xl font-black text-white">⚡</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">System Bootstrap</h1>
          <p className="mt-1 text-xs text-slate-500">One-time Super Admin initialization</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          {step === "input" ? (
            <>
              <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
                This terminal binds root privileges to an account. The user must already be registered. 
                This page will permanently lock after the first Super Admin is created.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1 block">
                    Target Account Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none text-emerald-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="admin@ashbazar.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleSetup}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-3 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition tracking-widest uppercase text-sm disabled:opacity-50"
                >
                  {loading ? "Initializing..." : "Execute Escalation"}
                </button>
              </div>

              {message && (
                <div className="mt-6 p-4 rounded-xl text-xs font-bold leading-relaxed bg-red-900/50 text-red-300 border border-red-800">
                  {message}
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-4xl">✅</div>
              <p className="text-emerald-300 font-bold text-sm">{message}</p>
              <div className="text-xs text-slate-400 space-y-1">
                <p>1. Go to <a href="/admin/login" className="text-emerald-400 underline">/admin/login</a></p>
                <p>2. Sign in with your Super Admin email + password</p>
                <p>3. You now control the entire system</p>
              </div>
              <a
                href="/admin/login"
                className="inline-block mt-4 bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-black hover:bg-emerald-700 transition"
              >
                Go to Admin Login →
              </a>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          <a href="/login" className="text-slate-500 hover:text-emerald-400">← Back to Customer Login</a>
        </p>
      </div>
    </div>
  );
}
