import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/UI";
import { LocationPermissionDialog, LocationDeniedBanner, LocationLoadingOverlay } from "@/components/LocationPermissionDialog";
import {
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  Sprout,
  MapPin,
  Navigation,
  RefreshCw,
  AlertTriangle,
  Eye,
  Gauge,
  Cloud,
  Sunrise,
  Sunset,
  Umbrella,
  CloudSun,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { fetchCurrentWeather, fetchForecast } from "@/lib/weatherApi";
import { API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/weather")({
  component: WeatherPage,
});

export const API = {
  BASE_URL: API_BASE_URL,
};
const WEATHER_CACHE_KEY = "krushi-weather-cache";
const PERMISSION_KEY = "krushi-weather-permission";
const FARM_KEY = "krushimitra_farm";
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// ─── Types ────────────────────────────────────────────────────────────────

type WeatherPermission = "prompt" | "granted" | "denied" | "unsupported";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  lat: number;
  lon: number;
}

interface FarmData {
  name: string;
  lat: number;
  lon: number;
}

interface ParsedLocation {
  locality: string;
  city: string;
  state: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function parseLocation(locationStr: string): ParsedLocation {
  const parts = locationStr.split(",").map((s) => s.trim()).filter(Boolean);
  const locality = parts[0] || "Unknown";
  // For patterns like "Katraj, Maharashtra, IN": parts[1]="Maharashtra", parts[2]="IN"
  // For "Katraj, Maharashtra": parts[1]="Maharashtra"
  // For "Katraj": just locality
  let city = "";
  let state = "";
  if (parts.length >= 3) {
    city = parts[1];
    state = parts[parts.length - 2];
    // If city and state are the same, city is actually a state, so clear city
    if (city === state) city = "";
  } else if (parts.length === 2) {
    state = parts[1];
  }
  return { locality, city, state };
}

function loadCachedWeather<T>(lat: number, lon: number): T | null {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const cache: CacheEntry<T> = JSON.parse(raw);
    const age = Date.now() - cache.timestamp;
    if (age > CACHE_DURATION_MS) {
      localStorage.removeItem(WEATHER_CACHE_KEY);
      return null;
    }
    if (cache.lat !== lat || cache.lon !== lon) return null;
    return cache.data;
  } catch {
    return null;
  }
}

function saveCachedWeather<T>(lat: number, lon: number, data: T) {
  const cache: CacheEntry<T> = { data, timestamp: Date.now(), lat, lon };
  localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
}

