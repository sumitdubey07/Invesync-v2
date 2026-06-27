import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { getSector, SECTOR_COLORS } from '../utils/sectors'

export default function SectorChart({ holdings }) {
  const sectorMap = {}
  holdings.forEach((h) => {
    const sector = getSector(h.symbol)
    const value = h.avgPrice * h.qty
    sectorMap[sector] = (sectorMap[sector] || 0) + value
  })

  const total = Object.values(sectorMap).reduce((a, b) => a + b, 0)
  const data = Object.entries(sectorMap)
    .map(([sector, value]) => ({
      name: sector,
      value: +value.toFixed(2),
      percent: +((value / total) * 100).toFixed(1),
    }))
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) return null

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{
        // ── CHANGED: CSS variables on tooltip ──
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '8px 12px',
      }}>
        <p style={{ color: 'var(--text)', fontSize: 12, fontWeight: 600 }}>{payload[0].name}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>₹{payload[0].value.toLocaleString('en-IN')}</p>
        <p style={{ color: '#a78bfa', fontSize: 11 }}>{payload[0].payload.percent}%</p>
      </div>
    )
  }

  return (
    // ── CHANGED: CSS variables on outer card ──
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '20px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top glow line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,.4), transparent)',
      }} />

      {/* ── CHANGED: CSS variable on label text ── */}
      <p style={{
        fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
        letterSpacing: 1, fontFamily: 'monospace', marginBottom: 16,
      }}>
        Sector Exposure
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Donut chart */}
        <div style={{ width: 160, height: 160, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={SECTOR_COLORS[entry.name] || SECTOR_COLORS['Other']}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.map((entry) => (
            <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Color dot */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: SECTOR_COLORS[entry.name] || SECTOR_COLORS['Other'],
              }} />

              {/* ── CHANGED: CSS variable on sector name ── */}
              <span style={{ fontSize: 12, color: 'var(--text)', flex: 1 }}>{entry.name}</span>

              {/* ── CHANGED: CSS variable on progress bar track ── */}
              <div style={{ width: 80, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${entry.percent}%`,
                  background: SECTOR_COLORS[entry.name] || SECTOR_COLORS['Other'],
                  borderRadius: 2,
                }} />
              </div>

              {/* ── CHANGED: CSS variable on percent ── */}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', width: 36, textAlign: 'right' }}>
                {entry.percent}%
              </span>

              {/* ── CHANGED: CSS variable on value ── */}
              <span style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'monospace', width: 90, textAlign: 'right' }}>
                ₹{entry.value.toLocaleString('en-IN')}
              </span>
            </div>
          ))}

          {/* Total */}
          <div style={{
            marginTop: 4,
            paddingTop: 10,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            {/* ── CHANGED: CSS variable on total label ── */}
            <span style={{ fontSize: 10, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'monospace' }}>
              Total Invested
            </span>
            {/* ── CHANGED: CSS variable on total value ── */}
            <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, fontFamily: 'monospace' }}>
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}