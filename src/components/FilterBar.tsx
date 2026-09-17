import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import type { DataCenter } from '../lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '../lib/constants'

interface FilterBarProps {
  dataCenters: DataCenter[]
  filters: {
    statuses: Set<string>
    state: string | null
    mwMin: number
    mwMax: number
    search: string
  }
  onFiltersChange: (filters: FilterBarProps['filters']) => void
}

const FILTER_STATUSES = ['operating', 'under_construction', 'proposed'] as const

export default function FilterBar({ dataCenters, filters, onFiltersChange }: FilterBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  const states = useMemo(() => {
    const set = new Set(dataCenters.map(dc => dc.state))
    return [...set].sort()
  }, [dataCenters])

  function toggleStatus(status: string) {
    const next = new Set(filters.statuses)
    if (next.has(status)) {
      if (next.size > 1) next.delete(status)
    } else {
      next.add(status)
    }
    onFiltersChange({ ...filters, statuses: next })
  }

  return (
    <div className="absolute top-0 left-0 right-0 z-10 p-3">
      <div className="flex items-center gap-2 flex-wrap bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/50">
        {FILTER_STATUSES.map(status => {
          const active = filters.statuses.has(status)
          const color = STATUS_COLORS[status]
          return (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
              style={{
                backgroundColor: active ? color + '22' : 'transparent',
                color: active ? color : '#64748b',
                border: `1px solid ${active ? color + '44' : '#334155'}`,
              }}
            >
              {STATUS_LABELS[status]}
            </button>
          )
        })}

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <select
          value={filters.state || ''}
          onChange={e => onFiltersChange({ ...filters, state: e.target.value || null })}
          className="text-xs bg-transparent text-slate-300 border border-slate-700 rounded px-2 py-1.5 outline-none"
        >
          <option value="">All states</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="flex-1" />

        {searchOpen ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={filters.search}
              onChange={e => onFiltersChange({ ...filters, search: e.target.value })}
              placeholder="Search name, operator, city..."
              className="text-xs bg-slate-800 text-slate-200 border border-slate-600 rounded px-2 py-1.5 w-48 outline-none placeholder:text-slate-500"
              autoFocus
            />
            <button
              onClick={() => { setSearchOpen(false); onFiltersChange({ ...filters, search: '' }) }}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Search size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
