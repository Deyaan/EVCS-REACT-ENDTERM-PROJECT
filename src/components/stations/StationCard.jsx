import { MapPin, Zap, Users } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import { getStatus } from '../../utils/stationUtils'

export default function StationCard({ station, onClick, actions }) {
  const status = getStatus(station.currentQueue, station.totalChargers)
  const available = Math.max(0, station.totalChargers - station.currentQueue)
  const pct = Math.min(100, Math.round((station.currentQueue / station.totalChargers) * 100))

  return (
    <div
      className="card p-5 hover:border-gray-600 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate group-hover:text-ev-green transition-colors">
            {station.name}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-ev-muted">
            <MapPin size={11} />
            <span className="truncate">{station.address || `${station.location?.lat?.toFixed(4)}, ${station.location?.lng?.toFixed(4)}`}</span>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-ev-dark rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap size={12} className="text-ev-green" />
          </div>
          <div className="text-lg font-semibold text-white">{station.totalChargers}</div>
          <div className="text-xs text-ev-muted">Total</div>
        </div>
        <div className="bg-ev-dark rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap size={12} className="text-ev-green" />
          </div>
          <div className="text-lg font-semibold text-ev-green">{available}</div>
          <div className="text-xs text-ev-muted">Free</div>
        </div>
        <div className="bg-ev-dark rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users size={12} className="text-ev-yellow" />
          </div>
          <div className="text-lg font-semibold text-ev-yellow">{station.currentQueue}</div>
          <div className="text-xs text-ev-muted">Queue</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-ev-muted mb-1.5">
          <span>Capacity</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-ev-dark rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              status === 'available' ? 'bg-ev-green' :
              status === 'moderate' ? 'bg-ev-yellow' : 'bg-ev-red'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      {actions && <div className="flex gap-2" onClick={e => e.stopPropagation()}>{actions}</div>}
    </div>
  )
}
