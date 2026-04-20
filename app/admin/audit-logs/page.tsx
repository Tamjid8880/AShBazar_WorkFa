"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const TYPE_BADGES: Record<string, { bg: string; text: string; dot: string }> = {
  ORDER_EDIT: { bg: "bg-amber-50", text: "text-amber-700", dot: "🟡" },
  ORDER_NOTE: { bg: "bg-blue-50", text: "text-blue-700", dot: "🔵" },
  ORDER_DELETE: { bg: "bg-red-50", text: "text-red-700", dot: "🔴" },
  USER_ROLE: { bg: "bg-purple-50", text: "text-purple-700", dot: "🟣" },
  ROLE_PERMISSION: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "🟣" },
  SYSTEM: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "🟢" },
  SYSTEM_BOOTSTRAP: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "🟢" },
};

function getBadge(type: string | null) {
  return TYPE_BADGES[type || ""] || { bg: "bg-slate-50", text: "text-slate-600", dot: "⚪" };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/audit-logs")
      .then(res => res.json())
      .then(data => {
        if (data.success) setLogs(data.data);
        setLoading(false);
      });
  }, []);

  const types = ["ALL", ...Array.from(new Set(logs.map(l => l.targetType || "SYSTEM")))];
  const filtered = filter === "ALL" ? logs : logs.filter(l => (l.targetType || "SYSTEM") === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">System History</h1>
          <p className="text-slate-500 font-medium">Complete audit trail of admin actions.</p>
        </div>
        <Link
          href="/admin/orders"
          className="rounded-xl border px-5 py-2 text-sm font-bold shadow-sm hover:bg-slate-50"
        >
          Back to Orders
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${filter === t
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
          >
            {t === "ALL" ? `All (${logs.length})` : `${t.replace(/_/g, " ")} (${logs.filter(l => (l.targetType || "SYSTEM") === t).length})`}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-20 text-center text-slate-400 font-bold animate-pulse">Loading records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center text-slate-400 font-bold">No historical data available.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-6 py-4 w-[180px]">Timestamp</th>
                <th className="px-6 py-4 w-[120px]">Admin</th>
                <th className="px-6 py-4 w-[160px]">Type</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => {
                const badge = getBadge(log.targetType);
                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase">
                        {log.performedBy}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 ${badge.bg} ${badge.text} px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider`}>
                        <span>{badge.dot}</span>
                        {(log.targetType || "SYSTEM").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700 max-w-[400px] truncate">
                      {log.action}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
