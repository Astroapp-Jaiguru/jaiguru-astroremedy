import { VendorRegistrationForm } from "@/components/vendor/vendor-registration-form";

export const dynamic = "force-dynamic";

export default function VendorRegisterPage() {
  return <main className="min-h-screen bg-background px-4 py-16"><div className="mx-auto max-w-3xl space-y-8"><div className="max-w-2xl"><p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Jaiguru Astroremedy marketplace</p><h1 className="mt-3 text-balance font-heading text-4xl font-semibold tracking-tight md:text-5xl">Become a trusted vendor</h1><p className="mt-4 text-pretty leading-6 text-muted-foreground">Join our curated spiritual marketplace. Complete your business and verification details to begin the review process.</p></div><VendorRegistrationForm /></div></main>;
}
