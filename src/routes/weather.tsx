import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionCard, StatCard } from "@/components/UI";
import { weather } from "@/lib/mockData";
import { Thermometer, Droplets, Wind, CloudRain, Sun, Sprout } from "lucide-react";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Weather — KrushiMitra" },
      { name: "description", content: "7-day forecast and farming suggestions tuned for your field." },
    ],
  }),
  component: WeatherPage,
});

const tips = [
  { day: "Today", text: "Great window for spraying — winds are gentle and skies are clear." },
  { day: "Wednesday", text: "Light rain expected. Hold off on fertilizer to avoid runoff." },
  { day: "Thursday", text: "Heavy rain (80%). Cover seedlings and check drainage channels." },
  { day: "Weekend", text: "Sunny and warm — ideal for harvesting mature crops." },
];

function WeatherPage() {
  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-card sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-80">Current weather</p>
              <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{weather.location}</h2>
              <div className="mt-6 flex items-center gap-6">
                <p className="font-display text-7xl font-semibold leading-none sm:text-8xl">{weather.temp}°</p>
                <div>
                  <p className="text-2xl">⛅</p>
                  <p className="mt-1 font-semibold">{weather.condition}</p>
                  <p className="text-sm opacity-80">Feels like {weather.temp + 2}°C</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { l: "Humidity", v: `${weather.humidity}%`, i: Droplets },
                { l: "Wind", v: `${weather.wind} km/h`, i: Wind },
                { l: "Rainfall", v: `${weather.rainfall} mm`, i: CloudRain },
                { l: "UV Index", v: weather.uv, i: Sun },
              ].map((x) => (
                <div key={x.l} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-4 backdrop-blur">
                  <x.i className="h-5 w-5 opacity-80" />
                  <p className="mt-2 text-xs uppercase tracking-wider opacity-80">{x.l}</p>
                  <p className="font-display text-xl font-semibold">{x.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Temperature" value={weather.temp} unit="°C" icon={<Thermometer className="h-5 w-5" />} tone="sun" />
          <StatCard label="Humidity" value={weather.humidity} unit="%" icon={<Droplets className="h-5 w-5" />} tone="sky" />
          <StatCard label="Rainfall" value={weather.rainfall} unit="mm" icon={<CloudRain className="h-5 w-5" />} />
          <StatCard label="Wind" value={weather.wind} unit="km/h" icon={<Wind className="h-5 w-5" />} />
        </div>

        <SectionCard title="7-day forecast" subtitle="Plan your field operations ahead">
          <div className="grid gap-3 sm:grid-cols-7">
            {weather.forecast.map((d) => (
              <div key={d.day} className="rounded-3xl border border-border bg-background p-5 text-center transition hover:-translate-y-0.5 hover:shadow-card">
                <p className="text-sm font-semibold text-muted-foreground">{d.day}</p>
                <p className="my-3 text-4xl">{d.icon}</p>
                <p className="font-display text-2xl font-semibold">{d.high}°</p>
                <p className="text-sm text-muted-foreground">/ {d.low}°</p>
                <div className="mt-3 rounded-full bg-sky/30 py-1 text-xs font-semibold text-sky-foreground">
                  💧 {d.rain}%
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Farming suggestions" subtitle="What this week's weather means for you">
          <ul className="grid gap-3 md:grid-cols-2">
            {tips.map((t) => (
              <li key={t.day} className="flex gap-4 rounded-2xl border border-border bg-background p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-leaf text-primary-foreground">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-base font-semibold">{t.day}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </AppShell>
  );
}
