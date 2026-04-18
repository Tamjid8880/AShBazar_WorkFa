"use client";

import { useEffect, useState } from "react";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);

  async function load() {
    const res = await fetch("/api/complaints");
    const data = await res.json();
    setComplaints(data.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Complaints & Tickets</h1>
        <p className="text-slate-500 font-medium tracking-tight">Manage user issues and support requests.</p>
      </div>

      <div className="grid gap-6">
        {complaints.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200 text-slate-400 font-bold">No complaints found.</div>
        ) : (
          complaints.map(c => (
            <div key={c.id} className="rounded-[40px] bg-white border border-slate-100 shadow-sm p-8 flex flex-col md:flex-row gap-10">
               <div className="md:w-1/4">
                  <span className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{c.ticketId}</span>
                  <div className="mt-6">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Customer</p>
                     <p className="font-bold text-slate-900">{c.user?.name}</p>
                     <p className="text-xs text-slate-400">{c.user?.email}</p>
                  </div>
                  <div className="mt-4">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Submitted On</p>
                     <p className="text-xs font-bold text-slate-600 italic">{new Date(c.createdAt).toLocaleString()}</p>
                  </div>
               </div>
               <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                     <h2 className="text-xl font-black text-slate-900 line-clamp-1">{c.subject}</h2>
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${c.status === 'open' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>{c.status}</span>
                  </div>
                  <p className="text-slate-500 font-medium leading-relaxed italic border-l-4 border-slate-100 pl-6 py-2 bg-slate-50/50 rounded-r-xl">"{c.description}"</p>
                   <div className="pt-6 flex flex-col gap-4">
                      {c.status === 'open' && (
                        <div className="flex gap-3">
                           <button 
                             onClick={() => {
                               const reply = prompt("Enter your reply to the customer:");
                               if (reply) {
                                 fetch(`/api/complaints`, {
                                   method: "PUT",
                                   headers: { "Content-Type": "application/json" },
                                   body: JSON.stringify({ id: c.id, status: 'replied', adminReply: reply })
                                 }).then(() => load());
                               }
                             }}
                             className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg"
                           >
                             REPLY CUSTOMER
                           </button>
                           <button 
                             onClick={() => {
                               if (confirm("Mark this complaint as resolved?")) {
                                 fetch(`/api/complaints`, {
                                   method: "PUT",
                                   headers: { "Content-Type": "application/json" },
                                   body: JSON.stringify({ id: c.id, status: 'closed' })
                                 }).then(() => load());
                               }
                             }}
                             className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-xl text-xs font-black"
                           >
                             MARK AS RESOLVED
                           </button>
                        </div>
                      )}
                      {c.adminReply && (
                        <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                           <p className="text-[10px] font-black uppercase text-orange-600 mb-1">Admin Reply</p>
                           <p className="text-sm font-bold text-slate-700">{c.adminReply}</p>
                        </div>
                      )}
                   </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
