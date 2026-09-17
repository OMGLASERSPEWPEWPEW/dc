import { useState } from 'react'
import { Droplets, Home } from 'lucide-react'
import { calculateWaterDraw, formatGallons, formatLiters } from '../lib/water'
import { WUE_MIN, WUE_MAX, WUE_DEFAULT } from '../lib/constants'

interface WaterDrawCardProps {
  mwCapacity: number
  defaultWue?: number
}

export default function WaterDrawCard({ mwCapacity, defaultWue = WUE_DEFAULT }: WaterDrawCardProps) {
  const [wue, setWue] = useState(defaultWue)
  const impact = calculateWaterDraw(mwCapacity, wue)

  const homeIcons = Math.min(impact.equivalentHomes, 20)
  const multiplier = impact.equivalentHomes > 20
    ? `× ${Math.ceil(impact.equivalentHomes / 20)}`
    : null

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-blue-400">
        <Droplets size={18} />
        <span className="text-sm font-medium">Daily Water Draw</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="font-mono text-2xl text-blue-300">{formatGallons(impact.dailyGallons)}</div>
          <div className="text-xs text-slate-400">gallons/day</div>
        </div>
        <div>
          <div className="font-mono text-2xl text-blue-300">{formatLiters(impact.dailyLiters)}</div>
          <div className="text-xs text-slate-400">liters/day</div>
        </div>
      </div>

      <div className="border-t border-slate-700 pt-3">
        <div className="text-sm text-slate-300 mb-1">
          Equivalent to <span className="font-mono text-white font-medium">{impact.equivalentHomes.toLocaleString()}</span> homes
        </div>
        <div className="flex items-center gap-0.5 flex-wrap">
          {Array.from({ length: homeIcons }, (_, i) => (
            <Home key={i} size={14} className="text-slate-400" />
          ))}
          {multiplier && <span className="text-xs text-slate-500 ml-1">{multiplier}</span>}
        </div>
      </div>

      <div className="border-t border-slate-700 pt-3">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>WUE: {wue.toFixed(1)} L/kWh</span>
          <span className="text-slate-500">
            {wue <= 0.5 ? 'Air-cooled' : wue <= 1.5 ? 'Hybrid' : 'Evaporative'}
          </span>
        </div>
        <input
          type="range"
          min={WUE_MIN}
          max={WUE_MAX}
          step={0.1}
          value={wue}
          onChange={e => setWue(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6, #eab308, #dc2626)`,
          }}
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
          <span>Air-cooled</span>
          <span>Evaporative</span>
        </div>
      </div>
    </div>
  )
}
