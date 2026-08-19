"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Tags, Layers, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  upsertProductTypeAction,
  deleteProductTypeAction,
  upsertSubtypeAction,
  deleteSubtypeAction,
} from "@/lib/admin/product-types/actions";

export interface SubtypeRow {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductTypeRow {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  subtypes: SubtypeRow[];
}

export function ProductTypeManager({ types }: { types: ProductTypeRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(
    types[0]?.id ?? null
  );

  const [typeForm, setTypeForm] = useState({
    id: "",
    name: "",
    slug: "",
    icon: "",
    isActive: true,
    sortOrder: "0",
  });
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);

  const [subForm, setSubForm] = useState({
    id: "",
    name: "",
    slug: "",
    isActive: true,
    sortOrder: "0",
  });
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  const selectedType = useMemo(
    () => types.find((t) => t.id === selectedTypeId) ?? null,
    [types, selectedTypeId]
  );

  function beginTypeCreate() {
    setEditingTypeId(null);
    setTypeForm({
      id: "",
      name: "",
      slug: "",
      icon: "",
      isActive: true,
      sortOrder: "0",
    });
  }

  function beginTypeEdit(row: ProductTypeRow) {
    setEditingTypeId(row.id);
    setTypeForm({
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: row.icon ?? "",
      isActive: row.isActive,
      sortOrder: String(row.sortOrder),
    });
  }

  function saveType() {
    if (!typeForm.name.trim()) {
      toast.error("Product type name is required.");
      return;
    }
    startTransition(async () => {
      const res = await upsertProductTypeAction({
        id: typeForm.id || undefined,
        name: typeForm.name,
        slug: typeForm.slug,
        icon: typeForm.icon,
        isActive: typeForm.isActive,
        sortOrder: Number.parseInt(typeForm.sortOrder, 10) || 0,
      });
      if (res.ok) {
        toast.success(editingTypeId ? "Product type updated" : "Product type created");
        beginTypeCreate();
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not save product type.");
      }
    });
  }

  function removeType(row: ProductTypeRow) {
    if (!window.confirm(`Delete type "${row.name}"? Its subtypes are removed and products become untyped.`)) return;
    startTransition(async () => {
      const res = await deleteProductTypeAction(row.id);
      if (res.ok) {
        toast.success("Product type deleted");
        if (selectedTypeId === row.id) setSelectedTypeId(null);
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not delete product type.");
      }
    });
  }

  function openSubtypes(row: ProductTypeRow) {
    setSelectedTypeId(row.id);
    setEditingSubId(null);
    setSubForm({ id: "", name: "", slug: "", isActive: true, sortOrder: "0" });
  }

  function beginSubCreate() {
    setEditingSubId(null);
    setSubForm({ id: "", name: "", slug: "", isActive: true, sortOrder: "0" });
  }

  function beginSubEdit(row: SubtypeRow) {
    setEditingSubId(row.id);
    setSubForm({
      id: row.id,
      name: row.name,
      slug: row.slug,
      isActive: row.isActive,
      sortOrder: String(row.sortOrder),
    });
  }

  function saveSub() {
    if (!selectedTypeId) return;
    if (!subForm.name.trim()) {
      toast.error("Subtype name is required.");
      return;
    }
    startTransition(async () => {
      const res = await upsertSubtypeAction({
        id: subForm.id || undefined,
        productTypeId: selectedTypeId,
        name: subForm.name,
        slug: subForm.slug,
        isActive: subForm.isActive,
        sortOrder: Number.parseInt(subForm.sortOrder, 10) || 0,
      });
      if (res.ok) {
        toast.success(editingSubId ? "Subtype updated" : "Subtype created");
        beginSubCreate();
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not save subtype.");
      }
    });
  }

  function removeSub(row: SubtypeRow) {
    if (!window.confirm(`Delete subtype "${row.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteSubtypeAction(row.id);
      if (res.ok) {
        toast.success("Subtype deleted");
        if (editingSubId === row.id) beginSubCreate();
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not delete subtype.");
      }
    });
  }

  const statusBadge = (active: boolean) => (
    <Badge
      variant={active ? "default" : "outline"}
      className={
        active
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
          : "text-muted-foreground"
      }
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Product Types</h1>
          <p className="text-sm text-muted-foreground">
            Top-level taxonomy used by the /products filter (e.g. Yellow Sapphire),
            with subtypes for origin / mine / variety (e.g. Ceylon, Burmese, Thai).
          </p>
        </div>
        <Button onClick={beginTypeCreate} disabled={pending}>
          <Plus className="mr-1 h-4 w-4" />
          New Type
        </Button>
      </div>

      {/* Type form */}
      {typeForm.name !== "" || editingTypeId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingTypeId ? "Edit Product Type" : "New Product Type"}
            </CardTitle>
            <CardDescription>
              Slug is used in URLs — leave blank to auto-generate from the name.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pt-name">Type Name</Label>
              <Input
                id="pt-name"
                value={typeForm.name}
                onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                placeholder="e.g. Yellow Sapphire"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pt-slug">Slug</Label>
              <Input
                id="pt-slug"
                value={typeForm.slug}
                onChange={(e) =>
                  setTypeForm({
                    ...typeForm,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, ""),
                  })
                }
                placeholder="auto-generated"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pt-icon">Icon (optional)</Label>
              <Input
                id="pt-icon"
                value={typeForm.icon}
                onChange={(e) => setTypeForm({ ...typeForm, icon: e.target.value })}
                placeholder="e.g. 💎 or gem"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pt-order">Sort Order</Label>
              <Input
                id="pt-order"
                type="number"
                value={typeForm.sortOrder}
                onChange={(e) => setTypeForm({ ...typeForm, sortOrder: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="pt-active"
                  checked={typeForm.isActive}
                  onCheckedChange={(v) => setTypeForm({ ...typeForm, isActive: v })}
                />
                <Label htmlFor="pt-active" className="cursor-pointer">
                  Active (visible in the shop filter)
                </Label>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={beginTypeCreate}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={saveType} disabled={pending}>
                  {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Type
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Types table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tags className="h-4 w-4 text-primary" />
            Product Types
          </CardTitle>
          <CardDescription>
            {types.length} total. Click &quot;Subtypes&quot; to manage origin / variety
            options for a type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Subtypes</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No product types yet. Click &quot;New Type&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                types.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-base">{row.icon ?? <Tags className="h-4 w-4 text-primary" />}</span>
                        {row.name}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.slug}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Layers className="h-3 w-3" />
                        {row.subtypes.length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Package className="h-3 w-3" />
                        {row.productCount}
                      </Badge>
                    </TableCell>
                    <TableCell>{statusBadge(row.isActive)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSubtypes(row)}
                          disabled={pending}
                        >
                          <Layers className="mr-1 h-3.5 w-3.5" />
                          Subtypes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => beginTypeEdit(row)}
                          disabled={pending}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeType(row)}
                          disabled={pending}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subtypes panel */}
      {selectedType ? (
        <Card className="border-primary/30">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-4 w-4 text-primary" />
                Subtypes — {selectedType.name}
              </CardTitle>
              <CardDescription>
                Origins / mines / varieties shown under this type on the /products page.
              </CardDescription>
            </div>
            <Button onClick={beginSubCreate} disabled={pending} variant="outline">
              <Plus className="mr-1 h-4 w-4" />
              New Subtype
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Subtype form */}
            {subForm.name !== "" || editingSubId ? (
              <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="st-name">Subtype Name</Label>
                  <Input
                    id="st-name"
                    value={subForm.name}
                    onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                    placeholder="e.g. Ceylon"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="st-slug">Slug</Label>
                  <Input
                    id="st-slug"
                    value={subForm.slug}
                    onChange={(e) =>
                      setSubForm({
                        ...subForm,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, ""),
                      })
                    }
                    placeholder="auto-generated"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="st-order">Sort Order</Label>
                  <Input
                    id="st-order"
                    type="number"
                    value={subForm.sortOrder}
                    onChange={(e) => setSubForm({ ...subForm, sortOrder: e.target.value })}
                  />
                </div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="st-active"
                      checked={subForm.isActive}
                      onCheckedChange={(v) => setSubForm({ ...subForm, isActive: v })}
                    />
                    <Label htmlFor="st-active" className="cursor-pointer">
                      Active
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={beginSubCreate}
                      disabled={pending}
                    >
                      Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={saveSub} disabled={pending}>
                      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Subtype
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedType.subtypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      No subtypes yet. Click &quot;New Subtype&quot; to add one.
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedType.subtypes.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="font-mono text-xs">{row.slug}</TableCell>
                      <TableCell>{statusBadge(row.isActive)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => beginSubEdit(row)}
                            disabled={pending}
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSub(row)}
                            disabled={pending}
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}