export interface DataCenter {
  id: string
  name: string
  operator: string
  latitude: number
  longitude: number
  address?: string
  city?: string
  state: string
  county?: string
  mw_capacity?: number
  sqft?: number
  cooling_method?: 'air' | 'evaporative' | 'hybrid' | 'liquid' | string
  status: 'operating' | 'under_construction' | 'proposed' | 'approved' | 'suspended' | string
  wue?: number
  source_url?: string
  source_name?: string
  external_id?: string
}

export interface WaterImpact {
  dailyLiters: number
  dailyGallons: number
  equivalentHomes: number
  mwCapacity: number
  wue: number
}

export interface NoiseContour {
  thresholdDba: number
  radiusMeters: number
  color: string
  opacity: number
  label: string
}
