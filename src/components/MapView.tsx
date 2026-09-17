import { useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import type { DataCenter } from '../lib/types'
import { STATUS_COLORS, MW_BREAKPOINTS, MARKER_SIZES, US_CENTER, US_ZOOM } from '../lib/constants'

interface MapViewProps {
  dataCenters: DataCenter[]
  onSelect: (dc: DataCenter | null) => void
  selectedId: string | null
  filters: {
    statuses: Set<string>
    state: string | null
    mwMin: number
    mwMax: number
    search: string
  }
}

function markerSize(mw?: number): number {
  if (!mw || mw < MW_BREAKPOINTS.small) return MARKER_SIZES.small
  if (mw < MW_BREAKPOINTS.medium) return MARKER_SIZES.medium
  return MARKER_SIZES.large
}

export default function MapView({ dataCenters, onSelect, selectedId, filters }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())

  const filtered = dataCenters.filter(dc => {
    if (!filters.statuses.has(dc.status)) return false
    if (filters.state && dc.state !== filters.state) return false
    const mw = dc.mw_capacity ?? 0
    if (mw < filters.mwMin || mw > filters.mwMax) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const match = dc.name.toLowerCase().includes(q)
        || dc.operator.toLowerCase().includes(q)
        || (dc.city?.toLowerCase().includes(q))
      if (!match) return false
    }
    return true
  })

  const handleMarkerClick = useCallback((dc: DataCenter) => {
    onSelect(dc)
    mapRef.current?.flyTo({ center: [dc.longitude, dc.latitude], zoom: 12, duration: 1500 })
  }, [onSelect])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: US_CENTER,
      zoom: US_ZOOM,
      attributionControl: false,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left')

    map.on('click', (e) => {
      const target = e.originalEvent.target as HTMLElement
      if (!target.closest('.dc-marker')) {
        onSelect(null)
      }
    })

    mapRef.current = map

    return () => { map.remove() }
  }, [onSelect])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const currentIds = new Set(filtered.map(dc => dc.id))
    const existing = markersRef.current

    for (const [id, marker] of existing) {
      if (!currentIds.has(id)) {
        marker.remove()
        existing.delete(id)
      }
    }

    for (const dc of filtered) {
      if (existing.has(dc.id)) continue

      const size = markerSize(dc.mw_capacity)
      const color = STATUS_COLORS[dc.status] || '#6b7280'

      const el = document.createElement('div')
      el.className = 'dc-marker'
      el.style.width = `${size}px`
      el.style.height = `${size}px`
      el.style.borderRadius = '50%'
      el.style.backgroundColor = color
      el.style.border = '2px solid rgba(255,255,255,0.3)'
      el.style.cursor = 'pointer'
      el.style.transition = 'transform 150ms ease'
      el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.15)' })
      el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        handleMarkerClick(dc)
      })

      const popup = new mapboxgl.Popup({ offset: 12, closeButton: false, className: 'dc-popup' })
        .setHTML(`
          <div style="color:#f1f5f9;font-size:13px;line-height:1.4">
            <strong>${dc.name}</strong><br/>
            ${dc.operator}${dc.mw_capacity ? ` · ${dc.mw_capacity} MW` : ''}
          </div>
        `)

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([dc.longitude, dc.latitude])
        .setPopup(popup)
        .addTo(map)

      el.addEventListener('mouseenter', () => popup.addTo(map))
      el.addEventListener('mouseleave', () => popup.remove())

      existing.set(dc.id, marker)
    }
  }, [filtered, handleMarkerClick])

  useEffect(() => {
    for (const [id, marker] of markersRef.current) {
      const el = marker.getElement()
      if (id === selectedId) {
        el.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.6)'
      } else {
        el.style.boxShadow = 'none'
      }
    }
  }, [selectedId])

  return <div ref={containerRef} className="w-full h-full" />
}
