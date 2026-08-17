"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  ImagePlus,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const btn =
  "inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50";
const active = "bg-muted text-foreground border-primary";

/**
 * Rich text editor (Tiptap v3) used by the admin article form.
 * Output is HTML stored on the Article.content column and rendered
 * sanitized on the public article pages.
 */
export function ArticleEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const [html, setHtml] = useState(defaultValue ?? "");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: defaultValue ?? "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert min-h-[320px] max-w-none rounded-b-md border border-t-0 border-input bg-background px-4 py-3 text-sm focus-visible:outline-none",
      },
    },
    onUpdate({ editor }) {
      setHtml(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.isEmpty && defaultValue) {
      editor.commands.setContent(defaultValue);
    }
  }, [editor, defaultValue]);

  if (!editor) return null;

  const setImage = () => {
    const url = window.prompt("Image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };
  const setLink = () => {
    const url = window.prompt("Link URL");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-input bg-muted/50 p-1.5">
        <button type="button" className={cn(btn, editor.isActive("bold") && active)} onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Bold">
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={cn(btn, editor.isActive("italic") && active)} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Italic">
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={cn(btn, editor.isActive("strike") && active)} onClick={() => editor.chain().focus().toggleStrike().run()} aria-label="Strikethrough">
          <Strikethrough className="h-3.5 w-3.5" />
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button type="button" className={cn(btn, editor.isActive("heading", { level: 1 }) && active)} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} aria-label="Heading 1">
          <Heading1 className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={cn(btn, editor.isActive("heading", { level: 2 }) && active)} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Heading 2">
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={cn(btn, editor.isActive("heading", { level: 3 }) && active)} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} aria-label="Heading 3">
          <Heading3 className="h-3.5 w-3.5" />
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button type="button" className={cn(btn, editor.isActive("bulletList") && active)} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Bullet list">
          <List className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={cn(btn, editor.isActive("orderedList") && active)} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Ordered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={cn(btn, editor.isActive("blockquote") && active)} onClick={() => editor.chain().focus().toggleBlockquote().run()} aria-label="Quote">
          <Quote className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={cn(btn, editor.isActive("codeBlock") && active)} onClick={() => editor.chain().focus().toggleCodeBlock().run()} aria-label="Code block">
          <Code className="h-3.5 w-3.5" />
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button type="button" className={cn(btn, editor.isActive("link") && active)} onClick={setLink} aria-label="Link">
          <Link2 className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn} onClick={setImage} aria-label="Image">
          <ImagePlus className="h-3.5 w-3.5" />
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button type="button" className={btn} onClick={() => editor.chain().focus().undo().run()} aria-label="Undo">
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn} onClick={() => editor.chain().focus().redo().run()} aria-label="Redo">
          <Redo2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}