// ============================================================================
// Weather — Open-Meteo current conditions (free, no key) + browser geolocation
// ============================================================================

export interface WeatherNow {
  tempC: number | null
  wind: number | null
}

const NULL_WEATHER: WeatherNow = { tempC: null, wind: null }

export async function fetchWeatherNow(
  position: GeolocationPosition,
  fetchImpl: typeof fetch = fetch,
): Promise<WeatherNow> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}` +
    `&current=temperature_2m,wind_speed_10m`
  try {
    const response = await fetchImpl(url)
    if (!response.ok) return NULL_WEATHER
    const data = (await response.json()) as {
      current?: { temperature_2m?: number; wind_speed_10m?: number }
    }
    return {
      tempC: data.current?.temperature_2m ?? null,
      wind: data.current?.wind_speed_10m ?? null,
    }
  } catch {
    return NULL_WEATHER
  }
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject)
  })
}

/** Geolocation → Open-Meteo. Any failure degrades to nulls, never throws. */
export async function getWeatherNow(fetchImpl: typeof fetch = fetch): Promise<WeatherNow> {
  try {
    const position = await getPosition()
    return await fetchWeatherNow(position, fetchImpl)
  } catch {
    return NULL_WEATHER
  }
}