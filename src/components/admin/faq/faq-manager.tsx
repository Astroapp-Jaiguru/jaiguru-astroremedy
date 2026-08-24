"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  CircleHelp,
} from "lucide-react";
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
  upsertFaqAction,
  deleteFaqAction,
  toggleFaqAction,
} from "@/lib/admin/faqs/actions";
import { TypographyOverridePanel } from "@/components/admin/content/typography-override-panel";
import type {
  TypographyOverride,
  FaqTypographyOverride,
} from "@/config/typography-overrides";

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
  typography?: FaqTypographyOverride;
}

type FormState = {
  question: string;
  answer: string;
  category: string;
  sortOrder: string;
  isActive: boolean;
  questionOverride?: TypographyOverride;
  answerOverride?: TypographyOverride;
};

const emptyForm: FormState = {
  question: "",
  answer: "",
  category: "",
  sortOrder: "0",
  isActive: true,
  questionOverride: undefined,
  answerOverride: undefined,
};

export function FaqManager({ faqs }: { faqs: FaqRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [filter, setFilter] = useState("all");

  const categories = Array.from(
    new Set(faqs.map((f) => f.category).filter((c): c is string => !!c))
  );
  const visible = faqs.filter((f) =>
    filter === "all" ? true : f.category === filter
  );

  function beginCreate() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function beginEdit(row: FaqRow) {
    setEditingId(row.id);
    setForm({
      question: row.question,
      answer: row.answer,
      category: row.category ?? "",
      sortOrder: String(row.sortOrder),
      isActive: row.isActive,
      questionOverride: row.typography?.question,
      answerOverride: row.typography?.answer,
    });
  }

  function save() {
    if (!form.question.trim()) {
      toast.error("Question is required.");
      return;
    }
    if (!form.answer.trim()) {
      toast.error("Answer is required.");
      return;
    }
    startTransition(async () => {
      const res = await upsertFaqAction(editingId, {
        question: form.question,
        answer: form.answer,
        category: form.category,
        sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
        isActive: form.isActive,
        typography: {
          question: form.questionOverride,
          answer: form.answerOverride,
        },
      });
      if (res.ok) {
        toast.success(editingId ? "FAQ updated" : "FAQ created");
        setForm(emptyForm);
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not save the FAQ.");
      }
    });
  }

  function remove(row: FaqRow) {
    if (!window.confirm(`Delete "${row.question}"?`)) return;
    startTransition(async () => {
      const res = await deleteFaqAction(row.id);
      if (res.ok) {
        toast.success("FAQ deleted");
        if (editingId === row.id) {
          setEditingId(null);
          setForm(emptyForm);
        }
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not delete the FAQ.");
      }
    });
  }

  function toggle(row: FaqRow) {
    startTransition(async () => {
      const res = await toggleFaqAction(row.id);
      if (res.ok) {
        toast.success(row.isActive ? "FAQ hidden" : "FAQ shown");
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not update the FAQ.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">FAQ</h1>
          <p className="text-sm text-muted-foreground">
            Questions shown in the elegant accordion section on the homepage.
          </p>
        </div>
        <Button onClick={beginCreate} disabled={pending}>
          <Plus className="mr-1 h-4 w-4" />
          New Question
        </Button>
      </div>

      {form.question || form.answer || editingId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit Question" : "New Question"}
            </CardTitle>
            <CardDescription>
              Active questions appear on the homepage, ordered by sort order.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="faq-question">Question</Label>
              <Input
                id="faq-question"
                value={form.question}
                onChange={(e) =>
                  setForm({ ...form, question: e.target.value })
                }
                placeholder="e.g. Do you provide services worldwide?"
              />
            </div>
            <div className="space-y-2">
              <TypographyOverridePanel
                field="question"
                label="Question"
                override={form.questionOverride}
                mode="controlled"
                onValueChange={(v) => setForm({ ...form, questionOverride: v })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faq-category">Category (optional)</Label>
              <Input
                id="faq-category"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                placeholder="e.g. Consultations"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="faq-answer">Answer</Label>
              <Textarea
                id="faq-answer"
                rows={4}
                value={form.answer}
                onChange={(e) =>
                  setForm({ ...form, answer: e.target.value })
                }
                placeholder="The full answer shown when the question is opened..."
              />
            </div>
            <div className="sm:col-span-2">
              <TypographyOverridePanel
                field="answer"
                label="Answer"
                override={form.answerOverride}
                mode="controlled"
                onValueChange={(v) => setForm({ ...form, answerOverride: v })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faq-order">Sort Order</Label>
              <Input
                id="faq-order"
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: e.target.value })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="faq-active"
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <Label htmlFor="faq-active" className="cursor-pointer">
                  Active (visible on website)
                </Label>
              </div>
            </div>
            <div className="flex gap-2 sm:col-span-2">
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
                Save Question
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Questions</CardTitle>
          <CardDescription>
            {visible.length > 0 ? `${visible.length} total.` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    <CircleHelp className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    No questions yet. Click &quot;New Question&quot; to add one.
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="max-w-[420px]">
                      <p className="line-clamp-2 font-medium">{row.question}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {row.answer}
                      </p>
                    </TableCell>
                    <TableCell>
                      {row.category ? (
                        <Badge variant="outline">{row.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {row.sortOrder}
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
                        {row.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggle(row)}
                          disabled={pending}
                          title={row.isActive ? "Hide" : "Show"}
                        >
                          {row.isActive ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
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