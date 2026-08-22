"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  /** Hidden input name - the uploaded URL is submitted with the form. */
  name: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  /** Tailwind height class for the preview, e.g. "h-28" or "h-14 w-auto". */
  previewClassName?: string;
  aspect?: "wide" | "square" | "portrait" | "circle";
}

/**
 * Drag & drop file uploader for admin forms. Uploads straight to the
 * application's image store and writes the resulting URL into a hidden
 * form input - no manual URL handling required.
 */
export function ImageUploader({
  name,
  value,
  onChange,
  label,
  hint,
  previewClassName = "h-28",
  aspect = "square",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const aspectClass =
    aspect === "wide"
      ? "aspect-[16/9] w-full"
      : aspect === "portrait"
        ? "aspect-[3/4] h-full max-h-32"
        : aspect === "circle"
          ? "size-24 rounded-full"
          : "aspect-square h-full max-h-32";

  async function handleFile(file: File) {
    if (uploading) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as {
        url?: string;
        error?: string;
      } | null;
      if (!res.ok) {
        toast.error(data?.error ?? "Upload failed. Please try again.");
        return;
      }
      if (data?.url) {
        onChange(data.url);
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {label ? <p className="text-sm font-medium">{label}</p> : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <input type="hidden" name={name} value={value} />

      {value ? (
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "relative overflow-hidden rounded-lg border border-border bg-muted",
              aspectClass,
              previewClassName
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Uploading…
              </span>
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">
                Drag & drop an image here
              </span>
              <span className="text-xs text-muted-foreground">
                or click to browse · PNG, JPG, WEBP, GIF, SVG · max 2 MB
              </span>
            </>
          )}
        </button>
      )}
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}