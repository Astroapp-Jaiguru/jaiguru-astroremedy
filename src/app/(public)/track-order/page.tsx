"use client";

import { useState } from "react";
import { Search, Truck } from "lucide-react";

export default function TrackOrderPage() {
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<{ status: string; trackingNumber: string | null; trackingUrl: string | null } | null>(null);
  const [searched, setSearched] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setSearched(false); const response = await fetch(`/api/orders/track?reference=${encodeURIComponent(reference.trim())}`); setResult(response.ok ? await response.json() : null); setSearched(true); }
  return <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6"><div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10"><Truck className="size-10 text-golden" /><h1 className="mt-5 font-heading text-4xl font-bold text-foreground">Track your order</h1><p className="mt-3 text-muted-foreground">Enter your order reference or shipment tracking number to see the latest update.</p><form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row"><input value={reference} onChange={(event) => setReference(event.target.value)} required placeholder="Order reference or tracking number" className="min-h-12 flex-1 rounded-xl border border-border bg-background px-4 outline-none focus:border-golden" /><button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-royal-purple px-5 font-semibold text-white"><Search className="size-4" />Track</button></form>{searched && (result ? <div className="mt-8 rounded-2xl border border-golden/40 bg-golden/10 p-5"><p className="text-sm text-muted-foreground">Current status</p><p className="mt-1 text-2xl font-bold text-foreground">{result.status.replaceAll("_", " ")}</p>{result.trackingNumber ? <p className="mt-3 text-sm text-muted-foreground">Tracking number: {result.trackingNumber}</p> : <p className="mt-3 text-sm text-muted-foreground">Shipment tracking will appear after dispatch.</p>}{result.trackingUrl ? <a className="mt-4 inline-block font-semibold text-royal-purple underline" href={result.trackingUrl} target="_blank" rel="noreferrer">Open courier tracking</a> : null}</div> : <p className="mt-8 rounded-xl bg-muted p-4 text-sm text-muted-foreground">We could not find that reference. Please check it and try again.</p>)}</div></section>;
}
