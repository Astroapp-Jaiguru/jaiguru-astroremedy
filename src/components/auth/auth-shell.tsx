import type { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="bg-hero-gradient relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-royal-purple/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-premium-gold/20 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-3xl font-bold text-white">
            {siteConfig.name}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Admin Dashboard · {siteConfig.tagline}
          </p>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
          {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
        <p className="mt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} {siteConfig.name}. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
