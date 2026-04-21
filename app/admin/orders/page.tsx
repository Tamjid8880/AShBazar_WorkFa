"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PermissionGuard from "@/components/permission-guard";
import { usePermissions } from "@/hooks/use-permissions";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "packed", label: "Packed" },
  { value: "on_the_way", label: "On the way" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" }
];

function QuickNoteCell({ orderId, initialNote, disabled }: { orderId: string, initialNote: string, disabled?: boolean }) {
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);

  async function saveNote() {
    setSaving(true);
    await fetch(`/api/orders/${orderId}/quick-note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note })
    });
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-1 w-32 sm:w-48">
      <textarea
        className="w-full text-xs p-1 border rounded min-h-[30px] outline-none focus:ring-1 ring-orange-400 disabled:bg-slate-50 disabled:text-slate-500"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Add instructions..."
        disabled={disabled}
      />
      {note !== initialNote && !disabled && (
        <button
          onClick={saveNote} disabled={saving}
          className="text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 py-0.5 rounded"
        >
          {saving ? "Saving..." : "Save Note"}
        </button>
      )}
    </div>
  );
}

type Order = {
  id: string;
  orderStatus: string;
  total: number | null;
  totalPrice: number;
  subtotal: number | null;
  discount: number | null;
  deliveryCharge: number | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  paymentMethod: string;
  orderDate: string;
  adminNotes?: string | null;
  user: { name: string; email: string | null };
  items: { productName: string; quantity: number; price: number; variant: string | null }[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { hasPermission } = usePermissions();

  const canEditOrders = hasPermission("edit_orders");
  const canManageOrders = hasPermission("manage_orders");
  const canViewLogs = hasPermission("view_audit_logs");

  async function load() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, orderStatus: string) {
    if (!canManageOrders) return;
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus })
    });
    load();
  }

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== "all" && o.orderStatus !== statusFilter) return false;
    return true;
  });

  return (
    <PermissionGuard permission="view_orders">
      <div className="space-y-8 relative pb-20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Order Management</h1>
            <p className="text-slate-500 font-medium">Manage fulfillment and generate customer invoices.</p>
          </div>
          {canViewLogs && (
            <button
              onClick={() => {
                window.location.href = "/admin/audit-logs";
              }}
              className="flex items-center gap-2 rounded-xl bg-purple-100 px-5 py-3 text-sm font-black text-purple-700 hover:bg-purple-200 transition"
            >
              VIEW HISTORY
            </button>
          )}
        </div>

        <div className="flex bg-white border border-slate-200 rounded-2xl p-2 gap-2 overflow-x-auto shadow-sm">
          <button 
            onClick={() => setStatusFilter("all")}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${statusFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            All Orders
          </button>
          {STATUS_OPTIONS.map(s => (
            <button 
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${statusFilter === s.value ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Note</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition border-b">
                  <td className="px-6 py-5">
                    <p className="font-black text-slate-900">#{o.id.slice(-6).toUpperCase()}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{new Date(o.orderDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-800">{o.user?.name}</p>
                    <p className="text-xs text-slate-500">{o.phone}</p>
                  </td>
                  <td className="px-6 py-5 font-black text-slate-900">
                    ৳{(o.total ?? o.totalPrice).toFixed(2)}
                  </td>
                  <td className="px-6 py-5">
                    <select
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold outline-none ring-orange-500/20 focus:ring-4 ${
                        o.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        o.orderStatus === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                      value={o.orderStatus}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      disabled={!canManageOrders}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <QuickNoteCell orderId={o.id} initialNote={o.adminNotes || ""} disabled={!canEditOrders} />
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded-md text-slate-500">{o.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-5 flex items-center gap-2">
                    <button
                      onClick={() => window.open(`/admin/orders/${o.id}/invoice`, '_blank')}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-slate-800 transition"
                    >
                      INVOICE
                    </button>
                    {canEditOrders && (
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-orange-100 px-4 py-2 text-xs font-black text-orange-700 hover:bg-orange-200 transition"
                      >
                        EDIT
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-bold">No orders found for this status.</div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}
