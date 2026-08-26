import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/components/AppShell";
import { SectionCard, StatusBadge } from "@/components/UI";
import {
  Sprout,
  FlaskConical,
  ArrowRight,
  Loader2,
  AlertTriangle,
  WifiOff,
  Clock,
  RefreshCw,
  Server,
} from "lucide-react";
import { topCrops } from "@/lib/mockData";

export const Route = createFileRoute("/soil")({
  component: SoilPage,
});

type Form = {
  ph: number;
  n: number;
  p: number;
  k: number;
  moisture: number;
  temperature: number;
  rainfall: number;
  season: string;
};

type CropSummary = {
  name: string;
  confidence: number;
};

type AnalysisResult = {
  status: string;
  soil_score: number;
  soil_quality: string;
  best_crop: CropSummary | null;
  top_crops: CropSummary[];
  all_crops: CropSummary[];
  fertilizer_advice: string[];
  explanation: string;
  risks?: {
    drought_risk: string;
    flood_risk: string;
    heat_stress: string;
    cold_stress: string;
    nutrient_deficiency: string;
    overall_risk: string;
    warnings: string[];
  };
  irrigation_advice?: string;
  model_version: string;
};

function SoilPage() {
  const { t } = useTranslation();
  const isOnline = true;
  const [api, setApi] = useState({
    data: null as AnalysisResult | null,
    isLoading: false,
    isError: false,
    status: "idle",
    isCheckingHealth: false,
    error: null as any
  });

  const [f, setF] = useState<Form>({
    ph: 6.7,
    n: 75,
    p: 45,
    k: 55,
    moisture: 38,
    temperature: 25,
    rainfall: 65,
    season: "Kharif",
  });

  const num = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: Number(e.target.value) });

  const handleAnalyze = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setApi(prev => ({ ...prev, isLoading: true, status: "loading" }));

      setTimeout(() => {
        // Simple logic for Soil Score
        let score = 10.0;
        const advice: string[] = [];
        const risks = {
          drought_risk: "Low",
          flood_risk: "Low",
          heat_stress: "Low",
          cold_stress: "Low",
          nutrient_deficiency: "Low",
          overall_risk: "Low",
          warnings: [] as string[]
        };

        if (f.ph < 5.5) { score -= 1.5; advice.push("Soil is too acidic. Apply agricultural lime."); }
        else if (f.ph > 7.5) { score -= 1.5; advice.push("Soil is alkaline. Consider adding sulfur or organic compost."); }

        if (f.n < 40) { score -= 1.5; advice.push("Nitrogen is very low. Apply urea or organic manure."); risks.nutrient_deficiency = "High"; }
        else if (f.n < 80) { score -= 0.5; advice.push("Nitrogen is slightly low. Add balanced NPK fertilizer."); }
        
        if (f.p < 30) { score -= 1.0; advice.push("Phosphorus is low. Consider using DAP."); }
        if (f.k < 30) { score -= 1.0; advice.push("Potassium is low. Muriate of potash (MOP) is recommended."); }
        
        if (f.moisture < 20) { score -= 1.0; risks.drought_risk = "High"; risks.warnings.push("Very low moisture. Immediate irrigation needed."); }
        if (f.rainfall > 300) { risks.flood_risk = "High"; risks.warnings.push("High rainfall detected. Ensure proper field drainage."); }
        if (f.temperature > 35) { score -= 0.5; risks.heat_stress = "High"; risks.warnings.push("High temperature. Crops may experience heat stress."); }

        score = Math.max(1.0, Math.round(score * 10) / 10);
        let quality = "excellent";
        if (score < 5) quality = "poor";
        else if (score < 7.5) quality = "fair";
        else if (score < 9) quality = "good";

        if (advice.length === 0) advice.push("Nutrient levels are well balanced. Maintain current practices.");

        // Realistic Crop Matching
        const scoredCrops = topCrops.map(c => {
          let match = 95;
          if (c.season !== f.season && c.season !== "All Season") match -= 25;
          if (c.reqs) {
            if (f.ph < c.reqs.ph[0] || f.ph > c.reqs.ph[1]) match -= 10;
            if (f.n < c.reqs.n[0]) match -= 15;
            if (f.p < c.reqs.p[0]) match -= 5;
            if (f.k < c.reqs.k[0]) match -= 5;
            if (f.temperature < c.reqs.temp[0] || f.temperature > c.reqs.temp[1]) match -= 10;
          }
          return { ...c, confidence: Math.max(15, match + Math.floor(Math.random() * 5)) };
        }).sort((a, b) => b.confidence - a.confidence);

        const bestCrop = scoredCrops[0];

        const fullResult = {
          status: quality,
          soil_score: score,
          soil_quality: quality,
          best_crop: bestCrop,
          top_crops: scoredCrops.slice(0, 3),
          all_crops: scoredCrops,
          fertilizer_advice: advice,
          explanation: `Based on your inputs, the soil has a ${quality} profile for ${f.season} crops.`,
          risks,
          irrigation_advice: f.moisture < 30 ? "Increase irrigation frequency to every 3-4 days." : "Standard irrigation every 5-7 days is sufficient.",
          model_version: "v2.1"
        };
        
        // Match the simplified type for local state
        const localResult: AnalysisResult = {
          ...fullResult,
          best_crop: { name: bestCrop.name, confidence: bestCrop.confidence },
          top_crops: scoredCrops.slice(0, 3).map(c => ({ name: c.name, confidence: c.confidence })),
          all_crops: scoredCrops.map(c => ({ name: c.name, confidence: c.confidence }))
        };

        setApi(prev => ({ ...prev, isLoading: false, status: "success", data: localResult }));
        localStorage.setItem("soilAnalysisResult", JSON.stringify(fullResult));
      }, 1500);
    },
    [f]
  );

  const errorMessage = null;

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-5">
        {/* ─── Analysis Form ─── */}
        <SectionCard
          title={t("soil.title")}
          subtitle={t("soil.subtitle")}
          className="lg:col-span-3"
        >
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleAnalyze}>
            {(
              [
                [t("soil.pHLevel"), "ph", 0, 14, 0.1],
                [t("soil.nitrogen"), "n", 0, 200, 1],
                [t("soil.phosphorus"), "p", 0, 200, 1],
                [t("soil.potassium"), "k", 0, 200, 1],
                [t("soil.moisture"), "moisture", 0, 100, 1],
                [t("soil.temperature"), "temperature", -5, 50, 1],
                [t("soil.rainfall"), "rainfall", 0, 400, 1],
              ] as const
            ).map(([label, key, min, max, step]) => (
              <label key={key} className="block">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={f[key]}
                  onChange={num(key)}
                  className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-lg font-semibold text-foreground outline-none ring-ring/40 transition focus:border-leaf focus:ring-2"
                />
              </label>
            ))}
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("soil.season")}
              </span>
              <select
                value={f.season}
                onChange={(e) => setF({ ...f, season: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-lg font-semibold text-foreground outline-none focus:border-leaf focus:ring-2 focus:ring-ring/40"
              >
                {["Kharif", "Rabi", "Summer", "Monsoon"].map((s) => (
                  <option key={s} value={s}>
                    {t(`cropNames.${s}`)}
                  </option>
                ))}
              </select>
            </label>

            {/* ── Network Offline Banner ── */}
            {!isOnline && (
              <div className="sm:col-span-2 flex items-center gap-3 rounded-2xl border border-warn/20 bg-warn/5 p-4 text-sm text-warn">
                <WifiOff className="h-5 w-5 shrink-0" />
                <span>No internet connection. Please check your network.</span>
              </div>
            )}

            {/* ── Submit Button ── */}
            <button
              type="submit"
              disabled={api.isLoading || !isOnline}
              className="sm:col-span-2 mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-card transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {api.isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("soil.analyzing", "Analyzing...")}
                </>
              ) : (
                <>
                  <FlaskConical className="h-5 w-5" />
                  {t("soil.analyzeBtn")}
                </>
              )}
            </button>
          </form>

          {/* ── Error Display ── */}
          {api.isError && errorMessage && (
            <div className="mt-4 rounded-2xl border border-bad/20 bg-bad/5 p-4 text-sm">
              <div className="flex items-start gap-3">
                {errorMessage.icon === "server" && (
                  <Server className="h-5 w-5 shrink-0 text-bad" />
                )}
                {errorMessage.icon === "timeout" && (
                  <Clock className="h-5 w-5 shrink-0 text-warn" />
                )}
                {errorMessage.icon === "wifi" && (
                  <WifiOff className="h-5 w-5 shrink-0 text-warn" />
                )}
                {errorMessage.icon === "alert" && (
                  <AlertTriangle className="h-5 w-5 shrink-0 text-bad" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {errorMessage.title}
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    {errorMessage.details}
                  </p>
                </div>
                {errorMessage.showRetry && (
                  <button
                    onClick={handleAnalyze}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Try again
                  </button>
                )}
              </div>
            </div>
          )}
        </SectionCard>

        {/* ─── Results Panel ─── */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title={t("soil.qualityTitle")}
            subtitle={t("soil.qualitySubtitle")}
            action={
              api.data && (
                <StatusBadge
                  status={
                    api.data.soil_quality === "excellent" ||
                    api.data.soil_quality === "good"
                      ? "good"
                      : api.data.soil_quality === "fair"
                      ? "warn"
                      : "bad"
                  }
                >
                  {api.data.soil_quality === "excellent" ||
                  api.data.soil_quality === "good"
                    ? t("soil.healthy")
                    : api.data.soil_quality === "fair"
                    ? t("soil.needsCare")
                    : t("soil.poor")}
                </StatusBadge>
              )
            }
          >
            {api.status === "idle" && !api.data && (
              <p className="text-sm text-muted-foreground">
                {t("soil.emptyState")}
              </p>
            )}

            {api.isLoading && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-leaf" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {api.isCheckingHealth
                    ? "Checking backend..."
                    : "Analyzing soil..."}
                </p>
              </div>
            )}

            {api.data && (
              <>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {api.data.explanation}
                </p>
                <div className="rounded-2xl bg-gradient-leaf p-6 text-primary-foreground">
                  <p className="text-xs uppercase tracking-wider opacity-80">
                    {t("soil.overallScore")}
                  </p>
                  <p className="font-display text-5xl font-semibold">
                    {api.data.soil_score}
                    <span className="text-2xl opacity-70">/10</span>
                  </p>
                </div>
                {api.data.top_crops && api.data.top_crops.length > 0 && (
                  <>
                    <h4 className="mt-5 font-display text-base font-semibold">
                      {t("soil.suggestedCrops")}
                    </h4>
                    <div className="mt-3 space-y-2">
                      {api.data.top_crops.map((c: CropSummary) => (
                        <div
                          key={c.name}
                          className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3"
                        >
                          <span className="font-semibold">
                            {t(`cropNames.${c.name}`, c.name)}
                          </span>
                          <span className="text-sm font-semibold text-leaf">
                            {c.confidence}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </SectionCard>

          {api.data &&
            api.data.fertilizer_advice &&
            api.data.fertilizer_advice.length > 0 && (
              <SectionCard
                title={t("soil.fertilizerAdvice")}
                subtitle={t("soil.tailoredDeficits")}
              >
                <ul className="space-y-2.5">
                  {api.data.fertilizer_advice.map(
                    (t_text: string, i: number) => (
                      <li
                        key={i}
                        className="flex gap-3 rounded-2xl bg-muted px-4 py-3 text-sm"
                      >
                        <Sprout className="h-4 w-4 shrink-0 text-leaf mt-0.5" />
                        {t_text}
                      </li>
                    )
                  )}
                </ul>
                <Link
                  to="/crops"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-leaf hover:underline"
                >
                  {t("soil.seeFullRecommendations")}{" "}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </SectionCard>
            )}
        </div>
      </div>
    </AppShell>
  );
}



export default SoilPage;
