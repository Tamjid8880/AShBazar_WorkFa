"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [form, setForm] = useState({
    logoUrl: "",
    contactTitle: "",
    contactAddress: "",
    contactPhone: "",
    contactEmail: "",
    contactMapUrl: "",
    footerDescription: "",
    socialFacebook: "",
    socialInstagram: "",
    socialLinkedin: "",
    socialPinterest: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => {
       if (data.success && data.data) {
          setForm({
             logoUrl:           data.data.logoUrl           || "",
             contactTitle:      data.data.contactTitle      || "",
             contactAddress:    data.data.contactAddress    || "",
             contactPhone:      data.data.contactPhone      || "",
             contactEmail:      data.data.contactEmail      || "",
             contactMapUrl:     data.data.contactMapUrl     || "",
             footerDescription: data.data.footerDescription || "",
             socialFacebook:    (data.data.socialLinks as any)?.facebook  || "",
             socialInstagram:   (data.data.socialLinks as any)?.instagram || "",
             socialLinkedin:    (data.data.socialLinks as any)?.linkedin  || "",
             socialPinterest:   (data.data.socialLinks as any)?.pinterest || "",
          });
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
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, logoUrl: data.url }));
        setMsg("Image uploaded successfully.");
      } else {
        setMsg("Failed to upload image.");
      }
    } catch {
      setMsg("Error uploading image.");
    } finally {
       setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const payload = {
        ...form,
        socialLinks: {
          facebook:  form.socialFacebook  || null,
          instagram: form.socialInstagram || null,
          linkedin:  form.socialLinkedin  || null,
          pinterest: form.socialPinterest || null,
        },
      };
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMsg("Settings saved successfully!");
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
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Store Settings</h1>
        <p className="text-slate-500 font-medium">Manage global configuration, contact details, and footer.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* LOGO SETTINGS */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold mb-6 border-b pb-4">Branding</h2>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Store Logo</label>
            <input
              type="file" accept="image/*" onChange={handleFileChange}
              className="mt-2 w-full text-xs font-bold text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-slate-900 file:text-white file:uppercase hover:file:bg-slate-800"
            />
          </div>
          {form.logoUrl && (
             <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 inline-block">
                <img src={form.logoUrl} alt="Preview" className="h-12 object-contain" />
             </div>
          )}
        </div>

        {/* CONTACT PAGE SETTINGS */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 grid md:grid-cols-2 gap-6">
          <h2 className="text-xl font-bold mb-2 border-b pb-4 md:col-span-2">Contact Page Settings</h2>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Title</label>
            <input
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold"
              value={form.contactTitle} onChange={e => setForm({ ...form, contactTitle: e.target.value })}
              placeholder="e.g. Get in Touch with AshBazar"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
            <input
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold"
              value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })}
              placeholder="e.g. support@ashbazar.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</label>
            <input
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold"
              value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })}
              placeholder="e.g. +880 1234 567890"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Physical Address</label>
            <textarea
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium"
              value={form.contactAddress} onChange={e => setForm({ ...form, contactAddress: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Google Map Embed Link (src only)</label>
            <input
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold text-xs font-mono"
              value={form.contactMapUrl} onChange={e => setForm({ ...form, contactMapUrl: e.target.value })}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
          </div>
        </div>

        {/* FOOTER SETTINGS */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold mb-6 border-b pb-4">Footer Settings</h2>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Footer Description</label>
            <textarea
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium"
              value={form.footerDescription} onChange={e => setForm({ ...form, footerDescription: e.target.value })}
              rows={3}
              placeholder="Write a short description for the footer..."
            />
          </div>
        </div>

        {/* SOCIAL MEDIA LINKS */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 grid md:grid-cols-2 gap-6">
          <h2 className="text-xl font-bold mb-2 border-b pb-4 md:col-span-2">Social Media Links</h2>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">🔵 Facebook URL</label>
            <input
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold text-sm"
              value={form.socialFacebook} onChange={e => setForm({ ...form, socialFacebook: e.target.value })}
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">📸 Instagram URL</label>
            <input
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold text-sm"
              value={form.socialInstagram} onChange={e => setForm({ ...form, socialInstagram: e.target.value })}
              placeholder="https://instagram.com/yourhandle"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">💼 LinkedIn URL</label>
            <input
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold text-sm"
              value={form.socialLinkedin} onChange={e => setForm({ ...form, socialLinkedin: e.target.value })}
              placeholder="https://linkedin.com/company/yourco"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">📌 Pinterest URL</label>
            <input
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 font-bold text-sm"
              value={form.socialPinterest} onChange={e => setForm({ ...form, socialPinterest: e.target.value })}
              placeholder="https://pinterest.com/yourprofile"
            />
          </div>
        </div>

        {msg && <p className={`text-sm font-bold px-4 ${msg.includes("Failed") || msg.includes("Error") ? 'text-red-500' : 'text-emerald-600'}`}>{msg}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 font-black text-white shadow-xl hover:opacity-95 transition disabled:opacity-50"
        >
          {loading ? "SAVING SETTINGS..." : "SAVE ALL SETTINGS"}
        </button>
      </form>
    </div>
  );
}