function loadFarmData(): FarmData {
  try {
    const saved = localStorage.getItem(FARM_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { name: "My Farm", lat: 20.7002, lon: 77.0082 };
}

function loadPermission(): WeatherPermission {
  try {
    const val = localStorage.getItem(PERMISSION_KEY);
    if (val === "granted" || val === "denied") return val;
  } catch {}
  return "prompt";
}

function savePermission(p: WeatherPermission) {
  localStorage.setItem(PERMISSION_KEY, p);
}



// ─── Skeleton Card ────────────────────────────────────────────────────────

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-[2rem] bg-muted p-8 shadow-sm ${className}`}>
      <div className="h-8 w-8 rounded-xl bg-muted-foreground/10" />
      <div className="mt-6 h-3 w-24 rounded-full bg-muted-foreground/10" />
      <div className="mt-3 h-8 w-32 rounded-full bg-muted-foreground/10" />
      <div className="mt-2 h-3 w-20 rounded-full bg-muted-foreground/10" />
    </div>
  );
}

// ─── Weather Icon Helper ──────────────────────────────────────────────────

function WeatherEmoji({ condition }: { condition: string }) {
  const c = condition?.toLowerCase() || "";
  if (c.includes("thunderstorm") || c.includes("lightning")) return "⛈️";
  if (c.includes("drizzle") || c.includes("rain")) return "🌧️";
  if (c.includes("snow")) return "❄️";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze")) return "🌫️";
  if (c.includes("clear") || c.includes("sunny")) return "☀️";
  if (c.includes("cloud")) return "☁️";
  return "⛅";
}

// ─── Main Page Component ──────────────────────────────────────────────────

function WeatherPage() {
  const { t } = useTranslation();

  // ── Permission State ────────────────────────────────────────────────
  const [permission, setPermission] = useState<WeatherPermission>(loadPermission);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  // ── GPS State ───────────────────────────────────────────────────────
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationName, setLocationName] = useState<ParsedLocation | null>(null);

  // ── View State ──────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"live" | "farm">("live");
  const [farmData, setFarmData] = useState<FarmData>(loadFarmData);

  // Track if initial permission dialog has been shown
  const initialDialogShown = useRef(false);

  // ── Derive active coordinates ───────────────────────────────────────
  const activeCoords = viewMode === "live" ? coords : farmData;

  // ── Cached data for instant display with default fallbacks (temp: 26, humidity: 77, rainfall: 0.1, wind: 19) ─
  const [cachedCurrent, setCachedCurrent] = useState<any>(getDefaultWeatherData);
  const [cachedForecast, setCachedForecast] = useState<any>(getDefaultForecastData);

  // Load cache on mount
  useEffect(() => {
    if (coords) {
      const cc = loadCachedWeather<any>(coords.lat, coords.lon);
      if (cc) {
        setCachedCurrent(cc.current || null);
        setCachedForecast(cc.forecast || null);
      }
    }
  }, [coords]);

  // ── Request GPS Location ────────────────────────────────────────────
  const requestGps = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGpsStatus("error");
      setGpsError("Geolocation not supported by your browser.");
      setPermission("unsupported");
      savePermission("unsupported");
      return;
    }

    setGpsStatus("loading");
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        setGpsStatus("success");
        setGpsError(null);
        setViewMode("live");
      },
      (err) => {
        console.warn("[GPS] Error:", err.message);
        setGpsStatus("error");
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError("Location permission denied.");
          setPermission("denied");
          savePermission("denied");
          // Fall back to farm
          setViewMode("farm");
        } else if (err.code === err.TIMEOUT) {
          setGpsError("Location request timed out. Try again.");
          setViewMode("farm");
        } else {
          setGpsError("Unable to detect your location.");
          setViewMode("farm");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Accept cached position up to 1 minute
      }
    );
  }, []);

  // ── Handle GPS permission flow on mount ─────────────────────────────
  useEffect(() => {
    if (initialDialogShown.current) return;

    const perm = loadPermission();
    setPermission(perm);

    if (perm === "granted") {
      requestGps();
    } else if (perm === "prompt") {
      // Show permission dialog
      setShowPermissionDialog(true);
      initialDialogShown.current = true;
    } else if (perm === "denied" || perm === "unsupported") {
      setViewMode("farm");
      setGpsStatus("error");
      setGpsError(perm === "denied" ? "Location permission denied." : "Geolocation not supported.");
    }

    initialDialogShown.current = true;
  }, [requestGps]);

  // ── Handle Allow Location from dialog ───────────────────────────────
  const handleAllowLocation = () => {
    savePermission("granted");
    setPermission("granted");
    setShowPermissionDialog(false);
    requestGps();
  };

  // ── Handle Use Saved Farm from dialog or banner ─────────────────────
  const handleUseFarm = () => {
    if (permission === "prompt") {
      savePermission("denied");
      setPermission("denied");
    }
    setShowPermissionDialog(false);
    setViewMode("farm");
  };

  // ── Retry GPS ───────────────────────────────────────────────────────
  const handleRetryLocation = () => {
    savePermission("granted");
    setPermission("granted");
    requestGps();
  };

  // ── Data Fetching (with cache) ──────────────────────────────────────
  const {
    data: current,
    isLoading: loadingCurrent,
    error: errorCurrent,
    refetch: refetchCurrent,
    isFetching: fetchingCurrent,
  } = useQuery({
    queryKey: ["weather-current", activeCoords?.lat, activeCoords?.lon],
    queryFn: () => fetchCurrentWeather(activeCoords!.lat, activeCoords!.lon),
    enabled: !!activeCoords?.lat && !!activeCoords?.lon,
    staleTime: CACHE_DURATION_MS,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const {
    data: forecast,
    isLoading: loadingForecast,
    error: errorForecast,
    refetch: refetchForecast,
    isFetching: fetchingForecast,
  } = useQuery({
    queryKey: ["weather-forecast", activeCoords?.lat, activeCoords?.lon],
    queryFn: () => fetchForecast(activeCoords!.lat, activeCoords!.lon),
    enabled: !!activeCoords?.lat && !!activeCoords?.lon,
    staleTime: CACHE_DURATION_MS,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  // Update location name from API response
  useEffect(() => {
    if (current?.location) {
      setLocationName(parseLocation(current.location));
    }
  }, [current?.location]);

  // Save to cache when data arrives
  useEffect(() => {
    if (current && forecast && coords) {
      saveCachedWeather(coords.lat, coords.lon, { current, forecast });
      setCachedCurrent(current);
      setCachedForecast(forecast);
    }
  }, [current, forecast, coords]);

  // ── Refresh Handler ─────────────────────────────────────────────────
  const handleRefresh = async () => {
    const toastId = toast.loading("Updating weather data...");
    try {
      if (viewMode === "live" && permission === "granted") {
        // Re-request GPS — coords change triggers new React Query fetches automatically
        requestGps();
      } else {
        // Farm mode or no GPS permission: just refetch existing queries
        await Promise.all([refetchCurrent(), refetchForecast()]);
      }
      toast.dismiss(toastId);
      toast.success("Weather updated!");
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to update weather data.");
    }
  };

  // ── Save Farm Handler ───────────────────────────────────────────────
  const handleSaveFarm = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(FARM_KEY, JSON.stringify(farmData));
    toast.success("Farm location saved!");
    refetchCurrent();
    refetchForecast();
  };

  // ── Display data (fallback to default values: temp: 26, humidity: 77, rainfall: 0.1, wind: 19) ─
  const displayCurrent = current || cachedCurrent || getDefaultWeatherData();
  const displayForecast = forecast || cachedForecast || getDefaultForecastData();
  const isLoading = gpsStatus === "loading" || ((loadingCurrent || loadingForecast) && !cachedCurrent);
  const isFetching =
    gpsStatus === "loading" || fetchingCurrent || fetchingForecast;
  const hasError = !displayCurrent && (errorCurrent || errorForecast);

  // ── Render: Permission Dialog ─────────────────────────────────────
  return (
    <>
      <LocationPermissionDialog
        open={showPermissionDialog}
        onAllow={handleAllowLocation}
        onUseFarm={handleUseFarm}
        onClose={() => setShowPermissionDialog(false)}
      />      <AppShell>

        {/* ═══ IDLE STATE (initial mount before any GPS flow) ═══ */}
        {gpsStatus === "idle" && !showPermissionDialog && (
          <LocationLoadingOverlay message="Preparing weather data..." />
        )}

        {/* ═══ GPS LOADING ═══ */}
        {gpsStatus === "loading" && !coords && (
          <LocationLoadingOverlay message="Getting your live location..." />
        )}

        {/* ═══ PERMISSION DENIED BANNER ═══ */}
        {gpsStatus === "error" && !coords && permission !== "prompt" && (
          <div className="mb-6">
            <LocationDeniedBanner onRetry={handleRetryLocation} onUseFarm={handleUseFarm} />
          </div>
        )}

        {/* ═══ MAIN CONTENT ═══ */}
        {(gpsStatus === "success" || coords || viewMode === "farm") && (
          <div className="grid gap-6">
            {/* ── Controls Bar ─────────────────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2 items-center flex-wrap">
                {/* Live / Farm toggle */}
                <div className="flex gap-1 rounded-2xl bg-muted p-1">
                  <button
                    onClick={() => {
                      if (permission === "granted") {
                        if (!coords) requestGps();
                        setViewMode("live");
                      } else {
                        setShowPermissionDialog(true);
                      }
                    }}
                    className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition ${
                      viewMode === "live"
                        ? "bg-background shadow-sm text-leaf"
                        : "text-muted-foreground hover:bg-background/50"
                    }`}
                  >
                    <Navigation className="h-4 w-4" />
                    Live Location
                  </button>
                  <button
                    onClick={() => setViewMode("farm")}
                    className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition ${
                      viewMode === "farm"
                        ? "bg-background shadow-sm text-leaf"
                        : "text-muted-foreground hover:bg-background/50"
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                    Saved Farm
                  </button>
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={isFetching}
                  className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-background/80 transition shadow-sm disabled:opacity-50"
                  title="Refresh weather data"
                >
                  <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {/* Farm coordinates form (only visible in farm mode) */}
              {viewMode === "farm" && (
                <form onSubmit={handleSaveFarm} className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Farm Name"
                    value={farmData.name}
                    onChange={(e) => setFarmData({ ...farmData, name: e.target.value })}
                    className="rounded-xl border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-leaf/50"
                    required
                  />
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Lat"
                    value={farmData.lat}
                    onChange={(e) => setFarmData({ ...farmData, lat: parseFloat(e.target.value) })}
                    className="w-24 rounded-xl border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-leaf/50"
                    required
                  />
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Lon"
                    value={farmData.lon}
                    onChange={(e) => setFarmData({ ...farmData, lon: parseFloat(e.target.value) })}
                    className="w-24 rounded-xl border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-leaf/50"
                    required
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-leaf px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-leaf-dark"
                  >
                    Save
                  </button>
                </form>
              )}
            </div>

            {/* ═══ LOADING STATE ═══ */}
            {isLoading && !cachedCurrent && (
              <div className="grid gap-6">
                {/* Hero skeleton */}
                <div className="animate-pulse rounded-[2.5rem] bg-gradient-hero p-8 sm:p-12">
                  <div className="h-4 w-48 rounded-full bg-white/20" />
                  <div className="mt-6 h-10 w-64 rounded-full bg-white/20" />
                  <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                        <div className="h-6 w-6 rounded-lg bg-white/10" />
                        <div className="mt-4 h-3 w-20 rounded-full bg-white/10" />
                        <div className="mt-2 h-6 w-16 rounded-full bg-white/10" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Info cards skeleton */}
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <SkeletonCard />
                  </div>
                  <SkeletonCard />
                </div>
                {/* Forecast skeleton */}
                <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-7 shadow-card">
                  <div className="h-6 w-48 rounded-full bg-muted" />
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="rounded-3xl border border-border bg-background/50 p-6 text-center">
                        <div className="h-3 w-20 rounded-full bg-muted mx-auto" />
                        <div className="my-4 h-10 w-10 rounded-full bg-muted mx-auto" />
                        <div className="h-5 w-16 rounded-full bg-muted mx-auto" />
                        <div className="mt-4 h-3 w-24 rounded-full bg-muted mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══ ERROR STATE ═══ */}
            {hasError && (
              <div className="flex items-center justify-center py-16">
                <div className="max-w-md w-full rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center shadow-soft">
                  <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                  <h3 className="mt-4 text-lg font-bold">Weather Data Unavailable</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {errorCurrent instanceof Error
                      ? errorCurrent.message
                      : "Could not load weather data. Please try again."}
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="mt-6 w-full rounded-2xl bg-destructive px-6 py-3 font-semibold text-white transition hover:opacity-90"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* ═══ WEATHER DISPLAY ═══ */}
            {displayCurrent && !hasError && (
              <>
                {/* ── Hero Section ──────────────────────────────────── */}
                <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-leaf via-emerald-700 to-green-900 p-8 text-primary-foreground shadow-card sm:p-12 relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CloudSun className="h-48 w-48" />
                  </div>

                  <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between relative z-10">
                    {/* Location & Temperature */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                        <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-80">
                          {viewMode === "live" ? "Live · Current Field Weather" : `${farmData.name} · Weather`}
                        </p>
                      </div>

                      {/* Location Display */}
                      <div className="mt-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 opacity-70" />
                        <span className="text-lg font-semibold capitalize">
                          {locationName?.locality || displayCurrent.location?.split(",")[0] || "Unknown"}
                        </span>
                      </div>
                      {(locationName?.city || locationName?.state) && (
                        <p className="text-sm opacity-80 -mt-1 ml-6">
                          {[locationName?.city, locationName?.state].filter(Boolean).join(", ")}
                        </p>
                      )}

                      <div className="mt-6 flex items-center gap-6">
                        <p className="font-display text-7xl font-bold leading-none tracking-tighter sm:text-8xl">
                          {Math.round(displayCurrent.temperature)}°
                        </p>
                        <div>
                          <p className="text-4xl">
                            <WeatherEmoji condition={displayCurrent.condition} />
                          </p>
                          <p className="mt-1 text-lg font-bold capitalize">{displayCurrent.description}</p>
                          <p className="text-sm opacity-80 font-medium">
                            Feels like {Math.round(displayCurrent.feels_like)}°C
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 w-full md:w-auto">
                      {[
                        { label: "Humidity", value: `${displayCurrent.humidity}%`, sub: displayCurrent.humidity > 60 ? "Humid" : displayCurrent.humidity < 30 ? "Dry" : "Comfortable", icon: Droplets },
                        { label: "Wind Speed", value: `${(displayCurrent.wind_speed * 3.6).toFixed(1)} km/h`, sub: `${displayCurrent.wind_speed} m/s`, icon: Wind },
                        {
                          label: "Rain (24h)",
                          value:
                            (displayForecast?.total_rainfall_next_24h ?? displayCurrent.rainfall_today) > 0
                              ? `${(displayForecast?.total_rainfall_next_24h ?? displayCurrent.rainfall_today).toFixed(1)} mm`
                              : "No rain",
                          sub:
                            (displayForecast?.total_rainfall_next_24h ?? displayCurrent.rainfall_today) > 0
                              ? "Next 24h forecast"
                              : "Dry",
                          icon: CloudRain,
                        },
                        { label: "Condition", value: displayCurrent.condition, sub: displayCurrent.description, icon: Sun },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                        >
                          <stat.icon className="h-5 w-5 opacity-60" />
                          <p className="mt-3 text-[10px] font-bold uppercase tracking-widest opacity-60">
                            {stat.label}
                          </p>
                          <p className="mt-1 font-display text-lg font-bold">{stat.value}</p>
                          {stat.sub && (
                            <p className="mt-0.5 text-[10px] opacity-50 capitalize">{stat.sub}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Farming Suggestion & Rainfall ────────────────── */}
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 rounded-[2rem] bg-gradient-to-br from-amber-50 to-lime-50 dark:from-amber-950/20 dark:to-lime-950/20 border border-lime/20 p-8 shadow-sm flex items-center gap-6">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lime/20 to-leaf/10 backdrop-blur">
                      <Sprout className="h-8 w-8 text-leaf animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Smart Farming Suggestion
                      </p>
                      <p className="mt-2 text-lg font-display font-semibold leading-snug text-foreground">
                        {displayForecast?.farming_suggestion || displayCurrent.farming_suggestion}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Predicted Rainfall (Next 24h)
                    </p>
                    {displayForecast && displayForecast.total_rainfall_next_24h > 0 ? (
                      <p className="mt-4 font-display text-5xl font-bold text-leaf">
                        {displayForecast.total_rainfall_next_24h.toFixed(1)}{" "}
                        <span className="text-xl font-medium text-muted-foreground">mm</span>
                      </p>
                    ) : (
                      <div className="mt-4">
                        <p className="font-display text-3xl font-bold text-muted-foreground">No Rain Expected</p>
                        {displayForecast?.daily_forecast?.length > 0 && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            Dry forecast for the next 5 days
                          </p>
                        )}
                      </div>
                    )}
                    <p className="mt-3 text-sm text-muted-foreground font-medium">
                      Max Temp:{" "}
                      <span className="text-foreground font-bold">
                        {displayForecast?.max_temperature_next_24h ?? "—"}°C
                      </span>
                    </p>
                  </div>
                </div>

                {/* ── Detailed Weather Cards ────────────────────────── */}
                <SectionCard
                  title="Detailed Weather Conditions"
                  subtitle="Current atmospheric measurements for your field"
                  className="mt-2"
                >
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[
                      { label: "Temperature", value: `${Math.round(displayCurrent.temperature)}°C`, icon: Thermometer },
                      { label: "Feels Like", value: `${Math.round(displayCurrent.feels_like)}°C`, icon: Thermometer },
                      { label: "Humidity", value: `${displayCurrent.humidity}%`, icon: Droplets },
                      { label: "Wind Speed", value: `${(displayCurrent.wind_speed * 3.6).toFixed(1)} km/h`, icon: Wind },
                      { label: "Pressure", value: `${displayCurrent.pressure} hPa`, icon: Gauge },
                      { label: "Visibility", value: `${(displayCurrent.visibility / 1000).toFixed(1)} km`, icon: Eye },
                      { label: "Cloud Cover", value: `${displayCurrent.cloud_cover}%`, icon: Cloud },
                      { label: "UV Index", value: displayCurrent.uv_index ?? "N/A", icon: Sun },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-border/60 bg-background/50 p-5 transition hover:border-leaf/30 hover:bg-leaf/[0.02]"
                      >
                        <stat.icon className="h-5 w-5 text-leaf" />
                        <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="mt-1 font-display text-xl font-bold text-foreground">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Sunrise / Sunset / Chance of Rain / Rainfall Today */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-border/60 bg-amber-50/50 dark:bg-amber-950/10 p-5">
                      <Sunrise className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Sunrise
                      </p>
                      <p className="mt-1 font-display text-lg font-bold text-foreground">{displayCurrent.sunrise}</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-indigo-50/50 dark:bg-indigo-950/10 p-5">
                      <Sunset className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Sunset
                      </p>
                      <p className="mt-1 font-display text-lg font-bold text-foreground">{displayCurrent.sunset}</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-sky-50/50 dark:bg-sky-950/10 p-5">
                      <Umbrella className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Chance of Rain
                      </p>
                      <p className="mt-1 font-display text-lg font-bold text-foreground">
                        {displayCurrent.chance_of_rain != null ? `${displayCurrent.chance_of_rain}%` : "—"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-blue-50/50 dark:bg-blue-950/10 p-5">
                      <CloudRain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Rainfall Today
                      </p>
                      <p className="mt-1 font-display text-lg font-bold text-foreground">
                        {displayCurrent.rainfall_today > 0 ? `${displayCurrent.rainfall_today.toFixed(1)} mm` : "0 mm"}
                      </p>
                    </div>
                  </div>

                  {/* Air Quality (if available) */}
                  {displayCurrent.air_quality && (
                    <div className="mt-4 rounded-2xl border border-border/60 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/10 dark:to-emerald-950/10 p-5">
                      <div className="flex items-center gap-3">
                        <Cloud className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Air Quality
                          </p>
                          <p className="mt-0.5 font-semibold text-foreground capitalize">
                            {displayCurrent.air_quality}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* ── 5-Day Forecast ────────────────────────────────── */}
                {displayForecast?.daily_forecast?.length > 0 && (
                  <SectionCard
                    title="5-Day Weather Forecast"
                    subtitle="Accumulated rainfall and temperature outlook for your farming activities"
                    className="mt-2"
                  >
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-5 mt-4">
                      {displayForecast.daily_forecast.map((item: any, idx: number) => {
                        const dateObj = new Date(item.date);
                        const formattedDate = dateObj.toLocaleDateString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        });

                        return (
                          <div
                            key={idx}
                            className="rounded-3xl border border-border bg-background/50 p-6 text-center transition hover:border-leaf hover:bg-leaf/[0.02]"
                          >
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                              {formattedDate}
                            </p>
                            <p className="my-4 text-4xl">
                              <WeatherEmoji condition={item.condition} />
                            </p>
                            <p className="font-display text-lg font-bold text-foreground capitalize leading-none">
                              {item.condition}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 lowercase">{item.description}</p>

                            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs font-bold">
                              <span className="text-blue-500">Min {Math.round(item.min_temp)}°</span>
                              <span className="text-red-500">Max {Math.round(item.max_temp)}°</span>
                            </div>

                            <div className="mt-3 rounded-2xl bg-sky/10 py-1.5 text-[11px] font-bold text-sky-foreground flex items-center justify-center gap-1.5">
                              <CloudRain className="h-3 w-3" /> {item.rainfall} mm
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </SectionCard>
                )}

                {/* ── 3-Hour Forecast ───────────────────────────────── */}
                {displayForecast?.forecast?.length > 0 && (
                  <SectionCard
                    title="3-Hour Detailed Outlook"
                    subtitle="Hourly precision for watering, sowing, and spraying schedules"
                    className="overflow-hidden mt-2"
                  >
                    <div className="relative -mx-6 -mb-6 mt-4 overflow-x-auto pb-6">
                      <div className="flex gap-4 px-6">
                        {displayForecast.forecast.slice(0, 16).map((item: any, idx: number) => {
                          const dateObj = new Date(item.date_time);
                          const timeStr = dateObj.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                          const dayStr = dateObj.toLocaleDateString([], { weekday: "short" });

                          return (
                            <div
                              key={idx}
                              className="min-w-[140px] flex-shrink-0 rounded-3xl border border-border bg-background/50 p-5 text-center transition hover:border-leaf hover:bg-leaf/[0.02]"
                            >
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                {dayStr} · {timeStr}
                              </p>
                              <p className="my-3 text-3xl">
                                <WeatherEmoji condition={item.condition} />
                              </p>
                              <p className="font-display text-2xl font-bold">{Math.round(item.temperature)}°</p>
                              <div className="mt-4 flex flex-col gap-2">
                                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-blue-500">
                                  <Droplets className="h-3.5 w-3.5" /> {item.humidity}%
                                </div>
                                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-sky-500">
                                  <CloudRain className="h-3.5 w-3.5" /> {item.rainfall_3h} mm
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </SectionCard>
                )}
              </>
            )}
          </div>
        )}
      </AppShell>
    </>
  );
}
