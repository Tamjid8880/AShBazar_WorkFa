"use client";

import { FormEvent, useEffect, useState } from "react";
import { firstProductImageUrl } from "@/lib/product-images";
import PermissionGuard from "@/components/permission-guard";
import { usePermissions } from "@/hooks/use-permissions";

type Variant = { id: string; name: string };
type VariantType = { id: string; name: string; type: string; variants: Variant[] };
type Category = { id: string; name: string };
type SubCategory = { id: string; name: string; categoryId: string };

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  offerPrice: number | null;
  quantity: number;
  weight: number;
  isHotDeal: boolean;
  isSpecialOffer: boolean;
  isHidden: boolean;
  category: { name: string };
  images: any;
  variants: { price: number; stock: number; variant: { name: string } }[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);

  // Form states
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [weight, setWeight] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [variantTypeId, setVariantTypeId] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<{ variantId: string; price: string; stock: string }[]>([]);
  const [isHotDeal, setIsHotDeal] = useState(false);
  const [isSpecialOffer, setIsSpecialOffer] = useState(false);

  // Quick Add states
  const [newCatName, setNewCatName] = useState("");
  const [newVarName, setNewVarName] = useState("");

  // Edit modal state
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editOfferPrice, setEditOfferPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editHotDeal, setEditHotDeal] = useState(false);
  const [editSpecial, setEditSpecial] = useState(false);
  const [editHidden, setEditHidden] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // Restock modal state
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState("0");

  // Filter
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "instock" | "outofstock" | "hidden">("all");

  async function loadData() {
    const [p, c, sc, vt] = await Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/subCategories").then((r) => r.json()),
      fetch("/api/variantTypes").then((r) => r.json()),
    ]);
    setProducts(p.data ?? []);
    setCategories(c.data ?? []);
    setSubCategories(sc.data ?? []);
    setVariantTypes(vt.data ?? []);
  }

  useEffect(() => { loadData(); }, []);

  const currentVariants = variantTypes.find((vt) => vt.id === variantTypeId)?.variants ?? [];

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const newUrls = [...uploadedUrls];
    for (let i = 0; i < files.length; i++) {
      if (newUrls.length >= 5) break;
      const formData = new FormData();
      formData.append("file", files[i]);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) newUrls.push(data.url);
      } catch (err) { console.error("Upload failed", err); }
    }
    setUploadedUrls(newUrls);
    setUploading(false);
  }

  function removeUploadedImage(idx: number) { setUploadedUrls(uploadedUrls.filter((_, i) => i !== idx)); }

  function toggleVariant(vid: string) {
    if (selectedVariants.find((v) => v.variantId === vid)) {
      setSelectedVariants(selectedVariants.filter((v) => v.variantId !== vid));
    } else {
      setSelectedVariants([...selectedVariants, { variantId: vid, price: price, stock: quantity }]);
    }
  }

  async function quickAddCategory() {
    if (!newCatName) return;
    await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newCatName, image: "" }) });
    setNewCatName(""); loadData();
  }

  async function quickAddVariant() {
    if (!newVarName || !variantTypeId) return;
    await fetch("/api/variants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newVarName, variantTypeId }) });
    setNewVarName(""); loadData();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId || !subCategoryId) { alert("Please select category and subcategory."); return; }
    const payload = {
      name, description: desc, price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : null,
      quantity: Number(quantity), weight: Number(weight),
      proCategoryId: categoryId, proSubCategoryId: subCategoryId,
      proVariantTypeId: variantTypeId || null,
      isHotDeal, isSpecialOffer,
      images: uploadedUrls.map((u) => ({ url: u })),
      variants: selectedVariants.map((sv) => ({ variantId: sv.variantId, price: Number(sv.price), stock: Number(sv.stock) })),
    };
    const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      setName(""); setDesc(""); setPrice(""); setOfferPrice("");
      setQuantity("0"); setIsHotDeal(false); setIsSpecialOffer(false);
      setUploadedUrls([]); setSelectedVariants([]);
      loadData();
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product permanently?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadData();
  }

  async function quickToggle(id: string, field: "isHotDeal" | "isSpecialOffer" | "isHidden", current: boolean) {
    await fetch(`/api/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: !current }) });
    loadData();
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditOfferPrice(p.offerPrice ? String(p.offerPrice) : "");
    setEditQuantity(String(p.quantity));
    setEditHotDeal(p.isHotDeal);
    setEditSpecial(p.isSpecialOffer);
    setEditHidden(p.isHidden);
  }

  async function saveEdit() {
    if (!editProduct) return;
    setEditSaving(true);
    await fetch(`/api/products/${editProduct.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, price: Number(editPrice), offerPrice: editOfferPrice ? Number(editOfferPrice) : null, quantity: Number(editQuantity), isHotDeal: editHotDeal, isSpecialOffer: editSpecial, isHidden: editHidden })
    });
    setEditSaving(false); setEditProduct(null); loadData();
  }

  async function saveRestock() {
    if (!restockProduct || !restockAmount) return;
    const newStock = restockProduct.quantity + Number(restockAmount);
    await fetch(`/api/products/${restockProduct.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity: newStock }) });
    setRestockProduct(null); setRestockAmount("0"); loadData();
  }

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(filterSearch.toLowerCase());
    const matchStatus =
      filterStatus === "all" ? true :
        filterStatus === "instock" ? p.quantity > 0 && !p.isHidden :
          filterStatus === "outofstock" ? p.quantity <= 0 :
            filterStatus === "hidden" ? p.isHidden : true;
    return matchSearch && matchStatus;
  });

  const outOfStockCount = products.filter(p => p.quantity <= 0).length;
  const hiddenCount = products.filter(p => p.isHidden).length;

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("create_products");
  const canEdit = hasPermission("edit_products");
  const canDelete = hasPermission("delete_products"); // we didn't add this explicitly, but let's say canEdit means also delete or check it
  const canManageCategories = hasPermission("manage_categories");

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Product Management</h1>
          <p className="text-slate-500 font-medium tracking-tight">Create and manage your shop catalog.</p>
        </div>
        <div className="flex gap-3">
          {outOfStockCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-2 text-center">
              <p className="text-xs font-black text-red-600 uppercase tracking-widest">Out of Stock</p>
              <p className="text-2xl font-black text-red-700">{outOfStockCount}</p>
            </div>
          )}
          {hiddenCount > 0 && (
            <div className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2 text-center">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Hidden</p>
              <p className="text-2xl font-black text-slate-700">{hiddenCount}</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD PRODUCT & SETUP ROW */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {canCreate ? (
            <form onSubmit={handleSubmit} className="space-y-6 rounded-[40px] border border-slate-100 bg-white p-10 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">Add New Product</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Name</label>
                  <input className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10" placeholder="e.g. Pure Mustard Oil" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                  <textarea className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price (৳)</label>
                  <input type="number" step="0.01" className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Offer Price (৳)</label>
                  <input type="number" step="0.01" className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock (Units)</label>
                  <input type="number" className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weight (kg)</label>
                  <input type="number" step="0.01" className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                  <select className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                    <option value="">Select Category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sub Category</label>
                  <select className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10" value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)} required>
                    <option value="">Select SubCat</option>
                    {subCategories.filter((sc) => sc.categoryId === categoryId).map((sc) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                  </select>
                </div>
                {/* Images */}
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Images</label>
                  <div className="grid grid-cols-5 gap-3">
                    {uploadedUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removeUploadedImage(i)} className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px]">✕</button>
                      </div>
                    ))}
                    {uploadedUrls.length < 5 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition">
                        <span className="text-2xl text-slate-300 font-bold">+</span>
                        <span className="text-[8px] font-black text-slate-400">UPLOAD</span>
                        <input type="file" multiple className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
                      </label>
                    )}
                  </div>
                  {uploading && <p className="text-[10px] font-bold text-orange-600 animate-pulse">Uploading images...</p>}
                </div>
                {/* Promotions */}
                <div className="md:col-span-2 flex gap-8 py-4 border-y border-slate-50">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={isHotDeal} onChange={e => setIsHotDeal(e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-orange-600" />
                    <span className="text-sm font-black text-slate-900 uppercase">🔥 HOT DEAL</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={isSpecialOffer} onChange={e => setIsSpecialOffer(e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-orange-600" />
                    <span className="text-sm font-black text-slate-900 uppercase">🌟 SPECIAL OFFER</span>
                  </label>
                </div>
              </div>
              <button type="submit" disabled={uploading} className="w-full rounded-3xl bg-slate-900 py-5 font-black text-white shadow-2xl hover:bg-slate-800 transition-all disabled:opacity-50">
                ADD PRODUCT
              </button>
            </form>
          ) : (
            <div className="rounded-[40px] border-2 border-dashed border-slate-200 bg-slate-50 p-10 flex items-center justify-center text-center">
               <p className="font-bold text-slate-500">You do not have permission to create products.</p>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {canManageCategories && (
            <div className="rounded-[40px] border border-slate-100 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">Quick Setup</h2>
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Add Category</label>
                  <div className="flex gap-2">
                    <input className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold" placeholder="Name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
                    <button onClick={quickAddCategory} className="bg-orange-600 text-white px-4 rounded-xl font-black text-xs hover:bg-orange-700 transition-all">+</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Add Variant</label>
                  <div className="flex gap-2">
                    <select className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold" value={variantTypeId} onChange={(e) => setVariantTypeId(e.target.value)}>
                      <option value="">Select Group</option>
                      {variantTypes.map((vt) => <option key={vt.id} value={vt.id}>{vt.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold" placeholder="Label (e.g. 5kg)" value={newVarName} onChange={(e) => setNewVarName(e.target.value)} disabled={!variantTypeId} />
                    <button onClick={quickAddVariant} disabled={!variantTypeId} className="bg-slate-900 text-white px-4 rounded-xl font-black text-xs hover:bg-slate-800 transition-all disabled:opacity-50">+</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INVENTORY */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 mt-10">
          <h2 className="text-3xl font-black text-slate-900">Shop Inventory</h2>
          <div className="flex gap-2 flex-wrap">
            <input className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/30" placeholder="Search products..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
            {(["all","instock","outofstock","hidden"] as const).map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${filterStatus === f ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-900"}`}>
                {f === "all" ? "All" : f === "instock" ? "In Stock" : f === "outofstock" ? "Out of Stock" : "Hidden"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p) => {
            const img = firstProductImageUrl(p.images);
            const isOutOfStock = p.quantity <= 0;
            return (
              <div key={p.id} className={`group overflow-hidden rounded-[32px] border bg-white shadow-sm hover:shadow-xl transition-all duration-300 ${p.isHidden ? "opacity-50 border-dashed border-slate-300" : isOutOfStock ? "border-red-200" : "border-slate-100"}`}>
                <div className="aspect-square bg-slate-50 relative overflow-hidden">
                  {img ? (
                    <img src={img} alt="" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-300 font-bold">No Image</div>
                  )}
                  {/* Status badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {isOutOfStock && <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">OUT OF STOCK</span>}
                    {p.isHidden && <span className="bg-slate-700 text-white text-[9px] font-black px-2 py-0.5 rounded-full">HIDDEN</span>}
                    {p.isHotDeal && <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">🔥 HOT</span>}
                    {p.isSpecialOffer && <span className="bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">⭐ SPECIAL</span>}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`text-white text-[9px] font-black px-2 py-0.5 rounded-full ${isOutOfStock ? "bg-red-600" : "bg-slate-900/80"}`}>{p.quantity} Units</span>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-[9px] font-black uppercase text-orange-600 tracking-widest mb-1">{p.category.name}</p>
                  <h3 className="font-black text-slate-900 line-clamp-1 text-sm">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl font-black text-slate-900">৳{p.price.toFixed(0)}</span>
                    {p.offerPrice && <span className="text-xs text-slate-400 line-through font-bold">৳{p.offerPrice.toFixed(0)}</span>}
                  </div>

                  {/* Action row */}
                  {canEdit && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button onClick={() => openEdit(p)} className="col-span-2 bg-slate-900 text-white rounded-xl py-2 text-xs font-black hover:bg-slate-700 transition">✏️ EDIT</button>
                      <button onClick={() => { setRestockProduct(p); setRestockAmount("0"); }} className="bg-emerald-600 text-white rounded-xl py-2 text-xs font-black hover:bg-emerald-700 transition">📦 RESTOCK</button>
                      <button onClick={() => quickToggle(p.id, "isHidden", p.isHidden)} className={`rounded-xl py-2 text-xs font-black transition ${p.isHidden ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                        {p.isHidden ? "👁 SHOW" : "🙈 HIDE"}
                      </button>
                      <button onClick={() => quickToggle(p.id, "isHotDeal", p.isHotDeal)} className={`rounded-xl py-2 text-xs font-black transition ${p.isHotDeal ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-600 hover:bg-orange-100"}`}>🔥 HOT</button>
                      <button onClick={() => quickToggle(p.id, "isSpecialOffer", p.isSpecialOffer)} className={`rounded-xl py-2 text-xs font-black transition ${p.isSpecialOffer ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>⭐ SPECIAL</button>
                      <button onClick={() => deleteProduct(p.id)} className="col-span-2 bg-red-50 text-red-600 rounded-xl py-2 text-xs font-black hover:bg-red-100 transition">🗑 DELETE</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="rounded-[32px] border-2 border-dashed border-slate-200 p-20 text-center">
            <p className="text-slate-400 font-bold">No products found.</p>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-lg shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">Edit Product</h2>
              <button onClick={() => setEditProduct(null)} className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600 hover:bg-slate-200">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Name</label>
                <input className="w-full mt-1 rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Price (৳)</label>
                  <input type="number" className="w-full mt-1 rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-900 outline-none" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Offer Price</label>
                  <input type="number" className="w-full mt-1 rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-900 outline-none" value={editOfferPrice} onChange={e => setEditOfferPrice(e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Stock (Units)</label>
                <input type="number" className="w-full mt-1 rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-900 outline-none" value={editQuantity} onChange={e => setEditQuantity(e.target.value)} />
              </div>
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editHotDeal} onChange={e => setEditHotDeal(e.target.checked)} className="h-5 w-5" />
                  <span className="text-sm font-black">🔥 Hot Deal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editSpecial} onChange={e => setEditSpecial(e.target.checked)} className="h-5 w-5" />
                  <span className="text-sm font-black">⭐ Special</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editHidden} onChange={e => setEditHidden(e.target.checked)} className="h-5 w-5" />
                  <span className="text-sm font-black">🙈 Hidden</span>
                </label>
              </div>
            </div>
            <button onClick={saveEdit} disabled={editSaving} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition disabled:opacity-50">
              {editSaving ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Restock</h2>
              <button onClick={() => setRestockProduct(null)} className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600">✕</button>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="font-black text-slate-900">{restockProduct.name}</p>
              <p className="text-sm text-slate-500 font-bold mt-1">Current stock: <span className={restockProduct.quantity <= 0 ? "text-red-600" : "text-emerald-600"}>{restockProduct.quantity} units</span></p>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Add Units</label>
              <input type="number" min="1" className="w-full mt-2 rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 text-xl" value={restockAmount} onChange={e => setRestockAmount(e.target.value)} />
              {Number(restockAmount) > 0 && (
                <p className="text-xs text-slate-400 mt-2 font-bold">New stock: {restockProduct.quantity + Number(restockAmount)} units</p>
              )}
            </div>
            <button onClick={saveRestock} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition">
              📦 CONFIRM RESTOCK
            </button>
          </div>
        </div>
      )}
    </PermissionGuard>
  );
}
