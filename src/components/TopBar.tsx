import type { DataCenter } from '../lib/types'
import { STATUS_CONFIG } from '../lib/constants'

interface TopBarProps {
  dataCenters: DataCenter[]
  activeStatuses: Set<string>
  onToggleStatus: (status: string) => void
  visibleCount: number
}

const STATUSES = ['operating', 'under_construction', 'proposed'] as const

export default function TopBar({ dataCenters, activeStatuses, onToggleStatus, visibleCount }: TopBarProps) {
  const totalMw = dataCenters
    .filter(dc => activeStatuses.has(dc.status))
    .reduce((sum, dc) => sum + dc.mw_capacity, 0)

  return (
    <div
      className="absolute top-0 left-0 right-0 z-[1000] flex flex-wrap items-center gap-y-[10px] gap-x-[18px]"
      style={{
        padding: '12px 20px 10px',
        background: 'var(--glass)',
        backdropFilter: 'blur(6px)',
        borderBottom: '1px solid var(--rule)',
      }}
    >
      <div className="flex items-baseline gap-3">
        <b style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700, fontSize: 19, letterSpacing: '0.04em' }}>
          dc
        </b>
        <span
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: '9.5px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
          }}
        >
          {visibleCount} sites · {Math.round(totalMw).toLocaleString('en-US')} MW filed
        </span>
      </div>

      <div className="flex gap-1.5 ml-auto">
        {STATUSES.map(status => {
          const cfg = STATUS_CONFIG[status]
          const active = activeStatuses.has(status)
          return (
            <button
              key={status}
              onClick={() => onToggleStatus(status)}
              className="flex items-center gap-[7px] cursor-pointer"
              style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '0 12px',
                height: 30,
                borderRadius: 14,
                border: `1px solid ${active ? 'var(--accent-border)' : 'var(--rule)'}`,
                background: active ? 'var(--accent-bg)' : 'transparent',
                color: active ? 'var(--accent-text)' : 'var(--ink-dim)',
                transition: 'color 0.12s, background 0.12s, border-color 0.12s',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 9999,
                  background: cfg.cssVar,
                  opacity: active ? 1 : 0.3,
                }}
              />
              {cfg.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
