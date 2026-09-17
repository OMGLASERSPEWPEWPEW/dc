export const WUE_DEFAULT = 1.8
export const WUE_MIN = 0.1
export const WUE_MAX = 3.0

export const EPA_HOUSEHOLD_GALLONS_PER_DAY = 300
export const LITERS_PER_GALLON = 3.78541

export const NOISE_SOURCE_DBA = 85
export const NOISE_REF_DISTANCE_M = 1

export const NOISE_THRESHOLDS = [
  { dba: 75, color: '#dc2626', opacity: 0.4, label: '75+ dBA — hearing damage zone' },
  { dba: 65, color: '#f97316', opacity: 0.3, label: '65–75 dBA — conversation difficult' },
  { dba: 55, color: '#eab308', opacity: 0.25, label: '55–65 dBA — residential limit' },
  { dba: 45, color: '#22c55e', opacity: 0.2, label: '45–55 dBA — sleep disruption' },
  { dba: 35, color: '#3b82f6', opacity: 0.15, label: '35–45 dBA — faint' },
] as const

export const STATUS_COLORS: Record<string, string> = {
  operating: '#22c55e',
  under_construction: '#eab308',
  proposed: '#3b82f6',
  approved: '#8b5cf6',
  suspended: '#6b7280',
}

export const STATUS_LABELS: Record<string, string> = {
  operating: 'Operating',
  under_construction: 'Under Construction',
  proposed: 'Proposed',
  approved: 'Approved',
  suspended: 'Suspended',
}

export const MW_BREAKPOINTS = {
  small: 50,
  medium: 200,
} as const

export const MARKER_SIZES = {
  small: 12,
  medium: 18,
  large: 28,
} as const

export const US_CENTER: [number, number] = [-98.5795, 39.8283]
export const US_ZOOM = 4
