import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStations } from '../hooks/useStations'
import StationCard from '../components/stations/StationCard'
import { Search, SlidersHorizontal } from 'lucide-react'
import { getStatus } from '../utils/stationUtils'

const FILTERS = ['all', 'available', 'moderate', 'full']

export default function StationList() {
  const { stations, loading } = useStations()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = stations.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.address || '').toLowerCase().includes(search.toLowerCase())
    const status = getStatus(s.currentQueue, s.totalChargers)
    const matchFilter = filter === 'all' || status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Charging Stations</h1>
        <p className="text-ev-muted text-sm mt-1">Live queue status · updates in real-time</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ev-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or address…"
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border capitalize transition-all ${
                filter === f
                  ? f === 'all' ? 'bg-white/10 border-white/20 text-white'
                    : f === 'available' ? 'status-available'
                    : f === 'moderate' ? 'status-moderate'
                    : 'status-full'
                  : 'border-ev-border text-ev-muted hover:border-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-ev-muted mb-4">
        {loading ? 'Loading…' : `${filtered.length} station${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card p-5 animate-pulse space-y-3">
              <div className="h-4 bg-ev-border rounded w-3/4" />
              <div className="h-3 bg-ev-border rounded w-1/2" />
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(j => <div key={j} className="h-16 bg-ev-border rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <SlidersHorizontal size={32} className="text-ev-muted mx-auto mb-3" />
          <p className="text-white font-medium">No stations found</p>
          <p className="text-ev-muted text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <StationCard
              key={s.id}
              station={s}
              onClick={() => navigate(`/stations/${s.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
