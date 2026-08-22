"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const steps = ["Business details", "KYC & bank details", "Review & submit"];
const businessFields = [
  ["businessName", "Business name"], ["contactPerson", "Contact person"], ["phone", "Phone"],
  ["email", "Email"], ["gstNumber", "GST number"], ["panNumber", "PAN number"],
  ["categoryId", "Category ID"], ["businessType", "Business type"],
];
const bankFields = [["accountHolderName", "Account holder"], ["accountNumber", "Account number"], ["ifscCode", "IFSC code"], ["bankName", "Bank name"]];
const documents = [["addressProof", "Address proof"], ["panCard", "PAN card"], ["gstCertificate", "GST certificate"], ["businessRegistration", "Business registration"]];

export default function VendorRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const required = step === 1 ? ["businessName", "contactPerson", "phone", "email", "categoryId"] : ["accountHolderName", "accountNumber", "ifscCode"];
  const canContinue = required.every((key) => form[key]?.trim());

  async function submit() {
    if (!accepted) return setError("Please accept the terms and conditions to continue.");
    setError("");
    const response = await fetch("/api/vendor/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Unable to submit application.");
    setSubmitted(true);
    setTimeout(() => router.push("/vendor/dashboard"), 1800);
  }

  if (submitted) return <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6"><Card className="w-full"><CardContent className="flex flex-col gap-3 p-10 text-center"><p className="text-sm font-semibold uppercase tracking-widest text-primary">Application received</p><h1 className="text-3xl font-semibold">Your vendor application is under review.</h1><p className="text-muted-foreground">We&apos;ll notify you when your KYC review is complete.</p></CardContent></Card></main>;

  return <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-12"><div><p className="text-sm font-semibold uppercase tracking-widest text-primary">Jaiguru marketplace</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Become a trusted vendor</h1><p className="mt-2 text-muted-foreground">Complete your business profile and KYC details to apply.</p></div><div className="grid grid-cols-3 gap-2" aria-label="Registration progress">{steps.map((label, index) => <div key={label} className={`border-t-2 pt-3 text-xs ${step >= index + 1 ? "border-primary text-foreground" : "border-border text-muted-foreground"}`}><span>{index + 1}. {label}</span></div>)}</div><Card><CardHeader><CardTitle>{steps[step - 1]}</CardTitle><CardDescription>{step === 3 ? "Confirm the information below before submitting." : "Fields marked with an asterisk are required."}</CardDescription></CardHeader><CardContent className="flex flex-col gap-5">{step === 1 && <div className="grid gap-5 sm:grid-cols-2">{businessFields.map(([key, label]) => <Field key={key} id={key} label={label} value={form[key] || ""} onChange={set} required={["businessName", "contactPerson", "phone", "email", "categoryId"].includes(key)} type={key === "email" ? "email" : "text"} />)}</div>}{step === 2 && <div className="flex flex-col gap-6"><div className="grid gap-5 sm:grid-cols-2">{bankFields.map(([key, label]) => <Field key={key} id={key} label={label} value={form[key] || ""} onChange={set} required type="text" />)}</div><div className="grid gap-4 sm:grid-cols-2">{documents.map(([key, label]) => <div key={key} className="flex flex-col gap-2"><Label htmlFor={key}>{label}</Label><Input id={key} type="file" accept="image/*,.pdf" onChange={(event) => set(key, event.target.files?.[0]?.name || "")} /><p className="text-xs text-muted-foreground">Optional now; files can be uploaded from KYC workspace.</p></div>)}</div></div>}{step === 3 && <div className="flex flex-col gap-4 text-sm">{[...businessFields, ...bankFields].map(([key, label]) => form[key] && <div className="flex justify-between gap-4 border-b pb-2" key={key}><span className="text-muted-foreground">{label}</span><span className="text-right">{form[key]}</span></div>)}<label className="flex items-start gap-3 pt-2"><Checkbox checked={accepted} onCheckedChange={(value) => setAccepted(value === true)} /><span>I accept the vendor terms and conditions and confirm that the information provided is accurate.</span></label></div>}{error && <p className="text-sm text-destructive" role="alert">{error}</p>}<div className="flex justify-between gap-3"><Button variant="outline" disabled={step === 1} onClick={() => { setError(""); setStep((value) => value - 1); }}>Back</Button>{step < 3 ? <Button disabled={!canContinue} onClick={() => { setError(""); setStep((value) => value + 1); }}>Continue</Button> : <Button onClick={submit}>Submit application</Button>}</div></CardContent></Card></main>;
}

function Field({ id, label, value, onChange, required, type }: { id: string; label: string; value: string; onChange: (key: string, value: string) => void; required?: boolean; type: string }) {
  return <div className="flex flex-col gap-2"><Label htmlFor={id}>{label}{required ? " *" : ""}</Label><Input id={id} type={type} value={value} onChange={(event) => onChange(id, event.target.value)} required={required} /></div>;
}
