import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Info } from 'lucide-react'
import MapView from '../components/MapView'
import FilterBar from '../components/FilterBar'
import DataCenterSheet from '../components/DataCenterSheet'
import type { DataCenter } from '../lib/types'
import seedData from '../data/seed.json'

const dataCenters = seedData as DataCenter[]

export default function MapHome() {
  const [selectedDc, setSelectedDc] = useState<DataCenter | null>(null)

  const [filters, setFilters] = useState({
    statuses: new Set(['operating', 'under_construction', 'proposed']),
    state: null as string | null,
    mwMin: 0,
    mwMax: 9999,
    search: '',
  })

  const maxMw = useMemo(
    () => Math.max(...dataCenters.map(dc => dc.mw_capacity ?? 0)),
    [],
  )

  return (
    <div className="relative flex-1">
      <MapView
        dataCenters={dataCenters}
        onSelect={setSelectedDc}
        selectedId={selectedDc?.id ?? null}
        filters={filters}
      />

      <FilterBar
        dataCenters={dataCenters}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <Link
        to="/about"
        className="absolute top-3 right-3 z-10 p-2 bg-slate-900/80 backdrop-blur-sm rounded-full border border-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Info size={18} />
      </Link>

      {selectedDc && (
        <DataCenterSheet
          dc={selectedDc}
          onClose={() => setSelectedDc(null)}
          maxMw={maxMw}
        />
      )}
    </div>
  )
}
