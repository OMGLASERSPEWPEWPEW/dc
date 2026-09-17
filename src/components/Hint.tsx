interface HintProps {
  visible: boolean
}

export default function Hint({ visible }: HintProps) {
  if (!visible) return null

  return (
    <div
      className="absolute left-5 bottom-6 z-[900]"
      style={{
        fontStyle: 'italic',
        fontSize: 15,
        color: 'var(--ink-dim)',
        background: 'var(--glass)',
        backdropFilter: 'blur(6px)',
        border: '1px solid var(--rule)',
        borderRadius: 3,
        padding: '10px 14px',
        maxWidth: 320,
        textWrap: 'pretty',
      }}
    >
      Tap a site to see what it drinks and how far you can hear it. Drag the size slider to model a different filing.
    </div>
  )
}
