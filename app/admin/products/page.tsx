"use client";

import { FormEvent, useEffect, useState } from "react";
import { firstProductImageUrl } from "@/lib/product-images";

type Variant = { id: string; name: string };
type VariantType = { id: string; name: string; type: string; variants: Variant[] };
type Category = { id: string; name: string };
type SubCategory = { id: string; name: string; categoryId: string };
type Brand = { id: string; name: string };

type Product = {
  id: string;
  name: string;
  price: number;
  offerPrice: number | null;
  quantity: number;
  weight: number;
  images: any[];
  category: { name: string };
  variants: { price: number; stock: number; variant: { name: string } }[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
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
  const [brandId, setBrandId] = useState("");
  const [variantTypeId, setVariantTypeId] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Selected Variants state
  const [selectedVariants, setSelectedVariants] = useState<{ variantId: string; price: string; stock: string }[]>([]);

  // Quick Add states
  const [newCatName, setNewCatName] = useState("");
  const [newVarName, setNewVarName] = useState("");

  async function loadData() {
    const [p, c, sc, b, vt] = await Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/subCategories").then((r) => r.json()),
      fetch("/api/brands").then((r) => r.json()),
      fetch("/api/variantTypes").then((r) => r.json()),
    ]);
    setProducts(p.data ?? []);
    setCategories(c.data ?? []);
    setSubCategories(sc.data ?? []);
    setBrands(b.data ?? []);
    setVariantTypes(vt.data ?? []);
  }

  useEffect(() => {
    loadData();
  }, []);

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
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
    setUploadedUrls(newUrls);
    setUploading(false);
  }

  function removeUploadedImage(idx: number) {
    setUploadedUrls(uploadedUrls.filter((_, i) => i !== idx));
  }

  function toggleVariant(vid: string) {
    if (selectedVariants.find((v) => v.variantId === vid)) {
      setSelectedVariants(selectedVariants.filter((v) => v.variantId !== vid));
    } else {
      setSelectedVariants([...selectedVariants, { variantId: vid, price: price, stock: quantity }]);
    }
  }

  async function quickAddCategory() {
    if (!newCatName) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName, image: "" }),
    });
    if (res.ok) {
      setNewCatName("");
      loadData();
    }
  }

  async function quickAddVariant() {
    if (!newVarName || !variantTypeId) return;
    const res = await fetch("/api/variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newVarName, variantTypeId }),
    });
    if (res.ok) {
      setNewVarName("");
      loadData();
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId || !subCategoryId) {
      alert("Please select category and subcategory.");
      return;
    }

    const payload = {
      name,
      description: desc,
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : null,
      quantity: Number(quantity),
      weight: Number(weight),
      proCategoryId: categoryId,
      proSubCategoryId: subCategoryId,
      proBrandId: brandId || null,
      proVariantTypeId: variantTypeId || null,
      images: uploadedUrls.map((u) => ({ url: u })),
      variants: selectedVariants.map((sv) => ({
        variantId: sv.variantId,
        price: Number(sv.price),
        stock: Number(sv.stock),
      })),
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setName("");
      setDesc("");
      setPrice("");
      setOfferPrice("");
      setQuantity("0");
      setWeight("0");
      setUploadedUrls([]);
      setSelectedVariants([]);
      loadData();
    }
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Product Management</h1>
          <p className="text-slate-500 font-medium tracking-tight">Create and manage your shop catalog with variants and direct uploads.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* FORM */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-[40px] border border-slate-100 bg-white p-10 shadow-sm">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Name</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10"
                  placeholder="e.g. Pure Mustard Oil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                <textarea
                  className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10"
                  placeholder="Product details..."
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Offer Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Stock</label>
                <input
                  type="number"
                  className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                <select
                  className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sub Category</label>
                <select
                  className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10"
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  required
                >
                  <option value="">Select SubCat</option>
                  {subCategories
                    .filter((sc) => sc.categoryId === categoryId)
                    .map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Images */}
              <div className="md:col-span-2 space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Images (Direct Upload)</label>
                <div className="grid grid-cols-5 gap-3">
                   {uploadedUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                          <img src={url} alt="" className="h-full w-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeUploadedImage(i)}
                            className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px]"
                          >✕</button>
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

              {/* Variants Section */}
              <div className="md:col-span-2 border-t border-slate-100 pt-8 space-y-4">
                <h3 className="text-lg font-black text-slate-900">Product Variants</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Variant Group (kg/ltr/etc)</label>
                    <select
                      className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10"
                      value={variantTypeId}
                      onChange={(e) => setVariantTypeId(e.target.value)}
                    >
                      <option value="">No Variant Type</option>
                      {variantTypes.map((vt) => (
                        <option key={vt.id} value={vt.id}>
                          {vt.name} ({vt.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {variantTypeId && (
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      {currentVariants.map((v) => {
                        const isSelected = selectedVariants.find((sv) => sv.variantId === v.id);
                        return (
                          <div key={v.id} className="flex items-center gap-6 rounded-[24px] border border-slate-50 bg-slate-50/50 p-4">
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={() => toggleVariant(v.id)}
                              className="h-5 w-5 rounded-lg border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                            />
                            <span className="min-w-[100px] font-black text-slate-900 text-sm uppercase italic">{v.name}</span>
                            {isSelected && (
                              <div className="flex flex-1 gap-4">
                                <div className="flex-1 space-y-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase">Price</label>
                                    <input
                                      type="number"
                                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold"
                                      value={isSelected.price}
                                      onChange={(e) => {
                                        const next = [...selectedVariants];
                                        const item = next.find((sv) => sv.variantId === v.id);
                                        if (item) item.price = e.target.value;
                                        setSelectedVariants(next);
                                      }}
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase">Stock</label>
                                    <input
                                      type="number"
                                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold"
                                      value={isSelected.stock}
                                      onChange={(e) => {
                                        const next = [...selectedVariants];
                                        const item = next.find((sv) => sv.variantId === v.id);
                                        if (item) item.stock = e.target.value;
                                        setSelectedVariants(next);
                                      }}
                                    />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-3xl bg-slate-900 py-5 font-black text-white shadow-2xl hover:bg-slate-800 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
            >
              FINALIZE PRODUCT
            </button>
          </form>
        </div>

        {/* SIDEBAR: Quick Adds */}
        <div className="space-y-6">
          <div className="rounded-[40px] border border-slate-100 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">Quick Setup</h2>
            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Add New Category</label>
                <div className="flex gap-2">
                    <input
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold"
                        placeholder="Name"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                    />
                    <button onClick={quickAddCategory} className="bg-orange-600 text-white px-4 rounded-xl font-black text-xs hover:bg-orange-700transition-all">+</button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Add New Variant</label>
                <div className="flex gap-2">
                    <input
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold"
                        placeholder="Label (e.g. 5kg)"
                        value={newVarName}
                        onChange={(e) => setNewVarName(e.target.value)}
                        disabled={!variantTypeId}
                    />
                    <button onClick={quickAddVariant} disabled={!variantTypeId} className="bg-slate-900 text-white px-4 rounded-xl font-black text-xs hover:bg-slate-800 transition-all disabled:opacity-50">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCTS LIST */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 mb-8 border-b border-slate-200 pb-4">Shop Inventory</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => {
            const img = firstProductImageUrl(p.images);
            return (
              <div key={p.id} className="group overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-300">
                <div className="aspect-square bg-slate-50 relative overflow-hidden">
                  {img ? (
                    <img src={img} alt="" className="h-full w-full object-cover group-hover:scale-110 transition duration-500" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-300 font-bold">No product image</div>
                  )}
                  <div className="absolute top-4 left-4">
                      <span className="bg-slate-900/90 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{p.quantity} Units</span>
                  </div>
                </div>
                <div className="p-6">
                   <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest mb-1">{p.category.name}</p>
                   <h3 className="font-black text-slate-900 text-lg line-clamp-1">{p.name}</h3>
                   <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">${p.price.toFixed(2)}</span>
                    {p.offerPrice && (
                      <span className="text-sm text-slate-400 line-through font-bold">${p.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
