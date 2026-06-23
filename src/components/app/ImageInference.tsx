import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { UploadDropzone } from "./UploadDropzone";
import { ResultPanel } from "./ResultPanel";
import { ProgressBar } from "./ProgressBar";
import { detectImage, newDetectionId, type DetectResponse } from "@/lib/api";

const IMAGE_ETA_MS = 30_000;

export function ImageInference() {
  const [file, setFile] = useState<File | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectResponse | null>(null);
  const [detectionId, setDetectionId] = useState<string | null>(null);

  const run = async () => {
    if (!file) return;
    setError(null);
    setResult(null);
    setRunning(true);
    const id = newDetectionId();
    setDetectionId(id);
    try {
      const r = await detectImage(file);
      setResult(r);
    } catch (e: any) {
      setError(e?.message ?? "Detection failed");
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setDetectionId(null);
  };

  return (
    <div className="grid gap-5">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Image Inference</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xl">
              Detects helmet non-compliance, triple riding, and wrong-side driving from a single
              still. Estimated processing time:{" "}
              <span className="text-foreground font-medium">~30 seconds</span>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              disabled={running || (!file && !result)}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-card text-sm hover:bg-accent disabled:opacity-50"
            >
              <RotateCcw className="size-4" /> Reset
            </button>
            <button
              onClick={run}
              disabled={!file || running}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              <Play className="size-4" />
              {running ? "Detecting…" : "Run Detection"}
            </button>
          </div>
        </div>

        <div className="mt-5">
          <UploadDropzone
            accept="image/jpeg,image/png,image/webp,image/bmp"
            file={file}
            onFile={setFile}
            onClear={reset}
            disabled={running}
            hint="JPG, PNG, WEBP or BMP · single still image"
          />
        </div>

        {running && (
          <div className="mt-4">
            <ProgressBar running={running} estimateMs={IMAGE_ETA_MS} label="Running computer-vision pipeline" />
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      <ResultPanel
        detectionId={detectionId}
        result={result}
        emptyText="Upload an image and click Run Detection to view annotated evidence and violation breakdown."
      />
    </div>
  );
}
