import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionCard, StatusBadge } from "@/components/UI";
import { Sprout, FlaskConical, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/soil")({
  head: () => ({
    meta: [
      { title: "Soil Analyzer — KrushiMitra" },
      { name: "description", content: "Enter your soil readings and get instant quality, crop and fertilizer advice." },
    ],
  }),
  component: SoilPage,
});

type Form = {
  ph: number; n: number; p: number; k: number;
  moisture: number; temperature: number; rainfall: number; season: string;
};

function analyze(f: Form) {
  let score = 0;
  if (f.ph >= 6 && f.ph <= 7.5) score += 2; else if (f.ph >= 5.5 && f.ph <= 8) score += 1;
  if (f.n >= 60) score += 2; else if (f.n >= 40) score += 1;
  if (f.p >= 40) score += 2; else if (f.p >= 25) score += 1;
  if (f.k >= 50) score += 2; else if (f.k >= 30) score += 1;
  if (f.moisture >= 30 && f.moisture <= 60) score += 2; else if (f.moisture >= 20) score += 1;

  const status: "good" | "warn" | "bad" = score >= 8 ? "good" : score >= 5 ? "warn" : "bad";
  const crops =
    f.ph < 6
      ? [{ n: "Tea 🍵", c: 88 }, { n: "Potato 🥔", c: 81 }, { n: "Blueberry 🫐", c: 74 }]
      : f.rainfall > 60
      ? [{ n: "Rice 🌾", c: 92 }, { n: "Sugarcane 🎋", c: 84 }, { n: "Jute 🌿", c: 76 }]
      : [{ n: "Wheat 🌾", c: 89 }, { n: "Maize 🌽", c: 82 }, { n: "Soybean 🫘", c: 75 }];

  const fertilizer: string[] = [];
  if (f.n < 60) fertilizer.push("Apply Urea (40 kg/acre) to boost nitrogen");
  if (f.p < 40) fertilizer.push("Add DAP (25 kg/acre) for phosphorus");
  if (f.k < 50) fertilizer.push("Apply Muriate of Potash (20 kg/acre)");
  if (f.ph < 6) fertilizer.push("Add agricultural lime to raise pH");
  if (f.ph > 7.8) fertilizer.push("Apply gypsum to lower alkalinity");
  if (fertilizer.length === 0) fertilizer.push("Soil is well balanced — maintain with compost top-dressing.");

  return { status, score, crops, fertilizer };
}

function SoilPage() {
  const [f, setF] = useState<Form>({ ph: 6.7, n: 75, p: 45, k: 55, moisture: 38, temperature: 27, rainfall: 65, season: "Kharif" });
  const [result, setResult] = useState<ReturnType<typeof analyze> | null>(null);

  const num = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: Number(e.target.value) });

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-5">
        <SectionCard
          title="Soil readings"
          subtitle="Enter values from your test kit"
          className="lg:col-span-3"
        >
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => { e.preventDefault(); setResult(analyze(f)); }}
          >
            {([
              ["pH level", "ph", 0, 14, 0.1],
              ["Nitrogen (N)", "n", 0, 200, 1],
              ["Phosphorus (P)", "p", 0, 200, 1],
              ["Potassium (K)", "k", 0, 200, 1],
              ["Moisture %", "moisture", 0, 100, 1],
              ["Temperature °C", "temperature", -5, 50, 1],
              ["Rainfall mm", "rainfall", 0, 400, 1],
            ] as const).map(([label, key, min, max, step]) => (
              <label key={key} className="block">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
                <input
                  type="number" min={min} max={max} step={step}
                  value={f[key]} onChange={num(key)}
                  className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-lg font-semibold text-foreground outline-none ring-ring/40 transition focus:border-leaf focus:ring-2"
                />
              </label>
            ))}
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Season</span>
              <select
                value={f.season}
                onChange={(e) => setF({ ...f, season: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-lg font-semibold text-foreground outline-none focus:border-leaf focus:ring-2 focus:ring-ring/40"
              >
                {["Kharif", "Rabi", "Summer", "Monsoon"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <button
              type="submit"
              className="sm:col-span-2 mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-card transition hover:scale-[1.01]"
            >
              <FlaskConical className="h-5 w-5" /> Analyze soil
            </button>
          </form>
        </SectionCard>

        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title="Soil quality"
            subtitle="Based on your readings"
            action={result && <StatusBadge status={result.status}>
              {result.status === "good" ? "Healthy" : result.status === "warn" ? "Needs care" : "Poor"}
            </StatusBadge>}
          >
            {!result ? (
              <p className="text-sm text-muted-foreground">Enter values and tap Analyze to see results.</p>
            ) : (
              <>
                <div className="rounded-2xl bg-gradient-leaf p-6 text-primary-foreground">
                  <p className="text-xs uppercase tracking-wider opacity-80">Overall score</p>
                  <p className="font-display text-5xl font-semibold">{result.score}<span className="text-2xl opacity-70">/10</span></p>
                </div>
                <h4 className="mt-5 font-display text-base font-semibold">Suggested crops</h4>
                <div className="mt-3 space-y-2">
                  {result.crops.map((c) => (
                    <div key={c.n} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
                      <span className="font-semibold">{c.n}</span>
                      <span className="text-sm font-semibold text-leaf">{c.c}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </SectionCard>

          {result && (
            <SectionCard title="Fertilizer advice" subtitle="Tailored to your deficits">
              <ul className="space-y-2.5">
                {result.fertilizer.map((t, i) => (
                  <li key={i} className="flex gap-3 rounded-2xl bg-muted px-4 py-3 text-sm">
                    <Sprout className="h-4 w-4 shrink-0 text-leaf mt-0.5" /> {t}
                  </li>
                ))}
              </ul>
              <Link to="/crops" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-leaf hover:underline">
                See full crop recommendations <ArrowRight className="h-4 w-4" />
              </Link>
            </SectionCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
