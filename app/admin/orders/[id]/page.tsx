"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditOrderPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New item inputs
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Edit fields
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [adminNotes, setAdminNotes] = useState("");
  const [noteInput, setNoteInput] = useState("");

  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setDeliveryCharge(data.data.deliveryCharge || 0);
        setAdminNotes(data.data.adminNotes || "");
        setLogs(data.data.editLogs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(actionLabel: string, payload: any) {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionLabel, ...payload })
      });
      const data = await res.json();
      if (data.success) {
         fetchOrder(); // Reload
      } else {
         alert("Failed to update order");
      }
    } catch(e) {
      alert("Error saving.");
    }
    setSaving(false);
  }

  async function handleProductSearch(val: string) {
    setNewItemName(val);
    setShowOptions(true);
    setSelectedProductId(null);
    if (val.length < 2) {
      setProducts([]);
      return;
    }
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.data) {
        const matches = data.data.filter((p: any) => p.name.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
        setProducts(matches);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const selectProduct = (p: any) => {
    setNewItemName(p.name);
    setSelectedProductId(p.id);
    setNewItemPrice(Number(p.offerPrice || p.price));
    setShowOptions(false);
  };

  const handleAddItem = () => {
    if (!selectedProductId || !newItemName || newItemPrice < 0) return alert("Select a valid product from the dropdown.");
    handleUpdate(`Added item: ${newItemName} (Qty: ${newItemQty}, Price: ${newItemPrice} Tk)`, {
      addItem: {
        productId: selectedProductId,
        productName: newItemName,
        quantity: newItemQty,
        price: newItemPrice
      }
    });
    setNewItemName("");
    setNewItemQty(1);
    setNewItemPrice(0);
    setSelectedProductId(null);
  };

  const handleUpdateDelivery = () => {
    handleUpdate(`Updated delivery charge to ${deliveryCharge} Tk`, {
      deliveryCharge: Number(deliveryCharge)
    });
  };

  const handleAddNote = () => {
    if (!noteInput) return;
    handleUpdate(`Added Note: ${noteInput}`, {
      appendNote: noteInput
    });
    setNoteInput("");
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    if (confirm("Remove this item from order?")) {
      handleUpdate(`Removed item: ${itemName}`, {
        removeItemId: itemId
      });
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400">Loading Order Profile...</div>;
  if (!order) return <div className="p-20 text-center font-bold text-red-500">Order Not Found</div>;

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Manage Order</h1>
          <p className="text-slate-500 font-medium">Order #{order.id.slice(-6).toUpperCase()}</p>
        </div>
        <button onClick={() => router.back()} className="rounded-xl border px-4 py-2 text-sm font-bold shadow-sm hover:bg-slate-50">Back</button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 border-b pb-3 mb-4">Customer Details</h2>
            <div className="space-y-2 text-sm font-semibold">
              <p>Name: {order.user?.name}</p>
              <p>Phone: {order.phone}</p>
              <p>Address: {order.street}, {order.city}</p>
              <p>Status: <span className="uppercase text-orange-600 font-black">{order.orderStatus}</span></p>
            </div>
          </div>

          {/* Delivery & Totals */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
             <h2 className="text-lg font-black text-emerald-700 border-b pb-3 mb-4">Financials</h2>
             <div className="space-y-3 text-sm font-bold">
               <div className="flex justify-between text-slate-600"><span>Items Subtotal:</span> <span>৳ {order.subtotal}</span></div>
               <div className="flex justify-between text-slate-600"><span>Discount:</span> <span>- ৳ {order.discount || 0}</span></div>
               
               <div className="flex items-center justify-between py-2 border-y">
                 <span className="text-slate-700">Delivery Charge:</span>
                 <div className="flex items-center gap-2">
                   <span>৳</span>
                   <input 
                     type="number" 
                     className="w-20 border rounded px-2 py-1 text-right outline-none focus:ring-2 ring-emerald-500"
                     value={deliveryCharge}
                     onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                   />
                   <button 
                     disabled={saving}
                     onClick={handleUpdateDelivery}
                     className="bg-emerald-600 text-white px-3 py-1 rounded text-xs hover:bg-emerald-700"
                   >
                     SAVE
                   </button>
                 </div>
               </div>
               
               <div className="flex justify-between text-lg font-black text-slate-900 pt-2">
                 <span>Grand Total:</span> 
                 <span>৳ {order.total ?? order.totalPrice}</span>
               </div>
             </div>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 shadow-sm">
            <h2 className="text-lg font-black text-orange-800 border-b border-orange-200 pb-3 mb-4">Warehouse Notes</h2>
            <div className="whitespace-pre-wrap text-sm font-semibold text-orange-900 mb-4 bg-white/50 p-3 rounded-lg min-h-[60px]">
              {adminNotes || "No internal notes yet."}
            </div>
            <div className="flex flex-col gap-2">
              <textarea 
                className="w-full border-orange-300 rounded-lg p-3 text-sm font-medium outline-none focus:ring-2 ring-orange-500" 
                rows={3} 
                placeholder="Type order instruction for warehouse..."
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
              />
              <button 
                onClick={handleAddNote}
                disabled={saving}
                className="self-end bg-orange-600 text-white font-bold text-sm px-5 py-2 rounded-xl shadow-md hover:bg-orange-700 active:scale-95 transition"
              >
                + Append Note
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Items & Audit Trail */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 border-b pb-3 mb-4">Order Items</h2>
            <div className="space-y-3 mb-6">
              {order.items?.map((it: any) => (
                <div key={it.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 border">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{it.productName}</p>
                    <p className="text-xs font-semibold text-slate-500">{it.quantity}x @ ৳{it.price}</p>
                  </div>
                  <button 
                     onClick={() => handleRemoveItem(it.id, it.productName)}
                     className="text-red-500 hover:text-red-700 text-xs font-black uppercase"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
               <h3 className="text-xs font-black uppercase text-slate-400 mb-3">Add Custom Item</h3>
               <div className="grid grid-cols-12 gap-2 relative">
                 <div className="col-span-12 sm:col-span-6 relative">
                   <input 
                     type="text" 
                     placeholder="Type to search product..." 
                     className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-slate-900"
                     value={newItemName} onChange={e => handleProductSearch(e.target.value)}
                   />
                   {products.length > 0 && showOptions && (
                     <div className="absolute top-10 left-0 w-full bg-white border shadow-lg rounded-lg max-h-40 overflow-y-auto z-50">
                       {products.map(p => (
                         <div 
                           key={p.id} 
                           onClick={() => selectProduct(p)}
                           className="px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer font-bold border-b last:border-0"
                         >
                           {p.name} <span className="text-orange-500 float-right">৳{p.price}</span>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
                 
                 <input 
                   type="number" 
                   placeholder="Qty" 
                   min={1}
                   className="col-span-6 sm:col-span-3 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-slate-900"
                   value={newItemQty} onChange={e => setNewItemQty(Number(e.target.value))}
                 />
                 <input 
                   type="number" 
                   placeholder="Price (৳)" 
                   readOnly
                   className="col-span-6 sm:col-span-3 border rounded-lg px-3 py-2 text-sm bg-slate-50 outline-none"
                   value={newItemPrice}
                 />
                 <button 
                   onClick={handleAddItem}
                   disabled={saving || !selectedProductId}
                   className="col-span-12 bg-slate-900 text-white font-bold text-sm py-2 rounded-lg mt-1 hover:bg-slate-800 disabled:opacity-50"
                 >
                   Add Exact Item
                 </button>
               </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-6 shadow-none">
            <h2 className="text-sm font-black uppercase text-slate-500 border-b pb-2 mb-4">Audit Trail & History</h2>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {logs.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold italic">No manual edits recorded yet.</p>
              ) : logs.map((log: any) => (
                <div key={log.id} className="text-xs border-l-2 border-slate-300 pl-3">
                  <p className="text-slate-800 font-semibold">{log.action}</p>
                  <p className="text-slate-400 font-medium text-[10px]">By {log.adminName} on {new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
