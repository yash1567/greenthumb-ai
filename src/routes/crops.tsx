import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/components/AppShell";
import { SectionCard, StatusBadge } from "@/components/UI";
import {
  Sparkles, Calendar, Droplet, TrendingUp, Brain, Layers, Sun,
  CloudRain, AlertTriangle, CheckCircle, AlertCircle, Info,
  Thermometer, Wind, ArrowRight, Mountain,
} from "lucide-react";

type CropItem = {
  name: string;
  emoji: string;
  confidence: number;
  sowing: string;
  expected_yield?: string;
  water_need: string;
  category: string;
  season?: string;
  notes?: string;
  market_value?: string;
  growing_duration_days?: number;
  overall_status?: string;
  summary_reasons?: string[];
  concerns?: string[];
};

type RiskProfile = {
  drought_risk: "Low" | "Medium" | "High";
  flood_risk: "Low" | "Medium" | "High";
  heat_stress: "Low" | "Medium" | "High";
  cold_stress: "Low" | "Medium" | "High";
  nutrient_deficiency: "Low" | "Medium" | "High";
  overall_risk: "Low" | "Medium" | "High";
  warnings: string[];
};

type ApiResponse = {
  status: string;
  soil_score: number;
  soil_quality: string;
  best_crop: CropItem | null;
  top_crops: CropItem[];
  all_crops: CropItem[];
  fertilizer_advice: string[];
  explanation: string;
  risks: RiskProfile | null;
  irrigation_advice: string | null;
  model_version: string;
};

type CropCategory = "Food" | "Cash" | "Pulses" | "Vegetables" | "Oil";

