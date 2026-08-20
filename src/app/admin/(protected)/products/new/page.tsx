import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/products/product-form";
import { prisma } from "@/lib/prisma";
import { flattenNavigation } from "@/lib/product-navigation";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, navNodes] = await Promise.all([
    prisma.productCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.productNavigation.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        kind: true,
        parentId: true,
        isActive: true,
        sortOrder: true,
      },
    }),
  ]);
  const navigation = flattenNavigation(navNodes);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">New Product</h1>
          <p className="text-sm text-muted-foreground">Create a new catalogue product.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/products">
            <ArrowLeft /> Back to Products
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Fields marked * are required. Slug auto-generates from the name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories} navigation={navigation} />
        </CardContent>
      </Card>
    </div>
  );
}