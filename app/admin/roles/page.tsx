"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const GROUP_LABELS: Record<string, { label: string; icon: string }> = {
  dashboard: { label: "Dashboard", icon: "▣" },
  orders: { label: "Orders", icon: "◎" },
  products: { label: "Products & Categories", icon: "◇" },
  users: { label: "Users & Access", icon: "👤" },
  reports: { label: "Reports & Logs", icon: "📋" },
  store: { label: "Store Management", icon: "⚙" },
  general: { label: "General", icon: "○" },
};

export default function RolesPermissionsPage() {
  const { data: session } = useSession();
  const isSuperAdmin = (session?.user as any)?.role === "super_admin";

  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [assignedPermIds, setAssignedPermIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/roles");
    const data = await res.json();
    if (data.success) {
      setRoles(data.roles);
      setPermissions(data.permissions);
      // Auto-select first role
      if (data.roles.length > 0 && !selectedRoleId) {
        selectRole(data.roles[0]);
      }
    }
    setLoading(false);
  }

  function selectRole(role: any) {
    setSelectedRoleId(role.id);
    setAssignedPermIds(role.permissions.map((rp: any) => rp.permissionId));
  }

  function togglePermission(permId: string) {
    setAssignedPermIds(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  }

  async function savePermissions() {
    if (!selectedRoleId) return;
    setSaving(true);
    await fetch(`/api/admin/roles/${selectedRoleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissionIds: assignedPermIds })
    });
    await load();
    setSaving(false);
  }

  async function seedPermissions() {
    setSeeding(true);
    await fetch("/api/admin/seed-permissions", { method: "POST" });
    await load();
    setSeeding(false);
  }

  async function createRole(name: string) {
    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (data.success) {
      await load();
      setSelectedRoleId(data.role.id);
      setAssignedPermIds([]);
    } else {
      alert(data.error || "Failed to create role");
    }
  }

  // Group permissions by their group field
  const grouped = permissions.reduce((acc: Record<string, any[]>, p: any) => {
    const g = p.group || "general";
    if (!acc[g]) acc[g] = [];
    acc[g].push(p);
    return acc;
  }, {});

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  if (loading) return <div className="p-20 text-center text-slate-400 font-bold animate-pulse">Loading Roles & Permissions...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Roles & Permissions</h1>
          <p className="text-slate-500 font-medium">Control what each role can access across the system.</p>
        </div>
        <div className="flex items-center gap-3">
          {isSuperAdmin && permissions.length > 0 && (
            <button
              onClick={() => {
                const name = prompt("Enter new role name (e.g. Sales Manager, Call Center):");
                if (name) createRole(name);
              }}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-lg hover:bg-slate-800 active:scale-95 transition"
            >
              + CREATE ROLE
            </button>
          )}
          {permissions.length === 0 && (
            <button
              onClick={seedPermissions}
              disabled={seeding}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-lg hover:bg-emerald-700 active:scale-95 transition"
            >
              {seeding ? "Seeding..." : "Initialize Permissions"}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Role List */}
        <div className="lg:col-span-3 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">System Roles</p>
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => selectRole(role)}
              className={`w-full text-left rounded-xl px-4 py-3 border transition ${selectedRoleId === role.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
            >
              <p className="text-sm font-black uppercase tracking-wide">{role.name.replace("_", " ")}</p>
              <p className="text-[10px] mt-0.5 opacity-60">
                {role.permissions.length} permissions · {role._count.users} users
              </p>
            </button>
          ))}
        </div>

        {/* Right: Permission Checkboxes */}
        <div className="lg:col-span-9">
          {selectedRole ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Permissions for <span className="text-orange-600 uppercase">{selectedRole.name.replace("_", " ")}</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">{assignedPermIds.length} of {permissions.length} enabled</p>
                </div>
                {isSuperAdmin && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        if(confirm("This will recreate default roles and permissions! Continue?")) {
                          await fetch("/api/admin/seed-permissions", { method: "POST" });
                          window.location.reload();
                        }
                      }}
                       className="rounded-lg bg-orange-100 text-orange-700 px-4 py-2 font-black text-xs hover:bg-orange-200"
                    >
                      RESET ROLES
                    </button>
                    <button
                      onClick={savePermissions}
                      disabled={saving}
                      className="rounded-lg bg-slate-900 px-6 py-2.5 text-xs font-black text-white hover:bg-slate-800 transition disabled:opacity-50"
                    >
                      {saving ? "SAVING..." : "SAVE CHANGES"}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6">
                {Object.entries(grouped).map(([groupName, perms]) => {
                  const info = GROUP_LABELS[groupName] || { label: groupName, icon: "○" };
                  const allInGroup = (perms as any[]).every(p => assignedPermIds.includes(p.id));

                  return (
                    <div key={groupName} className="rounded-xl border border-slate-100 overflow-hidden">
                      {/* Group Header */}
                      <div className="flex items-center justify-between bg-slate-50 px-5 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500">{info.icon}</span>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">{info.label}</h3>
                        </div>
                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              const groupIds = (perms as any[]).map(p => p.id);
                              if (allInGroup) {
                                setAssignedPermIds(prev => prev.filter(id => !groupIds.includes(id)));
                              } else {
                                setAssignedPermIds(prev => [...new Set([...prev, ...groupIds])]);
                              }
                            }}
                            className="text-[10px] font-black uppercase text-slate-500 hover:text-orange-600"
                          >
                            {allInGroup ? "Deselect All" : "Select All"}
                          </button>
                        )}
                      </div>

                      {/* Permission Checkboxes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                        {(perms as any[]).map(perm => {
                          const isChecked = assignedPermIds.includes(perm.id);
                          return (
                            <label
                              key={perm.id}
                              className={`flex items-center gap-3 px-5 py-3 border-b border-slate-50 cursor-pointer transition-colors ${isChecked ? "bg-orange-50/50" : "hover:bg-slate-50/50"
                                } ${!isSuperAdmin ? "pointer-events-none opacity-60" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.id)}
                                disabled={!isSuperAdmin}
                                className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                              />
                              <span className="text-sm font-semibold text-slate-700">
                                {perm.name.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-20 text-center text-slate-400 font-bold">
              Select a role from the left to manage its permissions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
