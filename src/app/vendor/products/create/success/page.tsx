"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function ProductSubmittedPage() { const router = useRouter(); useEffect(() => { const timer = setTimeout(() => router.replace("/vendor/dashboard"), 3500); return () => clearTimeout(timer); }, [router]); return <main className="mx-auto flex max-w-2xl flex-col items-center gap-5 py-20 text-center"><div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-3xl text-primary">✓</div><h1 className="text-3xl font-semibold">Submitted for review</h1><p className="max-w-lg text-muted-foreground">Your product has been saved and sent to the JAIGURU ASTROREMEDY team. It will remain hidden until approved.</p><Button asChild><Link href="/vendor/dashboard">Return to dashboard</Link></Button></main>; }
