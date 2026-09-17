import { useState, useMemo, useCallback } from 'react'
import MapView from '../components/MapView'
import TopBar from '../components/TopBar'
import DataCenterSheet from '../components/DataCenterSheet'
import MapKey from '../components/MapKey'
import Hint from '../components/Hint'
import type { DataCenter, Model } from '../lib/types'
import { calculateNoise } from '../lib/noise'
import { WUE_DEFAULT } from '../lib/constants'
import seedData from '../data/seed.json'

const dataCenters = seedData as DataCenter[]

export default function MapHome() {
  const [selectedDc, setSelectedDc] = useState<DataCenter | null>(null)
  const [model, setModel] = useState<Model>({ mw: 100, cool: 'evaporative', wue: 1.8 })
  const [activeStatuses, setActiveStatuses] = useState(new Set(['operating', 'under_construction', 'proposed']))

  const handleSelect = useCallback((dc: DataCenter | null) => {
    setSelectedDc(dc)
    if (dc) {
      setModel({ mw: dc.mw_capacity, cool: dc.cooling_method, wue: WUE_DEFAULT[dc.cooling_method] ?? 1.8 })
    }
  }, [])

  const toggleStatus = useCallback((status: string) => {
    setActiveStatuses(prev => {
      const next = new Set(prev)
      if (next.has(status)) {
        if (next.size > 1) next.delete(status)
      } else {
        next.add(status)
      }
      return next
    })
  }, [])

  const noiseResult = useMemo(
    () => selectedDc ? calculateNoise(model.mw, model.cool) : { sourceDba: 0, units: 0, rings: [] },
    [selectedDc, model.mw, model.cool],
  )

  const visibleCount = useMemo(
    () => dataCenters.filter(dc => activeStatuses.has(dc.status)).length,
    [activeStatuses],
  )

  return (
    <div className="relative flex-1">
      <MapView
        dataCenters={dataCenters}
        onSelect={handleSelect}
        selectedId={selectedDc?.id ?? null}
        activeStatuses={activeStatuses}
        noiseRings={noiseResult.rings}
        selectedDc={selectedDc}
      />

      <TopBar
        dataCenters={dataCenters}
        activeStatuses={activeStatuses}
        onToggleStatus={toggleStatus}
        visibleCount={visibleCount}
      />

      <MapKey sheetOpen={!!selectedDc} />
      <Hint visible={!selectedDc} />

      {selectedDc && (
        <DataCenterSheet
          dc={selectedDc}
          model={model}
          onModelChange={setModel}
          onClose={() => setSelectedDc(null)}
        />
      )}
    </div>
  )
}
