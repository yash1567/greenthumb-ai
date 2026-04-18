import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/UI";
import { topCrops } from "@/lib/mockData";
import { Sparkles, Calendar, Droplet, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/crops")({
  head: () => ({
    meta: [
      { title: "Crop Recommendations — KrushiMitra" },
      { name: "description", content: "Top 3 crops for your field with confidence scores, sowing windows and yield." },
    ],
  }),
  component: CropsPage,
});

function CropsPage() {
  const [best, ...others] = topCrops;
  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-card sm:p-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Best match
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
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { l: "Sowing window", v: best.sowing, i: Calendar },
              { l: "Expected yield", v: best.yield, i: TrendingUp },
              { l: "Water need", v: best.water, i: Droplet },
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

        <SectionCard title="Other strong matches" subtitle="Alternatives ranked by AI confidence">
          <div className="grid gap-5 md:grid-cols-2">
            {others.map((c) => (
              <div key={c.name} className="group rounded-3xl border border-border bg-background p-6 transition hover:-translate-y-0.5 hover:shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-4xl">{c.emoji}</div>
                    <div>
                      <h3 className="font-display text-2xl font-semibold">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">Sow {c.sowing}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-leaf/10 px-3 py-1 text-sm font-semibold text-leaf">{c.confidence}%</span>
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
      </div>
    </AppShell>
  );
}
