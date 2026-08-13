import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import {
  getPricingSettings,
  getPricingRunMeta,
} from "@/lib/pricing/settings";
import {
  PricingSettingsForm,
  EngineStatus,
  JobRunners,
} from "@/components/admin/pricing/pricing-settings-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function PricingAdminPage() {
  await requireAdmin();

  const [settings, meta, products, services, changes, images] =
    await Promise.all([
      getPricingSettings(),
      getPricingRunMeta(),
      prisma.product.aggregate({
        _count: true,
        _sum: { price: true },
      }),
      prisma.service.count(),
      prisma.priceChange.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { name: true, slug: true } },
          service: { select: { name: true, slug: true } },
        },
      }),
      prisma.product.groupBy({
        by: ["imageSource"],
        _count: true,
      }),
    ]);

  const withCompetitor = await prisma.product.count({
    where: { competitorPrice: { not: null } },
  });
  const withFloor = await prisma.product.count({
    where: { priceFloor: { not: null } },
  });
  const withCost = await prisma.product.count({
    where: { costPrice: { not: null } },
  });

  const keys: Record<string, boolean> = {
    SERPAPI_API_KEY: Boolean(process.env.SERPAPI_API_KEY),
    UNSPLASH_ACCESS_KEY: Boolean(process.env.UNSPLASH_ACCESS_KEY),
    OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
    REPLICATE_API_TOKEN: Boolean(process.env.REPLICATE_API_TOKEN),
  };

  const imgBySource = Object.fromEntries(
    images.map((g) => [g.imageSource, g._count])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Pricing & Images</h1>
        <p className="text-sm text-muted-foreground">
          Dynamic pricing engine, international price display toggle and the
          automated image pipeline.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <PricingSettingsForm initial={settings} />
          <JobRunners />
        </div>
        <div className="space-y-6">
          <EngineStatus keys={keys} />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Catalog Coverage</CardTitle>
              <CardDescription>
                How much of the catalog is ready for the engine.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Products" value={String(products._count)} />
              <Row label="Services" value={String(services)} />
              <Row
                label="With competitor price"
                value={`${withCompetitor} / ${products._count}`}
              />
              <Row label="With price floor" value={`${withFloor} / ${products._count}`} />
              <Row label="With cost (auto floor)" value={`${withCost} / ${products._count}`} />
              <div className="border-t border-border pt-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Image sources
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(imgBySource).length === 0 && (
                    <Badge variant="outline">none yet</Badge>
                  )}
                  {Object.entries(imgBySource).map(([src, count]) => (
                    <Badge key={src} variant="secondary">
                      {src}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Last Runs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <RunLine
                label="Pricing engine"
                at={meta.lastRunAt}
                summary={meta.lastRunSummary}
              />
              <RunLine
                label="Image pipeline"
                at={meta.lastImageRunAt}
                summary={meta.lastImageRunSummary}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Price Changes</CardTitle>
              <CardDescription>Audit trail — last 8 updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {changes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No automatic price changes yet.
                </p>
              )}
              {changes.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-border px-3 py-2 text-xs"
                >
                  <p className="font-medium">
                    {c.product?.name ?? c.service?.name ?? "Unknown"}
                  </p>
                  <p className="text-muted-foreground">
                    {c.field}: {c.oldValue?.toString() ?? "—"} → {c.newValue?.toString() ?? "—"}{" "}
                    <span className="text-[10px] uppercase">{c.source}</span>
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function RunLine({
  label,
  at,
  summary,
}: {
  label: string;
  at: string | null;
  summary: Record<string, unknown> | null;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">
        {at ? (
          <>
            <span className="block text-xs font-semibold">
              {new Date(at).toLocaleString()}
            </span>
            <span className="block text-[10px] text-muted-foreground">
              {summary
                ? `changed ${summary.changed ?? "?"}, fetched ${summary.fetched ?? "?"}`
                : "no summary"}
            </span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">never run</span>
        )}
      </span>
    </div>
  );
}
