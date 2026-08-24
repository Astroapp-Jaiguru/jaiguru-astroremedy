import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceForm, type ServiceFormValues } from "@/components/admin/services/service-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: PageProps) {
  const { id } = await params;
  const [service, categories] = await Promise.all([
    prisma.service.findUnique({ where: { id } }),
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);
  if (!service) notFound();

  const values: ServiceFormValues = {
    id: service.id,
    name: service.name,
    slug: service.slug,
    categoryId: service.categoryId,
    mode: service.mode,
    duration: service.duration ?? "",
    slotDuration: service.slotDuration ? String(service.slotDuration) : "60",
    price: service.price ? service.price.toString() : "",
    priceLabel: service.priceLabel ?? "",
    competitorPrice: service.competitorPrice ? service.competitorPrice.toString() : "",
    priceFloor: service.priceFloor ? service.priceFloor.toString() : "",
    priceSource: service.priceSource,
    imageUrl: service.imageUrl ?? "",
    shortDescription: service.shortDescription ?? "",
    longDescription: service.longDescription ?? "",
    benefits: service.benefits,
    syllabus: service.syllabus,
    serviceArea: service.serviceArea ?? "",
    isFeatured: service.isFeatured,
    isActive: service.isActive,
    sortOrder: String(service.sortOrder),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Edit Service</h1>
          <p className="text-sm text-muted-foreground">{service.name}</p>
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
          <CardDescription>Update the service and save your changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceForm categories={categories} service={values} />
        </CardContent>
      </Card>
    </div>
  );
}