"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/shop/cart-provider";

type Props = { product: { id: string; slug: string; name: string; price: string; image: string | null; vendorId?: string | null; vendorName?: string | null; vendorLogo?: string | null } };

export function AddToCartButton({ product }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  return <button type="button" onClick={() => { addItem({ id: product.id, slug: product.slug, name: product.name, pricePaise: Math.max(0, Math.round(Number(product.price) * 100)), image: product.image, vendorId: product.vendorId ?? null, vendorName: product.vendorName ?? "JAIGURU ASTROREMEDY", vendorLogo: product.vendorLogo ?? null }); setAdded(true); window.setTimeout(() => setAdded(false), 1800); }} className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--jaiguru-btn-radius)] bg-royal-purple px-3 py-2.5 text-xs font-semibold text-white transition hover:opacity-90">{added ? <Check data-icon="inline-start" /> : <ShoppingCart data-icon="inline-start" />}{added ? "Added to cart" : "Add to cart"}</button>;
}
