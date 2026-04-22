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
  proCategoryId: string;
  proSubCategoryId: string;
  proBrandId?: string | null;
  images: any;
  variants: { price: number; stock: number; variant: { name: string } }[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);
  const [brands, setBrands] = useState<{ id: string, name: string, subcategoryId: string }[]>([]);

  // Form states
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [weight, setWeight] = useState("0");
  const [categoryInput, setCategoryInput] = useState("");
  const [subcategoryInput, setSubcategoryInput] = useState("");
  const [brandInput, setBrandInput] = useState("");
  const [variantTypeId, setVariantTypeId] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<{ variantId: string; price: string; stock: string }[]>([]);
  const [isHotDeal, setIsHotDeal] = useState(false);
  const [isSpecialOffer, setIsSpecialOffer] = useState(false);

  // Quick Add states
  const [newCatName, setNewCatName] = useState("");
  const [newSubCatName, setNewSubCatName] = useState("");
  const [quickSubCatParent, setQuickSubCatParent] = useState("");
  const [newVarName, setNewVarName] = useState("");

  // Edit modal state
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editOfferPrice, setEditOfferPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editBrandId, setEditBrandId] = useState("");
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
    const [p, c, sc, vt, b] = await Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/subCategories").then((r) => r.json()),
      fetch("/api/variantTypes").then((r) => r.json()),
      fetch("/api/brands").then((r) => r.json()),
    ]);
    setProducts(p.data ?? []);
    setCategories(c.data ?? []);
    setSubCategories(sc.data ?? []);
    setVariantTypes(vt.data ?? []);
    setBrands(b.data ?? []);
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

  const [newCatImage, setNewCatImage] = useState("");
  const [quickCatUploading, setQuickCatUploading] = useState(false);

  async function quickAddCategory() {
    if (!newCatName || !newCatImage) return;
    await fetch("/api/categories", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ name: newCatName, image: newCatImage }) 
    });
    setNewCatName(""); setNewCatImage(""); loadData();
  }

  async function handleQuickCategoryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setQuickCatUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) setNewCatImage(data.url);
    } catch (err) { console.error(err); }
    finally { setQuickCatUploading(false); }
  }

  async function quickAddSubCategory() {
    if (!newSubCatName || !quickSubCatParent) return;
    await fetch("/api/subCategories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newSubCatName, categoryId: quickSubCatParent }) });
    setNewSubCatName(""); loadData();
  }

  async function quickAddVariant() {
    if (!newVarName || !variantTypeId) return;
    await fetch("/api/variants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newVarName, variantTypeId }) });
    setNewVarName(""); loadData();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryInput.trim() || !subcategoryInput.trim()) {
      alert("Please enter category and subcategory.");
      return;
    }
    if (uploadedUrls.length === 0) {
      alert("Please upload at least one product image.");
      return;
    }
    const payload = {
      name, description: desc, price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : null,
      quantity: Number(quantity), weight: Number(weight),
      category: categoryInput.trim(),
      subcategory: subcategoryInput.trim(),
      brand: brandInput.trim() || undefined,
      proVariantTypeId: variantTypeId || null,
      isHotDeal, isSpecialOffer,
      images: uploadedUrls.map((u) => ({ url: u })),
      variants: selectedVariants.map((sv) => ({ variantId: sv.variantId, price: Number(sv.price), stock: Number(sv.stock) })),
    };
    const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      setName(""); setDesc(""); setPrice(""); setOfferPrice("");
      setQuantity("0"); setIsHotDeal(false); setIsSpecialOffer(false);
      setCategoryInput(""); setSubcategoryInput(""); setBrandInput("");
      setUploadedUrls([]); setSelectedVariants([]);
      loadData();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Failed to create product. Please try again.");
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
    setEditBrandId(p.proBrandId || "");
    setEditHotDeal(p.isHotDeal);
    setEditSpecial(p.isSpecialOffer);
    setEditHidden(p.isHidden);
  }

  async function saveEdit() {
    if (!editProduct) return;
    setEditSaving(true);
    await fetch(`/api/products/${editProduct.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: editName, 
        price: Number(editPrice), 
        offerPrice: editOfferPrice ? Number(editOfferPrice) : null, 
        quantity: Number(editQuantity), 
        proBrandId: editBrandId || null,
        isHotDeal: editHotDeal, 
        isSpecialOffer: editSpecial, 
        isHidden: editHidden 
      })
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
  const canDelete = hasPermission("delete_products");
  const canManageCategories = hasPermission("manage_categories");

  return (
    <PermissionGuard permission="view_products">
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
              <form onSubmit={handleSubmit} className="space-y-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-black text-slate-900">Add New Product</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Name</label>
                    <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" placeholder="e.g. Pure Mustard Oil" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                    <textarea className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price (৳)</label>
                    <input type="number" step="0.01" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" value={price} onChange={(e) => setPrice(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Offer Price (৳)</label>
                    <input type="number" step="0.01" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock (Units)</label>
                    <input type="number" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weight (kg)</label>
                    <input type="number" step="0.01" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category <span className="normal-case text-slate-300">(type or pick)</span></label>
                    <input
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      placeholder="e.g. Grocery"
                      list="cat-suggestions"
                      value={categoryInput}
                      onChange={(e) => { setCategoryInput(e.target.value); setSubcategoryInput(""); }}
                      required
                    />
                    <datalist id="cat-suggestions">
                      {categories.map((c) => <option key={c.id} value={c.name} />)}
                    </datalist>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sub Category <span className="normal-case text-slate-300">(type or pick)</span></label>
                    <input
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      placeholder="e.g. Cooking Oil"
                      list="subcat-suggestions"
                      value={subcategoryInput}
                      onChange={(e) => setSubcategoryInput(e.target.value)}
                      required
                    />
                    <datalist id="subcat-suggestions">
                      {subCategories
                        .filter((sc) => {
                          const matchedCat = categories.find(c => c.name.toLowerCase() === categoryInput.trim().toLowerCase());
                          return matchedCat ? sc.categoryId === matchedCat.id : true;
                        })
                        .map((sc) => <option key={sc.id} value={sc.name} />)}
                    </datalist>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brand <span className="normal-case text-slate-300">(optional)</span></label>
                    <input
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      placeholder="Leave blank if no brand"
                      list="brand-suggestions"
                      value={brandInput}
                      onChange={(e) => setBrandInput(e.target.value)}
                    />
                    <datalist id="brand-suggestions">
                      {brands.map((b) => <option key={b.id} value={b.name} />)}
                    </datalist>
                  </div>
                  {/* Images */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Product Images <span className="text-red-500">*</span>
                      <span className="normal-case text-slate-300 ml-1">(at least 1 required)</span>
                    </label>
                    <div className={`grid grid-cols-5 gap-2 p-2 rounded-xl transition ${uploadedUrls.length === 0 ? "border-2 border-dashed border-red-200 bg-red-50/30" : "border border-slate-100"}`}>
                      {uploadedUrls.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                          <img src={url} alt="" className="h-full w-full object-cover" />
                          <button type="button" onClick={() => removeUploadedImage(i)} className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px]">✕</button>
                        </div>
                      ))}
                      {uploadedUrls.length < 5 && (
                        <label className="aspect-square rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition">
                          <span className="text-xl text-slate-300 font-bold">+</span>
                          <span className="text-[8px] font-black text-slate-400">UPLOAD</span>
                          <input type="file" multiple className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
                        </label>
                      )}
                    </div>
                    {uploading && <p className="text-[10px] font-bold text-orange-600 animate-pulse">Uploading images...</p>}
                  </div>
                  {/* Promotions */}
                  <div className="md:col-span-2 flex gap-6 py-3 border-y border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isHotDeal} onChange={e => setIsHotDeal(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
                      <span className="text-xs font-bold text-slate-900 uppercase">🔥 HOT DEAL</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isSpecialOffer} onChange={e => setIsSpecialOffer(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-xs font-bold text-slate-900 uppercase">🌟 SPECIAL OFFER</span>
                    </label>
                  </div>
                </div>
                <button type="submit" disabled={uploading} className="w-full rounded-xl bg-slate-900 py-3 text-sm font-black text-white shadow-md hover:bg-slate-800 transition-all disabled:opacity-50">
                  ADD PRODUCT
                </button>
              </form>
            ) : (
              <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50 p-6 flex items-center justify-center text-center">
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
                      <label className="w-12 h-[38px] flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-orange-500 transition-all bg-slate-50 overflow-hidden">
                        {quickCatUploading ? (
                          <span className="text-[8px] animate-pulse">...</span>
                        ) : newCatImage ? (
                          <img src={newCatImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">📷</span>
                        )}
                        <input type="file" className="hidden" onChange={handleQuickCategoryUpload} accept="image/*" />
                      </label>
                      <button onClick={quickAddCategory} disabled={!newCatName || !newCatImage} className="bg-orange-600 text-white px-4 rounded-xl font-black text-xs hover:bg-orange-700 transition-all disabled:opacity-50">+</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Add Sub Category</label>
                    <div className="flex gap-2">
                      <select className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold" value={quickSubCatParent} onChange={(e) => setQuickSubCatParent(e.target.value)}>
                        <option value="">Select Category</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <input className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold" placeholder="Sub Category Name" value={newSubCatName} onChange={(e) => setNewSubCatName(e.target.value)} disabled={!quickSubCatParent} />
                      <button onClick={quickAddSubCategory} disabled={!quickSubCatParent} className="bg-emerald-600 text-white px-4 rounded-xl font-black text-xs hover:bg-emerald-700 transition-all disabled:opacity-50">+</button>
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
              {(["all", "instock", "outofstock", "hidden"] as const).map(f => (
                <button key={f} onClick={() => setFilterStatus(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${filterStatus === f ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-900"}`}>
                  {f === "all" ? "All" : f === "instock" ? "In Stock" : f === "outofstock" ? "Out of Stock" : "Hidden"}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200/60 bg-white p-1 shadow-xl shadow-slate-200/40 overflow-hidden mt-6">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Thumbnail</th>
                    <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Product Name & Category</th>
                    <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Price</th>
                    <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Stock</th>
                    <th className="h-12 px-5 py-4 text-left align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Status</th>
                    {canEdit && (
                      <th className="h-12 px-5 py-4 text-right align-middle font-black uppercase text-[10px] tracking-widest text-slate-400">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p, i) => {
                    const img = firstProductImageUrl(p.images);
                    const isOutOfStock = p.quantity <= 0;
                    return (
                      <tr key={p.id} className="border-b border-slate-100 transition-all duration-200 hover:bg-slate-50/80 bg-white group">
                        {/* THUMBNAIL */}
                        <td className="p-4 align-middle w-[80px]">
                          <div className="h-14 w-14 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                            {img ? (
                              <img src={img} alt={p.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[9px] text-slate-300 font-bold uppercase">No Img</span>
                            )}
                            {p.isHidden && (
                              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                                <span className="text-[8px] font-black text-white">HIDDEN</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* NAME & CATEGORY */}
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{p.category.name}</span>
                            <span className="font-bold text-slate-900 text-sm tracking-tight">{p.name}</span>
                          </div>
                        </td>

                        {/* PRICE */}
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm">৳{p.price.toFixed(2)}</span>
                            {p.offerPrice && (
                              <span className="text-[10px] text-slate-400 line-through font-bold">৳{p.offerPrice.toFixed(2)}</span>
                            )}
                          </div>
                        </td>

                        {/* STOCK */}
                        <td className="p-4 align-middle">
                          <span className={`text-sm font-bold ${isOutOfStock ? 'text-red-600' : p.quantity < 10 ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {p.quantity} Units
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="p-4 align-middle">
                          <div className="flex gap-1.5 flex-wrap">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ring-1 ring-inset ${isOutOfStock ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-emerald-500'}`} />
                              {isOutOfStock ? 'Out of Stock' : 'Active'}
                            </span>
                            {p.isHotDeal && (
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ring-1 ring-inset bg-orange-50 text-orange-700 ring-orange-200">🔥 Hot</span>
                            )}
                            {p.isSpecialOffer && (
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-200">⭐ Special</span>
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        {canEdit && (
                          <td className="p-4 align-middle text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit */}
                              <button onClick={() => openEdit(p)} title="Edit" className="h-8 w-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white transition shadow-sm border border-slate-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                              </button>
                              
                              {/* Restock */}
                              <button onClick={() => { setRestockProduct(p); setRestockAmount("0"); }} title="Restock" className="h-8 w-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition shadow-sm border border-emerald-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                              </button>

                              {/* Toggle Visibility */}
                              <button onClick={() => quickToggle(p.id, "isHidden", p.isHidden)} title={p.isHidden ? "Show Product" : "Hide Product"} className={`h-8 w-8 rounded-lg flex items-center justify-center transition shadow-sm border ${p.isHidden ? "bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-600 hover:text-white" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-200 hover:text-slate-700"}`}>
                                {p.isHidden ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 2 20 20"/><path d="M6.71 6.71q.28-.27.57-.5L12 3l10 9-3 2.72"/><path d="M13.73 13.73a3 3 0 0 0-4.46-4.46"/><path d="M2.5 12a19.11 19.11 0 0 0 3 2.73l5.52 4.97 3-2.73"/></svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                )}
                              </button>

                              {/* Delete */}
                              <button onClick={() => deleteProduct(p.id)} title="Delete" className="h-8 w-8 rounded-lg flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-200 ml-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="py-24 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                  <p className="text-slate-500 font-bold">No products found.</p>
                </div>
              )}
            </div>
          </div>
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
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Brand</label>
                  <select className="w-full mt-1 rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-900 outline-none" value={editBrandId} onChange={e => setEditBrandId(e.target.value)}>
                    <option value="">Select Brand (Optional)</option>
                    {brands.filter(b => b.subcategoryId === editProduct.proSubCategoryId || !b.subcategoryId).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
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
      </div>
    </PermissionGuard>
  );
}
