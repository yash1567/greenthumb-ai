import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useTranslation } from "react-i18next";
import { StatCard, SectionCard, StatusBadge } from "@/components/UI";
import { weather, topCrops, alerts, getSoilHistory } from "@/lib/mockData";
import { getUser } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Thermometer, Droplets, CloudRain, Wind, Sprout, Wheat, ArrowUpRight, AlertTriangle, CheckCircle2, AlertOctagon, Loader2 } from "lucide-react";
import { fetchCurrentWeather } from "@/lib/weatherApi";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation();
  const user = getUser();
  const firstName = user?.name ? user.name.split(" ")[0] : "Guest";
  const soilHistory = getSoilHistory();
  const latest = soilHistory[0];

  // Load saved farm location from localStorage
  const [farmData, setFarmData] = useState({ name: "My Farm", lat: 18.5204, lon: 73.8567 }); // Default Pune

  useEffect(() => {
    const saved = localStorage.getItem("krushimitra_farm");
    if (saved) {
      try {
        setFarmData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved farm data");
      }
    } else {
      // If no saved farm, try to get GPS on dashboard load (silent)
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
          setFarmData({ name: "My Current Location", lat: pos.coords.latitude, lon: pos.coords.longitude });
        });
      }
    }
  }, []);

  // Fetch live weather data using open-meteo
  const { data: current, isLoading: loadingWeather, error: errorWeather } = useQuery({
    queryKey: ["weather-current", farmData.lat, farmData.lon],
    queryFn: () => fetchCurrentWeather(farmData.lat, farmData.lon),
  });
  return (
    <AppShell>
      <div className="grid gap-6">
        {/* Greeting hero */}
        <div className="overflow-hidden rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-card sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.2em] opacity-80">{t('dashboard.goodMorning')}, {firstName}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                {t('dashboard.heroTitle')}
              </h2>
              <p className="mt-3 text-sm opacity-90">
                {t('dashboard.heroDesc')}
              </p>
            </div>
            <Link
              to="/soil"
              className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-semibold text-lime-foreground shadow-glow transition hover:scale-[1.02]"
            >
              {t('dashboard.analyzeNewSample')} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Stat row */}
        {loadingWeather ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: t('dashboard.temp'), icon: <Thermometer className="h-5 w-5" /> },
              { label: t('dashboard.humidity'), icon: <Droplets className="h-5 w-5" /> },
              { label: t('dashboard.rainfall'), icon: <CloudRain className="h-5 w-5" /> },
              { label: t('dashboard.wind'), icon: <Wind className="h-5 w-5" /> },
            ].map((stat, i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-border bg-background p-6 shadow-soft flex flex-col justify-between h-[120px]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                  <div className="rounded-xl bg-muted p-2 text-muted-foreground opacity-50">{stat.icon}</div>
                </div>
                <div className="mt-2 h-8 w-20 rounded bg-muted" />
                <div className="h-3 w-16 rounded bg-muted opacity-50" />
              </div>
            ))}
          </div>
        ) : errorWeather || !current ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t('dashboard.temp')} value={weather.temp} unit="°C" hint={`${weather.condition}`} icon={<Thermometer className="h-5 w-5" />} tone="sun" />
            <StatCard label={t('dashboard.humidity')} value={weather.humidity} unit="%" hint="Comfortable" icon={<Droplets className="h-5 w-5" />} tone="sky" />
            <StatCard label={t('dashboard.rainfall')} value={weather.rainfall} unit="mm" hint="Light showers" icon={<CloudRain className="h-5 w-5" />} />
            <StatCard label={t('dashboard.wind')} value={weather.wind} unit="km/h" hint="Gentle breeze" icon={<Wind className="h-5 w-5" />} />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label={t('dashboard.temp')}
              value={isNaN(Number(current?.temperature)) ? 28 : Math.round(Number(current.temperature))}
              unit="°C"
              hint={current?.condition || "Clear"}
              icon={<Thermometer className="h-5 w-5" />}
              tone="sun"
            />
            <StatCard
              label={t('dashboard.humidity')}
              value={isNaN(Number(current?.humidity)) ? 60 : Number(current.humidity)}
              unit="%"
              hint={(current?.humidity ?? 60) > 60 ? "Humid" : (current?.humidity ?? 60) < 35 ? "Dry" : "Moderate"}
              icon={<Droplets className="h-5 w-5" />}
              tone="sky"
            />
            <StatCard
              label={t('dashboard.rainfall')}
              value={isNaN(Number(current?.rainfall_1h)) ? 0 : Number(current.rainfall_1h)}
              unit="mm"
              hint={(current?.rainfall_1h ?? 0) > 0 ? "Sprinkling" : "No rain"}
              icon={<CloudRain className="h-5 w-5" />}
            />
            <StatCard
              label={t('dashboard.wind')}
              value={isNaN(Number(current?.wind_speed)) ? 12 : Math.round(Number(current.wind_speed) * 3.6)}
              unit="km/h"
              hint={(current?.wind_speed ?? 3.5) > 5 ? "Breezy" : "Calm"}
              icon={<Wind className="h-5 w-5" />}
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Crop recommendation */}
          <SectionCard
            title={t('nav.cropRecommendation')}
            subtitle={t('dashboard.bestMatchSubtitle')}
            className="lg:col-span-2"
            action={
              <Link to="/crops" className="text-sm font-semibold text-leaf hover:underline">
                {t('dashboard.viewDetails')} →
              </Link>
            }
          >
            <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-gradient-leaf p-6 text-primary-foreground">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/15 text-5xl backdrop-blur">
                {topCrops[0].emoji}
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs uppercase tracking-wider opacity-80">{t('dashboard.topMatch')}</p>
                <p className="font-display text-3xl font-semibold">{t(`cropNames.${topCrops[0].name}`, topCrops[0].name)}</p>
                <p className="mt-1 text-sm opacity-90">{topCrops[0].notes}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-5xl font-semibold text-lime">{topCrops[0].confidence}%</p>
                <p className="text-xs uppercase tracking-wider opacity-80">{t('dashboard.confidence')}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                [t('dashboard.sowingWindow'), topCrops[0].sowing],
                [t('dashboard.expectedYield'), topCrops[0].yield],
                [t('dashboard.waterNeed'), topCrops[0].water],
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
            title={t('dashboard.soilHealth')}
            subtitle={`${t('dashboard.lastTest')} • ${latest.date}`}
            action={<StatusBadge status={latest.status}>{t('dashboard.healthy')}</StatusBadge>}
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
              <Sprout className="h-4 w-4" /> {t('dashboard.analyzeNewSample')}
            </Link>
          </SectionCard>
        </div>

        {/* Alerts + 7-day strip */}
        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard title={t('dashboard.alertsTitle')} subtitle={t('dashboard.alertsSubtitle')} className="lg:col-span-1">
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
                      <p className="font-semibold text-foreground">{t(`dashboard.alerts.${a.id}.title`)}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{t(`dashboard.alerts.${a.id}.body`)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          <SectionCard
            title={t('dashboard.weatherTitle')}
            subtitle={current?.location || t('dashboard.nashik')}
            className="lg:col-span-2"
            action={
              <Link to="/weather" className="text-sm font-semibold text-leaf hover:underline">
                {t('dashboard.openForecast')} →
              </Link>
            }
          >
            <div className="grid grid-cols-7 gap-2">
              {weather.forecast.map((d) => (
                <div key={d.day} className="rounded-2xl border border-border bg-background p-3 text-center">
                  <p className="text-xs font-semibold text-muted-foreground">{t(`dashboard.days.${d.day}`, d.day)}</p>
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
            { to: "/crops", label: t('dashboard.cropRec'), icon: Wheat },
            { to: "/pest", label: t('dashboard.detectPest'), icon: Sprout },
            { to: "/history", label: t('dashboard.viewHistory'), icon: ArrowUpRight },
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
