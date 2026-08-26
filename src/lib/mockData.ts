export type SoilReading = {
  id: string;
  date: string;
  ph: number;
  n: number;
  p: number;
  k: number;
  moisture: number;
  temperature: number;
  rainfall: number;
  season: string;
  status: "good" | "warn" | "bad";
  topCrop: string;
};

export type CropCategory = "Food" | "Cash" | "Pulses" | "Vegetables" | "Oil";

export type CropRec = {
  name: string;
  emoji: string;
  confidence: number;
  sowing: string;
  yield: string;
  water: "Low" | "Medium" | "High";
  notes: string;
  category: CropCategory;
  season: "Kharif" | "Rabi" | "Zaid" | "All Season";
  reqs?: {
    n: [number, number];
    p: [number, number];
    k: [number, number];
    ph: [number, number];
    temp: [number, number];
    rain: [number, number];
  };
};

export type PestRecord = {
  id: string;
  date: string;
  crop: string;
  disease: string;
  severity: "Low" | "Moderate" | "High";
  confidence: number;
};

export const initialSoilHistory: SoilReading[] = [
  { id: "s-104", date: "2025-04-12", ph: 6.7, n: 82, p: 45, k: 60, moisture: 38, temperature: 27, rainfall: 84, season: "Kharif", status: "good", topCrop: "Rice" },
  { id: "s-103", date: "2025-03-28", ph: 5.9, n: 55, p: 30, k: 48, moisture: 22, temperature: 31, rainfall: 22, season: "Summer", status: "warn", topCrop: "Millet" },
  { id: "s-102", date: "2025-02-14", ph: 7.1, n: 70, p: 52, k: 65, moisture: 41, temperature: 24, rainfall: 60, season: "Rabi", status: "good", topCrop: "Wheat" },
  { id: "s-101", date: "2025-01-05", ph: 5.2, n: 38, p: 22, k: 30, moisture: 18, temperature: 22, rainfall: 14, season: "Rabi", status: "bad", topCrop: "Barley" },
];

export function getSoilHistory(): SoilReading[] {
  if (typeof window === "undefined") return initialSoilHistory;
  const data = localStorage.getItem("krushi-soil-history");
  return data ? [...JSON.parse(data), ...initialSoilHistory] : initialSoilHistory;
}

