import { NavigationManager, type NavigationRow } from "@/components/admin/product-navigation/navigation-manager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductNavigationPage() {
  const nodes = await prisma.productNavigation.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      kind: true,
      parentId: true,
      isActive: true,
      sortOrder: true,
      _count: { select: { products: true } },
    },
  });

  // Flatten the tree in display order (parents before children, depth-first).
  const byParent = new Map<string | null, typeof nodes>();
  for (const n of nodes) {
    const arr = byParent.get(n.parentId) ?? [];
    arr.push(n);
    byParent.set(n.parentId, arr);
  }
  const sortKids = (list: typeof nodes) =>
    [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  const rows: NavigationRow[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const n of sortKids(byParent.get(parentId) ?? [])) {
      rows.push({
        id: n.id,
        name: n.name,
        slug: n.slug,
        kind: n.kind,
        parentId: n.parentId,
        isActive: n.isActive,
        sortOrder: n.sortOrder,
        depth,
        productCount: n._count.products,
      });
      walk(n.id, depth + 1);
    }
  };
  walk(null, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Product Navigation</h1>
        <p className="text-sm text-muted-foreground">
          Build the multi-level menu shown in the site header ("Product List")
          and used to filter the /products catalogue. Products can be linked to
          any level — the menu filters the whole subtree below it.
        </p>
      </div>
      <NavigationManager nodes={rows} />
    </div>
  );
}