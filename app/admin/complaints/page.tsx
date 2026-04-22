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

      <div className="rounded-[24px] border border-slate-200/60 bg-white p-1 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Ticket ID</th>
                <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Customer</th>
                <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Issue</th>
                <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Status</th>
                <th className="h-12 px-5 py-4 text-right align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.map(c => (
                <tr key={c.id} className="border-b border-slate-100 transition-all duration-200 hover:bg-slate-50/80 bg-white group">
                  <td className="p-4 align-middle">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">{c.ticketId}</span>
                    <p className="text-[10px] text-slate-400 font-bold mt-1.5">{new Date(c.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4 align-middle">
                    <p className="font-bold text-slate-900 text-sm tracking-tight">{c.user?.name}</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{c.user?.email}</p>
                  </td>
                  <td className="p-4 align-middle max-w-[300px]">
                    <h2 className="font-black text-slate-900 line-clamp-1">{c.subject}</h2>
                    <p className="text-xs text-slate-500 line-clamp-1 italic mt-0.5">"{c.description}"</p>
                    {c.adminReply && (
                      <div className="mt-2 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        Reply: {c.adminReply}
                      </div>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${c.status === 'open' ? 'bg-orange-50 text-orange-700 ring-orange-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${c.status === 'open' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-right">
                    {c.status === 'open' ? (
                      <div className="flex items-center justify-end gap-1.5">
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
                          title="Reply"
                          className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm border border-blue-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
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
                          title="Mark Resolved"
                          className="h-8 w-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition shadow-sm border border-emerald-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {complaints.length === 0 && (
            <div className="py-24 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <p className="text-slate-500 font-bold">No complaints found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
