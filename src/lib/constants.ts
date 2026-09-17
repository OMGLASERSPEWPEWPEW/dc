export const WUE_DEFAULT: Record<string, number> = {
  air: 0.1,
  hybrid: 1.0,
  evaporative: 1.8,
  liquid: 0.3,
}

export const WUE_MIN = 0.1
export const WUE_MAX = 3.0

export const EPA_HOUSEHOLD_GALLONS_PER_DAY = 300
export const LITERS_PER_GALLON = 3.78541

export const NOISE_BASE_DBA = 85
export const NOISE_ADJ: Record<string, number> = {
  air: 5,
  hybrid: 2,
  evaporative: 0,
  liquid: 1,
}

export const NOISE_RINGS = [
  { dba: 75, color: 'oklch(0.66 0.19 35)', opacity: 0.40, label: 'At the fence · hearing risk' },
  { dba: 65, color: 'oklch(0.80 0.14 55)', opacity: 0.30, label: 'Property line · conversation strained' },
  { dba: 55, color: 'oklch(0.85 0.15 90)', opacity: 0.25, label: 'Over most residential limits' },
  { dba: 45, color: 'oklch(0.74 0.16 145)', opacity: 0.20, label: 'Sleep disruption possible' },
  { dba: 35, color: 'oklch(0.62 0.13 235)', opacity: 0.15, label: 'Faint · ambient threshold' },
] as const

export const STATUS_CONFIG: Record<string, { label: string; cssVar: string; oklch: string }> = {
  operating: { label: 'Operating', cssVar: 'var(--live)', oklch: 'oklch(0.74 0.16 145)' },
  under_construction: { label: 'Under construction', cssVar: 'var(--accent)', oklch: 'oklch(0.80 0.14 55)' },
  proposed: { label: 'Proposed', cssVar: 'var(--member)', oklch: 'oklch(0.62 0.13 235)' },
}

export const MARKER_RADII = { small: 4, medium: 6.5, large: 10 } as const
export const MW_BREAKPOINTS = { small: 50, medium: 200 } as const

export const US_CENTER: [number, number] = [-96.5, 38.5]
export const US_ZOOM = 4

export const TRADEOFF_TEXT: Record<string, string> = {
  air: 'Air cooling saves the water but runs the biggest fans. Quieter is thirstier; this is the trade every filing makes.',
  hybrid: 'Hybrid cooling splits the difference: some water, some fan noise, and a footprint that shifts with the season.',
  evaporative: 'Evaporative cooling is the quiet option. It is also the one that drinks the most.',
  liquid: 'Direct liquid cooling keeps both water and noise low, at a higher build cost. Backup generators still test at 95 dBA.',
}
