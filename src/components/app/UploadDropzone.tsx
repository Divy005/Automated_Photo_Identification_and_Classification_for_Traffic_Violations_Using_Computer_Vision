import { useRef, useState, useCallback } from "react";
import { UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadDropzone({
  accept,
  onFile,
  hint,
  file,
  onClear,
  disabled,
}: {
  accept: string;
  onFile: (f: File) => void;
  hint: string;
  file: File | null;
  onClear: () => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setOver(false);
      if (disabled) return;
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile, disabled],
  );

  if (file) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{file.name}</div>
          <div className="text-xs text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || "file"}
          </div>
        </div>
        <button
          onClick={onClear}
          disabled={disabled}
          className="grid place-items-center size-8 rounded-md border border-border hover:bg-accent disabled:opacity-50"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        "cursor-pointer rounded-xl border border-dashed bg-card/40 transition-colors",
        "px-6 py-10 text-center",
        over ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
        disabled && "opacity-60 cursor-not-allowed",
      )}
    >
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/20">
        <UploadCloud className="size-6 text-primary" />
      </div>
      <div className="mt-4 text-sm font-medium">Drop file here or click to browse</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
