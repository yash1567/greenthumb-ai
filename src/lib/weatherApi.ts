import { getApiUrl } from "./api";

export async function fetchCurrentWeather(lat: number = 18.5204, lon: number = 73.8567) {
  try {
    const res = await fetch(getApiUrl(`/api/weather?lat=${lat}&lon=${lon}`));
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend weather endpoint unavailable, falling back to Open-Meteo", err);
  }

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  return response.json();
}

export async function fetchForecast(lat: number = 18.5204, lon: number = 73.8567) {
  try {
    const res = await fetch(getApiUrl(`/api/weather/forecast?lat=${lat}&lon=${lon}`));
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend forecast endpoint unavailable, falling back to Open-Meteo", err);
  }

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch forecast data");
  }
  return response.json();
}
