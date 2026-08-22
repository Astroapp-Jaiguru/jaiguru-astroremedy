import { requireVendor } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import ProductCreateWizard from "@/components/vendor/product-create-wizard";

export default async function CreateVendorProductPage() {
  await requireVendor();
  const categories = await prisma.productCategory.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });
  return <main className="mx-auto flex max-w-5xl flex-col gap-6"><div><p className="text-sm text-muted-foreground">Vendor catalog</p><h1 className="text-3xl font-semibold text-balance">Create a product</h1><p className="mt-2 text-muted-foreground">Products are reviewed before becoming visible in the marketplace.</p></div><ProductCreateWizard categories={categories} /></main>;
}
