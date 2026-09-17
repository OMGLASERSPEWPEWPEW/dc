import { NOISE_BASE_DBA, NOISE_ADJ, NOISE_RINGS } from './constants'

export interface NoiseRing {
  dba: number
  color: string
  opacity: number
  label: string
  radiusMeters: number
}

export function calculateNoise(mw: number, coolingMethod: string): { sourceDba: number; units: number; rings: NoiseRing[] } {
  const units = Math.max(1, Math.round(mw / 10))
  const adj = NOISE_ADJ[coolingMethod] ?? 0
  const sourceDba = NOISE_BASE_DBA + 10 * Math.log10(units) + adj

  const rings = NOISE_RINGS.map(({ dba, color, opacity, label }) => {
    const drop = sourceDba - dba
    const radiusMeters = drop > 0 ? Math.pow(10, drop / 20) : 0
    return { dba, color, opacity, label, radiusMeters }
  }).filter(r => r.radiusMeters > 0)

  return { sourceDba, units, rings }
}

export function noiseNarrative(units: number, rings: NoiseRing[]): string {
  const sleepRing = rings.find(r => r.dba === 45)
  if (!sleepRing) return ''
  const far = sleepRing.radiusMeters
  const blocks = far / 100

  if (units > 1) {
    const blockText = blocks < 1.5 ? 'a block' : `${Math.round(blocks)} blocks`
    return `${units.toLocaleString('en-US')} chiller clusters running together. Sleep can be disturbed about ${blockText} out.`
  }
  return 'A single chiller cluster. Beyond the adjacent lot you would barely notice it.'
}
