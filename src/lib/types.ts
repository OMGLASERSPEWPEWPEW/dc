export interface DataCenter {
  id: string
  name: string
  operator: string
  latitude: number
  longitude: number
  city?: string
  state: string
  mw_capacity: number
  cooling_method: string
  status: string
  source_name?: string
  source_url?: string
}

export interface WaterImpact {
  dailyLiters: number
  dailyGallons: number
  equivalentHomes: number
  mwCapacity: number
  wue: number
  kwhPerDay: number
}

export interface Model {
  mw: number
  cool: string
  wue: number
}
