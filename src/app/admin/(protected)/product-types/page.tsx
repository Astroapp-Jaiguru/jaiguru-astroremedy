import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { ProductTypeManager } from "@/components/admin/product-types/product-type-manager";

export const dynamic = "force-dynamic";

export default async function AdminProductTypesPage() {
  await requireAdmin();
  const types = await prisma.productType.findMany({
    include: {
      subtypes: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
      _count: { select: { products: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <ProductTypeManager
      types={types.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        icon: t.icon,
        isActive: t.isActive,
        sortOrder: t.sortOrder,
        productCount: t._count.products,
        subtypes: t.subtypes.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          isActive: s.isActive,
          sortOrder: s.sortOrder,
        })),
      }))}
    />
  );
}