import { WUE_DEFAULT, EPA_HOUSEHOLD_GALLONS_PER_DAY, LITERS_PER_GALLON } from './constants'
import type { WaterImpact } from './types'

export function calculateWaterDraw(mwCapacity: number, wue = WUE_DEFAULT): WaterImpact {
  const kwhPerDay = mwCapacity * 1000 * 24
  const dailyLiters = wue * kwhPerDay
  const dailyGallons = dailyLiters / LITERS_PER_GALLON
  const equivalentHomes = Math.round(dailyGallons / EPA_HOUSEHOLD_GALLONS_PER_DAY)

  return { dailyLiters, dailyGallons, equivalentHomes, mwCapacity, wue }
}

export function formatGallons(gallons: number): string {
  if (gallons >= 1_000_000) return `${(gallons / 1_000_000).toFixed(1)}M`
  if (gallons >= 1_000) return `${(gallons / 1_000).toFixed(0)}K`
  return gallons.toFixed(0)
}

export function formatLiters(liters: number): string {
  if (liters >= 1_000_000) return `${(liters / 1_000_000).toFixed(1)}M`
  if (liters >= 1_000) return `${(liters / 1_000).toFixed(0)}K`
  return liters.toFixed(0)
}
