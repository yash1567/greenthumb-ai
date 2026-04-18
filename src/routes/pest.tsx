import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionCard, StatusBadge } from "@/components/UI";
import { Upload, Image as ImageIcon, Sparkles, X, Leaf } from "lucide-react";

export const Route = createFileRoute("/pest")({
  head: () => ({
    meta: [
      { title: "Pest Detection — KrushiMitra" },
      { name: "description", content: "Upload a leaf photo and get an AI diagnosis with treatment in seconds." },
    ],
  }),
  component: PestPage,
});

type Detection = {
  disease: string;
  crop: string;
  confidence: number;
  severity: "Low" | "Moderate" | "High";
  status: "good" | "warn" | "bad";
  treatments: string[];
};

const mockDetections: Detection[] = [
  {
    disease: "Early Blight",
    crop: "Tomato",
    confidence: 92,
    severity: "Moderate",
    status: "warn",
    treatments: [
      "Remove and destroy infected lower leaves",
      "Apply copper-based fungicide every 7–10 days",
      "Mulch around base to prevent soil splash",
      "Improve airflow by spacing plants 60 cm apart",
    ],
  },
  {
    disease: "Leaf Rust",
    crop: "Wheat",
    confidence: 87,
    severity: "Low",
    status: "good",
    treatments: [
      "Monitor field weekly — currently low risk",
      "Ensure balanced potassium for natural resistance",
      "Plan rust-resistant variety for next sowing",
    ],
  },
  {
    disease: "Bacterial Leaf Blight",
    crop: "Rice",
    confidence: 95,
    severity: "High",
    status: "bad",
    treatments: [
      "Drain field for 2–3 days to slow spread",
      "Apply copper oxychloride spray immediately",
      "Stop nitrogen top-dressing until controlled",
      "Burn severely infected plants away from field",
    ],
  },
];

function PestPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Detection | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);
    setAnalyzing(true);
    setTimeout(() => {
      setResult(mockDetections[Math.floor(Math.random() * mockDetections.length)]);
      setAnalyzing(false);
    }, 1400);
  };

  const reset = () => { setPreview(null); setResult(null); };

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-5">
        <SectionCard title="Upload a leaf photo" subtitle="Drag & drop or browse — JPG/PNG up to 10MB" className="lg:col-span-3">
          {!preview ? (
            <label
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center transition ${
                drag ? "border-leaf bg-leaf/5" : "border-border bg-background hover:border-leaf hover:bg-leaf/5"
              }`}
            >
              <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)} />
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-leaf text-primary-foreground shadow-glow">
                <Upload className="h-7 w-7" />
              </div>
              <p className="mt-5 font-display text-xl font-semibold">Drop your leaf image here</p>
              <p className="mt-1 text-sm text-muted-foreground">or click to browse from your device</p>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                <ImageIcon className="h-4 w-4" /> Choose photo
              </span>
            </label>
          ) : (
            <div className="relative">
              <img src={preview} alt="Uploaded leaf" className="aspect-video w-full rounded-3xl object-cover" />
              <button
                onClick={reset}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow-soft hover:bg-background"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
              {analyzing && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-foreground/40 backdrop-blur-sm">
                  <div className="rounded-2xl bg-card px-6 py-4 shadow-card">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 animate-pulse text-leaf" />
                      <p className="font-semibold">Analyzing leaf…</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title="Diagnosis"
            subtitle="AI-powered detection result"
            action={result && <StatusBadge status={result.status}>{result.severity} severity</StatusBadge>}
          >
            {!result ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <Leaf className="h-10 w-10 text-leaf/40" />
                <p className="mt-3 text-sm">Upload a photo to see results.</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-gradient-leaf p-6 text-primary-foreground">
                  <p className="text-xs uppercase tracking-wider opacity-80">{result.crop}</p>
                  <p className="mt-1 font-display text-3xl font-semibold">{result.disease}</p>
                  <div className="mt-4 flex items-end justify-between">
                    <span className="text-sm opacity-90">Confidence</span>
                    <span className="font-display text-3xl font-semibold text-lime">{result.confidence}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-foreground/15">
                    <div className="h-full bg-lime" style={{ width: `${result.confidence}%` }} />
                  </div>
                </div>
              </>
            )}
          </SectionCard>

          {result && (
            <SectionCard title="Treatment plan" subtitle="Follow these steps in order">
              <ol className="space-y-2.5">
                {result.treatments.map((t, i) => (
                  <li key={i} className="flex gap-3 rounded-2xl bg-muted px-4 py-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-leaf text-xs font-bold text-primary-foreground">{i + 1}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
            </SectionCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
