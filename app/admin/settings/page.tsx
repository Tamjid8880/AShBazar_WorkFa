"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // We can fetch initial logo from our public API or pass it down.
    // For simplicity, we just fetch it by hitting a GET, wait, we don't have a GET.
    // Let's add simple fetch logic or rely on the user to just put a new one.
    fetch('/api/settings').then(res => res.json()).then(data => {
       if (data && data.logoUrl) {
          setLogoUrl(data.logoUrl);
       }
    }).catch(() => {});
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setLoading(true);
    setMsg("Uploading image...");
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setLogoUrl(data.url);
        setMsg("Image uploaded temporarily. Click 'Save Settings' to apply.");
      } else {
        setMsg("Failed to upload image.");
      }
    } catch (err) {
      setMsg("Error uploading image.");
    } finally {
       setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoUrl) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl }),
      });
      if (res.ok) {
        setMsg("Settings saved successfully! Logo updated.");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMsg("Failed to save settings.");
      }
    } catch {
      setMsg("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Store Settings</h1>
        <p className="text-slate-500 font-medium">Manage website logo and global settings.</p>
      </div>
      <div className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Upload Store Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 file:mr-4 file:rounded-full file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-orange-700 hover:file:bg-orange-100"
            />
            <p className="mt-2 text-xs text-slate-500">
              Select an image from your PC or Phone. It will be used in the header and invoices.
            </p>
          </div>

          {logoUrl && (
             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Logo Preview</p>
                <img src={logoUrl} alt="Preview" className="h-16 object-contain" />
             </div>
          )}

          {msg && <p className={`text-sm font-bold ${msg.includes("Failed") || msg.includes("Error") ? 'text-red-500' : 'text-emerald-600'}`}>{msg}</p>}

          <button
            type="submit"
            disabled={loading || !logoUrl}
            className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
