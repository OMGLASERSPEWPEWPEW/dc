import { STATUS_CONFIG } from '../lib/constants'

interface MapKeyProps {
  sheetOpen: boolean
}

export default function MapKey({ sheetOpen }: MapKeyProps) {
  return (
    <div
      className="absolute right-5 z-[900] key-hide-mobile"
      style={{
        bottom: sheetOpen ? 424 : 24,
        padding: '10px 12px',
        background: 'var(--glass)',
        backdropFilter: 'blur(6px)',
        border: '1px solid var(--rule)',
        borderRadius: 3,
        display: 'grid',
        gap: 5,
        transition: 'bottom 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
        <div
          key={key}
          className="flex items-center gap-2"
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-dim)',
          }}
        >
          <span style={{
            width: 10,
            height: 10,
            borderRadius: 9999,
            background: cfg.cssVar,
            border: '1px solid transparent',
          }} />
          {cfg.label}
        </div>
      ))}
      <div
        className="flex items-center gap-1.5"
        style={{
          fontFamily: "'Courier Prime', monospace",
          fontSize: 9,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--ink-dim)',
          marginTop: 4,
        }}
      >
        <span style={{ display: 'block', width: 8, height: 8, borderRadius: 9999, background: 'var(--ink-faint)' }} />
        <span style={{ display: 'block', width: 13, height: 13, borderRadius: 9999, background: 'var(--ink-faint)' }} />
        <span style={{ display: 'block', width: 20, height: 20, borderRadius: 9999, background: 'var(--ink-faint)' }} />
        &nbsp;&lt;50 · 50–200 · 200+ MW
      </div>
    </div>
  )
}
