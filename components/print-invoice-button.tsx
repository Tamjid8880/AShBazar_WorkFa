"use client";

export default function PrintInvoiceButton() {
  return (
    <div className="fixed bottom-10 right-10 print:hidden">
      <button
        onClick={() => window.print()}
        className="rounded-full bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-2xl hover:scale-110 active:scale-95 transition-all"
      >
        PRINT INVOICE
      </button>
    </div>
  );
}
