"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function UserManagementPage() {
  const { data: session } = useSession();
  const isSuperAdmin = (session?.user as any)?.role === "super_admin";

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [modalUser, setModalUser] = useState<any>(null);
  const [modalRoleId, setModalRoleId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setRoles(data.roles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openModal(user: any) {
    setModalUser(user);
    setModalRoleId(user.roleId || "");
  }

  async function saveRole() {
    if (!modalUser) return;
    setSaving(true);
    const res = await fetch(`/api/admin/users/${modalUser.id}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId: modalRoleId })
    });
    const data = await res.json();
    if (data.success) {
      setModalUser(null);
      fetchData();
    } else {
      alert(data.error || "Failed to update role.");
    }
    setSaving(false);
  }

  const ROLE_COLORS: Record<string, string> = {
    super_admin: "bg-red-100 text-red-700 border-red-200",
    admin: "bg-orange-100 text-orange-700 border-orange-200",
    customer: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center text-slate-400 font-bold animate-pulse">Loading Users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Users Management</h1>
          <p className="text-slate-500 font-medium">{users.length} registered accounts</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 ring-orange-500/30"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(u => {
              const roleName = u.role?.name || "customer";
              const roleColor = ROLE_COLORS[roleName] || ROLE_COLORS.customer;
              return (
                <tr key={u.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-slate-900">{u.name}</td>
                  <td className="px-6 py-4 text-slate-600">{u.email || "—"}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{u.phone || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block border px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${roleColor}`}>
                      {roleName.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {isSuperAdmin ? (
                      <button
                        onClick={() => openModal(u)}
                        className="text-xs font-black uppercase text-orange-600 hover:text-orange-800 tracking-wider"
                      >
                        Assign Role
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400 font-bold">No users found.</div>
        )}
      </div>

      {/* Role Assignment Modal */}
      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="text-lg font-black text-slate-900 mb-1">Assign Role</h2>
            <p className="text-sm text-slate-500 mb-6">Changing role for <strong>{modalUser.name}</strong></p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Email</label>
                <input
                  type="text"
                  readOnly
                  value={modalUser.email || "No email"}
                  className="w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-700"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Select Role</label>
                <select
                  value={modalRoleId}
                  onChange={e => setModalRoleId(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm font-bold outline-none focus:ring-2 ring-orange-500/30"
                >
                  <option value="">— No Role (Customer) —</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name.toUpperCase().replace("_", " ")}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={() => setModalUser(null)}
                className="px-5 py-2 rounded-xl border text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={saveRole}
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-orange-500 text-white text-sm font-black shadow-md hover:bg-orange-600 active:scale-95 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
