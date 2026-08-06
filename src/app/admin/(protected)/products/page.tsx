import Link from "next/link";
import Image from "next/image";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/shop-data";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteProductAction } from "@/lib/admin/products/actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function param(sp: Awaited<PageProps["searchParams"]>, key: string): string {
  const v = sp[key];
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(param(sp, "page"), 10) || 1);
  const q = param(sp, "q").trim();

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const total = await prisma.product.count({ where });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pages);

  const products = await prisma.product.findMany({
    where,
    include: { category: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    skip: (current - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            {total} products · list, create, edit and delete
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus /> New Product
          </Link>
        </Button>
      </div>

      <form method="get" action="/admin/products" className="flex w-full max-w-sm gap-2">
        <div className="relative w-full">
          <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Search by name or SKU..." className="pl-8" />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Badges</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.mainImage ? (
                        <Image
                          src={p.mainImage}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-gradient-to-br from-[#1E1B4B] to-[#4C1D95]" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{p.category?.name ?? "-"}</TableCell>
                  <TableCell className="text-sm">
                    <span className="font-medium">{formatPrice(p.price)}</span>
                    {p.discountPrice ? (
                      <span className="ml-1.5 text-xs text-muted-foreground line-through">
                        {formatPrice(p.discountPrice)}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm">
                    <Badge
                      variant={
                        p.stockStatus === "IN_STOCK"
                          ? "default"
                          : p.stockStatus === "PRE_ORDER"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {p.stockStatus === "IN_STOCK"
                        ? "In Stock"
                        : p.stockStatus === "PRE_ORDER"
                          ? "Pre Order"
                          : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {p.isFeatured ? <Badge variant="secondary">Featured</Badge> : null}
                      {p.isPopular ? <Badge variant="secondary">Popular</Badge> : null}
                      {p.isNewArrival ? <Badge variant="secondary">New</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.isActive ? "default" : "destructive"}>
                      {p.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/products/${p.id}/edit`}>Edit</Link>
                      </Button>
                      <DeleteButton id={p.id} action={deleteProductAction} label="Delete" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {current > 1 ? (
            <Link href={`/admin/products?page=${current - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="text-sm underline-offset-4 hover:underline">
              Previous
            </Link>
          ) : null}
          <span className="text-sm text-muted-foreground">
            Page {current} of {pages}
          </span>
          {current < pages ? (
            <Link href={`/admin/products?page=${current + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="text-sm underline-offset-4 hover:underline">
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}