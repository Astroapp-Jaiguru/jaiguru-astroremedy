"use client";
import { useTransition } from "react";
import { approveVendorProduct, rejectVendorProduct } from "@/lib/vendor/product-actions";
import { Button } from "@/components/ui/button";
export function ProductModerationActions({ productId }: { productId: string }) { const [pending, startTransition] = useTransition(); return <div className="flex gap-2"><Button disabled={pending} onClick={() => startTransition(() => approveVendorProduct(productId))}>Approve</Button><Button disabled={pending} variant="destructive" onClick={() => startTransition(() => rejectVendorProduct(productId))}>Reject</Button></div>; }
