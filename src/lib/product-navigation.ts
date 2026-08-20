/**
 * Helpers for the ProductNavigation tree: flattening for selects, subtree
 * id resolution for filtering, and building the nested menu for the header.
 */

export interface NavNodeCore {
  id: string;
  name: string;
  slug: string;
  kind: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface NavFlatRow extends NavNodeCore {
  depth: number;
  productCount: number;
}

export interface NavMenuItem {
  name: string;
  slug: string;
  href: string;
  children: NavMenuItem[];
}

/** Sort siblings by sortOrder then name. */
function sortSiblings<T extends { sortOrder: number; name: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

/** Flatten the tree into a depth-ordered list (parents before children). */
export function flattenNavigation(nodes: NavNodeCore[]): NavFlatRow[] {
  const byParent = new Map<string | null, NavNodeCore[]>();
  for (const n of nodes) {
    const arr = byParent.get(n.parentId) ?? [];
    arr.push(n);
    byParent.set(n.parentId, arr);
  }
  const rows: NavFlatRow[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const n of sortSiblings(byParent.get(parentId) ?? [])) {
      rows.push({ ...n, depth, productCount: 0 });
      walk(n.id, depth + 1);
    }
  };
  walk(null, 0);
  return rows;
}

/** All ids in the subtree rooted at `rootId` (inclusive). */
export function navSubtreeIds(nodes: NavNodeCore[], rootId: string): Set<string> {
  const byParent = new Map<string | null, string[]>();
  for (const n of nodes) {
    const arr = byParent.get(n.parentId) ?? [];
    arr.push(n.id);
    byParent.set(n.parentId, arr);
  }
  const ids = new Set<string>([rootId]);
  const stack = [rootId];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const child of byParent.get(cur) ?? []) {
      ids.add(child);
      stack.push(child);
    }
  }
  return ids;
}

/** Build the nested menu structure for the header (active nodes only). */
export function buildNavMenu(nodes: NavNodeCore[]): NavMenuItem[] {
  const active = nodes.filter((n) => n.isActive);
  const byParent = new Map<string | null, NavNodeCore[]>();
  for (const n of active) {
    const arr = byParent.get(n.parentId) ?? [];
    arr.push(n);
    byParent.set(n.parentId, arr);
  }
  const build = (parentId: string | null): NavMenuItem[] =>
    sortSiblings(byParent.get(parentId) ?? []).map((n) => ({
      name: n.name,
      slug: n.slug,
      href: `/products?nav=${n.slug}`,
      children: build(n.id),
    }));
  return build(null);
}