"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createProductAction, updateProductAction } from "@/lib/admin/products/actions";

export const DELIVERY_TIME_OPTIONS = [
  "1-2 Business Days",
  "3-5 Business Days",
  "5-7 Business Days",
  "1-2 Weeks",
  "2-3 Weeks",
  "Custom (Enter manually)",
] as const;

const CUSTOM_OPTION = "Custom (Enter manually)";

export interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  subcategory: string;
  sku: string;
  price: string;
  discountPrice: string;
  stockStatus: string;
  quantity: string;
  mainImage: string;
  shortDescription: string;
  longDescription: string;
  returnPolicy: string;
  benefits: string[];
  tags: string[];
  material: string;
  size: string;
  weight: string;
  color: string;
  estimatedDeliveryTime: string;
  hasCertificate: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  sortOrder: string;
}

export function ProductForm({
  categories,
  product,
}: {
  categories: { id: string; name: string }[];
  product?: ProductFormValues;
}) {
  const action = product?.id ? updateProductAction : createProductAction;
  const [state, formAction, pending] = useActionState(action, undefined);
  const isEdit = Boolean(product?.id);

  const savedDelivery = product?.estimatedDeliveryTime ?? "";
  const isCustom = !DELIVERY_TIME_OPTIONS.some((o) => o === savedDelivery);
  const [deliverySelection, setDeliverySelection] = useState(
    isCustom && savedDelivery ? CUSTOM_OPTION : savedDelivery
  );
  const [customDelivery, setCustomDelivery] = useState(
    isCustom && savedDelivery ? savedDelivery : ""
  );

  return (
    <form action={formAction} className="space-y-6">
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state?.success && (
        <Alert>
          <AlertDescription>Product saved successfully.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input id="name" name="name" defaultValue={product?.name ?? ""} required placeholder="e.g. Rudraksha Japa Mala" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={product?.slug ?? ""} placeholder="Leave empty to auto-generate" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category *</Label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={product?.categoryId ?? ""}
            className="h-8 w-full rounded-lg border bg-background px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subcategory">Subcategory / Type</Label>
          <Input id="subcategory" name="subcategory" defaultValue={product?.subcategory ?? ""} placeholder="e.g. Malas" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} placeholder="e.g. JG-SPI-001" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹) *</Label>
          <Input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={product?.price ?? ""} placeholder="499" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountPrice">Discount Price (₹)</Label>
          <Input id="discountPrice" name="discountPrice" type="number" step="0.01" min="0" defaultValue={product?.discountPrice ?? ""} placeholder="399" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stockStatus">Stock Status</Label>
          <select
            id="stockStatus"
            name="stockStatus"
            defaultValue={product?.stockStatus ?? "IN_STOCK"}
            className="h-8 w-full rounded-lg border bg-background px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <option value="IN_STOCK">In Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="PRE_ORDER">Pre Order</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" name="quantity" type="number" min="0" defaultValue={product?.quantity ?? "10"} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={product?.sortOrder ?? "0"} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="mainImage">Main Image URL</Label>
          <Input id="mainImage" name="mainImage" defaultValue={product?.mainImage ?? ""} placeholder="https://placehold.co/600x400/... or any image URL" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Textarea id="shortDescription" name="shortDescription" rows={2} defaultValue={product?.shortDescription ?? ""} placeholder="One or two lines for cards" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="longDescription">Long Description</Label>
          <Textarea id="longDescription" name="longDescription" rows={4} defaultValue={product?.longDescription ?? ""} placeholder="Full description shown on the product page" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="returnPolicy">Return Policy</Label>
          <Textarea id="returnPolicy" name="returnPolicy" rows={4} defaultValue={product?.returnPolicy ?? ""} placeholder="Authenticity, quality and return policy text" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="benefits">Benefits (one per line or comma)</Label>
          <Textarea id="benefits" name="benefits" rows={3} defaultValue={product?.benefits?.join("\n") ?? ""} placeholder={"Energised\nOriginal beads"} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Textarea id="tags" name="tags" rows={3} defaultValue={product?.tags?.join(", ") ?? ""} placeholder="rudraksha, mala" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Input id="material" name="material" defaultValue={product?.material ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Input id="size" name="size" defaultValue={product?.size ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight</Label>
          <Input id="weight" name="weight" defaultValue={product?.weight ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input id="color" name="color" defaultValue={product?.color ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedDeliveryTime">Estimated Delivery Time</Label>
          <select
            id="estimatedDeliveryTime"
            name="estimatedDeliveryTime"
            value={deliverySelection}
            onChange={(e) => setDeliverySelection(e.target.value)}
            className="h-8 w-full rounded-lg border bg-background px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <option value="">Select delivery time</option>
            {DELIVERY_TIME_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        {deliverySelection === CUSTOM_OPTION ? (
          <div className="space-y-2">
            <Label htmlFor="customDelivery">Custom Delivery Time</Label>
            <Input
              id="customDelivery"
              name="customDelivery"
              value={customDelivery}
              onChange={(e) => setCustomDelivery(e.target.value)}
              placeholder="e.g. 7-10 Business Days"
            />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} className="size-4 accent-[#4C1D95]" />
          Featured
        </label>
        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
          <input type="checkbox" name="isPopular" defaultChecked={product?.isPopular ?? false} className="size-4 accent-[#4C1D95]" />
          Bestseller
        </label>
        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
          <input type="checkbox" name="isNewArrival" defaultChecked={product?.isNewArrival ?? false} className="size-4 accent-[#4C1D95]" />
          New Arrival
        </label>
        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
          <input type="checkbox" name="hasCertificate" defaultChecked={product?.hasCertificate ?? false} className="size-4 accent-[#4C1D95]" />
          Test Certificate Available (Lab Certified)
        </label>
        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} className="size-4 accent-[#4C1D95]" />
          Active
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}