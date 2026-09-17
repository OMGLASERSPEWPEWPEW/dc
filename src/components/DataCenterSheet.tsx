import { useMemo } from 'react'
import type { DataCenter, Model } from '../lib/types'
import { calculateWaterDraw, formatNumber, formatDistance } from '../lib/water'
import { calculateNoise, noiseNarrative } from '../lib/noise'
import { STATUS_CONFIG, WUE_DEFAULT, TRADEOFF_TEXT } from '../lib/constants'

interface DataCenterSheetProps {
  dc: DataCenter
  model: Model
  onModelChange: (model: Model) => void
  onClose: () => void
}

const COOL_OPTIONS = ['air', 'hybrid', 'evaporative', 'liquid'] as const

export default function DataCenterSheet({ dc, model, onModelChange, onClose }: DataCenterSheetProps) {
  const statusCfg = STATUS_CONFIG[dc.status]
  const water = useMemo(() => calculateWaterDraw(model.mw, model.wue), [model.mw, model.wue])
  const noise = useMemo(() => calculateNoise(model.mw, model.cool), [model.mw, model.cool])
  const narrative = useMemo(() => noiseNarrative(noise.units, noise.rings), [noise.units, noise.rings])

  const homePer = water.equivalentHomes > 20 ? Math.ceil(water.equivalentHomes / 20) : 1
  const homeIcons = Math.min(20, Math.max(1, Math.round(water.equivalentHomes / homePer)))

  const mwNote = model.mw === dc.mw_capacity
    ? `As filed · ${formatNumber(dc.mw_capacity)} MW`
    : `Filed at ${formatNumber(dc.mw_capacity)} MW · modeling ${model.mw > dc.mw_capacity ? '+' : '−'}${formatNumber(Math.abs(model.mw - dc.mw_capacity))} MW`

  return (
    <div
      className="absolute left-0 right-0 bottom-0 z-[1100] sheet-open sheet-mobile"
      style={{
        height: 400,
        background: 'var(--glass)',
        backdropFilter: 'blur(6px)',
        borderTop: '1px solid var(--rule)',
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -14px 44px rgba(0,0,0,0.75)',
        overflow: 'hidden',
      }}
    >
      <div className="h-full overflow-auto" style={{ padding: '0 20px 24px' }}>
        {/* Header */}
        <div
          className="flex items-start gap-[14px] sticky top-0 z-[2]"
          style={{
            padding: '16px 0 14px',
            borderBottom: '1px solid var(--rule)',
            background: 'var(--glass-dense)',
          }}
        >
          <div className="min-w-0 flex-1">
            <h2 style={{ fontStyle: 'italic', fontWeight: 400, fontSize: 24, margin: '0 0 3px', lineHeight: 1.15 }}>
              {dc.name}
            </h2>
            <div
              className="flex flex-wrap items-center"
              style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-dim)',
                gap: '4px 10px',
              }}
            >
              <span>{dc.operator}</span>
              <span>·</span>
              <span>{dc.city}, {dc.state}</span>
              {statusCfg && (
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{
                    padding: '2px 8px',
                    borderRadius: 9999,
                    border: '1px solid var(--rule)',
                    fontSize: 9,
                    letterSpacing: '0.14em',
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: 9999, background: statusCfg.cssVar }} />
                  {statusCfg.label}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              marginLeft: 'auto',
              flex: 'none',
              width: 44,
              height: 44,
              border: '1px solid var(--rule)',
              borderRadius: 3,
              background: 'transparent',
              color: 'var(--ink)',
              fontSize: 16,
              cursor: 'pointer',
              fontFamily: "'Courier Prime', monospace",
            }}
          >
            ✕
          </button>
        </div>

        {/* Two-column content */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0 40px' }}>
          {/* Left column */}
          <div>
            {/* MW slider */}
            <div style={{ padding: '16px 0', borderBottom: '1px solid var(--rule-soft)' }}>
              <div className="lbl" style={lblStyle}>
                <span>Size of the filing</span>
                <b style={lblAccent}>{formatNumber(model.mw)} MW</b>
              </div>
              <input
                type="range"
                min={10}
                max={2500}
                step={10}
                value={model.mw}
                onChange={e => onModelChange({ ...model, mw: +e.target.value })}
              />
              <div style={subStyle}>{mwNote}</div>
            </div>

            {/* Cooling method */}
            <div style={{ padding: '16px 0', borderBottom: '1px solid var(--rule-soft)' }}>
              <div style={lblStyle}>
                <span>Cooling method</span>
                <b style={lblAccent}>WUE {model.wue.toFixed(1)}</b>
              </div>
              <div style={{ display: 'flex', border: '1px solid var(--rule)', borderRadius: 3, overflow: 'hidden' }}>
                {COOL_OPTIONS.map(c => (
                  <button
                    key={c}
                    onClick={() => onModelChange({ ...model, cool: c, wue: WUE_DEFAULT[c] })}
                    style={{
                      flex: 1,
                      height: 34,
                      border: 0,
                      borderRight: c !== 'liquid' ? '1px solid var(--rule)' : 'none',
                      background: model.cool === c ? 'var(--accent)' : 'transparent',
                      color: model.cool === c ? 'var(--accent-on)' : 'var(--ink-dim)',
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'background 0.12s, color 0.12s',
                    }}
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={0.1}
                max={3}
                step={0.1}
                value={model.wue}
                onChange={e => onModelChange({ ...model, wue: +e.target.value })}
              />
              <div style={subStyle}>Water usage effectiveness · L per kWh</div>
            </div>

            <p style={{ fontStyle: 'italic', fontSize: 15, color: 'var(--ink)', margin: '8px 0 0', textWrap: 'pretty' }}>
              {TRADEOFF_TEXT[model.cool] ?? ''}
            </p>
          </div>

          {/* Right column */}
          <div>
            {/* Water */}
            <div style={{ padding: '16px 0', borderBottom: '1px solid var(--rule-soft)' }}>
              <div style={lblStyle}><span>Water · every day</span></div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 29, lineHeight: 1.05, color: 'var(--ink)' }}>
                {formatNumber(water.dailyGallons)}
                <small style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-dim)',
                  marginLeft: 8,
                }}>
                  gallons
                </small>
              </div>
              <div style={subStyle}>
                {formatNumber(water.dailyLiters)} liters · {formatNumber(water.kwhPerDay / 1000)} MWh of IT load
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '3px 5px',
                margin: '10px 0 6px',
                fontSize: 16,
                lineHeight: 1,
                color: 'var(--member)',
              }}>
                {Array.from({ length: homeIcons }, (_, i) => <span key={i}>⌂</span>)}
                {homePer > 1 && (
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: 'var(--ink-dim)',
                    alignSelf: 'center',
                    marginLeft: 4,
                  }}>
                    × {formatNumber(homePer)}
                  </span>
                )}
              </div>
              <div style={subStyle}>The daily water of {formatNumber(water.equivalentHomes)} homes</div>
            </div>

            {/* Noise */}
            <div style={{ padding: '16px 0', borderBottom: '1px solid var(--rule-soft)' }}>
              <div style={lblStyle}>
                <span>Noise · how far it carries</span>
                <b style={lblAccent}>{noise.sourceDba.toFixed(0)} dBA at source</b>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                <tbody>
                  {noise.rings.map((ring, i) => (
                    <tr key={ring.dba}>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          background: ring.color,
                          marginRight: 8,
                          verticalAlign: '-1px',
                        }} />
                        <span style={tdLabelStyle}>{ring.dba}{i === 0 ? '+' : ''} dBA</span>
                      </td>
                      <td style={{ ...tdStyle, ...tdLabelStyle }}>{ring.label}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>{formatDistance(ring.radiusMeters)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {narrative && (
                <p style={{ fontStyle: 'italic', fontSize: 15, color: 'var(--ink)', margin: '8px 0 0', textWrap: 'pretty' }}>
                  {narrative}
                </p>
              )}
            </div>

            <div style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 9,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ink-ghost)',
              paddingTop: 14,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}>
              <span>Source · seed file · {dc.operator}</span>
              <span>Seed data · locations and MW approximate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const lblStyle: React.CSSProperties = {
  fontFamily: "'Courier Prime', monospace",
  fontSize: '9.5px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--ink-faint)',
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  marginBottom: 8,
}

const lblAccent: React.CSSProperties = {
  color: 'var(--accent-text)',
  fontWeight: 400,
  fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: '0.04em',
}

const subStyle: React.CSSProperties = {
  fontFamily: "'Courier Prime', monospace",
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ink-dim)',
  marginTop: 4,
}

const tdStyle: React.CSSProperties = {
  padding: '5px 0',
  borderBottom: '1px solid var(--rule-soft)',
  verticalAlign: 'middle',
}

const tdLabelStyle: React.CSSProperties = {
  fontFamily: "'Courier Prime', monospace",
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--ink-dim)',
}
