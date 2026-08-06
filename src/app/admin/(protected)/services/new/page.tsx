import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceForm } from "@/components/admin/services/service-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">New Service</h1>
          <p className="text-sm text-muted-foreground">Create a new course or service package.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/services">
            <ArrowLeft /> Back to Services
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <CardDescription>
            Fields marked * are required. Slug auto-generates from the name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}