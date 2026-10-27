import { describe, expect, it, vi } from 'vitest'
import { fetchWeatherNow, getWeatherNow } from './weather.service'

const position = {
  coords: { latitude: 45.46, longitude: 9.19, accuracy: 10, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
  timestamp: Date.now(),
} as GeolocationPosition

describe('weather.service', () => {
  it('reads temperature and wind from Open-Meteo', async () => {
    const fetchImpl = vi.fn(async (url: unknown) => {
      expect(String(url)).toContain('latitude=45.46')
      expect(String(url)).toContain('current=temperature_2m,wind_speed_10m')
      return {
        ok: true,
        json: async () => ({ current: { temperature_2m: 14.2, wind_speed_10m: 8.4 } }),
      } as Response
    })

    const weather = await fetchWeatherNow(position, fetchImpl as typeof fetch)
    expect(weather).toEqual({ tempC: 14.2, wind: 8.4 })
  })

  it('returns nulls when geolocation fails', async () => {
    Object.defineProperty(window.navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: (_ok: unknown, fail: (error: Error) => void) => fail(new Error('denied')) },
    })
    const weather = await getWeatherNow()
    expect(weather).toEqual({ tempC: null, wind: null })
  })

  it('returns nulls when the fetch rejects', async () => {
    Object.defineProperty(window.navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: (ok: (position: GeolocationPosition) => void) => ok(position) },
    })
    const weather = await getWeatherNow(vi.fn(async () => {
      throw new Error('offline')
    }) as unknown as typeof fetch)
    expect(weather).toEqual({ tempC: null, wind: null })
  })
})