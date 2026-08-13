import Link from "next/link";
import {
  Package,
  Sparkles,
  MessageSquareQuote,
  Inbox,
  ShoppingBag,
  Plus,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/dal";
import { siteConfig } from "@/config/site";
import { getPricingRunMeta } from "@/lib/pricing/settings";
import { DashboardActions } from "@/components/admin/pricing/dashboard-actions";

async function getStats() {
  try {
    const [products, services, testimonials, messages, categories, users, orders] =
      await Promise.all([
        prisma.product.count(),
        prisma.service.count(),
        prisma.testimonial.count({ where: { isApproved: true } }),
        prisma.contactMessage.count(),
        prisma.productCategory.count(),
        prisma.user.count(),
        prisma.order.count(),
      ]);
    return { products, services, testimonials, messages, categories, users, orders };
  } catch {
    return {
      products: 0,
      services: 0,
      testimonials: 0,
      messages: 0,
      categories: 0,
      users: 0,
      orders: 0,
    };
  }
}

export default async function AdminDashboardPage() {
  const [user, stats, meta] = await Promise.all([
    getCurrentUser(),
    getStats(),
    getPricingRunMeta(),
  ]);

  const cards = [
    {
      title: "Products",
      value: stats.products,
      icon: Package,
      href: "/admin/products",
      color: "text-primary",
    },
    {
      title: "Services",
      value: stats.services,
      icon: Sparkles,
      href: "/admin/services",
      color: "text-saffron",
    },
    {
      title: "Approved Testimonials",
      value: stats.testimonials,
      icon: MessageSquareQuote,
      href: "/admin/testimonials",
      color: "text-emerald",
    },
    {
      title: "Contact Messages",
      value: stats.messages,
      icon: Inbox,
      href: "/admin/contact-messages",
      color: "text-premium-gold",
    },
    {
      title: "Orders & Bookings",
      value: stats.orders,
      icon: ShoppingBag,
      href: "/admin/orders",
      color: "text-indigo-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your website content, products, services and settings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="font-heading text-3xl font-bold">
                    {card.value}
                  </p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <DashboardActions
        lastRunAt={meta.lastRunAt}
        lastImageRunAt={meta.lastImageRunAt}
        keysSet={{
          serpapi: Boolean(process.env.SERPAPI_API_KEY),
          images: Boolean(
            process.env.UNSPLASH_ACCESS_KEY ||
              process.env.OPENAI_API_KEY ||
              process.env.REPLICATE_API_TOKEN
          ),
        }}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/products/new"
              className="flex items-center justify-between rounded-lg border p-4 text-sm font-medium hover:bg-muted/60"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Product
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/admin/services/new"
              className="flex items-center justify-between rounded-lg border p-4 text-sm font-medium hover:bg-muted/60"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Service
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/admin/announcements"
              className="flex items-center justify-between rounded-lg border p-4 text-sm font-medium hover:bg-muted/60"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Edit Announcements
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/admin/theme"
              className="flex items-center justify-between rounded-lg border p-4 text-sm font-medium hover:bg-muted/60"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Theme Settings
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Database</span>
              <span
                className={`font-medium ${
                  stats.categories > 0 || stats.products > 0
                    ? "text-emerald"
                    : "text-saffron"
                }`}
              >
                {stats.categories > 0 || stats.products > 0
                  ? "Connected"
                  : "Not connected"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Product Categories</span>
              <span className="font-medium">{stats.categories}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Admin Users</span>
              <span className="font-medium">{stats.users}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Legal Entity / Owner</span>
              <span className="font-medium">
                {siteConfig.business.legalOwnerName} · {siteConfig.business.businessName}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Registered Under</span>
              <span className="font-medium">{siteConfig.business.registrationBody}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">v1.0.0 (Phase 2)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
