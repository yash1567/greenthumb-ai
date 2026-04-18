import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionCard, StatusBadge } from "@/components/UI";
import { soilHistory, pestHistory, topCrops } from "@/lib/mockData";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Verdant" },
      { name: "description", content: "Past soil tests, crop recommendations and pest detections in one place." },
    ],
  }),
  component: HistoryPage,
});

const tabs = ["Soil tests", "Crop recommendations", "Pest detections"] as const;
type Tab = typeof tabs[number];

function HistoryPage() {
  const [tab, setTab] = useState<Tab>("Soil tests");

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex flex-wrap gap-2 rounded-full border border-border bg-card p-1.5 shadow-soft sm:w-fit">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                tab === t ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Soil tests" && (
          <SectionCard title="Soil test history" subtitle={`${soilHistory.length} tests recorded`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    {["Date", "pH", "N", "P", "K", "Moisture", "Season", "Top crop", "Status"].map((h) => (
                      <th key={h} className="py-3 pr-4 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {soilHistory.map((r) => (
                    <tr key={r.id} className="border-t border-border/70">
                      <td className="py-4 pr-4 font-medium">{r.date}</td>
                      <td className="py-4 pr-4">{r.ph}</td>
                      <td className="py-4 pr-4">{r.n}</td>
                      <td className="py-4 pr-4">{r.p}</td>
                      <td className="py-4 pr-4">{r.k}</td>
                      <td className="py-4 pr-4">{r.moisture}%</td>
                      <td className="py-4 pr-4">{r.season}</td>
                      <td className="py-4 pr-4 font-semibold">{r.topCrop}</td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={r.status}>
                          {r.status === "good" ? "Healthy" : r.status === "warn" ? "Needs care" : "Poor"}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {tab === "Crop recommendations" && (
          <SectionCard title="Past crop recommendations" subtitle="What we suggested for your fields">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topCrops.map((c) => (
                <div key={c.name} className="rounded-3xl border border-border bg-background p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-3xl">{c.emoji}</div>
                    <div>
                      <p className="font-display text-lg font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">Sow {c.sowing}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-semibold text-leaf">{c.confidence}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-gradient-leaf" style={{ width: `${c.confidence}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {tab === "Pest detections" && (
          <SectionCard title="Pest detections" subtitle={`${pestHistory.length} diagnoses`}>
            <ul className="space-y-3">
              {pestHistory.map((p) => {
                const status = p.severity === "Low" ? "good" : p.severity === "Moderate" ? "warn" : "bad";
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-background p-5">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.date} • {p.crop}</p>
                      <p className="mt-1 font-display text-xl font-semibold">{p.disease}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="font-display text-xl font-semibold">{p.confidence}%</p>
                      </div>
                      <StatusBadge status={status as "good" | "warn" | "bad"}>{p.severity}</StatusBadge>
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        )}
      </div>
    </AppShell>
  );
}
