import { Package, Sparkles, ShoppingBag, Inbox, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const [
    products,
    services,
    orders,
    messages,
    subscribers,
    pendingOrders,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.service.count(),
    prisma.order.count(),
    prisma.contactMessage.count(),
    prisma.subscriber.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { customerName: true, itemName: true, amount: true, status: true, createdAt: true },
    }),
  ]);

  const cards = [
    { title: "Total Products", value: products, icon: Package, color: "text-primary" },
    { title: "Total Services", value: services, icon: Sparkles, color: "text-saffron" },
    { title: "Total Orders", value: orders, icon: ShoppingBag, color: "text-indigo-500" },
    { title: "Contact Messages", value: messages, icon: Inbox, color: "text-premium-gold" },
    { title: "Subscribers", value: subscribers, icon: Mail, color: "text-emerald" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Key store and engagement metrics. Deeper traffic analytics are
          planned once a provider is connected.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="font-heading text-3xl font-bold">{card.value}</p>
              </div>
              <card.icon className={`h-8 w-8 ${card.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No orders recorded yet.
            </p>
          ) : (
            <ul className="divide-y">
              {recentOrders.map((o) => {
                const a = o.amount;
                const n = typeof a === "number" ? a : Number.parseFloat(String(a ?? ""));
                const amt =
                  Number.isFinite(n) && n > 0
                    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
                    : "On Request";
                return (
                  <li
                    key={o.createdAt.toISOString() + o.customerName}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">{o.itemName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{amt}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {o.status.toLowerCase()}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {pendingOrders > 0 ? (
            <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-300">
              {pendingOrders} order{pendingOrders === 1 ? "" : "s"} pending action in
              Orders & Leads.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}