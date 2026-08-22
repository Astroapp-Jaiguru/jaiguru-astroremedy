"use client";

import { useState } from "react";
import { createVendorProduct } from "@/lib/vendor/product-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const steps = ["Basics", "Details", "Review"];

type Category = { id: string; name: string };

export function ProductCreateWizard({ categories }: { categories: Category[] }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({ quantity: "0" });
  const set = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const slug = values.slug || values.name?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "";
  const next = () => {
    if (step === 0 && (!values.name || !values.categoryId || !values.price || !values.shortDescription)) return;
    if (step === 1 && !values.longDescription) return;
    setStep((current) => Math.min(2, current + 1));
  };
  const input = (name: string, label: string, type = "text", required = false) => (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}{required ? " *" : ""}</Label>
      <Input id={name} name={name} type={type} required={required} value={values[name] ?? ""} onChange={(event) => set(name, event.target.value)} min={type === "number" ? "0" : undefined} step={name === "price" || name === "mrp" ? "0.01" : undefined} />
    </div>
  );
  return <div className="flex flex-col gap-6">
    <div className="grid grid-cols-3 gap-2" aria-label="Product creation steps">{steps.map((label, index) => <div key={label} className={`border-b-2 px-2 py-3 text-center text-sm ${index === step ? "border-primary font-semibold text-foreground" : "border-border text-muted-foreground"}`}>{index + 1}. {label}</div>)}</div>
    <form action={createVendorProduct} className="flex flex-col gap-6">
      {Object.entries(values).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
      <input type="hidden" name="slug" value={slug} />
      {step === 0 && <Card><CardHeader><CardTitle>Product basics</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{input("name", "Product name", "text", true)}{input("brand", "Brand")}{<div className="flex flex-col gap-2"><Label htmlFor="categoryId">Category *</Label><select id="categoryId" name="categoryId" value={values.categoryId ?? ""} onChange={(event) => set("categoryId", event.target.value)} required className="h-9 rounded-md border bg-background px-3 text-sm"><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>}{input("subcategory", "Subcategory")}{input("price", "Selling price (₹)", "number", true)}{input("mrp", "MRP (₹)", "number")}{input("quantity", "Stock quantity", "number", true)}<div className="flex flex-col gap-2 sm:col-span-2"><Label htmlFor="shortDescription">Short description *</Label><Textarea id="shortDescription" value={values.shortDescription ?? ""} onChange={(event) => set("shortDescription", event.target.value)} required /></div></CardContent></Card>}
      {step === 1 && <Card><CardHeader><CardTitle>Details and attributes</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2 sm:col-span-2"><Label htmlFor="longDescription">Long description *</Label><Textarea id="longDescription" value={values.longDescription ?? ""} onChange={(event) => set("longDescription", event.target.value)} rows={6} required /></div>{input("tags", "Tags", "text")}{input("size", "Size")}{input("weight", "Weight (grams)", "number")}{input("color", "Color")}{input("material", "Material")}{input("estimatedDeliveryTime", "Estimated delivery")}{input("certificateLabel", "Certificate label")}</CardContent></Card>}
      {step === 2 && <Card><CardHeader><CardTitle>Review before submission</CardTitle></CardHeader><CardContent className="flex flex-col gap-3 text-sm"><p><strong>{values.name}</strong> will be submitted for moderation.</p><div className="grid gap-2 sm:grid-cols-2"><p>Category: {categories.find((category) => category.id === values.categoryId)?.name || "—"}</p><p>Price: ₹{values.price || "0"}</p><p>Stock: {values.quantity || "0"}</p><p>Slug: {slug || "—"}</p></div><p className="text-muted-foreground">It will remain inactive until an administrator approves it.</p><label className="flex items-center gap-2"><input type="checkbox" required /> I confirm that these product details are accurate.</label></CardContent></Card>}
      <div className="flex justify-between gap-3"><Button type="button" variant="outline" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Back</Button>{step < 2 ? <Button type="button" onClick={next}>Continue</Button> : <Button type="submit">Submit for review</Button>}</div>
    </form>
  </div>;
}

export default ProductCreateWizard;
