"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fields = [
  ["businessName", "Business name"], ["contactPerson", "Contact person"],
  ["phone", "Phone"], ["email", "Email"], ["gstNumber", "GST number"],
  ["panNumber", "PAN number"], ["category", "Business category"], ["businessType", "Business type"],
] as const;

export function VendorRegistrationForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const update = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));
  async function submit() {
    setMessage("");
    const response = await fetch("/api/vendor/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "Unable to submit registration.");
    setSubmitted(true);
  }
  if (submitted) return <div className="rounded-xl border border-primary/30 bg-primary/10 p-8 text-center"><h2 className="font-heading text-2xl font-semibold">Application received</h2><p className="mt-2 text-muted-foreground">Our team will review your business and KYC details before activating your vendor account.</p></div>;
  return <div className="space-y-6 rounded-xl border border-border/70 bg-card/80 p-6 shadow-xl shadow-primary/5 md:p-8">
    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground"><span className={step >= 1 ? "text-primary" : ""}>Business details</span><span>—</span><span className={step >= 2 ? "text-primary" : ""}>KYC & bank</span><span>—</span><span className={step >= 3 ? "text-primary" : ""}>Submit</span></div>
    {step === 1 && <div className="grid gap-4 sm:grid-cols-2">{fields.map(([key, label]) => <div key={key} className="space-y-2"><Label htmlFor={key}>{label}</Label><Input id={key} required value={values[key] ?? ""} onChange={(event) => update(key, event.target.value)} /></div>)}</div>}
    {step === 2 && <div className="grid gap-4 sm:grid-cols-2">{[["accountHolder", "Bank account holder"], ["accountNumber", "Bank account number"], ["ifsc", "IFSC code"], ["bankName", "Bank name"], ["addressProof", "Address proof filename"], ["panCard", "PAN card filename"], ["gstCertificate", "GST certificate filename"], ["businessRegistration", "Business registration filename"]].map(([key, label]) => <div key={key} className="space-y-2"><Label htmlFor={key}>{label}</Label><Input id={key} required type={key.includes("Proof") || key.includes("Card") || key.includes("Certificate") || key.includes("Registration") ? "file" : "text"} onChange={(event) => update(key, event.target.value)} /></div>)}</div>}
    {step === 3 && <div className="space-y-4"><div className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">Review your business details and uploaded document references. By submitting, you agree to the vendor terms and consent to KYC verification.</div><label className="flex items-start gap-3 text-sm"><input className="mt-1" type="checkbox" required /> I accept the terms and conditions.</label></div>}
    {message && <p className="text-sm text-destructive">{message}</p>}
    <div className="flex justify-between gap-3"><Button type="button" variant="outline" disabled={step === 1} onClick={() => setStep((value) => value - 1)}>Back</Button>{step < 3 ? <Button type="button" onClick={() => setStep((value) => value + 1)}>Continue</Button> : <Button type="button" onClick={submit}>Submit application</Button>}</div>
  </div>;
}
