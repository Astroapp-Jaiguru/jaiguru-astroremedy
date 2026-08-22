import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, Server, AlertTriangle, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export const dynamic = "force-dynamic";

async function dbStatus() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, ms: Date.now() - start };
  } catch {
    return { ok: false, ms: Date.now() - start };
  }
}

export default async function AdminSystemStatusPage() {
  await requireAdmin();
  const db = await dbStatus();
  const deployedAt = process.env.NEXT_PUBLIC_DEPLOYED_AT ?? "Unknown";

  const envChecks = [
    { key: "DATABASE_URL", ok: Boolean(process.env.DATABASE_URL) },
    { key: "AUTH_SECRET", ok: Boolean(process.env.AUTH_SECRET) },
    { key: "NEXT_PUBLIC_SITE_URL", ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL) },
    { key: "ADMIN_SIGNUP_KEY", ok: Boolean(process.env.ADMIN_SIGNUP_KEY) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">System Status</h1>
        <p className="text-sm text-muted-foreground">
          Database connectivity and environment configuration for this deployment.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {db.ok ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              Database
            </CardTitle>
            <CardDescription>
              Prisma ORM connected to the Postgres instance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              Status:{" "}
              <span className={db.ok ? "font-semibold text-emerald-600 dark:text-emerald-300" : "font-semibold text-red-500"}>
                {db.ok ? "Connected" : "Unreachable"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              Latency: <span className="font-semibold">{db.ms} ms</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Environment Variables</CardTitle>
            <CardDescription>
              Required secrets and configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {envChecks.map((c) => (
              <div
                key={c.key}
                className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
              >
                <code className="font-mono text-xs">{c.key}</code>
                {c.ok ? (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                    Set
                  </span>
                ) : (
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-500">
                    Missing
                  </span>
                )}
              </div>
            ))}
            <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
              <span className="text-xs text-muted-foreground">Deployment timestamp</span>
              <code className="font-mono text-xs">{(deployedAt)}</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}