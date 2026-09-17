import circle from '@turf/circle'
import { featureCollection } from '@turf/helpers'
import { NOISE_SOURCE_DBA, NOISE_REF_DISTANCE_M, NOISE_THRESHOLDS } from './constants'
import type { NoiseContour } from './types'

export function calculateNoiseContours(
  sourceDba = NOISE_SOURCE_DBA,
  barrierDb = 0,
): NoiseContour[] {
  const effectiveSource = sourceDba - barrierDb

  return NOISE_THRESHOLDS.map(({ dba, color, opacity, label }) => {
    const drop = effectiveSource - dba
    if (drop <= 0) return { thresholdDba: dba, radiusMeters: 0, color, opacity, label }
    const radiusMeters = NOISE_REF_DISTANCE_M * Math.pow(10, drop / 20)
    return { thresholdDba: dba, radiusMeters, color, opacity, label }
  }).filter(c => c.radiusMeters > 0)
}

export function noiseContoursToGeoJSON(
  lat: number,
  lng: number,
  sourceDba = NOISE_SOURCE_DBA,
  barrierDb = 0,
): GeoJSON.FeatureCollection {
  const contours = calculateNoiseContours(sourceDba, barrierDb)

  const features = contours
    .sort((a, b) => b.radiusMeters - a.radiusMeters)
    .map(contour => {
      const feat = circle([lng, lat], contour.radiusMeters / 1000, {
        steps: 64,
        units: 'kilometers',
      })
      feat.properties = {
        dba: contour.thresholdDba,
        radius_m: contour.radiusMeters,
        color: contour.color,
        opacity: contour.opacity,
        label: contour.label,
      }
      return feat
    })

  return featureCollection(features)
}
