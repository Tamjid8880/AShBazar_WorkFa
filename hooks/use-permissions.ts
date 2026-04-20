"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function usePermissions() {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPerms() {
      if (status === "loading") return;
      if (status === "unauthenticated" || !session) {
        setPermissions([]);
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch("/api/admin/my-permissions");
        const data = await res.json();
        if (data.success && Array.isArray(data.permissions)) {
          setPermissions(data.permissions);
        } else {
          setPermissions([]);
        }
      } catch (err) {
        setPermissions([]);
      }
      setLoading(false);
    }
    
    fetchPerms();
  }, [session, status]);

  const hasPermission = (perm: string) => {
    if (session?.user?.role === "super_admin") return true;
    return permissions.includes(perm);
  };

  return { permissions, hasPermission, loading, isSuperAdmin: session?.user?.role === "super_admin" };
}