export const Route = createFileRoute("/crops")({
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

const statusStyles: Record<string, string> = {
  excellent: "text-good bg-good/10",
  good: "text-good bg-good/10",
  fair: "text-warn bg-warn/10",
  poor: "text-bad bg-bad/10",
  unsuitable: "text-bad bg-bad/10",
};

const riskLevelColor = (level: string) => {
  switch (level) {
    case "Low": return "text-good bg-good/10 border-good/20";
    case "Medium": return "text-warn bg-warn/10 border-warn/20";
    case "High": return "text-bad bg-bad/10 border-bad/20";
    default: return "text-muted-foreground bg-muted";
  }
};

function RiskBadge({ label, level }: { label: string; level: string }) {
  return (
    <div className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm ${riskLevelColor(level)}`}>
      <span className="font-medium">{label}</span>
      <span className={`font-semibold ${level === "Low" ? "text-good" : level === "Medium" ? "text-warn" : "text-bad"}`}>
        {level}
      </span>
    </div>
  );
}

function CropsPage() {
  const { t } = useTranslation();
  const [apiData, setApiData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("soilAnalysisResult");
    if (data) {
      try {
        setApiData(JSON.parse(data));
      } catch (e) {
        console.error("Failed to parse recommendation data");
      }
    }
  }, []);

  if (!apiData) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <Sparkles className="h-16 w-16 text-muted-foreground opacity-30" />
          <h2 className="mt-5 font-display text-3xl font-semibold">{t('crops.noDataTitle', 'No soil analysis data found')}</h2>
          <p className="mt-3 text-muted-foreground">{t('crops.noDataDesc', 'Please analyze soil first to get AI crop recommendations.')}</p>
          <Link to="/soil" className="mt-6 rounded-2xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground shadow-card transition hover:scale-[1.02]">
            {t('crops.goToSoil', 'Analyze Soil Now')}
          </Link>
        </div>
      </AppShell>
    );
  }

  const best = apiData.best_crop;
  const detailed = apiData.top_crops;
  const rest = apiData.all_crops?.filter(c => !detailed.some(d => d.name === c.name) && c.name !== best?.name) || [];
  const risks = apiData.risks;

  if (apiData.status === "unsuitable" || apiData.status === "extreme") {
    return (
      <AppShell>
        <div className="grid gap-6">
          <div className="flex items-center gap-3 rounded-3xl border border-bad/20 bg-bad/5 p-6 text-bad">
            <AlertTriangle className="h-8 w-8 shrink-0" />
            <div>
              <h2 className="font-display text-xl font-semibold">
                {t('crops.unsuitableTitle', 'Cultivation Not Recommended')}
              </h2>
              <p className="mt-1 text-sm opacity-80">{apiData.explanation}</p>
            </div>
          </div>
          {apiData.all_crops && apiData.all_crops.length > 0 && (
            <SectionCard title={t('crops.possibleCrops', 'Possible Crops (Low Compatibility)')}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {apiData.all_crops.filter(c => c.confidence > 0).sort((a, b) => b.confidence - a.confidence).slice(0, 6).map(c => (
                  <div key={c.name} className="flex items-center justify-between rounded-2xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.emoji}</span>
                      <span className="font-medium text-sm">{c.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{Math.round(c.confidence)}%</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
          {risks && (
            <SectionCard title={t('crops.riskAssessment', 'Risk Assessment')} subtitle={t('crops.riskDesc', 'Environmental risk analysis')}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <RiskBadge label={t('crops.droughtRisk', 'Drought')} level={risks.drought_risk} />
                <RiskBadge label={t('crops.floodRisk', 'Flood')} level={risks.flood_risk} />
                <RiskBadge label={t('crops.heatStress', 'Heat Stress')} level={risks.heat_stress} />
                <RiskBadge label={t('crops.coldStress', 'Cold Stress')} level={risks.cold_stress} />
                <RiskBadge label={t('crops.nutrientDef', 'Nutrient Def.')} level={risks.nutrient_deficiency} />
                <RiskBadge label={t('crops.overallRisk', 'Overall Risk')} level={risks.overall_risk} />
              </div>
              {risks.warnings.length > 0 && (
                <div className="mt-4 space-y-2">
                  {risks.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-xl bg-bad/5 p-3 text-sm text-bad">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold">{t('crops.title', 'AI Crop Recommendations')}</h1>
          <p className="text-sm text-muted-foreground">{apiData.explanation}</p>
        </div>

        {/* Best Crop */}
        {best && (
          <div className="overflow-hidden rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-card sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> {t('crops.bestMatch')} · {t(`cropNames.${best.category}`, best.category)}
              </span>
              {best.overall_status && (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur ${
                  statusStyles[best.overall_status] || "bg-primary-foreground/10"
                }`}>
                  {best.overall_status}
                </span>
              )}
            </div>
            <div className="mt-5 flex flex-wrap items-end gap-8">
              <div className="text-7xl">{best.emoji}</div>
              <div className="flex-1 min-w-[240px]">
                <h2 className="font-display text-4xl font-semibold sm:text-5xl">{t(`cropNames.${best.name}`, best.name)}</h2>
                <p className="mt-2 max-w-md text-sm opacity-90">{best.notes || ""}</p>
                {best.summary_reasons && best.summary_reasons.length > 0 && (
                  <div className="mt-4 space-y-1">
                    {best.summary_reasons.map((reason, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs opacity-80">
                        <CheckCircle className="h-3.5 w-3.5 text-lime" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
                {best.concerns && best.concerns.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {best.concerns.slice(0, 2).map((concern, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-warn">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{concern}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="font-display text-6xl font-semibold text-lime">{Math.round(best.confidence)}%</p>
                <p className="text-xs uppercase tracking-wider opacity-80">{t('crops.confidence')}</p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              {[
                { l: t('crops.sowingWindow'), v: best.sowing || '—', i: Calendar },
                { l: t('crops.expectedYield'), v: best.expected_yield || '—', i: TrendingUp },
                { l: t('crops.waterNeed'), v: best.water_need || '—', i: Droplet },
                { l: t('crops.season'), v: best.season || '—', i: Sun },
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

        {/* Irrigation Advice */}
        {apiData.irrigation_advice && (
          <div className="flex items-start gap-4 rounded-3xl border border-sky/20 bg-sky/5 p-6">
            <Droplet className="h-6 w-6 shrink-0 text-sky" />
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">{t('crops.irrigationAdvice', 'Irrigation Advice')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{apiData.irrigation_advice}</p>
            </div>
          </div>
        )}

        {/* Risk Assessment */}
        {risks && (
          <SectionCard title={t('crops.riskAssessment', 'Risk Assessment')} subtitle={t('crops.riskDesc', 'Environmental risk analysis for your farm')}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <RiskBadge label={t('crops.droughtRisk', 'Drought')} level={risks.drought_risk} />
              <RiskBadge label={t('crops.floodRisk', 'Flood')} level={risks.flood_risk} />
              <RiskBadge label={t('crops.heatStress', 'Heat Stress')} level={risks.heat_stress} />
              <RiskBadge label={t('crops.coldStress', 'Cold Stress')} level={risks.cold_stress} />
              <RiskBadge label={t('crops.nutrientDef', 'Nutrient Def.')} level={risks.nutrient_deficiency} />
              <RiskBadge label={t('crops.overallRisk', 'Overall Risk')} level={risks.overall_risk} />
            </div>
            {risks.warnings.length > 0 && (
              <div className="mt-4 space-y-2">
                {risks.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-xl bg-bad/5 p-3 text-sm text-bad">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {/* Top Alternatives */}
        {detailed.length > 1 && (
          <SectionCard title={t('crops.otherMatches')} subtitle={t('crops.topAlternatives')}>
            <div className="grid gap-5 md:grid-cols-2">
              {detailed.slice(1).map((c) => (
                <div key={c.name} className="group rounded-3xl border border-border bg-background p-6 transition hover:-translate-y-0.5 hover:shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-4xl">{c.emoji}</div>
                      <div>
                        <h3 className="font-display text-2xl font-semibold">{t(`cropNames.${c.name}`)}</h3>
                        <p className="text-xs text-muted-foreground">{t('crops.sow')} {c.sowing} · {c.season || '—'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="rounded-full bg-leaf/10 px-3 py-1 text-sm font-semibold text-leaf">{c.confidence}%</span>
                      {c.overall_status && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusStyles[c.overall_status] || "bg-muted text-muted-foreground"}`}>
                          {c.overall_status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-muted px-3 py-2"><span className="text-muted-foreground">{t('crops.yield')} · </span><b>{c.expected_yield || '—'}</b></div>
                    <div className="rounded-xl bg-muted px-3 py-2"><span className="text-muted-foreground">{t('crops.water')} · </span><b>{c.water_need || '—'}</b></div>
                  </div>
                  {c.summary_reasons && c.summary_reasons.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {c.summary_reasons.slice(0, 2).map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-good shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {c.concerns && c.concerns.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {c.concerns.slice(0, 1).map((cn, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-warn">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span>{cn}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-gradient-leaf transition-all" style={{ width: `${c.confidence}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* All Crops Table */}
        {rest.length > 0 && (
          <SectionCard title={t('crops.moreViable')} subtitle={`${rest.length} ${t('crops.additionalCrops')}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2 font-medium">{t('crops.tableCrop')}</th>
                    <th className="px-4 py-2 font-medium">{t('crops.tableCategory')}</th>
                    <th className="px-4 py-2 font-medium">{t('crops.tableSeason')}</th>
                    <th className="px-4 py-2 font-medium">{t('crops.tableWater')}</th>
                    <th className="px-4 py-2 font-medium">{t('crops.tableStatus')}</th>
                    <th className="px-4 py-2 font-medium text-right">{t('crops.tableSuitability')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((c, idx) => (
                    <tr key={c.name} className="bg-background transition hover:bg-muted/60">
                      <td className="rounded-l-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{c.emoji}</span>
                          <div>
                            <p className="font-semibold">{t(`cropNames.${c.name}`, c.name)}</p>
                            <p className="text-xs text-muted-foreground">{t('crops.sow')} {c.sowing}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${categoryStyles[c.category as CropCategory] || "bg-muted text-muted-foreground"}`}>
                          {t(`cropNames.${c.category}`, c.category)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.season || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${waterStyles[c.water_need as "Low"|"Medium"|"High"] || "bg-muted text-muted-foreground"}`}>
                          {c.water_need || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {c.overall_status && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusStyles[c.overall_status] || "bg-muted text-muted-foreground"}`}>
                            {c.overall_status}
                          </span>
                        )}
                      </td>
                      <td className="rounded-r-xl px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-gradient-leaf" style={{ width: `${Math.round(c.confidence)}%` }} />
                          </div>
                          <span className="w-10 text-right font-display text-base font-semibold">{Math.round(c.confidence)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {/* How It Works */}
        <SectionCard title={t('crops.whyCrops')} subtitle={t('crops.howRanked')}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { i: Brain, t: t('crops.soilChem'), d: t('crops.soilChemDesc') },
              { i: CloudRain, t: t('crops.weatherRain'), d: t('crops.weatherRainDesc') },
              { i: Sun, t: t('crops.agroZone'), d: t('crops.agroZoneDesc') },
              { i: TrendingUp, t: t('crops.yieldMarket'), d: t('crops.yieldMarketDesc') },
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
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/60 p-4">
            <p className="text-sm text-muted-foreground">
              {t('crops.confidenceDesc')}
            </p>
            <span className="rounded-full bg-leaf/10 px-3 py-1 text-xs font-medium text-leaf">
              {apiData.model_version}
            </span>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
