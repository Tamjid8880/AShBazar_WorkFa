"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
}

export default function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const { data: session, status } = useSession();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkPermission() {
      if (status === "loading") return;
      if (status === "unauthenticated" || !session) {
        setHasPermission(false);
        return;
      }

      // If user is super_admin, they have full access
      if (session.user.role === "super_admin") {
        setHasPermission(true);
        return;
      }

      try {
        const res = await fetch("/api/admin/my-permissions");
        const data = await res.json();
        
        if (data.success && Array.isArray(data.permissions)) {
          setHasPermission(data.permissions.includes(permission));
        } else {
          setHasPermission(false);
        }
      } catch (err) {
        console.error("Failed to check permissions:", err);
        setHasPermission(false);
      }
    }

    checkPermission();
  }, [session, status, permission]);

  if (hasPermission === null) {
    return <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Checking Access...</div>;
  }

  if (hasPermission === false) {
    return (
      <div className="p-16 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6 font-black text-3xl">
          !
        </div>
        <h2 className="text-2xl font-black text-slate-900">Access Denied</h2>
        <p className="mt-2 text-slate-500 font-medium max-w-md mx-auto">
          You do not have the required permission <code className="bg-slate-100 text-slate-700 px-2 py-1 rounded mx-1 text-xs">{permission}</code> to view this area.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
