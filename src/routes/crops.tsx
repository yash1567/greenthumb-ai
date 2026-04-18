import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/UI";
import { topCrops, type CropCategory } from "@/lib/mockData";
import { Sparkles, Calendar, Droplet, TrendingUp, Brain, Layers, Sun, CloudRain } from "lucide-react";

export const Route = createFileRoute("/crops")({
  head: () => ({
    meta: [
      { title: "Crop Recommendations — KrushiMitra" },
      { name: "description", content: "AI-ranked crop recommendations across food, cash, pulses, vegetables and oil crops for Indian farmers." },
    ],
  }),
  component: CropsPage,
});

const CATEGORIES: Array<"All" | CropCategory> = ["All", "Food", "Cash", "Pulses", "Vegetables", "Oil"];

const categoryStyles: Record<CropCategory, string> = {
  Food: "bg-leaf/10 text-leaf",
  Cash: "bg-sun/20 text-sun-foreground",
  Pulses: "bg-lime/20 text-foreground",
  Vegetables: "bg-bad/10 text-bad",
  Oil: "bg-sky/30 text-sky-foreground",
};

const waterStyles: Record<"Low" | "Medium" | "High", string> = {
  Low: "bg-good/15 text-good",
  Medium: "bg-warn/20 text-[oklch(0.45_0.12_75)]",
  High: "bg-sky/40 text-sky-foreground",
};

function CropsPage() {
  const [filter, setFilter] = useState<"All" | CropCategory>("All");

  const filtered = useMemo(() => {
    const list = filter === "All" ? topCrops : topCrops.filter((c) => c.category === filter);
    return [...list].sort((a, b) => b.confidence - a.confidence);
  }, [filter]);

  const best = filtered[0];
  const detailed = filtered.slice(1, 5);
  const rest = filtered.slice(5);

  return (
    <AppShell>
      <div className="grid gap-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Layers className="h-3.5 w-3.5" /> Filter by category
          </span>
          {CATEGORIES.map((c) => {
            const active = filter === c;
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "border border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {best && (
          <div className="overflow-hidden rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-card sm:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Best match · {best.category}
            </span>
            <div className="mt-5 flex flex-wrap items-end gap-8">
              <div className="text-7xl">{best.emoji}</div>
              <div className="flex-1 min-w-[240px]">
                <h2 className="font-display text-4xl font-semibold sm:text-5xl">{best.name}</h2>
                <p className="mt-2 max-w-md text-sm opacity-90">{best.notes}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-6xl font-semibold text-lime">{best.confidence}%</p>
                <p className="text-xs uppercase tracking-wider opacity-80">Confidence</p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              {[
                { l: "Sowing window", v: best.sowing, i: Calendar },
                { l: "Expected yield", v: best.yield, i: TrendingUp },
                { l: "Water need", v: best.water, i: Droplet },
                { l: "Season", v: best.season, i: Sun },
              ].map((x) => (
                <div key={x.l} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-4 backdrop-blur">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80">
                    <x.i className="h-4 w-4" /> {x.l}
                  </div>
                  <p className="mt-1.5 font-display text-2xl font-semibold">{x.v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {detailed.length > 0 && (
          <SectionCard title="Other strong matches" subtitle="Top alternatives ranked by AI confidence">
            <div className="grid gap-5 md:grid-cols-2">
              {detailed.map((c) => (
                <div key={c.name} className="group rounded-3xl border border-border bg-background p-6 transition hover:-translate-y-0.5 hover:shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-4xl">{c.emoji}</div>
                      <div>
                        <h3 className="font-display text-2xl font-semibold">{c.name}</h3>
                        <p className="text-xs text-muted-foreground">Sow {c.sowing} · {c.season}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="rounded-full bg-leaf/10 px-3 py-1 text-sm font-semibold text-leaf">{c.confidence}%</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${categoryStyles[c.category]}`}>{c.category}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{c.notes}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-muted px-3 py-2"><span className="text-muted-foreground">Yield · </span><b>{c.yield}</b></div>
                    <div className="rounded-xl bg-muted px-3 py-2"><span className="text-muted-foreground">Water · </span><b>{c.water}</b></div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-gradient-leaf" style={{ width: `${c.confidence}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {rest.length > 0 && (
          <SectionCard title="More viable crops" subtitle={`${rest.length} additional crops ranked for your field conditions`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Crop</th>
                    <th className="px-4 py-2 font-medium">Category</th>
                    <th className="px-4 py-2 font-medium">Season</th>
                    <th className="px-4 py-2 font-medium">Water</th>
                    <th className="px-4 py-2 font-medium text-right">Suitability</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((c) => (
                    <tr key={c.name} className="bg-background transition hover:bg-muted/60">
                      <td className="rounded-l-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{c.emoji}</span>
                          <div>
                            <p className="font-semibold">{c.name}</p>
                            <p className="text-xs text-muted-foreground">Sow {c.sowing}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${categoryStyles[c.category]}`}>{c.category}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.season}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${waterStyles[c.water]}`}>{c.water}</span>
                      </td>
                      <td className="rounded-r-xl px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-gradient-leaf" style={{ width: `${c.confidence}%` }} />
                          </div>
                          <span className="w-10 text-right font-display text-base font-semibold">{c.confidence}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        <SectionCard title="Why these crops?" subtitle="How KrushiMitra's AI ranked your recommendations">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { i: Brain, t: "Soil chemistry", d: "pH, nitrogen, phosphorus and potassium readings matched against ideal nutrient bands for each crop." },
              { i: CloudRain, t: "Weather & rainfall", d: "Local 7-day forecast, monsoon outlook and historical rainfall for your region inform season fit." },
              { i: Sun, t: "Agro-climatic zone", d: "Temperature ranges and humidity profiles cross-checked with ICAR zone requirements." },
              { i: TrendingUp, t: "Yield & market", d: "Expected yield, water cost and demand signals tilt the ranking toward profitable choices." },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-border bg-background p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf/10 text-leaf">
                  <x.i className="h-5 w-5" />
                </div>
                <p className="mt-3 font-display text-lg font-semibold">{x.t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
            Confidence scores blend these signals into a single 0–100 suitability index. Filter by category to compare crops within a group, or follow the highlighted best match for the strongest overall fit.
          </p>
        </SectionCard>
      </div>
    </AppShell>
  );
}
