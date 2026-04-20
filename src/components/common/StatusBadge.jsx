export default function StatusBadge({ status, size = 'sm' }) {
  const config = {
    available: { label: 'Available', cls: 'status-available', dot: 'bg-ev-green' },
    moderate: { label: 'Moderate', cls: 'status-moderate', dot: 'bg-ev-yellow' },
    full: { label: 'Full', cls: 'status-full', dot: 'bg-ev-red' },
  }
  const c = config[status] || config.available
  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${c.cls} ${pad}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
      {c.label}
    </span>
  )
}
