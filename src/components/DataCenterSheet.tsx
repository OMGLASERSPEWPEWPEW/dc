import { X, ExternalLink, Zap, MapPin } from 'lucide-react'
import type { DataCenter } from '../lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '../lib/constants'
import WaterDrawCard from './WaterDrawCard'

interface DataCenterSheetProps {
  dc: DataCenter
  onClose: () => void
  maxMw: number
}

export default function DataCenterSheet({ dc, onClose, maxMw }: DataCenterSheetProps) {
  const statusColor = STATUS_COLORS[dc.status] || '#6b7280'
  const statusLabel = STATUS_LABELS[dc.status] || dc.status
  const capacityPct = dc.mw_capacity && maxMw ? Math.min((dc.mw_capacity / maxMw) * 100, 100) : 0

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-10 animate-slide-up max-h-[50vh] overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-100 truncate">{dc.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
              <span>{dc.operator}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: statusColor + '22', color: statusColor }}
              >
                {statusLabel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-slate-500" />
            <span>{[dc.city, dc.state].filter(Boolean).join(', ')}</span>
            {dc.county && <span className="text-slate-500">({dc.county} County)</span>}
          </div>
        </div>

        {dc.mw_capacity && (
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Zap size={14} className="text-yellow-500" />
                <span>Capacity</span>
              </div>
              <span className="font-mono text-white">{dc.mw_capacity} MW</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${capacityPct}%`, backgroundColor: statusColor }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 text-right">
              vs {maxMw} MW largest in dataset
            </div>
          </div>
        )}

        {dc.mw_capacity && (
          <WaterDrawCard mwCapacity={dc.mw_capacity} defaultWue={dc.wue} />
        )}

        {!dc.mw_capacity && (
          <div className="text-sm text-slate-500 italic">
            MW capacity unknown — water draw cannot be calculated.
          </div>
        )}

        {dc.source_url && (
          <a
            href={dc.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ExternalLink size={14} />
            View source filing
          </a>
        )}
      </div>
    </div>
  )
}
