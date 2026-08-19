import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductForm, type ProductFormValues } from "@/components/admin/products/product-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories, productTypes] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.productCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.productType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        subtypes: {
          where: { isActive: true },
          select: { id: true, name: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);
  if (!product) notFound();

  const values: ProductFormValues = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    productTypeId: product.productTypeId ?? "",
    subtypeId: product.subtypeId ?? "",
    subcategory: product.subcategory ?? "",
    sku: product.sku ?? "",
    price: product.price.toString(),
    discountPrice: product.discountPrice ? product.discountPrice.toString() : "",
    costPrice: product.costPrice ? product.costPrice.toString() : "",
    competitorPrice: product.competitorPrice ? product.competitorPrice.toString() : "",
    priceFloor: product.priceFloor ? product.priceFloor.toString() : "",
    priceSource: product.priceSource,
    stockStatus: product.stockStatus,
    quantity: String(product.quantity),
    mainImage: product.mainImage ?? "",
    shortDescription: product.shortDescription ?? "",
    longDescription: product.longDescription ?? "",
    returnPolicy: product.returnPolicy ?? "",
    benefits: product.benefits,
    tags: product.tags,
    material: product.material ?? "",
    size: product.size ?? "",
    sizeOptions: Array.isArray(product.sizeOptions)
      ? JSON.stringify(product.sizeOptions, null, 2)
      : "",
    weight: product.weight ?? "",
    color: product.color ?? "",
    estimatedDeliveryTime: product.estimatedDeliveryTime ?? "",
    isFeatured: product.isFeatured,
    isPopular: product.isPopular,
    isNewArrival: product.isNewArrival,
    hasCertificate: product.hasCertificate,
    isActive: product.isActive,
    sortOrder: String(product.sortOrder),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Edit Product</h1>
          <p className="text-sm text-muted-foreground">{product.name}</p>
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
          <CardDescription>Update the product and save your changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories} productTypes={productTypes} product={values} />
        </CardContent>
      </Card>
    </div>
  );
}