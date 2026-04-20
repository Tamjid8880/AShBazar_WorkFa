import AdminSidebar from "@/components/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f0f2f7] lg:flex-row print:bg-white print:block">
      <div className="print:hidden"><AdminSidebar /></div>
      <div className="flex min-h-0 flex-1 flex-col print:block">
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 print:overflow-visible print:p-0 print:block">{children}</div>
      </div>
    </div>
  );
}
