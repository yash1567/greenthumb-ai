import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard, SectionCard, StatusBadge } from "@/components/UI";
import { weather, topCrops, alerts, soilHistory } from "@/lib/mockData";
import {
  Thermometer, Droplets, CloudRain, Wind, Sprout, Wheat, ArrowUpRight, AlertTriangle, CheckCircle2, AlertOctagon,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — KrushiMitra" },
      { name: "description", content: "Your farm at a glance: weather, soil, crop and alerts." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const latest = soilHistory[0];
  return (
    <AppShell>
      <div className="grid gap-6">
        {/* Greeting hero */}
        <div className="overflow-hidden rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-card sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.2em] opacity-80">Good morning, Ravi</p>
              <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                Your fields look healthy today. ☀️
              </h2>
              <p className="mt-3 text-sm opacity-90">
                Soil is in great shape and rain is expected Thursday — a good window for sowing rice.
              </p>
            </div>
            <Link
              to="/soil"
              className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-semibold text-lime-foreground shadow-glow transition hover:scale-[1.02]"
            >
              New soil analysis <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Temperature" value={weather.temp} unit="°C" hint={weather.condition} icon={<Thermometer className="h-5 w-5" />} tone="sun" />
          <StatCard label="Humidity" value={weather.humidity} unit="%" hint="Comfortable" icon={<Droplets className="h-5 w-5" />} tone="sky" />
          <StatCard label="Rainfall (24h)" value={weather.rainfall} unit="mm" hint="Light showers" icon={<CloudRain className="h-5 w-5" />} />
          <StatCard label="Wind" value={weather.wind} unit="km/h" hint="Gentle breeze" icon={<Wind className="h-5 w-5" />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Crop recommendation */}
          <SectionCard
            title="Recommended crop"
            subtitle="Best match for current soil & weather"
            className="lg:col-span-2"
            action={
              <Link to="/crops" className="text-sm font-semibold text-leaf hover:underline">
                See top 3 →
              </Link>
            }
          >
            <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-gradient-leaf p-6 text-primary-foreground">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/15 text-5xl backdrop-blur">
                {topCrops[0].emoji}
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs uppercase tracking-wider opacity-80">Top match</p>
                <p className="font-display text-3xl font-semibold">{topCrops[0].name}</p>
                <p className="mt-1 text-sm opacity-90">{topCrops[0].notes}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-5xl font-semibold text-lime">{topCrops[0].confidence}%</p>
                <p className="text-xs uppercase tracking-wider opacity-80">Confidence</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                ["Sowing window", topCrops[0].sowing],
                ["Expected yield", topCrops[0].yield],
                ["Water need", topCrops[0].water],
              ].map(([l, v]) => (
                <div key={l} className="rounded-2xl bg-muted p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{l}</p>
                  <p className="mt-1.5 font-display text-lg font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Soil health */}
          <SectionCard
            title="Soil health"
            subtitle={`Last test • ${latest.date}`}
            action={<StatusBadge status={latest.status}>Healthy</StatusBadge>}
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                ["pH", latest.ph],
                ["Moisture", `${latest.moisture}%`],
                ["Nitrogen", latest.n],
                ["Phosphorus", latest.p],
                ["Potassium", latest.k],
                ["Season", latest.season],
              ].map(([l, v]) => (
                <div key={l as string} className="rounded-2xl border border-border bg-background p-3">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{l}</p>
                  <p className="mt-1 font-display text-xl font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <Link
              to="/soil"
              className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <Sprout className="h-4 w-4" /> Run new analysis
            </Link>
          </SectionCard>
        </div>

        {/* Alerts + 7-day strip */}
        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard title="Alerts" subtitle="Things to act on this week" className="lg:col-span-1">
            <ul className="space-y-3">
              {alerts.map((a) => {
                const Icon = a.level === "good" ? CheckCircle2 : a.level === "warn" ? AlertTriangle : AlertOctagon;
                const color = a.level === "good" ? "text-good bg-good/10" : a.level === "warn" ? "text-[oklch(0.5_0.13_75)] bg-warn/15" : "text-bad bg-bad/10";
                return (
                  <li key={a.id} className="flex gap-3 rounded-2xl border border-border bg-background p-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{a.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{a.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          <SectionCard
            title="7-day weather"
            subtitle={weather.location}
            className="lg:col-span-2"
            action={
              <Link to="/weather" className="text-sm font-semibold text-leaf hover:underline">
                Open forecast →
              </Link>
            }
          >
            <div className="grid grid-cols-7 gap-2">
              {weather.forecast.map((d) => (
                <div key={d.day} className="rounded-2xl border border-border bg-background p-3 text-center">
                  <p className="text-xs font-semibold text-muted-foreground">{d.day}</p>
                  <p className="my-2 text-2xl">{d.icon}</p>
                  <p className="font-display text-base font-semibold">{d.high}°</p>
                  <p className="text-xs text-muted-foreground">{d.low}°</p>
                  <p className="mt-1 text-[10px] font-medium text-sky-foreground">{d.rain}% 💧</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Quick links */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { to: "/crops", label: "Crop recommendations", icon: Wheat },
            { to: "/pest", label: "Detect a pest", icon: Sprout },
            { to: "/history", label: "View history", icon: ArrowUpRight },
          ].map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <q.icon className="h-5 w-5" />
                </div>
                <span className="font-semibold">{q.label}</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-leaf" />
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
