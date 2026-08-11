"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, FolderTree, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  upsertCategoryAction,
  deleteCategoryAction,
  type CategoryModel,
} from "@/lib/admin/categories/actions";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  children?: CategoryRow[];
}

const TAB_META: Record<CategoryModel, { label: string; desc: string }> = {
  product: {
    label: "Product Categories",
    desc: "Top-level structure used on the shop pages.",
  },
  service: {
    label: "Service Categories",
    desc: "Top-level structure used on the consultations pages.",
  },
};

export function CategoryManager({
  products,
  services,
}: {
  products: CategoryRow[];
  services: CategoryRow[];
}) {
  const [model, setModel] = useState<CategoryModel>("product");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  type FormState = {
    name: string;
    slug: string;
    description: string;
    parentId: string;
    isActive: boolean;
    sortOrder: string;
  };
  const emptyForm: FormState = {
    name: "",
    slug: "",
    description: "",
    parentId: "",
    isActive: true,
    sortOrder: "0",
  };
  const [form, setForm] = useState<FormState>(emptyForm);

  const rows = model === "product" ? products : services;
  const flatOptions = useMemo(
    () => rows.filter((r) => r.id !== editingId),
    [rows, editingId]
  );
  const parentName = useMemo(
    () => rows.find((r) => r.id === form.parentId)?.name ?? "",
    [rows, form.parentId]
  );

  function beginCreate() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function beginEdit(row: CategoryRow) {
    setEditingId(row.id);
    setForm({
      name: row.name,
      slug: row.slug,
      description: row.description ?? "",
      parentId: row.parentId ?? "",
      isActive: row.isActive,
      sortOrder: String(row.sortOrder),
    });
  }

  function save() {
    if (!form.name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    startTransition(async () => {
      const res = await upsertCategoryAction(model, {
        name: form.name,
        slug: form.slug,
        description: form.description,
        parentId: form.parentId,
        isActive: form.isActive,
        sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
      });
      if (res.ok) {
        toast.success(editingId ? "Category updated" : "Category created");
        setForm(emptyForm);
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not save category.");
      }
    });
  }

  function remove(row: CategoryRow) {
    if (!window.confirm(`Delete "${row.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteCategoryAction(model, row.id);
      if (res.ok) {
        toast.success("Category deleted");
        if (editingId === row.id) {
          setEditingId(null);
          setForm(emptyForm);
        }
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not delete category.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage product and service categories, parents, descriptions and visibility.
          </p>
        </div>
        <Button onClick={beginCreate} disabled={pending}>
          <Plus className="mr-1 h-4 w-4" />
          New Category
        </Button>
      </div>

      <div className="flex gap-2">
        {(Object.keys(TAB_META) as CategoryModel[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setModel(m);
              setEditingId(null);
              setForm(emptyForm);
            }}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              model === m
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
            }`}
          >
            {TAB_META[m].label}
          </button>
        ))}
      </div>

      {form.name || form.slug || form.description || editingId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit Category" : "New Category"}
            </CardTitle>
            <CardDescription>
              {editingId
                ? "Update the category details below."
                : "Slug is used in URLs - leave blank to auto-generate from the name."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Rudraksha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) =>
                  setForm({
                    ...form,
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
              <Label>Parent Category</Label>
              <Select
                value={form.parentId}
                onValueChange={(v) => setForm({ ...form, parentId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (top-level)</SelectItem>
                  {flatOptions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {parentName ? (
                <p className="text-xs text-muted-foreground">
                  Child of: <span className="font-medium">{parentName}</span>
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-order">Sort Order</Label>
              <Input
                id="cat-order"
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: e.target.value })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4 sm:col-span-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="cat-active"
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <Label htmlFor="cat-active" className="cursor-pointer">
                  Active (visible on website)
                </Label>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={save} disabled={pending}>
                  {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Category
                </Button>
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Optional short description of this category."
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{TAB_META[model].label}</CardTitle>
          <CardDescription>
            {TAB_META[model].desc} {rows.length > 0 ? `${rows.length} total.` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No categories yet. Click &quot;New Category&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        {row.parentId ? (
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <FolderTree className="h-4 w-4 text-primary" />
                        )}
                        {row.name}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {row.slug}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.parentId
                        ? rows.find((r) => r.id === row.parentId)?.name ?? "—"
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <p className="line-clamp-1 max-w-[260px] text-sm text-muted-foreground">
                        {row.description ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={row.isActive ? "default" : "outline"}
                        className={
                          row.isActive
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                            : "text-muted-foreground"
                        }
                      >
                        {row.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => beginEdit(row)}
                          disabled={pending}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(row)}
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
    </div>
  );
}