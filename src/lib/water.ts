import { EPA_HOUSEHOLD_GALLONS_PER_DAY } from './constants'
import type { WaterImpact } from './types'

export function calculateWaterDraw(mwCapacity: number, wue: number): WaterImpact {
  const kwhPerDay = mwCapacity * 1000 * 24
  const dailyLiters = wue * kwhPerDay
  const dailyGallons = dailyLiters * 0.264172
  const equivalentHomes = Math.round(dailyGallons / EPA_HOUSEHOLD_GALLONS_PER_DAY)

  return { dailyLiters, dailyGallons, equivalentHomes, mwCapacity, wue, kwhPerDay }
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

export function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(m >= 10000 ? 0 : 1)} km`
  return `${Math.round(m)} m`
}
