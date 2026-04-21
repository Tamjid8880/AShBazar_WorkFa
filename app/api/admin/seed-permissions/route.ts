import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// All default permissions grouped by category
const DEFAULT_PERMISSIONS = [
  { name: "view_dashboard", group: "dashboard" },

  { name: "view_orders", group: "orders" },
  { name: "manage_orders", group: "orders" },
  { name: "edit_orders", group: "orders" },

  { name: "view_products", group: "products" },
  { name: "create_products", group: "products" },
  { name: "edit_products", group: "products" },
  { name: "delete_products", group: "products" },

  { name: "view_categories", group: "products" },
  { name: "manage_categories", group: "products" },

  { name: "view_users", group: "users" },
  { name: "manage_users", group: "users" },
  { name: "assign_roles", group: "users" },

  { name: "view_reports", group: "reports" },
  { name: "view_audit_logs", group: "reports" },

  { name: "manage_coupons", group: "store" },
  { name: "manage_posters", group: "store" },
  { name: "manage_shipping", group: "store" },
  { name: "manage_settings", group: "store" },
  { name: "manage_complaints", group: "store" },
];

export async function POST() {
  try {
    // 1. Seed all permissions
    for (const perm of DEFAULT_PERMISSIONS) {
      await prisma.permission.upsert({
        where: { name: perm.name },
        update: { group: perm.group },
        create: { name: perm.name, group: perm.group }
      });
    }

    // 2. Seed roles
    const roles = ["customer", "admin", "super_admin", "call_center", "product_manager", "audit"];
    for (const roleName of roles) {
      await prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName }
      });
    }

    // 3. Auto-assign all permissions to super_admin
    const superAdminRole = await prisma.role.findUnique({ where: { name: "super_admin" } });
    const allPerms = await prisma.permission.findMany();

    if (superAdminRole) {
      for (const p of allPerms) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: p.id } },
          update: {},
          create: { roleId: superAdminRole.id, permissionId: p.id }
        });
      }
    }

    // 4. Give admin a basic set of permissions
    const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
    const adminDefaults = [
      "view_dashboard", "view_orders", "manage_orders", "edit_orders",
      "view_products", "create_products", "edit_products",
      "view_categories", "manage_categories",
      "manage_coupons", "manage_posters", "manage_shipping", "manage_complaints"
    ];

    if (adminRole) {
      for (const permName of adminDefaults) {
        const perm = allPerms.find(p => p.name === permName);
        if (perm) {
          await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
            update: {},
            create: { roleId: adminRole.id, permissionId: perm.id }
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Permissions & roles seeded successfully." });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Seed failed" }, { status: 500 });
  }
}
