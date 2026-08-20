"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, GitBranch, Boxes, Hash } from "lucide-react";
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
  upsertNavigationAction,
  deleteNavigationAction,
  setNavigationActiveAction,
} from "@/lib/admin/product-navigation/actions";
import { cn } from "@/lib/utils";

export interface NavigationRow {
  id: string;
  name: string;
  slug: string;
  kind: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  depth: number;
  productCount: number;
}

/** Display label for the parent dropdown, e.g. "Gemstones / Maharatna / Yellow Sapphire". */
export function nodePathLabel(nodes: NavigationRow[], id: string): string {
  const node = nodes.find((n) => n.id === id);
  if (!node) return "";
  const parts = [node.name];
  let cur = node;
  let guard = 0;
  while (cur.parentId && guard++ < 20) {
    const parent = nodes.find((n) => n.id === cur.parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    cur = parent;
  }
  return parts.join(" / ");
}

export function NavigationManager({ nodes }: { nodes: NavigationRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: "",
    name: "",
    slug: "",
    kind: "",
    parentId: "",
    isActive: true,
    sortOrder: "0",
  });

  const parentOptions = nodes
    .filter((n) => n.id !== form.id)
    .sort((a, b) => a.depth - b.depth || a.name.localeCompare(b.name));

  function beginCreate(parentId = "") {
    setEditingId(null);
    setForm({
      id: "",
      name: "",
      slug: "",
      kind: "",
      parentId,
      isActive: true,
      sortOrder: "0",
    });
    setShowForm(true);
  }

  function beginEdit(row: NavigationRow) {
    setEditingId(row.id);
    setForm({
      id: row.id,
      name: row.name,
      slug: row.slug,
      kind: row.kind ?? "",
      parentId: row.parentId ?? "",
      isActive: row.isActive,
      sortOrder: String(row.sortOrder),
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
  }

  function save() {
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    startTransition(async () => {
      const res = await upsertNavigationAction({
        id: form.id || undefined,
        name: form.name,
        slug: form.slug,
        kind: form.kind,
        parentId: form.parentId,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0,
      });
      if (res.ok) {
        toast.success(form.id ? "Node updated" : "Node created");
        cancelForm();
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not save node.");
      }
    });
  }

  function remove(row: NavigationRow) {
    if (
      !window.confirm(
        `Delete "${row.name}"? Its direct children move to the top level and products become unlinked.`
      )
    )
      return;
    startTransition(async () => {
      const res = await deleteNavigationAction(row.id);
      if (res.ok) {
        toast.success("Node deleted");
        if (editingId === row.id) cancelForm();
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not delete node.");
      }
    });
  }

  function toggleActive(row: NavigationRow) {
    const next = !row.isActive;
    startTransition(async () => {
      const res = await setNavigationActiveAction(row.id, next);
      if (res.ok) {
        toast.success(next ? `"${row.name}" is now visible` : `"${row.name}" is now hidden`);
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not toggle node.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-royal-purple" />
              Navigation Tree
            </CardTitle>
            <CardDescription>
              {nodes.length} levels / nodes. Products link to any level; the
              public menu filters by the whole subtree below a level.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => beginCreate()}>
            <Plus className="mr-1.5 h-4 w-4" /> New Top Level
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-semibold">Name</th>
                  <th className="px-4 py-2.5 font-semibold">Slug</th>
                  <th className="px-4 py-2.5 font-semibold">Kind</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Products</th>
                  <th className="px-4 py-2.5 text-center font-semibold">Status</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((row) => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5" style={{ paddingLeft: row.depth * 20 }}>
                        {row.depth > 0 ? (
                          <span className="text-muted-foreground/50">└</span>
                        ) : (
                          <Boxes className="h-4 w-4 shrink-0 text-[#B8860B]" />
                        )}
                        <span className={cn("font-medium", !row.isActive && "text-muted-foreground line-through")}>
                          {row.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.slug}</td>
                    <td className="px-4 py-2.5">
                      {row.kind === "size" ? (
                        <Badge variant="outline" className="border-[#B8860B]/40 text-[#B8860B]">
                          <Hash className="mr-1 h-3 w-3" /> Size
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Level</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">{row.productCount}</td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={row.isActive}
                          disabled={pending}
                          onCheckedChange={() => toggleActive(row)}
                          aria-label={`Toggle ${row.name} active status`}
                        />
                        <Badge variant={row.isActive ? "default" : "secondary"}>
                          {row.isActive ? "Active" : "Hidden"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Add child"
                          onClick={() => beginCreate(row.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit" onClick={() => beginEdit(row)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete" onClick={() => remove(row)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {nodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No nodes yet — create a top-level node to begin.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{form.id ? "Edit Node" : "New Node"}</CardTitle>
            <CardDescription>
              Name and slug identify the node. Choose a parent to nest it one
              level deeper (unlimited depth).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nav-name">Name *</Label>
              <Input
                id="nav-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Yellow Sapphire (Pukhraj)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nav-slug">Slug</Label>
              <Input
                id="nav-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="Auto from name when empty"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nav-parent">Parent</Label>
              <select
                id="nav-parent"
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="h-8 w-full rounded-lg border bg-background px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <option value="">— Top level —</option>
                {parentOptions.map((n) => (
                  <option key={n.id} value={n.id}>
                    {"  ".repeat(n.depth)}
                    {nodePathLabel(nodes, n.id)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nav-kind">Kind</Label>
              <select
                id="nav-kind"
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value })}
                className="h-8 w-full rounded-lg border bg-background px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <option value="">Level / Structure</option>
                <option value="size">Size (leaf — filters by sizeOptions label)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nav-sort">Sort Order</Label>
              <Input
                id="nav-sort"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 pb-1.5 text-sm">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                Active
              </label>
            </div>
            <div className="flex items-end gap-2 sm:col-span-2">
              <Button onClick={save} disabled={pending}>
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {form.id ? "Update Node" : "Create Node"}
              </Button>
              <Button variant="outline" onClick={cancelForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}