export function addSoilHistory(reading: Omit<SoilReading, "id" | "date">) {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("krushi-soil-history");
    const existing = data ? JSON.parse(data) : [];
    const newReading: SoilReading = {
      ...reading,
      id: `s-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString().split("T")[0],
    };
    existing.unshift(newReading);
    localStorage.setItem("krushi-soil-history", JSON.stringify(existing));
  }
}

export const topCrops: CropRec[] = [
  // Food crops
  { name: "Rice (Basmati)", emoji: "🌾", confidence: 94, sowing: "Jun – Jul", yield: "5.2 t/ha", water: "High", notes: "Ideal pH and moisture levels detected. Strong monsoon outlook supports paddy.", category: "Food", season: "Kharif", reqs: { n: [100, 150], p: [40, 60], k: [40, 60], ph: [6.0, 7.5], temp: [20, 35], rain: [150, 300] } },
  { name: "Wheat (HD-2967)", emoji: "🌾", confidence: 88, sowing: "Oct – Dec", yield: "4.8 t/ha", water: "Medium", notes: "Suitable winter temperatures and loamy texture detected.", category: "Food", season: "Rabi", reqs: { n: [100, 150], p: [50, 70], k: [40, 60], ph: [6.0, 7.5], temp: [10, 25], rain: [40, 100] } },
  { name: "Maize", emoji: "🌽", confidence: 87, sowing: "Jun – Aug", yield: "4.1 t/ha", water: "Medium", notes: "Good NPK balance for vegetative growth.", category: "Food", season: "Kharif", reqs: { n: [100, 150], p: [50, 70], k: [40, 60], ph: [5.8, 7.5], temp: [21, 27], rain: [50, 150] } },
  { name: "Pearl Millet (Bajra)", emoji: "🌾", confidence: 82, sowing: "Jun – Jul", yield: "2.6 t/ha", water: "Low", notes: "Drought tolerant — fits semi-arid soil profile.", category: "Food", season: "Kharif", reqs: { n: [40, 80], p: [20, 40], k: [20, 40], ph: [5.5, 7.5], temp: [25, 35], rain: [20, 60] } },
  { name: "Finger Millet (Ragi)", emoji: "🌾", confidence: 76, sowing: "Jun – Aug", yield: "2.2 t/ha", water: "Low", notes: "High nutritional value, low input requirement.", category: "Food", season: "Kharif", reqs: { n: [40, 80], p: [20, 40], k: [20, 40], ph: [5.5, 7.5], temp: [20, 35], rain: [40, 80] } },
  { name: "Sorghum (Jowar)", emoji: "🌾", confidence: 74, sowing: "Jun – Jul", yield: "2.8 t/ha", water: "Low", notes: "Tolerates heat and erratic rainfall.", category: "Food", season: "Kharif", reqs: { n: [60, 100], p: [30, 50], k: [30, 50], ph: [5.5, 7.5], temp: [25, 35], rain: [30, 80] } },

  // Cash crops
  { name: "Cotton (Bt)", emoji: "🌿", confidence: 81, sowing: "Apr – May", yield: "1.8 t/ha", water: "Medium", notes: "Black soil suitability with controlled irrigation.", category: "Cash", season: "Kharif", reqs: { n: [100, 150], p: [50, 70], k: [50, 80], ph: [5.8, 8.0], temp: [25, 35], rain: [50, 150] } },
  { name: "Sugarcane", emoji: "🎋", confidence: 78, sowing: "Feb – Mar", yield: "70 t/ha", water: "High", notes: "Long duration crop — needs assured irrigation.", category: "Cash", season: "All Season", reqs: { n: [150, 250], p: [60, 100], k: [80, 120], ph: [6.5, 7.5], temp: [20, 35], rain: [150, 300] } },
  { name: "Jute", emoji: "🌱", confidence: 68, sowing: "Mar – May", yield: "2.5 t/ha", water: "High", notes: "Best in alluvial soil with high humidity.", category: "Cash", season: "Kharif", reqs: { n: [80, 120], p: [40, 60], k: [40, 60], ph: [6.0, 7.5], temp: [24, 35], rain: [150, 250] } },

  // Pulses
  { name: "Chickpea (Gram)", emoji: "🫛", confidence: 84, sowing: "Oct – Nov", yield: "1.6 t/ha", water: "Low", notes: "Fixes nitrogen — excellent for soil health.", category: "Pulses", season: "Rabi", reqs: { n: [20, 40], p: [40, 60], k: [20, 40], ph: [6.0, 7.5], temp: [20, 25], rain: [30, 60] } },
  { name: "Pigeon Pea (Tur)", emoji: "🫘", confidence: 80, sowing: "Jun – Jul", yield: "1.4 t/ha", water: "Low", notes: "Deep-rooted, drought tolerant pulse.", category: "Pulses", season: "Kharif", reqs: { n: [20, 40], p: [40, 60], k: [20, 40], ph: [6.0, 7.5], temp: [25, 35], rain: [60, 100] } },
  { name: "Green Gram (Moong)", emoji: "🫛", confidence: 77, sowing: "Mar – Jul", yield: "1.1 t/ha", water: "Low", notes: "Short duration — fits crop rotation.", category: "Pulses", season: "Zaid", reqs: { n: [20, 30], p: [30, 50], k: [20, 40], ph: [6.0, 7.5], temp: [25, 35], rain: [40, 80] } },
  { name: "Black Gram (Urad)", emoji: "🫘", confidence: 73, sowing: "Jun – Aug", yield: "1.0 t/ha", water: "Low", notes: "Improves soil fertility through N-fixation.", category: "Pulses", season: "Kharif", reqs: { n: [20, 30], p: [30, 50], k: [20, 40], ph: [6.0, 7.5], temp: [25, 35], rain: [40, 80] } },

  // Vegetables
  { name: "Potato", emoji: "🥔", confidence: 83, sowing: "Oct – Nov", yield: "22 t/ha", water: "Medium", notes: "Cool weather and well-drained soil suit it well.", category: "Vegetables", season: "Rabi", reqs: { n: [100, 150], p: [60, 100], k: [80, 120], ph: [5.0, 6.5], temp: [15, 20], rain: [50, 70] } },
  { name: "Tomato", emoji: "🍅", confidence: 79, sowing: "Jun – Jul", yield: "28 t/ha", water: "Medium", notes: "Good drainage and balanced NPK detected.", category: "Vegetables", season: "All Season", reqs: { n: [100, 150], p: [60, 80], k: [60, 80], ph: [6.0, 6.8], temp: [20, 25], rain: [40, 60] } },
  { name: "Onion", emoji: "🧅", confidence: 75, sowing: "Oct – Dec", yield: "20 t/ha", water: "Medium", notes: "Suits Rabi cycle with moderate irrigation.", category: "Vegetables", season: "Rabi", reqs: { n: [100, 150], p: [40, 60], k: [60, 80], ph: [6.0, 7.0], temp: [15, 25], rain: [50, 80] } },
  { name: "Brinjal", emoji: "🍆", confidence: 71, sowing: "Jun – Sep", yield: "25 t/ha", water: "Medium", notes: "Hardy crop with steady market demand.", category: "Vegetables", season: "All Season", reqs: { n: [100, 150], p: [50, 70], k: [50, 70], ph: [5.5, 6.8], temp: [20, 30], rain: [50, 100] } },

  // Oil crops
  { name: "Mustard", emoji: "🌼", confidence: 82, sowing: "Oct – Nov", yield: "1.5 t/ha", water: "Low", notes: "Cool dry winter favours oilseed yield.", category: "Oil", season: "Rabi", reqs: { n: [60, 100], p: [40, 60], k: [40, 60], ph: [6.0, 7.5], temp: [15, 25], rain: [20, 40] } },
  { name: "Groundnut", emoji: "🥜", confidence: 80, sowing: "Jun – Jul", yield: "2.2 t/ha", water: "Medium", notes: "Sandy loam and warm climate ideal.", category: "Oil", season: "Kharif", reqs: { n: [20, 40], p: [40, 60], k: [40, 60], ph: [6.0, 6.5], temp: [25, 30], rain: [50, 100] } },
  { name: "Soyabean", emoji: "🫘", confidence: 79, sowing: "Jul – Aug", yield: "2.4 t/ha", water: "Medium", notes: "Will improve nitrogen for next season.", category: "Oil", season: "Kharif", reqs: { n: [20, 40], p: [60, 80], k: [40, 60], ph: [6.0, 7.5], temp: [25, 30], rain: [60, 150] } },
  { name: "Sunflower", emoji: "🌻", confidence: 72, sowing: "Jan – Feb", yield: "1.8 t/ha", water: "Medium", notes: "Photo-insensitive — flexible sowing window.", category: "Oil", season: "Zaid", reqs: { n: [60, 100], p: [40, 60], k: [40, 60], ph: [6.0, 7.5], temp: [20, 30], rain: [40, 80] } },
];

export const pestHistory: PestRecord[] = [
  { id: "p-22", date: "2025-04-10", crop: "Tomato", disease: "Early Blight", severity: "Moderate", confidence: 91 },
  { id: "p-21", date: "2025-04-02", crop: "Wheat", disease: "Leaf Rust", severity: "Low", confidence: 84 },
  { id: "p-20", date: "2025-03-21", crop: "Rice", disease: "Bacterial Leaf Blight", severity: "High", confidence: 96 },
];

export const weather = {
  location: "Nashik, MH",
  temp: 28,
  condition: "Partly Cloudy",
  humidity: 64,
  wind: 12,
  rainfall: 4,
  uv: 6,
  forecast: [
    { day: "Mon", icon: "☀️", high: 31, low: 22, rain: 0 },
    { day: "Tue", icon: "⛅", high: 29, low: 21, rain: 10 },
    { day: "Wed", icon: "🌦️", high: 27, low: 20, rain: 60 },
    { day: "Thu", icon: "🌧️", high: 25, low: 19, rain: 80 },
    { day: "Fri", icon: "⛅", high: 28, low: 21, rain: 20 },
    { day: "Sat", icon: "☀️", high: 30, low: 22, rain: 0 },
    { day: "Sun", icon: "☀️", high: 32, low: 23, rain: 0 },
  ],
};

export const alerts = [
  { id: 1, level: "warn" as const, title: "Heavy rain expected Thursday", body: "Delay fertilizer application by 48 hours." },
  { id: 2, level: "good" as const, title: "Soil moisture optimal", body: "No irrigation needed for the next 2 days." },
  { id: 3, level: "bad" as const, title: "Pest risk: Leaf Rust", body: "Inspect wheat field — humidity favors spread." },
];
