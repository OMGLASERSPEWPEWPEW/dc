import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import type { DataCenter } from '../lib/types'
import type { NoiseRing } from '../lib/noise'
import { STATUS_CONFIG, MARKER_RADII, MW_BREAKPOINTS, US_CENTER, US_ZOOM } from '../lib/constants'

interface MapViewProps {
  dataCenters: DataCenter[]
  onSelect: (dc: DataCenter | null) => void
  selectedId: string | null
  activeStatuses: Set<string>
  noiseRings: NoiseRing[]
  selectedDc: DataCenter | null
}

function markerRadius(mw: number): number {
  if (mw < MW_BREAKPOINTS.small) return MARKER_RADII.small
  if (mw < MW_BREAKPOINTS.medium) return MARKER_RADII.medium
  return MARKER_RADII.large
}

function statusColor(status: string): string {
  return STATUS_CONFIG[status]?.oklch ?? 'oklch(0.5 0 0)'
}

export default function MapView({ dataCenters, onSelect, selectedId, activeStatuses, noiseRings, selectedDc }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const ringsLayerRef = useRef<L.LayerGroup | null>(null)

  const filtered = dataCenters.filter(dc => activeStatuses.has(dc.status))

  const handleMarkerClick = useCallback((dc: DataCenter) => {
    onSelect(dc)
  }, [onSelect])

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([US_CENTER[1], US_CENTER[0]], US_ZOOM)

    map.zoomControl.setPosition('topright')

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const ringsLayer = L.layerGroup().addTo(map)
    const markersLayer = L.layerGroup().addTo(map)

    map.on('click', () => {
      onSelect(null)
    })

    mapRef.current = map
    markersLayerRef.current = markersLayer
    ringsLayerRef.current = ringsLayer

    return () => { map.remove(); mapRef.current = null }
  }, [onSelect])

  // Draw markers
  useEffect(() => {
    const markersLayer = markersLayerRef.current
    if (!markersLayer) return

    markersLayer.clearLayers()

    for (const dc of filtered) {
      const r = markerRadius(dc.mw_capacity)
      const color = statusColor(dc.status)
      const dimmed = selectedId != null && selectedId !== dc.id

      const marker = L.circleMarker([dc.latitude, dc.longitude], {
        radius: r,
        color: '#0c0a05',
        weight: 1.5,
        fillColor: color,
        fillOpacity: dimmed ? 0.35 : 0.95,
      })

      marker.bindTooltip(
        `<i>${dc.name}</i>${dc.operator} · ${dc.mw_capacity} MW`,
        { direction: 'top', offset: [0, -8] },
      )

      marker.on('click', (e) => {
        L.DomEvent.stop(e)
        handleMarkerClick(dc)
      })

      marker.addTo(markersLayer)
    }
  }, [filtered, selectedId, handleMarkerClick])

  // Draw noise rings
  useEffect(() => {
    const map = mapRef.current
    const ringsLayer = ringsLayerRef.current
    if (!map || !ringsLayer) return

    ringsLayer.clearLayers()

    if (!selectedDc || noiseRings.length === 0) return

    const sorted = [...noiseRings].sort((a, b) => b.radiusMeters - a.radiusMeters)

    for (const ring of sorted) {
      L.circle([selectedDc.latitude, selectedDc.longitude], {
        radius: ring.radiusMeters,
        stroke: false,
        fillColor: ring.color,
        fillOpacity: ring.opacity,
        interactive: false,
      }).addTo(ringsLayer)
    }

    // Fly to fit outermost ring
    const outer = L.circle([selectedDc.latitude, selectedDc.longitude], {
      radius: sorted[0].radiusMeters * 1.3,
    })
    const bottomPad = window.innerWidth < 768 ? window.innerHeight * 0.58 + 20 : 440
    map.flyToBounds(outer.getBounds(), {
      paddingTopLeft: [20, 80] as L.PointTuple,
      paddingBottomRight: [20, bottomPad] as L.PointTuple,
      duration: 1.4,
      maxZoom: 16,
    })
  }, [noiseRings, selectedDc])

  return <div ref={containerRef} className="w-full h-full" />
}
