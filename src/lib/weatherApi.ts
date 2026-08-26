import { getApiUrl } from "./api";

function safeNumber(val: any, fallback: number): number {
  if (val === null || val === undefined) return fallback;
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

function weatherCodeToCondition(code: number): { condition: string; description: string } {
  if (code === 0) return { condition: "Clear", description: "Clear sky" };
  if (code >= 1 && code <= 3) return { condition: "Partly Cloudy", description: "Partly cloudy sky" };
  if (code === 45 || code === 48) return { condition: "Foggy", description: "Foggy conditions" };
  if (code >= 51 && code <= 55) return { condition: "Drizzle", description: "Light drizzle" };
  if (code >= 61 && code <= 65) return { condition: "Rainy", description: "Moderate to heavy rain" };
  if (code >= 80 && code <= 82) return { condition: "Showers", description: "Passing rain showers" };
  if (code >= 95) return { condition: "Thunderstorm", description: "Thunderstorm warning" };
  return { condition: "Clear", description: "Clear weather" };
}

export function getDefaultWeatherData() {
  return {
    temperature: 26,
    feels_like: 27,
    humidity: 77,
    wind_speed: 5.28, // 19 km/h
    rainfall_1h: 0.1,
    rainfall_today: 0.1,
    condition: "Clear",
    description: "Clear sky",
    location: "Pune, Maharashtra",
    farming_suggestion: "Good conditions for field preparation and crop monitoring.",
  };
}

export function getDefaultForecastData() {
  return {
    total_rainfall_next_24h: 0.1,
    farming_suggestion: "Clear conditions expected for farm operations.",
    daily: [],
  };
}

function normalizeCurrentWeather(data: any, lat: number, lon: number) {
  if (!data || typeof data !== "object") {
    return getDefaultWeatherData();
  }

  const temp = safeNumber(data.temperature, 26);
  const feels = safeNumber(data.feels_like ?? data.temperature, temp);
  const hum = safeNumber(data.humidity, 77);
  const wind = safeNumber(data.wind_speed, 5.28);
  const rain1h = safeNumber(data.rainfall_1h, 0.1);
  const rainToday = safeNumber(data.rainfall_today, 0.1);

  return {
    temperature: temp,
    feels_like: feels,
    humidity: hum,
    wind_speed: wind,
    rainfall_1h: rain1h,
    rainfall_today: rainToday,
    condition: data.condition || "Clear",
    description: data.description || "Clear sky",
    location: data.location || `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`,
    farming_suggestion: data.farming_suggestion || "Favorable conditions for farming tasks.",
  };
}

function normalizeOpenMeteoCurrent(data: any, lat: number, lon: number) {
  if (!data || typeof data !== "object") {
    return getDefaultWeatherData();
  }

  const cw = data.current_weather || {};
  const temp = safeNumber(cw.temperature, 26);
  const windKmh = safeNumber(cw.windspeed, 19);
  const windMs = Number((windKmh / 3.6).toFixed(2));
  const humidityArr = data.hourly?.relative_humidity_2m;
  const hum = Array.isArray(humidityArr) && humidityArr.length > 0 ? safeNumber(humidityArr[0], 77) : 77;
  const code = safeNumber(cw.weathercode, 0);
  const { condition, description } = weatherCodeToCondition(code);
  const rainToday = safeNumber(data.daily?.precipitation_sum?.[0], 0.1);

  return {
    temperature: temp,
    feels_like: temp,
    humidity: hum,
    wind_speed: isNaN(windMs) ? 5.28 : windMs,
    rainfall_1h: 0.1,
    rainfall_today: rainToday,
    condition,
    description,
    location: `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`,
    farming_suggestion: condition.includes("Rain")
      ? "Rain expected. Postpone pesticide spraying and check field drainage."
      : "Favorable conditions for farming tasks and field monitoring.",
  };
}

export async function fetchCurrentWeather(lat: number = 18.5204, lon: number = 73.8567) {
  try {
    const res = await fetch(getApiUrl(`/api/weather?lat=${lat}&lon=${lon}`));
    if (res.ok) {
      const data = await res.json();
      return normalizeCurrentWeather(data, lat, lon);
    }
  } catch (err) {
    console.warn("Backend weather endpoint unavailable, falling back to Open-Meteo", err);
  }

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
    );
    if (response.ok) {
      const data = await response.json();
      return normalizeOpenMeteoCurrent(data, lat, lon);
    }
  } catch (e) {
    console.warn("Open-Meteo fetch failed, returning fallback weather data", e);
  }

  return getDefaultWeatherData();
}

export async function fetchForecast(lat: number = 18.5204, lon: number = 73.8567) {
  try {
    const res = await fetch(getApiUrl(`/api/weather/forecast?lat=${lat}&lon=${lon}`));
    if (res.ok) {
      const data = await res.json();
      return {
        total_rainfall_next_24h: safeNumber(data?.total_rainfall_next_24h, 0),
        farming_suggestion: data?.farming_suggestion || "Favorable weather ahead for normal farm operations.",
        daily: Array.isArray(data?.daily) ? data.daily : [],
      };
    }
  } catch (err) {
    console.warn("Backend forecast endpoint unavailable, falling back to Open-Meteo", err);
  }

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`
    );
    if (response.ok) {
      const data = await response.json();
      const daily = data?.daily || {};
      const dates = daily.time || [];
      const maxTemps = daily.temperature_2m_max || [];
      const minTemps = daily.temperature_2m_min || [];
      const rains = daily.precipitation_sum || [];
      const codes = daily.weather_code || [];

      const list = dates.map((date: string, i: number) => {
        const { condition } = weatherCodeToCondition(safeNumber(codes[i], 0));
        return {
          date,
          max_temp: safeNumber(maxTemps[i], 30),
          min_temp: safeNumber(minTemps[i], 20),
          rain: safeNumber(rains[i], 0),
          condition,
        };
      });

      const rain24h = rains.length > 0 ? safeNumber(rains[0], 0) : 0;

      return {
        total_rainfall_next_24h: rain24h,
        farming_suggestion:
          rain24h > 5
            ? "Active rainfall expected in next 24h. Delay chemical sprays."
            : "Weather is clear for farm operations.",
        daily: list,
      };
    }
  } catch (e) {
    console.warn("Open-Meteo forecast fetch failed", e);
  }

  return getDefaultForecastData();
}
