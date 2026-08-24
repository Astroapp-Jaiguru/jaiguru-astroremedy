import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { CategoryManager } from "@/components/admin/categories/category-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const [products, services] = await Promise.all([
    prisma.productCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.serviceCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  return (
    <CategoryManager
      products={products.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        parentId: c.parentId,
        isActive: c.isActive,
        sortOrder: c.sortOrder,
      }))}
      services={services.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        parentId: c.parentId,
        isActive: c.isActive,
        sortOrder: c.sortOrder,
      }))}
    />
  );
}